import { Tooltip, useMediaQuery  } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import bvnkIndustryReference from '../../../../utils/Data/bvnkIndustryReference.json'
import CountryDropDown from '../../../AddBeneficiary/CountryDropDown'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'
import StepProgress from './StepProgress'
import AlertBox from './AlertBox'

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

const MAIN_COUNTRY_OPTIONS = [
    'Switzerland',
    'France',
    'Senegal',
    'Germany',
]

const COUNTRY_LIST = ['Switzerland', 'France', 'Germany', 'United Kingdom', 'Netherlands', 'Luxembourg', 'Ireland', 'Malta', 'United Arab Emirates', 'United States', 'Senegal', 'Pakistan', 'India', 'China', 'Brazil', 'Canada', 'Japan', 'Australia', 'Saudi Arabia', 'South Africa']

const countrySelectStyle = {
    borderRadius: '12px', padding: '13px 15px', border: '1px solid #1412201F'
}

const ActivityStep = ({ onNext, onBack, onChange, data = {}, currentStep}) => {
    const { t } = useTranslation()
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const isMobile = useMediaQuery('(max-width:600px)');
    
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, []);

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

    // Keeps the parent (and the saved draft) in sync while the user fills the form
    useEffect(() => {
        onChange?.(form)
    }, [form])

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

    const isFormValid = Boolean(
        (form.industryReference || form.industry) &&
        form.monthlyVolume &&
        form.purpose?.trim() &&
        form.paymentNature?.trim() &&
        form.originCountries?.length > 0 &&
        form.destinationCountries?.length > 0 &&
        form.averageTransaction &&
        form.maximumTransaction &&
        form.averageBalance &&
        form.incomingPayments &&
        form.outgoingPayments
    )

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    const handleCountrySelect = (selectedCountry) => {
        const countryName = selectedCountry?.name?.trim()

        if (!countryName) return

        setForm(prev => {
            const countryExists = prev.countries?.some(
                country => country?.toLowerCase() === countryName.toLowerCase()
            )

            if (countryExists) {
                return prev
            }

            return {
                ...prev,
                countries: [...(prev.countries || []), countryName],
            }
        })

        setShowCountryDropdown(false)
    }

    const toggleArrayItem = (key, item) => {
        setForm(prev => {
            const current = prev[key] || []
            return { ...prev, [key]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] }
        })
    }

    const handleContinue = () => {
        onNext(form, 'activity')
    }

    const steps = [
        { num: '01', label: t('Account'), completed: true },
        { num: '02', label: t('Company'), completed: true },
        { num: '03', label: t('Activity'), active: true },
        { num: '04', label: t('Ownership'), active: false },
        { num: '05', label: t('Documents'), active: false },
        { num: '06', label: t('Review'), active: false }
    ]

    return (
        <div className={styles.onboardingLayout}>
            <div>
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
                <StepProgress
                    percent={45} 
                    currentStep={currentStep} 
                />
            </div>
            <div style={{
                width: "100%"
            }} className={styles.activityHeader}>
                <h2 className={styles.formHeading}>{t("How will you use InstaPay?")}</h2>
                <p className={styles.formSubheading}>
                    {t("These answers tailor your account. Some questions and documents appear dynamically based on your profile, nothing more than we need.")}
                </p>
                <div className={styles.activityAlert}>
                    <AlertBox
                        title={"Assistant"}
                        description={"Almost halfway. These answers shape which documents we'll actually need from you."}
                    />
                </div>
            </div>
            <div className={styles.mainArea}>

                <div>
                    <div className={styles.formContainer2} style={{
                        marginBottom: "15px",
                    }}>
                        <div className={`${styles.onboardingForm2} ${styles.activityFormWrapper}`}>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("INDUSTRY / SECTOR")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                </label>

                                <select
                                    className={styles.textInput}
                                    style={{ height: "auto", padding: "12px" }}
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
                                    maxLength={1000}
                                    value={form.businessDescription}
                                    onChange={set("businessDescription")}
                                    placeholder={t(
                                        "Cross-border payment orchestration and multi-currency treasury..."
                                    )}
                                />
                                < span className={styles.charCount}>{form.businessDescription.length}/1000</span>
                            </div>

                            <div className={styles.inputGroup}
                                style={{
                                    width: "100%",
                                    maxWidth: "604px",
                                }}
                            >
                                <label className={styles.inputLabel}>
                                    {t("MAIN COUNTRIES OF OPERATION")}
                                </label>

                                <div className={styles.chips} style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "8px",
                                    whiteSpace: "nowrap",
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                }}>
                                    {MAIN_COUNTRY_OPTIONS.map((country) => {
                                        const isSelected = form.countries?.some(
                                            item => item?.toLowerCase() === country.toLowerCase()
                                        )

                                        return (
                                            <button
                                                key={country}
                                                type="button"
                                                className={isSelected ? styles.activeChip : styles.chip}
                                                onClick={() => toggleArrayItem('countries', country)}
                                                style={isSelected ? { gap: '6px', marginBottom: 0 } : undefined}
                                            >
                                                <span>{t(country)}</span>
                                                {isSelected ? <X size={15} /> : null}
                                            </button>
                                        )
                                    })}

                                    {form.countries
                                        ?.filter(country => !MAIN_COUNTRY_OPTIONS.some(item => item.toLowerCase() === country.toLowerCase()))
                                        ?.map((country) => (
                                            <button
                                                key={country}
                                                type="button"
                                                className={styles.activeChip}
                                                onClick={() => toggleArrayItem('countries', country)}
                                                style={{ gap: '6px', marginBottom: 0 }}
                                            >
                                                <span>{t(country)}</span>
                                                <X size={15} />
                                            </button>
                                        ))}

                                    {!showCountryDropdown && (
                                        <button
                                            type="button"
                                            className={styles.addChip}
                                            onClick={() => setShowCountryDropdown(true)}
                                            style={{ flex: '0 0 auto' }}
                                        >
                                            + {t("Add another country...")}
                                        </button>
                                    )}
                                </div>

                                {showCountryDropdown && (
                                    <div style={{ marginTop: '12px', maxWidth: '420px', width: '100%' }}>
                                        <CountryDropDown
                                            onSelect={handleCountrySelect}
                                            country={''}
                                            background="#fff"
                                        />
                                    </div>
                                )}
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
                                        { label: "SEPA & SWIFT", comingSoon: false },
                                        { label: "Crypto to Fiat", comingSoon: true },
                                        { label: "Mass payouts", comingSoon: true },
                                        { label: "Cards", comingSoon: true },
                                    ].map(({ label, comingSoon }) => (
                                        <Tooltip
                                            key={label}
                                            title={comingSoon ? "Coming Soon" : ""}
                                            arrow
                                            placement="top"
                                        >
                                            <span>
                                                <button
                                                    type="button"
                                                    disabled={comingSoon}
                                                    className={`${styles.chip} ${form.services?.includes(label)
                                                        ? styles.activeChip
                                                        : ""
                                                        }`}
                                                    onClick={() =>
                                                        !comingSoon && toggleArrayItem("services", label)
                                                    }
                                                >
                                                    {label}
                                                </button>
                                            </span>
                                        </Tooltip>
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

                        </div>
                    </div>

                    <div className={styles.formContainer2}

                        style={{
                            width: "100%"
                        }}>
                        <div className={`${styles.onboardingForm2} ${styles.activityFormWrapper}`}

                            style={{
                                width: "100%"
                            }}>
                            <h4 className={styles.sectionTitle}>
                                {t("Intended use of the account")}
                            </h4>

                            <div className={styles.formGrid} >
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("PURPOSE OF THE IBAN")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <input
                                        style={{ padding: "14.5px 14px 14.5px 12.5px" }}
                                        className={styles.textInput}
                                        value={form.purpose}
                                        onChange={set("purpose")}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("NATURE OF EXPECTED PAYMENTS")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <input
                                        style={{ padding: "14.5px 14px 14.5px 12.5px" }}
                                        type="text"
                                        placeholder={t("e.g. Invoices, consulting fees, supplier settlements")}
                                        className={styles.textInput}
                                        value={form.paymentNature}
                                        onChange={set("paymentNature")}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("COUNTRIES OF ORIGIN OF FUNDS")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <CountryDropDown
                                        onSelect={(country) => {
                                            if (country?.name) {
                                                toggleArrayItem("originCountries", country.name);
                                            }
                                        }}
                                        country=""
                                        background="#fff"
                                        containerStyle={countrySelectStyle}
                                    />

                                    <div className={styles.chips}>
                                        {form.originCountries?.map((c) => (
                                            <span
                                                key={c}
                                                className={styles.activeChip}
                                                onClick={() => toggleArrayItem("originCountries", c)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <span>
                                                    {c}</span>
                                                <X size={15} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("COUNTRIES OF DESTINATION")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <CountryDropDown
                                        onSelect={(country) => {
                                            if (country?.name) {
                                                toggleArrayItem("destinationCountries", country.name);
                                            }
                                        }}
                                        country=""
                                        background="#fff"
                                        containerStyle={countrySelectStyle}
                                    />

                                    <div className={styles.chips}>
                                        {form.destinationCountries?.map((c) => (
                                            <span
                                                key={c}
                                                className={styles.activeChip}
                                                onClick={() => toggleArrayItem("destinationCountries", c)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <span>
                                                    {c}</span>
                                                <X size={15} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.formGrid} ${isMobile && styles.twoInputRow}`}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t(isMobile ? "Avg transaction" : "AVERAGE TRANSACTION VALUE (EUR)")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <div className={styles.inputWrapper}>
                                        <input
                                            style={{ padding: "14.5px 52px 14.5px 14px" }}
                                            type="number"
                                            min="0"
                                            placeholder="12000"
                                            className={styles.textInput}
                                            value={form.averageTransaction}
                                            onChange={set("averageTransaction")}
                                        />
                                        <span className={styles.currencyBadge}>EUR</span>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t(isMobile ? "Max transaction" : "MAXIMUM TRANSACTION VALUE (EUR)")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="25000"
                                            style={{ padding: "14.5px 52px 14.5px 14px" }}
                                            className={styles.textInput}
                                            value={form.maximumTransaction}
                                            onChange={set("maximumTransaction")}
                                        />
                                        <span className={styles.currencyBadge}>EUR</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("EXPECTED AVERAGE BALANCE (EUR)")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
                                    </label>

                                    <div className={styles.inputWrapper}>
                                        <input
                                            style={{ padding: "14.5px 52px 14.5px 14px" }}
                                            type="number"
                                            min="0"
                                            placeholder="24000"
                                            className={styles.textInput}
                                            value={form.averageBalance}
                                            onChange={set("averageBalance")}
                                        />
                                        <span className={styles.currencyBadge}>EUR</span>
                                    </div>
                                </div>
                                {isMobile ?
                                    <div className={styles.twoInputRow}>
                                        <PaymentsFields form={form} set={set} isMobile={true} />
                                    </div>
                                :
                                    <PaymentsFields form={form} set={set} />
                                }
                               
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
             {isMobile ?
                <div className={styles.alertWrapper}>
                    <AlertBox
                        icon={<AlertCircle size={12} color='#5926F0' />}
                        description={"Crypto selected, offered as an upgrade. We may request source-of-wealth evidence and apply a temporary cap. Availability depends on your region."}
                    />
                    <AlertBox
                        variant='warning'
                        containerClass={styles.alertContainer}
                        descClass={styles.alertDesc}
                        icon={<AlertTriangle size={12} color='#8A5A00' />}
                        description={"Higher-risk corridor selected. Expect a standard-to-enhanced review with a couple of extra documents. This is normal and we'll guide you."}
                    />
                </div>
                :    
                <>
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
                </>       
            }
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
                    {!isMobile && <ArrowRight size={16} />}
                </button>
            </div>
        </div>
    )
}

export default ActivityStep

const PaymentsFields = ({ form, set, isMobile }) => {
    const { t } = useTranslation();
    return(
    <>
    <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
            {t(isMobile ? "Incoming / month" : "INCOMING PAYMENTS / MONTH (EUR)")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
        </label>

        <div className={styles.inputWrapper}>
            <input
                style={{ padding: "14.5px 52px 14.5px 14px" }}
                type="number"
                min="0"
                placeholder="50000"
                className={styles.textInput}
                value={form.incomingPayments}
                onChange={set("incomingPayments")}
            />
            <span className={styles.currencyBadge}>EUR</span>
        </div>
    </div>

    <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>
            {t(isMobile ? "Outgoing / month" : "OUTGOING PAYMENTS / MONTH (EUR)")} <span style={{ color: "red", fontWeight: 600 }}>*</span>
        </label>

        <div className={styles.inputWrapper}>
            <input
                style={{ padding: "14.5px 52px 14.5px 14px" }}
                type="number"
                min="0"
                placeholder="40000"
                className={styles.textInput}
                value={form.outgoingPayments}
                onChange={set("outgoingPayments")}
            />
            <span className={styles.currencyBadge}>EUR</span>
        </div>
    </div>
    </>
)
}