import { useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styles from '../style/onboardingSteps.module.css'

const ReviewStep = ({ onSubmit, onBack, allData = {}, onNext }) => {
    const { t } = useTranslation()
    const [agreed, setAgreed] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const { company = {}, activity = {}, owners = [], documents = {} } = allData

    const handleSubmit = async () => {
        if (!agreed) return
        setSubmitting(true)
        // Simulate API call
        await new Promise(res => setTimeout(res, 1500))
        onSubmit(allData)
    }

    const docCount = Object.keys(documents).length

    const steps = [
        { num: '01', label: t('Account'), done: true },
        { num: '02', label: t('Company'), done: true },
        { num: '03', label: t('Activity'), done: true },
        { num: '04', label: t('Ownership'), done: true },
        { num: '05', label: t('Documents'), done: true },
        { num: '06', label: t('Review'), active: true }
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
            <div
                style={{
                    width: "100%"
                }}>
                <h2 className={styles.formHeading}>{t("Review your activation request")}</h2>
                <p className={styles.formSubheading}>
                    {t("Check everything below before you submit. You can jump back to any step to make changes.")}
                </p>
            </div>
            <div className={styles.mainArea}>

                <div className={styles.summaryWrapper}>

                    <div className={styles.summaryCard}>
                        <div className={styles.cardHeader}>
                            <h4>Company details</h4>
                            <span className={styles.edit}>Edit</span>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.item}>
                                <label>Legal name</label>
                                <span>Exadel Trade Solutions SA</span>
                            </div>

                            <div className={styles.item}>
                                <label>Registration</label>
                                <span>CHE-106.327.324</span>
                            </div>

                            <div className={styles.item}>
                                <label>Jurisdiction</label>
                                <span>Switzerland</span>
                            </div>

                            <div className={styles.item}>
                                <label>Agent</label>
                                <span>Trays SA Switzerland</span>
                            </div>
                        </div>
                    </div>


                    <div className={styles.summaryCard}>
                        <div className={styles.cardHeader}>
                            <h4>Ownership &amp; control</h4>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.item}>
                                <label>Owners</label>
                                <span>
                                    Jean-Jacques Elong (60% UBO, UBO) • K2 Holdings SA (40%, UBO)
                                </span>
                            </div>

                            <div className={styles.item}>
                                <label>Criteria</label>
                                <span>Entity / Individual</span>
                            </div>
                        </div>
                    </div>


                    <div className={styles.summaryCard}>
                        <div className={styles.cardHeader}>
                            <h4>Activity &amp; intended use</h4>
                            <span className={styles.edit}>Edit</span>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.item}>
                                <label>Sector</label>
                                <span>FinTech &amp; payments</span>
                            </div>

                            <div className={styles.item}>
                                <label>Countries</label>
                                <span>Switzerland, France, Senegal</span>
                            </div>

                            <div className={styles.item}>
                                <label>Expected inflow</label>
                                <span>&lt;250,000 / month</span>
                            </div>

                            <div className={styles.item}>
                                <label>Currencies</label>
                                <span>EUR, USD, XOF</span>
                            </div>

                            <div className={styles.item}>
                                <label>Services</label>
                                <span>SEPA &amp; SWIFT, Crypto to fiat</span>
                            </div>
                        </div>
                    </div>


                    <div className={styles.summaryCard}>
                        <div className={styles.cardHeader}>
                            <h4>Documents</h4>
                            <span className={styles.edit}>Edit</span>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.item}>
                                <label>Provided</label>
                                <span>8 documents</span>
                            </div>
                        </div>
                    </div>


                    <div className={styles.infoBox}>
                        <span className={styles.infoIcon}>ⓘ</span>

                        <p>
                            {t("You won't be charged now. There's no pricing to accept at this stage, our team confirms your eligibility and sends a personalized offer with the applicable terms and next steps.")}
                        </p>
                    </div>


                    <div className={styles.infoBox}>
                        <input type="checkbox" />

                        <span>
                            {t("I confirm the information provided is true and complete, and I authorise InstaPay to carry out KYB, AML, sanctions, PEP and adverse-media checks. I understand submission does not guarantee approval.")}
                        </span>
                    </div>
                </div>

            </div>
            <div className={styles.navigationFooter}>
                <button onClick={() => onBack()} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    {t("Back")}
                </button>
                <button className={styles.continueButton} onClick={() => onNext()}>
                    {t("Request IBAN activation")}
                </button>
            </div>

        </div>
    )
}

export default ReviewStep
