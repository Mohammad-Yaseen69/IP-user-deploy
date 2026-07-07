import React from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Check } from 'react-feather'
import styles from '../style/onboardingSteps.module.css'

const SidebarProgress = ({ 
    percent = 15, 
    stepsLeft = 5, 
    assistantMessage = "Let's get you verified first, this only takes a minute, then we'll move to your company details.",
    currentStepKey = 'account'
}) => {
    const { t } = useTranslation()
    
    const checklist = [
        { key: 'account', label: t('Account') },
        { key: 'company', label: t('Company details') },
        { key: 'activity', label: t('Activity & intended use') },
        { key: 'owners', label: t('Owners verified') },
        { key: 'documents', label: t('Documents') }
    ]

    const getStatus = (itemKey) => {
        const order = ['account', 'company', 'activity', 'owners', 'documents']
        const currentIndex = order.indexOf(currentStepKey)
        const itemIndex = order.indexOf(itemKey)
        
        if (itemIndex < currentIndex) return 'done'
        if (itemIndex === currentIndex) return 'in-progress'
        return 'to-do'
    }

    const radius = 40
    const strokeWidth = 6
    const normalizedRadius = radius - strokeWidth * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (percent / 100) * circumference

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.assistantHeaderTitle}>
                    <div className={styles.pulseDot} />
                    <h3>{t("InstaPay Assistant")}</h3>
                </div>
                <p className={styles.sidebarSubtitle}>{t("Tracking your activation")}</p>
            </div>

            {/* Circular Progress */}
            <div className={styles.progressCircleContainer}>
                <div className={styles.circleSvgWrapper}>
                    <svg height={radius * 2} width={radius * 2} className={styles.svgCircle}>
                        <circle
                            className={styles.circleBg}
                            stroke="#EBF0FE"
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        <circle
                            className={styles.circleProgress}
                            stroke="#4A32E3"
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference + ' ' + circumference}
                            style={{ strokeDashoffset }}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                    </svg>
                    <div className={styles.circleText}>
                        <span className={styles.percentText}>{percent}%</span>
                        <span className={styles.readyText}>{t("READY")}</span>
                    </div>
                </div>
                <span className={styles.stepsLeftBadge}>
                    {stepsLeft} {t("steps left")}
                </span>
            </div>

            {/* Talk Bubble */}
            <div className={styles.assistantBubble}>
                <span className={styles.assistantLabel}>{t("ASSISTANT")}</span>
                <p>{t(assistantMessage)}</p>
            </div>

            {/* Checklist */}
            <div className={styles.checklistSection}>
                <div className={styles.checklistHeader}>
                    <h4>{t("YOUR CHECKLIST")}</h4>
                    <span>{checklist.filter(item => getStatus(item.key) === 'done').length} {t("of 5 done")}</span>
                </div>
                <div className={styles.checklistList}>
                    {checklist.map(item => {
                        const status = getStatus(item.key)
                        return (
                            <div key={item.key} className={`${styles.checklistItem} ${styles[status]}`}>
                                <div className={styles.checkIconBox}>
                                    {status === 'done' ? (
                                        <Check size={12} className={styles.checkIconDone} />
                                    ) : (
                                        <div className={styles.checkDot} />
                                    )}
                                </div>
                                <span className={styles.checklistLabel}>{item.label}</span>
                                <span className={`${styles.statusLabel} ${styles[status]}`}>
                                    {status === 'done' && t('Done')}
                                    {status === 'in-progress' && t('In progress')}
                                    {status === 'to-do' && t('To do')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Ask the Assistant Button */}
            <button className={styles.askAssistantBtn}>
                <MessageSquare size={16} />
                {t("Ask the assistant")}
            </button>
        </div>
    )
}

export default SidebarProgress
