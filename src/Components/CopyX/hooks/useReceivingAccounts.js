import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import allCountries from "../../PaymentsNewer/CountriesData.json";
import {
  buildCountryGroups,
  buildCryptoRows,
} from "../../Settings/WithdrawalsNew/withdrawalAccounts";
import { MAX_COUNTRIES, TRANSFER_METHODS } from "../../Settings/WithdrawalsNew/withdrawalPayload";
import { currencyForCountry } from "../api/fx";

const PAYOUT_METHODS = ["mobile_wallet", "bank_account", "cash_pickup"];

/* Accounts that exist when the page first loads; anything newer was added during this session. */
let initialIds = null;

const toAccount = (row) => {
  const iso3 = row.record?.iso_code;
  const country = allCountries.find((item) => item.alpha3 === iso3);
  const number =
    row.entry?.wallet_account_number ??
    row.entry?.iban ??
    row.entry?.account_number ??
    row.entry?.document_number ??
    "";
  return {
    id: row.channelId || row.key,
    method: row.method,
    providerLabel: row.title,
    detail: row.subtitle,
    last4: String(number).replace(/\s/g, "").slice(-4),
    countryIso3: iso3,
    countryName: country?.name ?? iso3,
    flag: country?.file_url ? `https:${country.file_url}` : null,
    currency: currencyForCountry(iso3),
    isDefault: row.isDefault,
    status: "verified",
  };
};

/*
 * The customer's real InstaPay receiving accounts (Settings → Receiving Accounts), plus what the
 * existing AddAccountFlow needs to create one: the allowed payout countries, groups and crypto rows.
 */
const useReceivingAccounts = () => {
  const { userDetails, allowedCountries, userWithdrawals, cryptoWithdrawals, getWithdrawals } =
    useContext(UserContext) || {};
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (userDetails?._id) getWithdrawals?.();
  }, [userDetails?._id]);

  /* Same lookup as Settings: payout countries for the sender, limited to the account's allowed list. */
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

  const groups = useMemo(() => buildCountryGroups(userWithdrawals || []), [userWithdrawals]);
  const cryptoRows = useMemo(() => buildCryptoRows(cryptoWithdrawals || []), [cryptoWithdrawals]);

  const accounts = useMemo(() => {
    const list = groups
      .flatMap((group) => group.rows)
      .filter((row) => PAYOUT_METHODS.includes(row.method))
      .map(toAccount);
    if (userWithdrawals && !initialIds) initialIds = new Set(list.map((account) => account.id));
    return list.map((account) => ({
      ...account,
      newlyAdded: !!initialIds && !initialIds.has(account.id),
    }));
  }, [groups, userWithdrawals]);

  /* Settings' rule: up to three countries, each with one account per method. */
  const canAddCountry = groups.length < MAX_COUNTRIES;
  const canAdd =
    canAddCountry ||
    groups.some((group) => !TRANSFER_METHODS.every((method) => group.usedMethods.includes(method)));

  return {
    accounts,
    groups,
    cryptoRows,
    countries,
    canAdd,
    loaded: Array.isArray(userWithdrawals),
  };
};

export default useReceivingAccounts;
