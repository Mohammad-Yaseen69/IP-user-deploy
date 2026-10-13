import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Modal } from "@mui/material";
import { ArrowLeft, X } from "react-feather";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import abf from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import {
  ContextCard,
  Stepper,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import {
  useAvailableMethods,
  useRequiredFields,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/useVendorRequirements";
import {
  flattenFieldSets,
  getThunesRequirements,
  resolveTransactionType,
} from "../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/vendorFields";
import citiesData from "../../../CitiesDropDown/CitiesData.json";
import { UserContext } from "../../../../Context/UserContext";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";
import { decryptData } from "../../../../Helper/EssentilaMethods/Decryption";
import styles from "../styles/WithdrawalsNew.module.css";
import useWithdrawalActions from "../useWithdrawalActions";
import { findCountry } from "../withdrawalAccounts";
import {
  ADDRESS_FIELDS,
  CHANNEL_KEY_BY_METHOD,
  CROSS_BORDER_ADDRESS_FIELDS,
  TRANSFER_METHODS,
  addressFromRecord,
  getHolderName,
  prefillChannel,
} from "../withdrawalPayload";
import StepConfirm from "./StepConfirm";
import StepCountry from "./StepCountry";
import StepDetails from "./StepDetails";
import StepMethod from "./StepMethod";

const STAGE_LABELS = {
  country: "Country",
  method: "Method",
  details: "Details",
  confirm: "Confirm",
};

const MODE_STAGES = {
  create: ["country", "method", "details", "confirm"],
  channel: ["method", "details", "confirm"],
  crypto: ["details", "confirm"],
  edit: ["details", "confirm"],
};

const DETAILS_SUBTITLE = {
  bank_account: "Enter your account details",
  mobile_wallet: "Enter your wallet details",
  cash_pickup: "Enter your pickup details",
  crypto_wallet: "Enter your crypto wallet",
};

/* The account level switches that allow each method, as the old channel tiles read them. */
const LEVEL_FLAG_BY_METHOD = {
  bank_account: "bank",
  cash_pickup: "cash_pickup",
  mobile_wallet: "mobile_money",
};

/* Ported from the old form: a 500 means the checker is down, not that the number is bad. */
const verifyWalletNumber = async (number) => {
  try {
    await apiWrapper({
      endpoint: "/api/dt/check-number-public",
      method: "POST",
      payload: { number: `+${number}` },
      isEncrypted: true,
      isPublic: true,
    });
    return "";
  } catch (error) {
    if (error?.response?.status === 500) return "";
    const dec = decryptData(error?.response?.data?.data);
    const message = typeof dec === "string" ? dec : dec?.message || "";
    return message.toLowerCase().includes("invalid")
      ? "Invalid phone number"
      : message || "This number could not be verified.";
  }
};

const AddAccountFlow = ({
  open,
  onClose,
  mode = "create",
  target = null,
  countries,
  groups,
  cryptoRows,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userDetails } = useContext(UserContext);
  const { saveFiatAccount, saveCryptoAccount } = useWithdrawalActions();

  const stages = MODE_STAGES[mode] || MODE_STAGES.create;
  const [stage, setStage] = useState(stages[0]);
  const [country, setCountry] = useState(null);
  const [method, setMethod] = useState("");
  const [channel, setChannel] = useState({});
  const [detailsValid, setDetailsValid] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [busy, setBusy] = useState(false);

  const holderName = getHolderName(userDetails);
  const recipientType = userDetails?.account_type === "business" ? "business" : "individual";
  const transactionType = resolveTransactionType(userDetails?.account_type, recipientType);
  const isCrypto = method === "crypto_wallet";
  const isEdit = mode === "edit";

  const resolveCountry = useCallback(
    (iso3) => {
      if (!iso3) return null;
      return countries.find((item) => item.alpha3 === iso3) ?? findCountry(iso3) ?? null;
    },
    [countries],
  );

  /* Fresh state every time the dialog opens, seeded from what it was opened on. */
  useEffect(() => {
    if (!open) return;
    setStage(stages[0]);
    setDetailsValid(false);
    setWalletError("");
    setBusy(false);

    if (isEdit && target) {
      setMethod(target.method);
      setCountry(target.isCrypto ? null : resolveCountry(target.record?.iso_code));
      setChannel(
        target.isCrypto
          ? {
              network: target.network,
              wallet_address: target.entry?.wallet_address ?? "",
            }
          : prefillChannel({
              method: target.method,
              record: target.record,
              userDetails,
            }),
      );
      return;
    }

    if (mode === "crypto") {
      setMethod("crypto_wallet");
      setChannel(prefillChannel({ method: "crypto_wallet" }));
      setCountry(null);
      return;
    }

    setMethod("");
    setChannel({});
    setCountry(mode === "channel" ? resolveCountry(target?.record?.iso_code) : null);
  }, [open]);

  const usedIsos = useMemo(() => groups.map((group) => group.iso3), [groups]);

  /* Picking a country that already has a record adds to it rather than making another. */
  const record = useMemo(() => {
    if (isCrypto) return null;
    if (mode !== "create") return target?.record ?? null;
    return groups.find((group) => group.iso3 === country?.alpha3)?.record ?? null;
  }, [isCrypto, mode, target, groups, country]);

  const usedMethods = useMemo(
    () => groups.find((group) => group.iso3 === country?.alpha3)?.usedMethods ?? [],
    [groups, country],
  );

  const {
    methods,
    isLoading: methodsLoading,
    error: methodsError,
  } = useAvailableMethods(country?.alpha3, transactionType);

  const available = useMemo(
    () =>
      methods.transfer.filter(
        (item) =>
          TRANSFER_METHODS.includes(item.value) &&
          userDetails?.level?.international_transfer?.[LEVEL_FLAG_BY_METHOD[item.value]],
      ),
    [methods, userDetails],
  );

  const service = available.find((item) => item.value === method) ?? null;
  const payers = service?.payers ?? [];

  const {
    fields,
    isLoading: fieldsLoading,
    error: fieldsError,
  } = useRequiredFields({
    countryIso3: country?.alpha3,
    serviceId: service?.serviceId,
    method,
    recipientType,
    enabled: !isCrypto && !!service,
  });

  const identifiers = useMemo(
    () => getThunesRequirements(fields, recipientType, method)?.channelFields ?? [],
    [fields, recipientType, method],
  );

  /*
   * The address the payout provider needs. A country other than the user's own always
   * asks for address, city and postal code; any address field the provider requires
   * (state, province...) is asked too, as the beneficiary flow does.
   */
  const [address, setAddress] = useState({});
  const senderIso = userDetails?.country?.country_iso_code;
  const isHomeCountry = !!country && country.alpha3 === senderIso;

  useEffect(() => {
    if (!open) return;
    const saved = addressFromRecord(record);
    setAddress(
      record || !isHomeCountry
        ? saved
        : {
            ...saved,
            address: userDetails?.address ?? "",
            city: userDetails?.city ?? "",
            postal_code: userDetails?.postal_code ?? "",
          },
    );
  }, [open, record?._id, country?.alpha3]);

  const addressFields = useMemo(() => {
    if (isCrypto || !country) return [];
    const required = flattenFieldSets(fields?.required_receiving_entity_fields);
    return ADDRESS_FIELDS.filter(
      (name) =>
        (!isHomeCountry && CROSS_BORDER_ADDRESS_FIELDS.includes(name)) || required.includes(name),
    );
  }, [isCrypto, country, fields, isHomeCountry]);

  /* As the old form did, African countries do not require a postal code. */
  const optionalAddress = useMemo(() => {
    const isAfrican = citiesData.find((item) => item.iso3 === country?.alpha3)?.region === "Africa";
    const providerRequires = flattenFieldSets(fields?.required_receiving_entity_fields).includes(
      "postal_code",
    );
    return isAfrican && !providerRequires ? ["postal_code"] : [];
  }, [country, fields]);

  const addressValid = addressFields.every(
    (name) => optionalAddress.includes(name) || String(address[name] ?? "").trim(),
  );

  const setAddressField = useCallback((name, value, patch = {}) => {
    setAddress((prev) => ({ ...prev, [name]: value, ...patch }));
  }, []);

  /* A single payer is not a choice, so it is picked for the user. */
  useEffect(() => {
    if (isCrypto || payers.length !== 1 || channel.payer_id) return;
    const [payer] = payers;
    setChannel((prev) => ({
      ...prev,
      payer_id: payer.id,
      ...(method === "mobile_wallet" ? { wallet_name: payer.name } : {}),
    }));
  }, [payers, isCrypto, method, channel.payer_id]);

  /* Where the provider has no IBAN, the bank is looked up by SWIFT instead. */
  useEffect(() => {
    if (method !== "bank_account" || isEdit || channel.bank_iban || !identifiers.length) return;
    const accNumType = identifiers.includes("iban") ? "IBAN" : "Swift";
    if (channel.accNumType !== accNumType) setChannel((prev) => ({ ...prev, accNumType }));
  }, [identifiers, method, isEdit]);

  const takenNumbers = useMemo(
    () =>
      groups
        .flatMap((group) => group.record?.mobile_wallet ?? [])
        .filter((entry) => !(isEdit && entry?._id && entry._id === target?.channelId))
        .map((entry) => entry?.wallet_account_number)
        .filter(Boolean),
    [groups, isEdit, target],
  );

  const takenAddresses = useMemo(
    () =>
      cryptoRows
        .filter((row) => !(isEdit && row.key === target?.key))
        .map((row) =>
          String(row.entry?.wallet_address ?? "")
            .trim()
            .toLowerCase(),
        ),
    [cryptoRows, isEdit, target],
  );

  const onValidChange = useCallback((valid) => setDetailsValid(valid), []);

  const selectMethod = (value) => {
    setMethod(value);
    setDetailsValid(false);
    setWalletError("");
    setChannel(prefillChannel({ method: value, record: null, userDetails }));
  };

  const selectCountry = (next) => {
    setCountry(next);
    setMethod("");
    setChannel({});
  };

  const goBack = () => {
    const index = stages.indexOf(stage);
    if (index > 0) setStage(stages[index - 1]);
  };

  const save = async () => {
    setBusy(true);
    const ok = isCrypto
      ? await saveCryptoAccount({ channel, editing: isEdit ? target : null })
      : await saveFiatAccount({
          record,
          country,
          method,
          channel,
          vendor:
            service?.vendor ??
            record?.[CHANNEL_KEY_BY_METHOD[method]]?.[0]?.vendor ??
            record?.vendor,
          address: addressFields.length ? address : {},
        });
    setBusy(false);
    if (ok) onClose();
  };

  const goNext = async () => {
    if (stage === "confirm") return save();

    if (stage === "details" && method === "mobile_wallet") {
      setBusy(true);
      const error = await verifyWalletNumber(channel.wallet_account_number);
      setBusy(false);
      setWalletError(error ? t(error) : "");
      if (error) return;
    }

    setStage(stages[stages.indexOf(stage) + 1]);
  };

  const primaryDisabled = () => {
    if (busy) return true;
    switch (stage) {
      case "country":
        return !country;
      case "method":
        return !method || (!isCrypto && !service);
      case "details":
        return !detailsValid || !addressValid;
      default:
        return false;
    }
  };

  const primaryLabel = () => {
    if (stage !== "confirm") return busy ? t("Checking...") : t("Continue");
    if (busy) return t("Saving...");
    return isEdit ? t("Save changes") : t("Add account");
  };

  const subtitle = () => {
    switch (stage) {
      case "country":
        return t("Where do you want to receive your money?");
      case "method":
        return t("How do you want to receive it?");
      case "details":
        return t(DETAILS_SUBTITLE[method] ?? "Enter your account details");
      default:
        return t("Check the details and confirm");
    }
  };

  const renderBody = () => {
    switch (stage) {
      case "country":
        return (
          <StepCountry
            countries={countries}
            country={country}
            onSelect={selectCountry}
            usedIsos={usedIsos}
            holderName={holderName}
            onOpenBeneficiaries={() => {
              onClose();
              navigate("/beneficiaries");
            }}
          />
        );
      case "method":
        return (
          <>
            <ContextCard
              initial={
                country?.file_url ? (
                  <img
                    className={styles.contextFlag}
                    src={country.file_url}
                    alt=""
                    draggable="false"
                  />
                ) : (
                  country?.name?.charAt(0)
                )
              }
              name={country?.name}
              meta={t("In your name: {{name}}", { name: holderName })}
              actionLabel={mode === "create" ? t("Change") : undefined}
              onAction={() => setStage("country")}
            />
            <StepMethod
              countryName={country?.name ?? ""}
              method={method}
              available={available}
              isLoading={methodsLoading}
              error={methodsError}
              usedMethods={usedMethods}
              cryptoCount={cryptoRows.length}
              onSelect={selectMethod}
            />
          </>
        );
      case "details":
        return (
          <StepDetails
            method={method}
            country={country}
            holderName={holderName}
            channel={channel}
            setChannel={setChannel}
            payers={payers}
            identifiers={identifiers}
            requirementsLoading={methodsLoading || fieldsLoading}
            requirementsError={
              methodsError || fieldsError || (!methodsLoading && !service && !isCrypto)
            }
            takenNumbers={takenNumbers}
            takenAddresses={takenAddresses}
            walletError={walletError}
            onValidChange={onValidChange}
            onChange={stages.includes("method") ? () => setStage("method") : null}
            addressFields={addressFields}
            optionalAddress={optionalAddress}
            address={address}
            onAddressChange={setAddressField}
          />
        );
      case "confirm":
        return (
          <StepConfirm
            method={method}
            country={country}
            channel={channel}
            payers={payers}
            holderName={holderName}
            address={addressFields.length ? address : null}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      aria-labelledby="add-withdrawal-account"
    >
      <div className={abf.root}>
        <div className={abf.modal}>
          <div className={abf.header}>
            <div className={abf.titleRow}>
              <div className={abf.titleText}>
                <h2 className={abf.title} id="add-withdrawal-account">
                  {isEdit ? t("Edit withdrawal account") : t("Add withdrawal account")}
                </h2>
                <p className={abf.subtitle}>{subtitle()}</p>
              </div>
              <button type="button" className={abf.closeBtn} onClick={onClose} disabled={busy}>
                <X size={16} />
              </button>
            </div>

            <Stepper
              steps={stages.map((item) => t(STAGE_LABELS[item]))}
              current={stages.indexOf(stage) + 1}
            />
          </div>

          <div className={abf.body}>{renderBody()}</div>

          <div className={abf.footer}>
            <div className={abf.footerSide}>
              {stage === stages[0] ? (
                <button
                  type="button"
                  className={`${abf.btn} ${abf.btnGhost}`}
                  onClick={onClose}
                  disabled={busy}
                >
                  {t("Cancel")}
                </button>
              ) : (
                <button
                  type="button"
                  className={`${abf.btn} ${abf.btnGhost}`}
                  onClick={goBack}
                  disabled={busy}
                >
                  <ArrowLeft size={20} />
                  {t("Back")}
                </button>
              )}
            </div>
            <div className={abf.footerSide}>
              <button
                type="button"
                className={`${abf.btn} ${abf.btnPrimary}`}
                onClick={goNext}
                disabled={primaryDisabled()}
              >
                {primaryLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddAccountFlow;
