import { useTranslation } from "react-i18next";
import styles from "../../CryptoWallet/cryptoPage.module.scss";

/**
 * Switches which channel's networks/address are shown below. Only rendered
 * once there is more than one channel — with a single channel it's already
 * selected and there's nothing to switch between.
 */
const ChannelSelector = ({ channels = [], selectedUuid, onSelect }) => {
  const { t } = useTranslation();

  if (channels.length <= 1) return null;

  return (
    <div>
      <div className={styles.sectionLabel}>{t("Select Channel")}</div>
      <div className={styles.networkTabs}>
        {channels.map((channel) => {
          const isSelected = channel.uuid === selectedUuid;
          return (
            <button
              key={channel.uuid}
              type="button"
              className={`${styles.networkTab} ${isSelected ? styles.networkTabActive : ""}`}
              onClick={() => onSelect(channel.uuid)}
            >
              <span>{channel.payCurrency}</span>
              {channel.status ? (
                <span
                  className={`${styles.protocolChip} ${isSelected ? styles.protocolChipActive : ""}`}
                >
                  {channel.status}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelSelector;
