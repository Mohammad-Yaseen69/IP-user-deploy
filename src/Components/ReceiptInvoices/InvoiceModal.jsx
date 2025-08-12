import React, { useContext, useMemo, useState } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import icon from "./files/invoice-icon.png"
import share from "./files/share.png"
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import { Toggle as CardToggle } from "../MyMasterCard/CardPurchased"
import ContactBox from '../MyMasterCard/PaymentModal/ContactBox'
import styles from "./styles/index.module.scss"
import QrDetails from '../PaymentAddressPublic/QrDetails'
import download from "./files/download.png"

const Field = ({ label, required, children, toggle }) => (
    <div style={{ display: 'flex', flexDirection: toggle ? "row" : 'column', gap: 3, marginBottom: 7, justifyContent: toggle && "space-between", padding: toggle && "12px", borderRadius: toggle && "8px", background: toggle && "#F9F9F9", alignItems: toggle && 'center' }}>
        <label style={{ fontWeight: 600, fontSize: 13 }}>
            {label} {required && <span style={{ color: '#e11d48' }}>*</span>}
        </label>
        {children}
    </div>
)

const TextInput = ({ value, onChange, placeholder }) => (
    <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            outline: 'none'
        }}
    />
)

const TextArea = ({ value, onChange, placeholder, rows = 4 }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            outline: 'none',
            resize: 'vertical'
        }}
    />
)

const Select = ({ value, onChange, options, placeholder = 'Select' }) => (
    <select
        value={value}
        onChange={onChange}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            outline: 'none'
        }}
    >
        <option value="">{placeholder}</option>
        {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
)



const Toggle = ({ checked, onChange }) => (
    <CardToggle checked={checked} onChange={onChange} />
)

