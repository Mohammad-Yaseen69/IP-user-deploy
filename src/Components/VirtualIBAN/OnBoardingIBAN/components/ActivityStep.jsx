import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, DollarSign, BarChart2, ArrowLeft, ArrowRight, CheckSquare } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'

const INDUSTRIES = [
    'Technology & Software', 'E-commerce & Retail', 'Financial Services',
    'Healthcare & Pharma', 'Real Estate', 'Professional Services',
    'Import / Export & Trade', 'Media & Entertainment', 'Logistics & Transport',
    'Manufacturing', 'Crypto & Web3', 'Other'
]

const MONTHLY_VOLUMES = [
    'Under €10,000', '€10,000 – €50,000', '€50,000 – €250,000',
    '€250,000 – €1M', '€1M – €5M', 'Over €5M'
]

const TRANSACTION_TYPES = [
    { key: 'sepa', label: 'SEPA Transfers' },
    { key: 'swift', label: 'SWIFT / International' },
    { key: 'crypto', label: 'Crypto ↔ Fiat' },
    { key: 'cards', label: 'Card Payments' },
    { key: 'fx', label: 'FX / Currency Exchange' },
    { key: 'treasury', label: 'Treasury & Liquidity' }
]

const ActivityStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [form, setForm] = useState({
        industry: data.industry || '',
        businessDescription: data.businessDescription || '',
        monthlyVolume: data.monthlyVolume || '',
        transactionTypes: data.transactionTypes || [],
    })

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    const toggleTxType = (key) => {
        setForm(prev => {
            const current = prev.transactionTypes
            return {
                ...prev,
                transactionTypes: current.includes(key)
                    ? current.filter(k => k !== key)
                    : [...current, key]
            }
        })
    }

    const handleContinue = () => {
        onNext({ activity: form })
    }

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), done: true },
        { num: '03', label: t('Activity'), active: true },
        { num: '04', label: t('Ownership'), active: false },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]

    return (
        <div className={styles.onboardingLayout}>
            <div className={styles.wizardSteps}>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`${styles.step} ${step.active ? styles.active : ""
                            } ${step.completed ? styles.completed : ""}`}
                    >
                        <div className={styles.stepLine}></div>

                        <div className={styles.stepContent}>
                            <span className={styles.stepNumber}>{step.num}</span>
                            <span className={styles.stepLabel}>{step.label}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{
                width: "100%"
            }}>
                <h2 className={styles.formHeading}>{t("How will you use InstaPay?")}</h2>
                <p className={styles.formSubheading}>
                    {t("These answers tailor your account. Some questions and documents appear dynamically based on your profile, nothing more than we need.")}
                </p>
            </div>
            <div className={styles.mainArea}>

                <div >
                    <div className={styles.formContainer2} style={{
                        marginBottom: "15px",
                    }}>
                        <div className={styles.onboardingForm2}>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("INDUSTRY / SECTOR")}
                                </label>

                                <div className={styles.chips}>
                                    {INDUSTRIES.map((item) => (
                                        <button
                                            type="button"
                                            key={item}
                                            className={`${styles.chip} ${form.industry === item ? styles.activeChip : ""
                                                }`}
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    industry: item,
                                                }))
                                            }
                                        >
                                            {t(item)}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    className={styles.textInput}
                                    placeholder={t("Specify your industry / sector")}
                                    value={form.industryOther || ""}
                                    onChange={set("industryOther")}
                                />
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("DETAILED DESCRIPTION OF BUSINESS ACTIVITY")}
                                </label>

                                <textarea
                                    className={styles.textArea}
                                    rows={4}
                                    value={form.businessDescription}
                                    onChange={set("businessDescription")}
                                    placeholder={t(
                                        "Cross-border payment orchestration and multi-currency treasury..."
                                    )}
                                />
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("MAIN COUNTRIES OF OPERATION")}
                                </label>

                                <div className={styles.chips}>
                                    {[
                                        "Switzerland",
                                        "France",
                                        "Senegal",
                                        "Germany",
                                    ].map((country) => (
                                        <button
                                            key={country}
                                            type="button"
                                            className={`${styles.chip} ${form.countries?.includes(country)
                                                ? styles.activeChip
                                                : ""
                                                }`}
                                        // onClick={() => toggleCountry(country)}
                                        >
                                            {country}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className={styles.addChip}
                                    >
                                        + {t("Add another country...")}
                                    </button>
                                </div>
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("EXPECTED MONTHLY INFLOW")}
                                </label>

                                <div className={styles.chips}>
                                    {[
                                        "€0-50k",
                                        "€50k-250k",
                                        "€250k-1M",
                                        "€1M+",
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`${styles.chip} ${form.monthlyVolume === item
                                                ? styles.activeChip
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    monthlyVolume: item,
                                                }))
                                            }
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("CURRENCIES YOU WORK WITH")}
                                </label>

                                <div className={styles.chips}>
                                    {["EUR", "USD", "GBP", "USDC"].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`${styles.chip} ${form.currencies?.includes(item)
                                                ? styles.activeChip
                                                : ""
                                                }`}
                                        // onClick={() => toggleCurrency(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("SERVICES REQUESTED")}
                                </label>

                                <div className={styles.chips}>
                                    {[
                                        "SEPA & SWIFT",
                                        "Crypto to Fiat",
                                        "Mass payouts",
                                        "Cards",
                                    ].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`${styles.chip} ${form.services?.includes(item)
                                                ? styles.activeChip
                                                : ""
                                                }`}
                                        // onClick={() => toggleService(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("PAYMENT RAILS")}
                                </label>

                                <div className={styles.chips}>
                                    {["SEPA", "SWIFT", "Local rails"].map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`${styles.chip} ${form.paymentRails?.includes(item)
                                                ? styles.activeChip
                                                : ""
                                                }`}
                                        // onClick={() => toggleRail(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* <div className={styles.sectionDivider} /> */}





                        </div>
                    </div>

                    <div className={styles.formContainer2}

                        style={{
                            width: "100%"
                        }}>
                        <div className={styles.onboardingForm2}

                            style={{
                                width: "100%"
                            }}>
                            <h4 className={styles.sectionTitle}>
                                {t("Intended use of the account")}
                            </h4>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("PURPOSE OF THE IBAN")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.purpose}
                                        onChange={set("purpose")}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("NATURE OF EXPECTED PAYMENTS")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.paymentNature}
                                        onChange={set("paymentNature")}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("COUNTRIES OF ORIGIN OF FUNDS")}
                                    </label>

                                    <select
                                        className={styles.selectInput}
                                        value={form.originCountry}
                                        onChange={set("originCountry")}
                                    >
                                        <option>{t("Add country...")}</option>
                                    </select>

                                    <div className={styles.chips}>
                                        {["Switzerland", "France"].map((c) => (
                                            <span
                                                key={c}
                                                className={styles.activeChip}
                                            >
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("COUNTRIES OF DESTINATION")}
                                    </label>

                                    <select
                                        className={styles.selectInput}
                                        value={form.destinationCountry}
                                        onChange={set("destinationCountry")}
                                    >
                                        <option>{t("Add country...")}</option>
                                    </select>

                                    <div className={styles.chips}>
                                        {["Senegal", "Pakistan"].map((c) => (
                                            <span
                                                key={c}
                                                className={styles.activeChip}
                                            >
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("AVERAGE TRANSACTION VALUE")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.averageTransaction}
                                        onChange={set("averageTransaction")}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("MAXIMUM TRANSACTION VALUE")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.maximumTransaction}
                                        onChange={set("maximumTransaction")}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("EXPECTED AVERAGE BALANCE")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.averageBalance}
                                        onChange={set("averageBalance")}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("INCOMING PAYMENTS / MONTH")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.incomingPayments}
                                        onChange={set("incomingPayments")}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("OUTGOING PAYMENTS / MONTH")}
                                    </label>

                                    <input
                                        className={styles.textInput}
                                        value={form.outgoingPayments}
                                        onChange={set("outgoingPayments")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className={styles.sidebarArea}>
                    <SidebarProgress
                        percent={45}
                        stepsLeft={3}
                        currentStepKey="activity"
                        assistantMessage="You're halfway there! Business activity info helps us assess your risk profile. Be as accurate as possible."
                    />
                </div>
            </div>
            <div className={styles.noticeStrip}>
                {t(
                    "Crypto selected, offered as an upgrade. We may request source-of-wealth evidence and apply a temporary cap. Availability depends on your region."
                )}
            </div>
            <div className={styles.noticeStri2}>
                {t(
                    "Higher-risk corridor selected. Expect a standard-to-enhanced review with a couple of extra documents. This is normal and we'll guide you."
                )}
            </div>
            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>
                <button onClick={handleContinue} className={styles.continueButton}>
                    {t("Continue")}
                    <ArrowRight size={16} />
                </button>
            </div>

        </div>
    )
}

export default ActivityStep
