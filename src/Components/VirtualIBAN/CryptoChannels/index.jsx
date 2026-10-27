import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Inbox, Plus } from "react-feather";
import InstaPayLoader from "../../Loader";
import DepositAddress from "../CryptoWallet/WalletDetail/DepositAddress";
import NetworkSelector from "../CryptoWallet/WalletDetail/NetworkSelector";
import { getAssetFullName, getWalletAccentColor } from "../CryptoWallet/utils/format";
import styles from "../CryptoWallet/cryptoPage.module.scss";
import { getChannelNetworks } from "./api/cryptoChannels";
import AddChannelModal from "./components/AddChannelModal";
import ChannelSelector from "./components/ChannelSelector";
import InstructionsModal from "./components/InstructionsModal";
import useCryptoChannels from "./hooks/useCryptoChannels";

/**
 * "Crypto Channels" tab on a virtual IBAN: additional crypto receiving
 * addresses on the vIBAN. Deposits on any of them are detected, converted
 * and credited to the vIBAN's own balance automatically.
 *
 * First time a vIBAN has zero channels, opening the tab shows an
 * instructions modal before letting the user add one; once a channel
 * exists the instructions never show again — just the channel list.
 */
const CryptoChannels = ({ selectedIban }) => {
  const { t } = useTranslation();
  // The channel endpoints key off the vIBAN's public virtualIbanId, not
  // its Mongo _id — fall back to _id/id only for records missing it.
  const virtualIbanId = selectedIban?.virtualIbanId || selectedIban?._id || selectedIban?.id;
  const displayCurrency = selectedIban?.currency || "EUR";

  const { channels, isLoading, creating, createChannel } = useCryptoChannels(virtualIbanId);

  const [showInstructions, setShowInstructions] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const [networkIndex, setNetworkIndex] = useState(0);

  const hasChannels = channels.length > 0;

  const ownedCurrencies = useMemo(
    () => new Set(channels.map((c) => String(c?.payCurrency || "").toUpperCase())),
    [channels],
  );

  useEffect(() => {
    if (!isLoading && !hasChannels) setShowInstructions(true);
  }, [isLoading, hasChannels]);

  // Keep a channel selected as the list loads or changes; default to the
  // first one whenever the current selection no longer exists.
  useEffect(() => {
    if (!channels.length) {
      setSelectedUuid(null);
      return;
    }
    if (!channels.some((c) => c.uuid === selectedUuid)) {
      setSelectedUuid(channels[0].uuid);
    }
  }, [channels, selectedUuid]);

  useEffect(() => {
    setNetworkIndex(0);
  }, [selectedUuid]);

  const selectedChannel = channels.find((c) => c.uuid === selectedUuid) || channels[0];
  const networks = getChannelNetworks(selectedChannel);
  const currentNetwork = networks[networkIndex] || networks[0];

  const handleInstructionsNext = () => {
    setShowInstructions(false);
    setShowAddChannel(true);
  };

  const handleCreate = async (payCurrency) => {
    const created = await createChannel({ payCurrency, displayCurrency });
    if (created) {
      setShowAddChannel(false);
      setSelectedUuid(created.uuid);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <InstaPayLoader />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {hasChannels ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>{t("Crypto channels")}</h2>
              <p className={styles.sectionSub}>
                {t(
                  "Receive crypto into this vIBAN — deposits convert automatically to {{currency}}.",
                  { currency: displayCurrency },
                )}
              </p>
            </div>
            <button type="button" className={styles.addBtn} onClick={() => setShowAddChannel(true)}>
              <Plus size={16} />
              {t("Add new channel")}
            </button>
          </div>

          <ChannelSelector
            channels={channels}
            selectedUuid={selectedUuid}
            onSelect={setSelectedUuid}
          />

          <div className={styles.detail}>
            <div className={styles.detailHead}>
              <span
                className={styles.detailMark}
                style={{
                  background: getWalletAccentColor(selectedChannel?.payCurrency),
                  width: 50,
                  height: 50,
                  fontSize: 14,
                }}
              >
                {selectedChannel?.payCurrency}
              </span>
              <div>
                <h4 className={styles.detailTitle}>
                  {selectedChannel?.payCurrency} {t(getAssetFullName(selectedChannel?.payCurrency))}
                </h4>
                <p className={styles.detailSub}>
                  {t("Crypto Channel")} •{" "}
                  {selectedChannel?.status === "OPEN"
                    ? t("Active")
                    : t(selectedChannel?.status || "")}
                </p>
              </div>
            </div>

            <NetworkSelector
              networks={networks}
              selectedIndex={networkIndex}
              onSelect={setNetworkIndex}
            />
            <DepositAddress currencyCode={selectedChannel?.payCurrency} network={currentNetwork} />
          </div>
        </section>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Inbox size={30} />
          </span>
          <h3 className={styles.emptyTitle}>{t("No crypto channels yet")}</h3>
          <p className={styles.emptyText}>
            {t("Add a crypto channel to start receiving crypto straight into this virtual IBAN.")}
          </p>
          <button
            type="button"
            className={`${styles.addBtn} ${styles.emptyCta}`}
            onClick={() => setShowAddChannel(true)}
          >
            <Plus size={16} />
            {t("Add crypto channel")}
          </button>
        </div>
      )}

      <InstructionsModal
        isOpen={showInstructions}
        toggle={() => setShowInstructions(false)}
        onNext={handleInstructionsNext}
        currency={displayCurrency}
      />
      <AddChannelModal
        isOpen={showAddChannel}
        toggle={() => setShowAddChannel(false)}
        ownedCurrencies={ownedCurrencies}
        creating={creating}
        displayCurrency={displayCurrency}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CryptoChannels;
