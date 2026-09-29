import { useTranslation } from "react-i18next"
import CoinMark from "../CryptoWallet/components/CoinMark"
import { getAssetSymbol, getWalletAccentColor } from "../CryptoWallet/utils/format"
import { formatWalletAmount, getWalletAvailable } from "../CryptoWallet/instapay/wallets"
import styles from "./ibanToCrypto.module.scss"

const DestinationNote = ({ wallet, onCreate }) => {
    const { t } = useTranslation()

    if (!wallet) {
        return (
            <div className={`${styles.destination} ${styles.destinationMissing}`}>
                <p>{t("You need an active USDT wallet to receive the converted funds.")}</p>
                <button type="button" className={styles.linkBtn} onClick={onCreate}>
                    {t("Create a USDT wallet")}
                </button>
            </div>
        )
    }

    const code = wallet?.currency?.code

    return (
        <div className={styles.destination}>
            <CoinMark symbol={getAssetSymbol(code)} color={getWalletAccentColor(code)} size="sm" />
            <div className={styles.destinationText}>
                <span className={styles.destinationLabel}>{t("Converted into")}</span>
                <span className={styles.destinationName}>{code} {t("Wallet")} · {wallet?.wallet_id}</span>
            </div>
            <span className={styles.destinationBalance}>
                {formatWalletAmount(getWalletAvailable(wallet))} {code}
            </span>
        </div>
    )
}

export default DestinationNote
