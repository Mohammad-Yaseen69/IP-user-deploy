import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "react-feather";
import styles from "./sendCrypto.module.scss";
import {
  getBeneficiaryCryptoChannels,
  getChannelAddress,
  getChannelAsset,
  getProtocolLabel,
  maskAddress,
} from "./cryptoProtocols";

const getBeneficiaryName = (beneficiary) => {
  const name = [beneficiary?.first_name, beneficiary?.last_name]
    .filter(Boolean)
    .join(" ");
  return (
    name ||
    beneficiary?.company_name ||
    beneficiary?.legalName ||
    beneficiary?.name ||
    "Beneficiary"
  );
};

const getBeneficiaryId = (beneficiary) => beneficiary?._id || beneficiary?.id;

const BeneficiaryStep = ({
  beneficiaries = [],
  selectedBeneficiary,
  onSelectBeneficiary,
  cryptoChannels = [],
  selectedChannel,
  onSelectChannel,
  protocolOptions = [],
  protocol,
  setProtocol,
  isProtocolLocked = false,
  addressStatus,
  cryptoCurrency,
  errorMessage,
  onEditBeneficiary,
  onAddBeneficiary,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return beneficiaries;
    return beneficiaries.filter((beneficiary) =>
      `${getBeneficiaryName(beneficiary)} ${beneficiary?.country_name || ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [beneficiaries, query]);

  const address = getChannelAddress(selectedChannel);

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          <span>{t("Select beneficiary")}</span>
          <button
            type="button"
            className={styles.addBtn}
            onClick={onAddBeneficiary}
          >
            <Plus size={14} />
            {t("Add New")}
          </button>
        </div>

        <label className={styles.searchBox}>
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Search beneficiaries")}
          />
        </label>

        <div className={styles.beneficiaryList}>
          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              {t(
                "No beneficiaries with a saved crypto wallet address. Add one to send crypto.",
              )}
            </div>
          )}

          {filtered.map((beneficiary) => {
            const id = getBeneficiaryId(beneficiary);
            const selected = getBeneficiaryId(selectedBeneficiary) === id;
            const channels = getBeneficiaryCryptoChannels(beneficiary);
            const firstAddress = getChannelAddress(channels[0]);

            return (
              <button
                type="button"
                key={id}
                className={`${styles.beneficiaryCard} ${selected ? styles.selectedBeneficiary : ""}`}
                onClick={() => onSelectBeneficiary(beneficiary)}
              >
                <span className={styles.avatar}>
                  {getBeneficiaryName(beneficiary).charAt(0).toUpperCase()}
                </span>
                <span className={styles.beneficiaryCopy}>
                  <strong>{getBeneficiaryName(beneficiary)}</strong>
                  <small>{maskAddress(firstAddress)}</small>
                </span>
                <span className={styles.assetBadge}>
                  {channels.length > 1
                    ? `${channels.length} ${t("wallets")}`
                    : t("Crypto")}
                </span>
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div className={styles.dangerBox}>
            <span className={styles.dangerText}>
              {errorMessage}
              {onEditBeneficiary && (
                <>
                  {" "}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={onEditBeneficiary}
                  >
                    {t("Edit beneficiary")}
                  </button>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {selectedBeneficiary && cryptoChannels.length > 1 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>{t("Destination wallet")}</div>
          <div className={styles.beneficiaryList}>
            {cryptoChannels.map((channel, index) => {
              const channelAddress = getChannelAddress(channel);
              const selected =
                getChannelAddress(selectedChannel) === channelAddress;
              return (
                <button
                  type="button"
                  key={channel?._id || `${channelAddress}-${index}`}
                  className={`${styles.beneficiaryCard} ${selected ? styles.selectedBeneficiary : ""}`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <span className={styles.beneficiaryCopy}>
                    <strong>{maskAddress(channelAddress)}</strong>
                    <small>{getChannelAsset(channel) || cryptoCurrency}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {address && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>{t("Destination address")}</div>
          <div className={styles.addressBox}>
            <span className={styles.addressValue}>{address}</span>
            <span className={styles.addressMeta}>
              {addressStatus === "checking" && (
                <span>{t("Checking address...")}</span>
              )}
              {addressStatus === "valid" && (
                <span className={styles.addressOk}>
                  {t("Valid for")} {getProtocolLabel(protocol)}
                </span>
              )}
              {addressStatus === "invalid" && (
                <span className={styles.addressBad}>
                  {isProtocolLocked
                    ? t(
                        "This address is not valid on the network saved for this beneficiary.",
                      )
                    : t("This address is not valid for the selected network.")}
                  {onEditBeneficiary && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={onEditBeneficiary}
                      >
                        {t("Edit beneficiary")}
                      </button>
                    </>
                  )}
                </span>
              )}
              {!addressStatus && (
                <span>{t("Taken from the saved beneficiary wallet.")}</span>
              )}
            </span>
          </div>
        </div>
      )}

      {address && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <span>{t("Network")}</span>
            <span className={styles.sectionHint}>
              {isProtocolLocked
                ? t("Saved with this beneficiary")
                : t("Must match what the recipient supports")}
            </span>
          </div>
          {isProtocolLocked && protocol ? (
            <div className={styles.protocolGrid}>
              <span
                className={`${styles.protocolChip} ${styles.protocolChipActive}`}
              >
                {getProtocolLabel(protocol)}
              </span>
            </div>
          ) : protocolOptions.length > 0 ? (
            <div className={styles.protocolGrid}>
              {protocolOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`${styles.protocolChip} ${protocol === option ? styles.protocolChipActive : ""}`}
                  onClick={() => setProtocol(option)}
                >
                  {getProtocolLabel(option)}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              {t(
                "We could not work out which network this address belongs to. Edit the beneficiary and save the wallet with its network.",
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BeneficiaryStep;
