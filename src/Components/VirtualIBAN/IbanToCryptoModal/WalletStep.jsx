import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import OptionRow from "../CryptoWallet/components/OptionRow"
import CoinMark from "../CryptoWallet/components/CoinMark"
import { getAssetSymbol, getWalletAccentColor } from "../CryptoWallet/utils/format"
import { formatWalletAmount, getWalletAvailable } from "../CryptoWallet/instapay/wallets"
import styles from "./ibanToCrypto.module.scss"

const WalletStep = ({ wallets, wallet, setWallet, onClose }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div>
            <div className={styles.stepTitle}>{t("Choose the crypto wallet")}</div>
            <p className={styles.stepHint}>{t("The converted amount lands in this wallet.")}</p>

            {wallets.length === 0 ? (
                <div className={styles.emptyWallets}>
                    <p>{t("You don't have an active USDT or USDC wallet yet.")}</p>
                    <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => {
                            onClose?.()
                            navigate("/crypto-wallets")
                        }}
                    >
                        {t("Create a crypto wallet")}
                    </button>
                </div>
            ) : (
                <div className={styles.walletList} role="radiogroup">
                    {wallets.map((item) => {
                        const code = item?.currency?.code
                        return (
                            <OptionRow
                                key={item?._id}
                                leading={<CoinMark symbol={getAssetSymbol(code)} color={getWalletAccentColor(code)} />}
                                title={`${code} ${t("Wallet")}`}
                                badge={item?.default ? t("Default") : undefined}
                                description={item?.wallet_id}
                                price={`${formatWalletAmount(getWalletAvailable(item))} ${code}`}
                                priceNote={t("Available")}
                                selected={wallet?._id === item?._id}
                                onSelect={() => setWallet(item)}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default WalletStep
