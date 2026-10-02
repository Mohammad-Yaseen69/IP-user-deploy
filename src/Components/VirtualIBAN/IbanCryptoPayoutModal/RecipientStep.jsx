import { useTranslation } from "react-i18next"
import BeneficiaryStep from "../SendMoney/Common/BeneficiaryStep"
import {
    getChannelAddress,
    getChannelAsset,
    getProtocolLabel,
    maskAddress,
} from "../../WalletsNew/SendCryptoModal/cryptoProtocols"
import { PAYOUT_ASSETS } from "../../../stateMachines/ibanCryptoPayout"
import styles from "./ibanCryptoPayout.module.scss"

const channelKey = (channel, index) => channel?._id || `${getChannelAddress(channel)}-${index}`

const RecipientStep = ({
    asset,
    setAsset,
    beneficiaries,
    selectedBeneficiary,
    onSelectBeneficiary,
    onAddBeneficiary,
    cryptoChannels,
    selectedChannel,
    onSelectChannel,
    address,
    protocol,
    setProtocol,
    protocolOptions,
    isProtocolLocked,
    addressStatus,
    errorMessage,
    onEditBeneficiary,
}) => {
    const { t } = useTranslation()

    return (
        <BeneficiaryStep
            beneficiaries={beneficiaries}
            selectedBeneficiary={selectedBeneficiary}
            setSelectedBeneficiary={onSelectBeneficiary}
            onAddBeneficiary={onAddBeneficiary}
            emptyMessage={t("No beneficiaries with a saved {{currency}} wallet address.", { currency: asset })}
        >
            <div className={styles.field}>
                <div className={styles.fieldLabel}>{t("Recipient receives")}</div>
                <div className={styles.chips}>
                    {PAYOUT_ASSETS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`${styles.chip} ${asset === option ? styles.chipActive : ""}`}
                            onClick={() => setAsset(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {selectedBeneficiary && cryptoChannels.length > 1 && (
                <div className={styles.field}>
                    <div className={styles.fieldLabel}>{t("Destination wallet")}</div>
                    <div className={styles.walletList}>
                        {cryptoChannels.map((channel, index) => {
                            const channelAddress = getChannelAddress(channel)
                            const active = getChannelAddress(selectedChannel) === channelAddress
                            return (
                                <button
                                    key={channelKey(channel, index)}
                                    type="button"
                                    className={`${styles.walletOption} ${active ? styles.walletOptionActive : ""}`}
                                    onClick={() => onSelectChannel(channel)}
                                >
                                    <strong>{maskAddress(channelAddress)}</strong>
                                    <small>{getChannelAsset(channel) || asset}</small>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {address && (
                <div className={styles.field}>
                    <div className={styles.fieldLabel}>{t("Destination address")}</div>
                    <div className={styles.addressBox}>
                        <span className={styles.addressValue}>{address}</span>
                        <span className={styles.addressMeta}>
                            {addressStatus === "checking" && t("Checking address...")}
                            {addressStatus === "valid" && (
                                <span className={styles.ok}>{t("Valid for")} {getProtocolLabel(protocol)}</span>
                            )}
                            {addressStatus === "invalid" && (
                                <span className={styles.bad}>
                                    {isProtocolLocked
                                        ? t("This address is not valid on the network saved for this beneficiary.")
                                        : t("This address is not valid for the selected network.")}
                                </span>
                            )}
                            {!addressStatus && t("Taken from the saved beneficiary wallet.")}
                        </span>
                    </div>
                </div>
            )}

            {address && (
                <div className={styles.field}>
                    <div className={styles.fieldLabel}>
                        <span>{t("Network")}</span>
                        <span className={styles.fieldHint}>{t("Must match what the recipient supports")}</span>
                    </div>
                    {protocolOptions.length > 0 ? (
                        <div className={styles.chips}>
                            {protocolOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`${styles.chip} ${protocol === option ? styles.chipActive : ""}`}
                                    onClick={() => setProtocol(option)}
                                    disabled={isProtocolLocked && protocol !== option}
                                >
                                    {getProtocolLabel(option)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.errorBox}>
                            {t("We could not work out which network this address belongs to. Edit the beneficiary and save the wallet with its network.")}
                        </div>
                    )}
                </div>
            )}

            {errorMessage && (
                <div className={styles.errorBox}>
                    {errorMessage}
                    {onEditBeneficiary && (
                        <button type="button" className={styles.linkBtn} onClick={onEditBeneficiary}>
                            {t("Edit beneficiary")}
                        </button>
                    )}
                </div>
            )}
        </BeneficiaryStep>
    )
}

export default RecipientStep
