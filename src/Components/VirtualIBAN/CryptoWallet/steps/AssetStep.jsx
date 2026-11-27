import { useTranslation } from "react-i18next";
import Callout from "../components/Callout";
import CoinMark from "../components/CoinMark";
import OptionRow from "../components/OptionRow";
import styles from "../cryptoWallet.module.scss";

const AssetStep = ({ assets = [], assetId, onSelect, isEuropean }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.optionList} role="radiogroup" aria-label={t("Asset")}>
        {assets.map((asset) => {
          const badge = asset.owned ? t("Active") : asset.comingSoon ? t("Coming Soon") : undefined;

          const asideNote = asset.owned
            ? t("Already in your portfolio")
            : asset.comingSoon
              ? t("Not available yet")
              : undefined;

          const selectable = !asset.owned && !asset.comingSoon;

          return (
            <OptionRow
              key={asset.id}
              leading={<CoinMark symbol={asset.symbol} color={asset.color} />}
              title={t(asset.name)}
              badge={badge}
              description={t(asset.description)}
              price={selectable ? t(asset.price) : undefined}
              priceNote={selectable ? t(asset.priceNote) : undefined}
              asideNote={asideNote}
              disabled={!selectable}
              selected={assetId === asset.id}
              onSelect={() => onSelect(asset.id)}
            />
          );
        })}
      </div>

      {isEuropean ? (
        <Callout variant="warning">{t("USDT is not available in your region.")}</Callout>
      ) : null}

      {/* <Callout variant="success">
                {t("Wallet activation is free. There is no one-time, monthly or recurring fee.")}
            </Callout> */}
    </>
  );
};

export default AssetStep;
