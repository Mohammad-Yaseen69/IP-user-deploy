import { AlertCircle, Shield } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styles from '../style/RiskProfileCard.module.css'
import { useRiskPreviewContext } from '../riskPreviewContext'

const LEVEL_TEXT = {
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk',
}

const CDD_TEXT = {
    simplified: 'Simplified due diligence',
    standard: 'Standard due diligence',
    enhanced: 'Enhanced due diligence',
}

// Live risk feedback while the user fills the IBAN onboarding. Informational only:
// it never blocks continuing or submitting.
const RiskProfileCard = ({ variant = 'sidebar' }) => {
    const { t } = useTranslation()
    const { data, isFetching } = useRiskPreviewContext()

    if (!data) return null

    const level = data.level || 'low'
    const feedback = (data.feedback || []).filter((item) => item.level !== 'low')

    return (
        <div className={`${styles.card} ${variant === 'inline' ? styles.inline : ''}`} aria-live="polite">
            <div className={styles.header}>
                <div className={styles.title}>
                    <Shield size={12} />
                    <span>{t('RISK PROFILE')}</span>
                </div>
                <span className={`${styles.level} ${styles[level]}`}>
                    {t(LEVEL_TEXT[level])}
                </span>
            </div>

            <p className={styles.cdd}>
                {t(CDD_TEXT[data.cddLevel] || CDD_TEXT.standard)}
                {isFetching && <span className={styles.updating}> · {t('updating…')}</span>}
            </p>

            {feedback.length > 0 ? (
                <ul className={styles.feedback}>
                    {feedback.map((item) => (
                        <li key={item.factor} className={styles[item.level]}>
                            <strong>{t(item.label)}</strong>
                            <span>{t(item.message)}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.note}>{t('Your profile looks straightforward so far.')}</p>
            )}

            {level === 'high' && (
                <p className={styles.highNote}>
                    <AlertCircle size={12} />
                    <span>{t('Your application will go through an enhanced review by our compliance team. You can still continue and submit it.')}</span>
                </p>
            )}
        </div>
    )
}

export default RiskProfileCard
