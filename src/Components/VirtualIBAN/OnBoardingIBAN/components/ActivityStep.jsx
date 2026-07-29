import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, DollarSign, BarChart2, ArrowLeft, ArrowRight, CheckSquare } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'
import bvnkIndustryReference from '../../../../utils/Data/bvnkIndustryReference.json'

const getIndustryPayload = (industry) => ({
    name: industry?.name,
    productionReference: industry?.productionReference,
    sandboxReference: industry?.sandboxReference || industry?.stagingReference,
})

const parseIndustryReference = (industryReference) => {
    if (!industryReference) return null
    if (typeof industryReference === "string") {
        try { return JSON.parse(industryReference) } catch { return null }
    }
    return industryReference
}

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

const COUNTRY_LIST = ['Switzerland', 'France', 'Germany', 'United Kingdom', 'Netherlands', 'Luxembourg', 'Ireland', 'Malta', 'United Arab Emirates', 'United States', 'Senegal', 'Pakistan', 'India', 'China', 'Brazil', 'Canada', 'Japan', 'Australia', 'Saudi Arabia', 'South Africa']

const ActivityStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [form, setForm] = useState({
        industry: data.industry || '',
        industryReference: data.industryReference || parseIndustryReference(data.industry),
        businessDescription: data.businessDescription || '',
        monthlyVolume: data.monthlyVolume || '',
        transactionTypes: data.transactionTypes || [],
        countries: data.countries || [],
        currencies: data.currencies || [],
        services: data.services || [],
        paymentRails: data.paymentRails || [],
        originCountries: data.originCountries || [],
        destinationCountries: data.destinationCountries || [],
        purpose: data.purpose || '',
        paymentNature: data.paymentNature || '',
        averageTransaction: data.averageTransaction || '',
        maximumTransaction: data.maximumTransaction || '',
        averageBalance: data.averageBalance || '',
        incomingPayments: data.incomingPayments || '',
        outgoingPayments: data.outgoingPayments || '',
    })

    const industryOptions = useMemo(() => {
        return bvnkIndustryReference.map(group => ({
            name: group.name,
            children: (group.children || []).map(child => getIndustryPayload(child)),
        }))
    }, [])

    const selectedIndustryValue = useMemo(() => {
        const ref = form.industryReference || parseIndustryReference(form.industry)
        if (!ref) return ""
        const selected = industryOptions
            .flatMap(group => group.children)
            .find(ind => (
                ind.productionReference === ref.productionReference ||
                ind.sandboxReference === ref.sandboxReference ||
                ind.name === ref.name
            ))
        return selected?.productionReference || ""
    }, [industryOptions, form.industryReference, form.industry])

    const handleIndustryChange = (event) => {
        const selected = industryOptions
            .flatMap(group => group.children)
            .find(ind => ind.productionReference === event.target.value)

        if (selected) {
            setForm(prev => ({
                ...prev,
                industry: selected.name,
                industryReference: selected
            }))
        }
    }

    const isFormValid = Boolean((form.industryReference || form.industry) && form.monthlyVolume && (form.purpose?.trim() || form.businessDescription?.trim() || true))

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    const toggleArrayItem = (key, item) => {
        setForm(prev => {
            const current = prev[key] || []
            return { ...prev, [key]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] }
        })
    }

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
        onNext(form, 'activity')
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
                                    {t("INDUSTRY / SECTOR")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                </label>

                                <select
                                    className={styles.textInput}
                                    value={selectedIndustryValue}
                                    onChange={handleIndustryChange}
                                >
                                    <option value="" disabled>{t("Select Industry / Sector")}</option>
                                    {industryOptions.map(group => (
                                        <optgroup key={group.name} label={t(group.name)}>
                                            {group.children.map(ind => (
                                                <option key={ind.productionReference} value={ind.productionReference}>
                                                    {t(ind.name)}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
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
                                            onClick={() => toggleArrayItem('countries', country)}
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
                                            onClick={() => toggleArrayItem('currencies', item)}
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
                                            onClick={() => toggleArrayItem('services', item)}
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
                                            onClick={() => toggleArrayItem('paymentRails', item)}
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
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) toggleArrayItem("originCountries", e.target.value)
                                        }}
                                    >
                                        <option value="">{t("Add country...")}</option>
                                        {COUNTRY_LIST.filter(c => !form.originCountries?.includes(c)).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>

                                    <div className={styles.chips}>
                                        {form.originCountries?.map((c) => (
                                            <span
                                                key={c}
                                                className={styles.activeChip}
                                                onClick={() => toggleArrayItem("originCountries", c)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {c} ✕
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
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) toggleArrayItem("destinationCountries", e.target.value)
                                        }}
                                    >
                                        <option value="">{t("Add country...")}</option>
                                        {COUNTRY_LIST.filter(c => !form.destinationCountries?.includes(c)).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>

                                    <div className={styles.chips}>
                                        {form.destinationCountries?.map((c) => (
                                            <span
                                                key={c}
                                                className={styles.activeChip}
                                                onClick={() => toggleArrayItem("destinationCountries", c)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {c} ✕
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
                <button 
                    onClick={handleContinue} 
                    className={styles.continueButton}
                    disabled={!isFormValid}
                    style={{ opacity: !isFormValid ? 0.5 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
                >
                    {t("Continue")}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    )
}

export default ActivityStep
