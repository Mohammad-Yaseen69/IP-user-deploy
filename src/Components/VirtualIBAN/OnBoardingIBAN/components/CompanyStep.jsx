import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Briefcase, MapPin, Globe, ArrowLeft, ArrowRight, Hash } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'
import Magicsvg from '../magicsvg'
import { FaHand } from 'react-icons/fa6'

const LEGAL_STRUCTURES = [
    'Limited Liability Company (LLC)',
    'Corporation (Corp / Inc)',
    'Public Limited Company (PLC)',
    'Partnership',
    'Sole Proprietorship',
    'Non-Profit Organization',
    'Other'
]

const COUNTRIES = [
    'Malta', 'United Kingdom', 'Germany', 'France', 'Netherlands',
    'Luxembourg', 'Ireland', 'Switzerland', 'United Arab Emirates',
    'United States', 'Other'
]

const CompanyStep = ({ onNext, onBack, userType, data = {} }) => {
    const { t } = useTranslation()
    const [form, setForm] = useState({
        legalName: data.legalName || '',
        tradingName: data.tradingName || '',
        registrationNumber: data.registrationNumber || '',
        legalStructure: data.legalStructure || '',
        countryOfIncorporation: data.countryOfIncorporation || '',
        registeredAddress: data.registeredAddress || '',
        website: data.website || '',
        legalForm: "",
        dateOfIncorporation: "",
        taxNumber: "",
        mainContact: "",
        agent: "",
    })

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

    const handleContinue = () => {
        onNext({ company: form })
    }

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), active: true },
        { num: '03', label: t('Activity'), active: false },
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
            <div className={styles.upperlayout}>
                <p>
                    {t("Start with your registration number, we'll pull what we can from the registry and let you confirm.")}
                </p>
                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <Magicsvg />
                    </div>

                    <div className={styles.infoContent}>
                        <span className={styles.infoTitle}>
                            {t("INSTAPAY ASSISTANT")}
                        </span>

                        <p>
                            {t("Start with your registration number, I'll pull the rest from the registry. Add your agent if one referred you.")}
                        </p>
                    </div>
                </div>

                <div className={styles.noticeCard}>
                    <FaHand />

                    <p>
                        {t("Agent detected. If this agent has a negotiated package, our team will apply it automatically to your activation pack.")}
                    </p>
                </div>
            </div>

            <div className={styles.mainArea}>

                <div className={styles.formContainer2}>
                    <div
                        className={styles.onboardingForm2}
                        style={{ width: "100%" }}
                    >

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>
                                {t("COUNTRY OF INCORPORATION")}
                            </label>

                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} size={16} />

                                <select
                                    className={styles.selectInput}
                                    value={form.countryOfIncorporation}
                                    onChange={set("countryOfIncorporation")}
                                    style={{ paddingLeft: 44 }}
                                >
                                    <option value="">{t("Select country")}</option>

                                    {COUNTRIES.map((c) => (
                                        <option key={c} value={c}>
                                            {t(c)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("REGISTRATION NUMBER")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Hash className={styles.inputIcon} size={16} />

                                    <input
                                        type="text"
                                        className={styles.textInput}
                                        value={form.registrationNumber}
                                        onChange={set("registrationNumber")}
                                        placeholder="CHE-105.837.234"
                                    />
                                </div>
                            </div>


                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>&nbsp;</label>

                                <button
                                    className={styles.registryBtn}
                                    type="button"
                                >
                                    {t("Look up on registry")}
                                </button>
                            </div>
                        </div>


                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("LEGAL COMPANY NAME")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.inputIcon} size={16} />

                                    <input
                                        className={styles.textInput}
                                        value={form.legalName}
                                        onChange={set("legalName")}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("TRADING NAME")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.inputIcon} size={16} />

                                    <input
                                        className={styles.textInput}
                                        value={form.tradingName}
                                        onChange={set("tradingName")}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("LEGAL FORM")}
                                </label>

                                <input
                                    className={styles.textInput}
                                    value={form.legalForm}
                                    onChange={set("legalForm")}
                                    placeholder="SA"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("DATE OF INCORPORATION")}
                                </label>

                                <input
                                    className={styles.textInput}
                                    value={form.dateOfIncorporation}
                                    onChange={set("dateOfIncorporation")}
                                    placeholder="2021"
                                />
                            </div>
                        </div>


                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("TAX / VAT NUMBER")}
                                </label>

                                <input
                                    className={styles.textInput}
                                    value={form.taxNumber}
                                    onChange={set("taxNumber")}
                                    placeholder="CHE-105.837.234 VAT"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("WEBSITE")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Globe className={styles.inputIcon} size={16} />

                                    <input
                                        className={styles.textInput}
                                        value={form.website}
                                        onChange={set("website")}
                                        placeholder="https://"
                                    />
                                </div>
                            </div>
                        </div>


                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>
                                {t("REGISTERED ADDRESS")}
                            </label>

                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} size={16} />

                                <input
                                    className={styles.textInput}
                                    value={form.registeredAddress}
                                    onChange={set("registeredAddress")}
                                    placeholder={t("Street, City, Country")}
                                />
                            </div>
                        </div>


                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("MAIN CONTACT PERSON")}
                                </label>

                                <input
                                    className={styles.textInput}
                                    value={form.mainContact}
                                    onChange={set("mainContact")}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("AGENT / INTRODUCER (IF ANY)")}
                                </label>

                                <input
                                    className={styles.textInput}
                                    value={form.agent}
                                    onChange={set("agent")}
                                />
                            </div>
                        </div>

                    </div>

                </div>
                <div className={styles.sidebarArea}>
                    <SidebarProgress
                        percent={30}
                        stepsLeft={4}
                        currentStepKey="company"
                        assistantMessage="Great start! Now let's capture your company's legal identity. This helps us verify your registration."
                    />
                </div>
            </div>
            <div className={styles.navigationFooter}>
                <button onClick={onBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>
                <button onClick={handleContinue} className={styles.continueButton}>
                    {t("Continue")}
                </button>
            </div>


        </div>
    )
}

export default CompanyStep