const InvoiceModal = ({ isOpen, toggle }) => {
    const { t } = useTranslation()
    const { userWallets, userDetails } = useContext(UserContext)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [wallet, setWallet] = useState("")
    const [allowMultiple, setAllowMultiple] = useState(false)
    const [allowShipping, setAllowShipping] = useState(false)
    const [mode, setMode] = useState('form') // 'form' | 'preview'

    const walletOptions = useMemo(() => {
        return (userWallets || []).filter(w2 => w2?.wallet_type === "insta").map(w => ({
            value: w?.wallet_id,
            label: `${w?.currency?.code ?? ''}`
        }))
    }, [userWallets])

    const isInvalid = useMemo(() => {
        return !title?.trim() || !description?.trim() || !amount || Number(amount) <= 0 || !wallet
    }, [title, description, amount, wallet])

    const shareLink = useMemo(() => {
        const base = window?.location?.origin || 'https://my.insta-pay.ch'
        const uid = userDetails?._id || 'user'
        return `${base}/pay/invoice/${uid}/${encodeURIComponent(title || 'invoice')}`
    }, [title, userDetails])

    const reset = () => {
        setTitle("")
        setDescription("")
        setAmount("")
        setWallet("")
        setAllowMultiple(false)
        setAllowShipping(false)
        setMode('form')
    }

    const onClose = () => {
        reset()
        toggle?.()
    }

    return (
        <Modal style={{ minWidth: 700 }} isOpen={isOpen} toggle={onClose}>
            <ModalHeader style={{ padding: "20px", border: "none" }} toggle={onClose}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={icon} alt="" />
                    <span style={{ fontWeight: 600, fontSize: 18 }}>
                        {t("Generate Your Invoice")}
                    </span>
                </div>
            </ModalHeader>
            <ModalBody style={{ paddingTop: "0px" }}>
                {mode === 'form' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Field label={t('Title')} required>
                            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('Enter title')} />
                        </Field>
                        <Field label={t('Description')} required>
                            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('Enter description')} rows={5} />
                        </Field>
                        <Field label={t('Amount')} required>
                            <TextInput value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder={t('0.00')} />
                        </Field>
                        <Field label={t('Receiving Wallet')} required>
                            <Select value={wallet} onChange={(e) => setWallet(e.target.value)} options={walletOptions} placeholder={t('Select wallet')} />
                        </Field>

                        <Field toggle={true} label={t('Allow multiple payments for this invoice')}>
                            <Toggle checked={allowMultiple} onChange={() => setAllowMultiple(v => !v)} />
                        </Field>

                        <Field toggle={true} label={t('Allow shipping address')}>
                            <Toggle checked={allowShipping} onChange={() => setAllowShipping(v => !v)} />
                        </Field>
                    </div>
                )}

                {mode === 'preview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .5fr', gap: 16, fontWeight: 600 }}>
                        <div className={styles.previewInfo}>
                            <div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ color: "#8E8E8E", fontSize: "12px" }}>{t('Title')}:</div>
                                    <div style={{ whiteSpace: 'pre-wrap', fontSize: "14px", marginTop: "5px" }}>{title}</div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ color: "#8E8E8E", fontSize: "12px" }}>{t('Description')}:</div>
                                    <div style={{ whiteSpace: 'pre-wrap', fontSize: "14px", marginTop: "5px" }}>{description}</div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ color: "#8E8E8E", fontSize: "12px" }}>{t('Amount')}:</div>
                                    <div style={{ whiteSpace: 'pre-wrap', fontSize: "14px", marginTop: "5px" }}>{amount}</div>
                                </div>
                            </div>

                            <div className={styles.linkShare}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <img src={share} alt="" />
                                    <span style={{ fontSize: "14px" }}>
                                        {t("Shareable Link")}
                                    </span>
                                </div>
                                <div className={styles.link}>
                                    <input readOnly value={shareLink} style={{ border: "none", outline: "none", fontSize: "12px", padding: "0px" }} />
                                    <svg onClick={() => navigator.clipboard?.writeText(shareLink)} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                        <path d="M5.97089 8.55365C6.24164 8.91561 6.58706 9.2151 6.98373 9.43183C7.38041 9.64855 7.81905 9.77742 8.26991 9.80971C8.72077 9.842 9.1733 9.77695 9.59681 9.61897C10.0203 9.46099 10.4049 9.21377 10.7245 8.89409L12.6158 7.00275C13.19 6.40823 13.5077 5.61197 13.5006 4.78546C13.4934 3.95895 13.1619 3.16833 12.5774 2.58388C11.993 1.99943 11.2023 1.66792 10.3758 1.66073C9.54932 1.65355 8.75306 1.97128 8.15854 2.54548L7.07417 3.62355M8.49268 7.29275C8.22193 6.9308 7.87651 6.6313 7.47983 6.41458C7.08316 6.19786 6.64452 6.06898 6.19366 6.03669C5.7428 6.0044 5.29027 6.06945 4.86676 6.22744C4.44325 6.38542 4.05867 6.63263 3.7391 6.95231L1.84776 8.84366C1.27356 9.43817 0.955828 10.2344 0.96301 11.0609C0.970192 11.8875 1.30171 12.6781 1.88616 13.2625C2.47061 13.847 3.26123 14.1785 4.08774 14.1857C4.91424 14.1929 5.71051 13.8751 6.30502 13.3009L7.38309 12.2229" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <QrDetails inInvoice={true} wallet={userWallets?.find(w => w.wallet_id === wallet)} invoiceId={"123123"} username={userDetails?.username} />
                            <div className={styles.downloadBtn}>
                               <img src={download} alt="" />
                                <span>
                                    {t("Download QR")}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: ".5rem" }}>
                    <ContactBox />

                    <button
                        type="button"
                        disabled={isInvalid}
                        onClick={() => {
                            if (mode === "form") {
                                setMode('preview')
                            } else {
                                toggle()
                            }
                        }}
                        style={{
                            border: 'none',
                            outline: 'none',
                            padding: '10px 16px',
                            borderRadius: 8,
                            fontWeight: 700,
                            background: isInvalid ? '#d1d5db' : '#5926F0',
                            color: '#fff',
                            cursor: isInvalid ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {mode === "preview" ? t('Close') : t('Generate New Invoice')}
                    </button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default InvoiceModal
