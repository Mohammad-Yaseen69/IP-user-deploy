import { useLocation, useNavigate } from "react-router";
import styles from "./styles/steptwo.module.css";
import { useEffect, useMemo, useState } from "react";
import search_icon from "./files/search.svg";
import { service_name_formatter } from "../../TransactionsNewApi/TransactionItem";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import AddBeneficiary from "../../AddBeneficiary";
import QuickAddBeneficiary from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/QuickAddBeneficiary";
import { USE_NEW_BENEFICIARY_FLOW } from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/constants";
import { buildTransactionBeneficiaryDetails } from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/buildPayloads";
import { getBeneficiaryDisplayName, getBeneficiaryInitial } from "./beneficiaryHelpers";
import {
  useBeneficiariesPage,
  useInvalidateBeneficiaryPages,
} from "../../../hooks/BeneficiaryHooks/useBeneficiariesPage";

function levenshteinDistance(a, b) {
  const dp = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[a.length][b.length];
}

function calculateSimilarity(a, b) {
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return ((maxLen - distance) / maxLen) * 100;
}

const findSimilarBankBeneficiaries = (array, word, threshold = 60) =>
  array.filter(
    (item) =>
      calculateSimilarity((item?.bank_details?.[0]?.name ?? "").toLowerCase(), word ?? "") >=
      threshold,
  );

