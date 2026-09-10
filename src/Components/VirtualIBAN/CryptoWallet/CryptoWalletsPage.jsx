import { useTranslation } from "react-i18next"
import useWindowWidth from "../../../utils/useWindowWidth"
import TopRight from "../../topRight"
import CryptoStablecoins from "./CryptoStablecoins"
import styles from "./cryptoPage.module.scss"

/** Route page for /crypto-wallets. */
const CryptoWalletsPage = () => {
    const { t } = useTranslation()
    const width = useWindowWidth()

    return (
        <div style={{ position: "relative" }} className={styles.routePage}>
            <div className={styles.routeTop}>
                <div>
                    <h1 className={styles.routeTitle}>{t("Crypto Wallets")}</h1>
                    <p className={styles.routeSub}>{t("Create and manage your crypto wallets in one place.")}</p>
                </div>
                {width > 1000 && <TopRight position="relative" />}
            </div>

            <CryptoStablecoins />
        </div>
    )
}

export default CryptoWalletsPage
