import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ModalBody } from 'reactstrap'
import { Field, TextInput, Select, TextArea, ButtonForRequests } from '../ReceiptInvoices/UI/FormElements'
import { UserContext } from '../../Context/UserContext'
import { formatCurrency } from '../../Helper/AmountFormat'
import { Toggle } from '../MyMasterCard/CardPurchased'

const PricingsAddModal = ({ isOpen, toggle, editMode = false, plan = null, onEditSave, onAddSave, submitting = false }) => {
    const { t } = useTranslation()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("0.00")
    const [billingCycle, setBillingCycle] = useState("One-Time")
    const [tAndC, setTAndC] = useState("")
    const [receivingWallet, setReceivingWallet] = useState("")
    const [status, setStatus] = useState(true)
    const { userWallets } = useContext(UserContext)

    useEffect(() => {
        if (editMode && plan) {
            setTitle(plan.title || "")
            setDescription(plan.description || "")
            setPrice(plan.price || "0.00")
            setBillingCycle(plan.billingCycle || "One-Time")
            setReceivingWallet(plan.currency || "")
            setStatus(plan.status)
            setReceivingWallet(plan.receivingWallet?._id)
            setTAndC(plan?.termsAndConditions?.text || "")
        }
        if (!isOpen) {
            setTitle(''); setDescription(''); setReceivingWallet(''); setPrice('0.00'); setBillingCycle('One-Time'); setTAndC(""); setStatus(true);
        }
    }, [editMode, plan, isOpen])

    const formValid = title && description && price && billingCycle && tAndC && receivingWallet && Number(String(price).replace(",", "")) > 0

    const handleSave = () => {
        const payload = {
            title,
            description,
            price,
            billingCycle,
            currency: receivingWallet,
            status,
            tAndC,
            _id: plan?._id
        }

        if (editMode && onEditSave) onEditSave(payload)
        else if (onAddSave) onAddSave(payload)
        else console.log(JSON.stringify(payload, null, 2))
    }

    const onClose = () => {
        setTitle('')
        setDescription('')
        setReceivingWallet('')
        setPrice('0.00')
        setBillingCycle('One-Time')
        setTAndC("")
        setStatus(true)
        toggle()
    }

    const formatedDate = editMode ? new Date(plan?.termsAndConditions?.lastUpdated).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }) : ""

    return (
        <Modal toggle={onClose} style={{ minWidth: window.innerWidth > 650 && "650px" }} isOpen={isOpen}>
            <ModalBody style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", gap: "10px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                        <path d="M10.5003 5.10156V16.7682M4.66699 10.9349H16.3337" stroke="#5926F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontWeight: 600, fontSize: "20px" }}>
                        {editMode ? t("Edit Plan") : t("Add new Plan")}
                    </span>
                </div>
                <div style={{ display: "grid", gap: "20px" }}>
                    <Field label={t("Plan or Service Title")} required={!title}>
                        <TextInput
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("Short name of your plan (e.g. Starter)")}
                            styles={{ boxShadow: "0 2px 4px 0 rgba(27, 28, 29, 0.04)" }}
                        />
                    </Field>
                    <Field label={t("Short Description")} required={!description}>
                        <TextInput
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t("Short line for your customer")}
                        />
                    </Field>
                    <Field label={t("Price")} required={!price || Number(price) === 0}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <TextInput
                                value={price}
                                placeholder={t("0.00")}
                                onChange={(e) => {
                                    const format = formatCurrency(e.target.value, false)
                                    setPrice(format)
                                }}
                                onBlur={(e) => {
                                    const format = formatCurrency(e.target.value, true)
                                    setPrice(format)
                                }}
                            />
                            <select
                                value={receivingWallet}
                                onChange={(e) => setReceivingWallet(e.target.value)}
                                style={{ minWidth: 70, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none' }}
                            >
                                <option value="">{t("Select Currency")}</option>
                                {userWallets?.filter(w => w.wallet_type === "insta")?.map((w, idx) => (
                                    <option key={idx} value={w?._id}>{w.currency.code}</option>
                                ))}
                            </select>
                        </div>
                    </Field>
                    <Field label={t("Billing Cycle")}>
                        <Select
                            value={billingCycle}
                            onChange={e => setBillingCycle(e.target.value)}
                            options={[
                                { value: "One-Time", label: t("One-Time") },
                                { value: "Monthly", label: t("Monthly") },
                                { value: "Weekly", label: t("Weekly") },
                                { value: "Yearly", label: t("Yearly") },
                                { value: "Quarterly", label: t("Quarterly") },
                            ]}
                            placeholder={t("Select billing cycle")}
                        />
                    </Field>
                    <Field
                        label={`${t("Terms & Conditions")} ${editMode ? `(${t("Last Updated")}: ${formatedDate})` : ""}`}
                        required={!tAndC}
                    >
                        <TextArea
                            as="textarea"
                            rows={6}
                            value={tAndC}
                            onChange={e => setTAndC(e.target.value)}
                            placeholder={t("Type in your Terms and Conditions")}
                            style={{ marginTop: 10, resize: "none", minHeight: "250px" }}
                        />
                    </Field>
                    {editMode && (
                        <Field label={t("Status")} toggle>
                            <Toggle onChange={() => setStatus(prev => !prev)} checked={status} />
                        </Field>
                    )}
                    <ButtonForRequests isLoading={submitting || !formValid} onClick={handleSave}>
                        {editMode ? t("Save Changes") : t("Save & Publish to My Payment Address")}
                    </ButtonForRequests>
                    <span
                        onClick={onClose}
                        style={{ margin: "auto", fontWeight: 600, color: "#5926F0", cursor: "pointer" }}
                    >
                        {t("Cancel")}
                    </span>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PricingsAddModal