const StepTwo = ({ data, dataHandler }) => {
  const { t } = useTranslation();
  const invalidateBeneficiaryPages = useInvalidateBeneficiaryPages();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showOthers, setShowOthers] = useState(false);
  const [showBeneficiaryAddModal, setShowBeneficiaryAddModal] = useState(false);
  const [addFormInitialValues, setAddFormInitialValues] = useState(null);

  const openAddForm = (initialValues = null) => {
    setAddFormInitialValues(initialValues);
    setShowBeneficiaryAddModal(true);
  };

  const channel = data.payoutChannel?.value;
  const isBank = channel === "bank";
  const payerName = data.payer?.name?.toLowerCase();
  // Channel, country, mobile payer and C/B type are filtered on the server, page by page.
  const pickerFilters = {
    channel,
    country: data.country?.alpha3,
    payer: channel === "mobile" ? data.payer?.id : undefined,
    beneficiary_type: data.transactionType === "C" ? "individual" : "business",
  };
  const {
    beneficiaries: channelBens,
    hasNextPage,
    loaderRef,
    isFetched,
  } = useBeneficiariesPage({
    limit: 20,
    search,
    sort: "date_desc",
    filters: pickerFilters,
    enabled: !!channel,
  });

  useEffect(() => {
    if (!USE_NEW_BENEFICIARY_FLOW || !showBeneficiaryAddModal) return;

    dataHandler("isAddingBeneficiary", true);
    return () => {
      dataHandler("isAddingBeneficiary", false);
      dataHandler("pendingBeneficiary", null);
    };
  }, [showBeneficiaryAddModal]);

  const handleDraftChange = (draft, saveForFuture) => {
    if (!draft) {
      dataHandler("pendingBeneficiary", null);
      return;
    }

    const draftDetails = buildTransactionBeneficiaryDetails({
      form: draft.form,
      beneficiaryPayload: draft.beneficiaryPayload,
      channelPayload: draft.channelPayload,
      saveForFuture,
    });

    dataHandler("pendingBeneficiary", {
      ...draftDetails,
      isNew: true,
      draftDetails,
      draftForm: draft.form,
    });
  };

  const draftBeneficiary = data.beneficiary?.isNew ? data.beneficiary : null;

  const filterd = useMemo(
    () => (isBank ? findSimilarBankBeneficiaries(channelBens, payerName) : channelBens),
    [channelBens, isBank, payerName],
  );
  const bankBens = isBank ? channelBens : [];

  useEffect(() => {
    if (isBank && isFetched && filterd.length === 0) setShowOthers(true);
  }, [isBank, isFetched, filterd.length]);

  useEffect(() => {
    if (search.length > 0 && data.beneficiary?._id) dataHandler("beneficiary", {});
  }, [search]);

  const message =
    channel === "mobile" || isBank || data.country?.alpha3
      ? t(`No beneficiary found from {{country}} having {{value}} details.`, {
          value: channel === "mobile" || isBank ? data.payer?.name : channel,
          country: data.country?.name,
        })
      : t("No beneficiary found.");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recipient = queryParams.get("recipient");

  const { beneficiaries: recipientMatches } = useBeneficiariesPage({
    limit: 1,
    filters: { ...pickerFilters, id: recipient },
    enabled: !!recipient && !!channel && !data.beneficiary?._id && !data.beneficiary?.isNew,
  });
  useEffect(() => {
    if (!recipient || data.beneficiary?._id || data.beneficiary?.isNew) return;

    const [ben] = isBank
      ? findSimilarBankBeneficiaries(recipientMatches, payerName)
      : recipientMatches;
    if (ben) dataHandler("beneficiary", ben);
  }, [recipient, recipientMatches]);
  if (USE_NEW_BENEFICIARY_FLOW && showBeneficiaryAddModal) {
    return (
      <div className={styles.container}>
        <QuickAddBeneficiary
          country={data.country}
          recipientType={data.transactionType === "C" ? "individual" : "business"}
          service={data.payoutChannel}
          payer={data.payer}
          payerRequiredFields={data.payerRequiredFields?.[0] || []}
          initialValues={addFormInitialValues}
          onCancel={() => setShowBeneficiaryAddModal(false)}
          onDraftChange={handleDraftChange}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {window.innerWidth > 1000 && (
        <div className={styles.top}>
          <span>{t("Beneficiaries")}</span>
          <button
            onClick={() => {
              openAddForm();
            }}
          >
            <span>{t("Add Beneficiaries")}</span>
          </button>
        </div>
      )}
      <div className={styles.search}>
        <img src={search_icon} alt="asdadf" />
        <input
          type="search"
          placeholder={t("Search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {window.innerWidth < 1000 && (
        <div className={styles.top}>
          <span style={{ opacity: 0, scale: 0, pointerEvents: "none" }}>{t("Beneficiaries")}</span>
          <button onClick={() => navigate("/beneficiaries")}>
            <span>{t("Manage Beneficiaries")}</span>
          </button>
        </div>
      )}
      <div className={styles.beneficiaries}>
        {draftBeneficiary && (
          <div style={{ marginBottom: "8px" }} className={`${styles.ben_card} ${styles.active}`}>
            <div style={{ flexShrink: 0 }} className={styles.dp}>
              {getBeneficiaryInitial(draftBeneficiary)}
            </div>
            <div style={{ width: "100%" }} className={styles.ben_details}>
              <div className={styles.bd_top}>
                <h5>{getBeneficiaryDisplayName(draftBeneficiary)}</h5>
                <div className={styles.badge}>
                  <span>{t("New")}</span>
                </div>
                {draftBeneficiary.draftForm && (
                  <button
                    type="button"
                    className={styles.badge}
                    style={{
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                    onClick={() =>
                      openAddForm({
                        beneficiary: draftBeneficiary.draftForm.beneficiary,
                        channel: draftBeneficiary.draftForm.channel,
                        saveForFuture: draftBeneficiary.draftDetails?.saveForFuture,
                      })
                    }
                  >
                    <span>{t("Edit")}</span>
                  </button>
                )}
              </div>
              <span>
                {data?.payoutChannel?.value === "mobile"
                  ? t("Mobile Wallet")
                  : data?.payoutChannel?.value === "cash"
                    ? t("Cash Point")
                    : t("Bank")}
                :{data?.payer?.name ?? ""}
              </span>
              {data.payoutChannel?.value === "bank" &&
                (draftBeneficiary.bank_details?.[0]?.iban ||
                  draftBeneficiary.bank_details?.[0]?.account_number) && (
                  <span>
                    {draftBeneficiary.bank_details[0].iban
                      ? `${t("IBAN")}: ${draftBeneficiary.bank_details[0].iban}`
                      : `${t("Account Number")}: ${draftBeneficiary.bank_details[0].account_number}`}
                  </span>
                )}
              {data.payoutChannel?.value === "mobile" &&
                draftBeneficiary.mobile_wallet?.[0]?.wallet_account_number && (
                  <span>{`${t("Number")}: ${draftBeneficiary.mobile_wallet[0].wallet_account_number}`}</span>
                )}
            </div>
          </div>
        )}
        {filterd?.length > 0 ? (
          filterd?.map((item) => (
            <div
              key={item?._id}
              className={`${styles.ben_card} ${data?.beneficiary?._id === item?._id ? styles.active : ""}`}
              onClick={() => dataHandler("beneficiary", item)}
            >
              <div style={{ flexShrink: 0 }} className={styles.dp}>
                {item?.first_name?.[0] ?? item?.company_name?.[0]}
              </div>
              <div style={{ width: "100%" }} className={styles.ben_details}>
                <div className={styles.bd_top}>
                  <h5>
                    {(item?.first_name || item?.company_name || "") +
                      (item?.last_name ? ` ${item.last_name}` : "")}
                  </h5>
                  {/* {
                                            window.innerWidth > 1000 &&
                                            <div className={styles.badge}>
                                                <img src={active} alt="" />
                                                <span style={{ maxWidth: "40ch", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                    {service_name_formatter(data?.payer?.name)}
                                                </span>
                                            </div>
                                        } */}
                </div>
                <span>
                  {data?.payoutChannel?.value === "mobile"
                    ? t("Mobile Wallet")
                    : data?.payoutChannel?.value === "cash"
                      ? t("Cash Point")
                      : t("Bank")}
                  :
                  {data?.payoutChannel?.value === "mobile"
                    ? data?.payer?.name
                    : data?.payoutChannel?.value === "cash"
                      ? data?.payer?.name
                      : service_name_formatter(
                          item?.bank_details?.[0]?.bank_name ??
                            item?.bank_details?.[0]?.name ??
                            "N/A",
                        )}
                </span>
                <span>
                  {data.payoutChannel?.value === "bank" &&
                    (item?.bank_details?.[0]?.iban
                      ? `${t("IBAN")}: ${item?.bank_details?.[0]?.iban}`
                      : `${t("Account Number")}: ${item?.bank_details?.[0]?.account_number}`)}
                  {data.payoutChannel?.value === "mobile" &&
                    `${t("Number")}: ${item?.mobile_wallet?.[0]?.wallet_account_number}`}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              margin: "1rem auto",
              textAlign: "center",
              fontSize: ".8rem",
            }}
          >
            {message?.replace("No", data.transactionType === "C" ? "No individual" : "No business")}
            <span
              onClick={() => {
                openAddForm();
              }}
              style={{ cursor: "pointer", color: "#3a04e2" }}
            >
              {t("Add Now")}
            </span>
          </div>
        )}
        {filterd.length > 0 && data.payoutChannel?.value === "bank" && bankBens?.length > 0 && (
          <div
            onClick={() => setShowOthers(!showOthers)}
            style={{
              margin: "1rem 0",
              textAlign: "center",
              color: "#5926f0",
              textDecoration: "underline",
              fontSize: ".7rem",
              cursor: "pointer",
            }}
          >
            {showOthers ? t("Show Less") : t("Show More")}
          </div>
        )}
        {data.payoutChannel?.value === "bank" && bankBens?.length > 0 && showOthers ? (
          <div style={{ marginTop: "1rem" }}>
            <span style={{ marginTop: "1rem" }}>{t("Other Beneficiaries:")} </span>
            {bankBens.map((item) => (
              <div
                key={item?._id}
                style={{ marginTop: "8px" }}
                className={`${styles.ben_card} ${data?.beneficiary?._id === item?._id ? styles.active : ""}`}
                onClick={() => {
                  dataHandler("beneficiary", item);
                  console.log(item);
                }}
              >
                <div className={styles.dp}>{item?.first_name?.[0] ?? item?.company_name?.[0]}</div>
                <div className={styles.ben_details}>
                  <div className={styles.bd_top}>
                    <h5>
                      {(item?.first_name || item?.company_name || "") +
                        (item?.last_name ? ` ${item.last_name}` : "")}
                    </h5>
                    {/* {
                                                    window.innerWidth > 1000 &&
                                                    <div className={styles.badge}>
                                                        <img src={active} alt="" />
                                                        <span style={{ maxWidth: "40ch", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                                            {service_name_formatter(data?.payer?.name)}
                                                        </span>
                                                    </div>
                                                } */}
                  </div>
                  {data?.payoutChannel?.value === "mobile" ? (
                    <span>
                      {t("Mobile Wallet")} : {data?.payer?.name ?? ""}
                    </span>
                  ) : data?.payoutChannel?.value === "cash" ? (
                    <span>
                      {t("Cash Point")} : {data?.payer?.name ?? ""}
                    </span>
                  ) : item?.bank_details?.[0]?.bank_name || item?.bank_details?.[0]?.name ? (
                    <span>
                      {t("Bank")} :{" "}
                      {service_name_formatter(
                        item?.bank_details?.[0]?.bank_name ?? item?.bank_details?.[0]?.name,
                      )}
                    </span>
                  ) : null}
                  <span>
                    {data.payoutChannel?.value === "bank" &&
                      (item?.bank_details?.[0]?.iban
                        ? `${t("IBAN")}: ${item?.bank_details?.[0]?.iban}`
                        : `${"Account Number"}: ${item?.bank_details?.[0]?.account_number}`)}
                    {data.payoutChannel?.value === "mobile" &&
                      `NUMBER: ${item?.mobile_wallet?.[0]?.wallet_account_number}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}
        {hasNextPage && <div ref={loaderRef} style={{ height: 40 }} />}
      </div>

      {!USE_NEW_BENEFICIARY_FLOW && (
        <Modal
          style={{ minWidth: window.innerWidth > 1000 && "900px" }}
          toggle={() => setShowBeneficiaryAddModal(false)}
          isOpen={showBeneficiaryAddModal}
        >
          <ModalBody style={{ padding: "0px" }}>
            <AddBeneficiary
              inInternationalModal={true}
              toggleHandler={async (addedBen) => {
                await invalidateBeneficiaryPages();
                dataHandler("beneficiary", addedBen);
                setShowBeneficiaryAddModal(false);
              }}
            />
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default StepTwo;
