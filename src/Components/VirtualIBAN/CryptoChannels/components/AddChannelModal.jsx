import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Modal, ModalBody } from "reactstrap"
import useWindowWidth from "../../../../utils/useWindowWidth"
import Callout from "../../CryptoWallet/components/Callout"
import CoinMark from "../../CryptoWallet/components/CoinMark"
import ModalShell from "../../CryptoWallet/components/ModalShell"
import OptionRow from "../../CryptoWallet/components/OptionRow"
import styles from "../../CryptoWallet/cryptoWallet.module.scss"
import { CHANNEL_ASSETS } from "../data/channelAssets"

/**
 * "Add crypto channel": pick the pay currency, we provision every network
 * it supports automatically. Opened either from the instructions modal's
 * "Next", or directly via "Add new channel" once channels already exist.
 */
const AddChannelModal = ({ isOpen, toggle, ownedCurrencies, creating, displayCurrency = "EUR", onSubmit }) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    const [selectedCode, setSelectedCode] = useState(null)

    const assets = useMemo(
        () => CHANNEL_ASSETS.map((asset) => ({ ...asset, owned: ownedCurrencies?.has(asset.code) })),
        [ownedCurrencies]
    )

    // Default to the first not-yet-added asset each time the modal opens.
    useEffect(() => {
        if (isOpen) setSelectedCode(assets.find((asset) => !asset.owned)?.code || null)
    }, [isOpen, assets])

    const close = () => {
        if (creating) return
        toggle?.()
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={close}
            centered
            backdrop={creating ? "static" : true}
            keyboard={!creating}
            style={{ maxWidth: width > 640 ? "560px" : "100%" }}
        >
            <ModalBody style={{ padding: 0 }}>
                <ModalShell
                    title={t("Add crypto channel")}
                    subtitle={t("Choose the crypto asset you want to receive into this vIBAN.")}
                    onClose={close}
                    secondaryLabel={t("Cancel")}
                    onSecondary={close}
                    primaryLabel={creating ? t("Adding...") : t("Add channel")}
                    onPrimary={() => onSubmit(selectedCode)}
                    primaryDisabled={!selectedCode || creating}
                    locked={creating}
                >
                    <div className={styles.optionList} role="radiogroup" aria-label={t("Crypto asset")}>
                        {assets.map((asset) => (
                            <OptionRow
                                key={asset.id}
                                leading={<CoinMark symbol={asset.symbol} color={asset.color} />}
                                title={t(asset.name)}
                                badge={asset.owned ? t("Active") : undefined}
                                description={t(asset.description)}
                                asideNote={asset.owned ? t("Already added") : undefined}
                                disabled={asset.owned}
                                selected={selectedCode === asset.code}
                                onSelect={() => setSelectedCode(asset.code)}
                            />
                        ))}
                    </div>

                    <Callout variant="success">
                        {t("Funds received on this channel convert automatically to {{currency}} in your virtual IBAN.", { currency: displayCurrency })}
                    </Callout>
                </ModalShell>
            </ModalBody>
        </Modal>
    )
}

export default AddChannelModal
