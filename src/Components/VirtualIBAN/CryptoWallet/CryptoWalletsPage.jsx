import { useTranslation } from "react-i18next"
import useWindowWidth from "../../../utils/useWindowWidth"
import TopRight from "../../topRight"
import CryptoStablecoins from "./CryptoStablecoins"
import InstapayCryptoWallets from "./instapay/InstapayCryptoWallets"
import styles from "./cryptoPage.module.scss"

/* The page runs on InstaPay crypto balances. The BVNK custodial version it replaced is
   kept whole in CryptoStablecoins and comes back by flipping this. */
const USE_INSTAPAY_CRYPTO_WALLETS = true

/** Route page for /crypto-wallets. */
const CryptoWalletsPage = () => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    return (
        <div style={{ position: "relative" }} className={styles.routePage}>
            <div className={styles.routeTop}>
                <div>
                    <h1 className={styles.routeTitle}>{t("Crypto Hub")}</h1>
                    <p className={styles.routeSub}>{t("Create and manage your crypto hub in one place.")}</p>
                </div>
                {width > 1000 && <TopRight position="relative" />}
            </div>

            {USE_INSTAPAY_CRYPTO_WALLETS ? <InstapayCryptoWallets /> : <CryptoStablecoins />}
        </div>
    )
}

export default CryptoWalletsPage
