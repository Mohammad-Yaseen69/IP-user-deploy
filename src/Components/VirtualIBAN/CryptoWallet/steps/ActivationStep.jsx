import { useTranslation } from "react-i18next"
import Callout from "../components/Callout"
import ChargesTable from "../components/ChargesTable"
import IncludesList from "../components/IncludesList"
import PromoCodeField from "../components/PromoCodeField"
import SelectionSummary from "../components/SelectionSummary"
import {
    ACTIVATION_FEE,
    ACTIVATION_INCLUDES,
    PROMO_CODES,
} from "../data/cryptoWalletOptions"

/**
 * Pricing / review step. Renders the paid variant, or the waived variant
 * when the activation fee is free (first wallet, or an applied promo code).
 */
const ActivationStep = ({ asset, isFree, promo, onApplyPromo, onChangeSelection }) => {
    const { t } = useTranslation()

    const chargeRows = isFree
        ? [
            {
                label: t("Wallet activation, one-time"),
                strikethrough: ACTIVATION_FEE,
                value: "EUR 0.00",
            },
            {
                label: t("Promotion applied"),
                value: promo?.label ? t(promo.label) : t("First wallet free"),
            },
            { label: t("Recurring fee"), value: t("None") },
        ]
        : [
            { label: t("Wallet activation, one-time"), value: ACTIVATION_FEE },
            { label: t("VAT"), value: "EUR 0.00" },
            { label: t("Recurring fee"), value: t("None") },
        ]

    return (
        <>
            {isFree ? (
                <Callout variant="success" title={t("Your first crypto wallet is free.")}>
                    {t("The activation fee has been waived on this wallet. Additional wallets are EUR 25.00 each.")}
                </Callout>
            ) : null}

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
                    value: isFree ? "EUR 0.00" : ACTIVATION_FEE,
                    free: isFree,
                }}
            />

            {isFree ? (
                <PromoCodeField
                    appliedCode={promo?.code}
                    codes={PROMO_CODES}
                    onApply={(code, details) => onApplyPromo?.({ code, ...details })}
                />
            ) : (
                <IncludesList
                    heading={t("What activation includes")}
                    items={ACTIVATION_INCLUDES.map((item) => t(item))}
                />
            )}

            <Callout variant="note" title={t("All networks included.")}>
                {t("You get a receiving address on every network this asset supports — no extra charge, nothing else to choose.")}
            </Callout>

            {isFree ? (
                <Callout>
                    {t("Nothing to pay, so the payment step is skipped. Network fees on transfers are still charged by the blockchain.")}
                </Callout>
            ) : (
                <Callout>
                    {t("This wallet is not billed monthly and will not renew. Network fees on transfers are charged separately by the blockchain.")}
                </Callout>
            )}
        </>
    )
}

export default ActivationStep
