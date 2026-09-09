import { useTranslation } from "react-i18next"
import Callout from "../components/Callout"
import CoinMark from "../components/CoinMark"
import OptionRow from "../components/OptionRow"
import styles from "../cryptoWallet.module.scss"

const AssetStep = ({ assets = [], assetId, onSelect, isEuropean }) => {
    const { t } = useTranslation()

    return (
        <>
            <div className={styles.optionList} role="radiogroup" aria-label={t("Asset")}>
                {assets.map((asset) => (
                    <OptionRow
                        key={asset.id}
                        leading={<CoinMark symbol={asset.symbol} color={asset.color} />}
                        title={t(asset.name)}
                        badge={asset.owned ? t("Active") : undefined}
                        description={t(asset.description)}
                        price={asset.owned ? undefined : t(asset.price)}
                        priceNote={asset.owned ? undefined : t(asset.priceNote)}
                        asideNote={asset.owned ? t("Already in your portfolio") : undefined}
                        disabled={asset.owned}
                        selected={assetId === asset.id}
                        onSelect={() => onSelect(asset.id)}
                    />
                ))}
            </div>

            {isEuropean ? (
                <Callout variant="warning">
                    {t("USDT is not available in your region.")}
                </Callout>
            ) : null}

            <Callout>
                {t("Activation is charged once per wallet, in EUR. No monthly or recurring fee applies.")}
            </Callout>
        </>
    )
}

export default AssetStep
