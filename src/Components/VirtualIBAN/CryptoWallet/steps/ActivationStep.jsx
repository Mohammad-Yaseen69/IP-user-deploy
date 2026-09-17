import { useTranslation } from "react-i18next"
import Callout from "../components/Callout"
import ChargesTable from "../components/ChargesTable"
import IncludesList from "../components/IncludesList"
import SelectionSummary from "../components/SelectionSummary"
import { ACTIVATION_INCLUDES } from "../data/cryptoWalletOptions"

/** Pricing / review step. Activation is currently free of charge. */
const ActivationStep = ({ asset, onChangeSelection }) => {
    const { t } = useTranslation()

    const chargeRows = [
        { label: t("Wallet activation, one-time"), value: t("Free") },
        { label: t("VAT"), value: t("Free") },
        { label: t("Recurring fee"), value: t("None") },
    ]

    return (
        <>
            <Callout variant="success" title={t("This wallet is free.")}>
                {t("There is no activation charge and no recurring fee.")}
            </Callout>

            <SelectionSummary
                symbol={asset?.symbol}
                color={asset?.color}
                title={t(asset?.name || "")}
                subtitle={asset?.networks}
                onChange={onChangeSelection}
                changeLabel={t("Change")}
            />

            <ChargesTable
                heading={t("Charges")}
                rows={chargeRows}
                total={{
                    label: t("Total due today"),
                    value: t("Free"),
                    free: true,
                }}
            />

            <IncludesList
                heading={t("What activation includes")}
                items={ACTIVATION_INCLUDES.map((item) => t(item))}
            />

            <Callout variant="note" title={t("All networks included.")}>
                {t("You get a receiving address on every network this asset supports — no extra charge, nothing else to choose.")}
            </Callout>

            <Callout>
                {t("Network fees on transfers are charged separately by the blockchain.")}
            </Callout>
        </>
    )
}

export default ActivationStep
