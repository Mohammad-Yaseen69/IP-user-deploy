import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal as MuiModal } from "@mui/material";
import abf from "../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/AddBeneficiaryFlowV2.module.css";
import { CRYPTO_ASSETS } from "../api/fixtures";
import closeIcon from "../assets/figma/fund-close.svg";
import globeFieldIcon from "../assets/figma/fund-globe.svg";
import lockIcon from "../assets/figma/fund-lock.svg";
import radioOnIcon from "../assets/figma/fund-radio-on.svg";
import searchIcon from "../assets/figma/fund-search.svg";
import { formatAmount } from "../state/money";
import styles from "../styles/copyTrading.module.css";
import { methodIconSrc, methodTitle } from "./methodDisplay";
import d from "./PaymentMethodDialog.module.css";

const cx = (...names) => names.filter(Boolean).join(" ");

/* WEB-05. Methods come from the capability service; mobile money and crypto need a second choice. */
const PaymentMethodDialog = ({
  open,
  onClose,
  methods,
  wallets = [],
  wallet,
  iban,
  country,
  initial,
  onSelect,
  onAddFunds,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState(initial?.family || "instapay_wallet");
  const [provider, setProvider] = useState(initial?.provider || "");
  const [asset, setAsset] = useState(initial?.asset || "");
  const [network, setNetwork] = useState(initial?.network || "");
  const [walletId, setWalletId] = useState(initial?.walletId || wallet?.id || "");
  const chosenWallet = wallets.find((item) => item.id === walletId) || wallet || null;

  const describe = (method) => {
    if (method.id === "instapay_wallet") {
      return chosenWallet
        ? t("{{balance}} available · fee 0", {
            balance: formatAmount(chosenWallet.balance, chosenWallet.currency),
          })
        : t(method.description);
    }
    if (method.requiresIban && !iban) return t("Apply for an InstaPay IBAN to use this method");
    if (method.requiresIban && iban)
      return t("Send from any bank to {{iban}}", { iban: iban.masked });
    return t(method.description);
  };

  const visible = useMemo(
    () =>
      methods.filter((method) =>
        methodTitle(method, iban, t, chosenWallet?.currency)
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [methods, query, iban, t, chosenWallet?.currency],
  );
  const available = visible.filter((method) => method.available && !(method.requiresIban && !iban));
  const unavailable = visible.filter((method) => !available.includes(method));
  const assetData = CRYPTO_ASSETS.find((item) => item.id === asset);

  const resolved = (() => {
    const method = methods.find((item) => item.id === family);
    if (!method) return null;
    const base = { family, label: method.label, icon: method.icon };
    if (family === "instapay_wallet") {
      return chosenWallet
        ? {
            ...base,
            walletId: chosenWallet.id,
            currency: chosenWallet.currency,
            detail: `${formatAmount(chosenWallet.balance, chosenWallet.currency)} available`,
          }
        : null;
    }
    if (family === "mobile_money")
      return provider
        ? { ...base, provider, detail: country ? `${provider} · ${country}` : provider }
        : null;
    if (family === "crypto")
      return asset && network
        ? { ...base, asset: assetData.label, network, detail: `${assetData.label} · ${network}` }
        : null;
    if (family === "instapay_iban") return { ...base, detail: iban?.masked };
    return { ...base, detail: method.description };
  })();

  const chip = (key, label, active, onClick, disabled) => (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      className={cx(d.chip, active && d.chipActive)}
      onClick={onClick}
    >
      {label}
    </button>
  );

  const extra = () => {
    if (family === "instapay_wallet" && wallets.length > 1) {
      return (
        <div className={d.extra}>
          <div className={d.chips} role="radiogroup" aria-label={t("Wallet")}>
            {wallets.map((item) =>
              chip(
                item.id,
                `${item.currency} · ${formatAmount(item.balance, item.currency)}`,
                chosenWallet?.id === item.id,
                () => setWalletId(item.id),
              ),
            )}
          </div>
        </div>
      );
    }
    if (family === "mobile_money") {
      const options = methods.find((item) => item.id === "mobile_money")?.providers || [];
      return (
        <div className={d.extra}>
          <div className={d.chips} role="radiogroup" aria-label={t("Operator")}>
            {options.map((option) =>
              chip(option, option, provider === option, () => setProvider(option)),
            )}
          </div>
        </div>
      );
    }
    if (family === "crypto") {
      return (
        <div className={d.extra}>
          <div className={d.chips} role="radiogroup" aria-label={t("Asset")}>
            {CRYPTO_ASSETS.map((item) =>
              chip(
                item.id,
                item.label,
                asset === item.id,
                () => {
                  setAsset(item.id);
                  setNetwork("");
                },
                !item.networks.length,
              ),
            )}
          </div>
          {assetData && (
            <div className={d.chips} role="radiogroup" aria-label={t("Network")}>
              {assetData.networks.map((item) =>
                chip(item, item, network === item, () => setNetwork(item)),
              )}
            </div>
          )}
          <p className={d.hint}>
            {t(
              "Only provider-supported asset and network pairs are shown. The address appears on the provider's secure checkout.",
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  const option = (method, enabled) => {
    const selected = enabled && family === method.id;
    return (
      <div
        key={method.id}
        className={cx(d.method, selected && d.methodSelected, !enabled && d.methodDisabled)}
      >
        <button
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={!enabled}
          className={d.methodRow}
          onClick={() => setFamily(method.id)}
        >
          {!enabled ? (
            <img className={d.lock} src={lockIcon} alt="" />
          ) : selected ? (
            <img className={d.radioImg} src={radioOnIcon} alt="" />
          ) : (
            <span className={d.radio} aria-hidden="true" />
          )}
          <span className={d.tile}>
            <img src={methodIconSrc(method.icon, !enabled)} alt="" />
          </span>
          <span className={d.text}>
            <span className={d.methodTitle}>
              {methodTitle(method, iban, t, chosenWallet?.currency)}
            </span>
            <span className={d.methodSub}>
              {enabled ? describe(method) : t(method.reason || method.description)}
            </span>
          </span>
          {enabled && method.tag && <span className={d.tag}>{t(method.tag)}</span>}
        </button>
        {selected && extra()}
      </div>
    );
  };

  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="ct-method-title"
      BackdropProps={{ className: d.scrim }}
    >
      <div className={cx(abf.root, styles.tokens, d.dialog)}>
        <div className={d.head}>
          <div className={d.titleBlock}>
            <h2 id="ct-method-title" className={d.title}>
              {t("Choose payment method")}
            </h2>
            <p className={d.subtitle}>{t("Select an available payment method.")}</p>
          </div>
          <button type="button" className={d.close} onClick={onClose} aria-label={t("Close")}>
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <div className={d.filters}>
          <label className={cx(d.field, d.search)}>
            <img src={searchIcon} alt="" />
            <span className={styles.srOnly}>{t("Search methods or providers")}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search methods or providers")}
            />
          </label>
          <span className={cx(d.field, d.country)}>
            <img src={globeFieldIcon} alt="" />
            {country || t("All countries")}
          </span>
        </div>

        <p className={d.group}>{t("Available for you")}</p>
        <div className={d.list} role="radiogroup" aria-label={t("Available for you")}>
          {available.map((method) => option(method, true))}
        </div>

        {unavailable.length > 0 && (
          <>
            <p className={cx(d.group, d.groupSpaced)}>{t("Unavailable for this transaction")}</p>
            <div className={d.list}>{unavailable.map((method) => option(method, false))}</div>
          </>
        )}

        <div className={d.foot}>
          <button type="button" className={cx(d.btn, d.btnTertiary)} onClick={onAddFunds}>
            {t("Add funds")}
          </button>
          <p className={d.footNote}>{t("Changing the method creates a new quote.")}</p>
          <button type="button" className={cx(d.btn, d.btnSecondary)} onClick={onClose}>
            {t("Cancel")}
          </button>
          <button
            type="button"
            className={cx(d.btn, d.btnPrimary)}
            onClick={() => {
              onSelect(resolved);
              onClose();
            }}
            disabled={!resolved}
          >
            {t("Select method")}
          </button>
        </div>
      </div>
    </MuiModal>
  );
};

export default PaymentMethodDialog;
