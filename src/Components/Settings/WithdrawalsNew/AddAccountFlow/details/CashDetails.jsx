import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Fields, SelectField, TextField } from "../../../../VirtualIBAN/Beneficiaries/AddBeneficiaryFlowV2/components"
import { DOCUMENT_TYPES } from "../../withdrawalPayload"

const CashDetails = ({ channel, setChannel, payers, identifiers, onValidChange }) => {
    const { t } = useTranslation()
    const needsMsisdn = (identifiers || []).includes("msisdn")

    const valid = !!(
        channel.payer_id &&
        channel.document_type &&
        channel.document_number &&
        (!needsMsisdn || channel.extras?.msisdn)
    )
    useEffect(() => { onValidChange(valid) }, [valid, onValidChange])

    const setField = (name, value) => setChannel(prev => ({ ...prev, [name]: value }))

    return (
        <Fields>
            {payers.length > 1 && (
                <SelectField
                    id="wd-cash-payer"
                    label={t("Cash pickup partner")}
                    value={String(channel.payer_id ?? "")}
                    placeholder={t("Select cash pickup partner")}
                    options={payers.map(payer => ({ value: String(payer.id), label: payer.name }))}
                    onChange={(value) => setField("payer_id", value)}
                />
            )}

            <SelectField
                id="wd-cash-doc-type"
                label={t("ID you'll show at pickup")}
                value={channel.document_type ?? ""}
                placeholder={t("Select document type")}
                options={DOCUMENT_TYPES.map(item => ({ ...item, label: t(item.label) }))}
                onChange={(value) => setField("document_type", value)}
            />

            <TextField
                id="wd-cash-doc-number"
                label={t("Document number")}
                value={channel.document_number ?? ""}
                onChange={(value) => setField("document_number", value.replace(/[^a-zA-Z0-9]/g, ""))}
            />

            {needsMsisdn && (
                <TextField
                    id="wd-cash-msisdn"
                    label={t("Mobile number")}
                    type="tel"
                    inputMode="tel"
                    value={channel.extras?.msisdn ?? ""}
                    onChange={(value) => setChannel(prev => ({ ...prev, extras: { ...prev.extras, msisdn: value } }))}
                />
            )}
        </Fields>
    )
}

export default CashDetails
