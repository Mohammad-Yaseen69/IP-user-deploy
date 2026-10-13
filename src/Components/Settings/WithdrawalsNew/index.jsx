import { useContext, useEffect, useMemo, useState } from "react";
import { Plus } from "react-feather";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { UserContext } from "../../../Context/UserContext";
import { usePermission } from "../../../hooks/GeneralUse/usePermission";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import allCountries from "../../PaymentsNewer/CountriesData.json";
import abf from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import { Icon } from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components";
import AddAccountFlow from "./AddAccountFlow";
import AccountGroup from "./components/AccountGroup";
import CountryMeter from "./components/CountryMeter";
import EmptyState from "./components/EmptyState";
import RemoveAccountModal from "./components/RemoveAccountModal";
import styles from "./styles/WithdrawalsNew.module.css";
import useWithdrawalActions from "./useWithdrawalActions";
import { buildCountryGroups, buildCryptoRows } from "./withdrawalAccounts";
import { MAX_COUNTRIES, MAX_CRYPTO_WALLETS, TRANSFER_METHODS } from "./withdrawalPayload";

const WithdrawalsNew = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allowedCountries, userWithdrawals, cryptoWithdrawals, getWithdrawals, userDetails } =
    useContext(UserContext);
  const can = usePermission();
  const canAdd = can("settings.receiving-accounts.add");
  const canDelete = can("settings.receiving-accounts.delete");
  const { removeAccount, setDefault } = useWithdrawalActions();

  const [countries, setCountries] = useState([]);
  const [flow, setFlow] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (userDetails?._id) getWithdrawals();
  }, [userDetails?._id]);

  /* Countries the user can pay out to, keyed by the allowed-country id the record stores. */
  useEffect(() => {
    const senderIso = userDetails?.country?.country_iso_code;
    if (!senderIso || !allowedCountries?.length) return;

    apiWrapper({ endpoint: `/api/payment/countries/${senderIso}` })
      .then((payoutCountries) => {
        const supported = allCountries.filter((item) =>
          (payoutCountries || []).some((apiCountry) => apiCountry.countryIso3 === item?.alpha3),
        );
        setCountries(
          allowedCountries
            .map((allowed) => {
              const country = supported.find((item) => item?.alpha3 === allowed?.country_iso_code);
              return country ? { ...country, id: allowed?._id } : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => setCountries([]));
  }, [userDetails?.country?.country_iso_code, allowedCountries]);

  const groups = useMemo(() => buildCountryGroups(userWithdrawals), [userWithdrawals]);
  const cryptoRows = useMemo(() => buildCryptoRows(cryptoWithdrawals), [cryptoWithdrawals]);

  const usedCountries = groups.length;
  const limitReached = usedCountries >= MAX_COUNTRIES;
  const cryptoFull = cryptoRows.length >= MAX_CRYPTO_WALLETS;
  const hasAccounts = groups.length > 0 || cryptoRows.length > 0;

  const rowProps = {
    canEdit: canAdd,
    canDelete,
    onSetDefault: setDefault,
    onEdit: (row) => setFlow({ mode: "edit", target: row }),
    onRemove: setRemoving,
  };

  return (
    <div className={`${abf.root} ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t("Withdrawal accounts")}</h2>
          <p className={styles.subtitle}>
            {t("Where InstaPay sends money when you withdraw. Accounts must be in your own name.")}
          </p>
        </div>
        {hasAccounts && (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setFlow({ mode: "create" })}
            disabled={!canAdd || (limitReached && cryptoFull)}
          >
            <Plus size={18} />
            {t("Add account")}
          </button>
        )}
      </div>

      {!hasAccounts ? (
        <EmptyState canAdd={canAdd} onAdd={() => setFlow({ mode: "create" })} />
      ) : (
        <>
          <CountryMeter used={usedCountries} />

          {groups.map((group) => {
            const name = group.country?.name ?? group.iso3;
            const allMethodsUsed = TRANSFER_METHODS.every((method) =>
              group.usedMethods.includes(method),
            );
            return (
              <AccountGroup
                key={group.record._id}
                title={name}
                flag={group.country?.file_url}
                addLabel={t("Add to {{country}}", { country: name })}
                onAdd={
                  allMethodsUsed
                    ? null
                    : () =>
                        setFlow({
                          mode: "channel",
                          target: { record: group.record },
                        })
                }
                canAdd={canAdd}
                rows={group.rows}
                rowProps={rowProps}
                emptyText="No accounts in this country yet."
              />
            );
          })}

          {cryptoRows.length > 0 && (
            <AccountGroup
              title={t("Crypto wallets")}
              icon="coins"
              meta="USDT"
              addLabel={t("Add crypto wallet")}
              onAdd={cryptoFull ? null : () => setFlow({ mode: "crypto" })}
              canAdd={canAdd}
              rows={cryptoRows}
              rowProps={rowProps}
            />
          )}

          {limitReached ? (
            <div className={`${styles.footNote} ${styles.footNoteWarning}`}>
              <Icon name="warning" size={18} color="#B5A300" />
              <p>
                {t(
                  "You've reached {{max}} countries. To withdraw to another country, remove one of your accounts there first.",
                  { max: MAX_COUNTRIES },
                )}
              </p>
            </div>
          ) : (
            <div className={styles.footNote}>
              <Icon name="info" size={18} color="var(--abf-primary)" />
              <p>
                {t(
                  "Withdrawals can only go to accounts in your own name. To pay someone else, use",
                )}{" "}
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => navigate("/beneficiaries")}
                >
                  {t("Beneficiaries")}
                </button>
                .
              </p>
            </div>
          )}
        </>
      )}

      <AddAccountFlow
        open={!!flow}
        onClose={() => setFlow(null)}
        mode={flow?.mode}
        target={flow?.target}
        countries={countries}
        groups={groups}
        cryptoRows={cryptoRows}
      />

      <RemoveAccountModal
        account={removing}
        onClose={() => setRemoving(null)}
        onConfirm={removeAccount}
      />
    </div>
  );
};

export default WithdrawalsNew;
