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
        { key: 'account',   label: t('Account') },
        { key: 'company',   label: t('Company details') },
        { key: 'activity',  label: t('Activity & intended use') },
        { key: 'owners',    label: t('Owners verified') },
        { key: 'documents', label: t('Documents') }
    ]

    const ORDER = ['account', 'company', 'activity', 'owners', 'documents']

    const getStatus = (itemKey) => {
        const currentIdx = ORDER.indexOf(currentStepKey)
        const itemIdx    = ORDER.indexOf(itemKey)
        if (itemIdx < currentIdx)  return 'done'
        if (itemIdx === currentIdx) return 'inprogress'
        return 'todo'
    }

    const radius     = 40
    const sw         = 6
    const nr         = radius - sw * 2
    const circ       = nr * 2 * Math.PI
    const dashOffset = circ - (percent / 100) * circ

    const doneCount = checklist.filter(i => getStatus(i.key) === 'done').length

    return (
        <div className={styles.sidebar}>
            {/* Header */}
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
                            stroke="#EBF0FE" fill="transparent"
                            strokeWidth={sw} r={nr} cx={radius} cy={radius}
                        />
                        <circle
                            className={styles.circleProgress}
                            stroke="#4A32E3" fill="transparent"
                            strokeWidth={sw}
                            strokeDasharray={`${circ} ${circ}`}
                            style={{ strokeDashoffset: dashOffset }}
                            r={nr} cx={radius} cy={radius}
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

            {/* AI bubble */}
            <div className={styles.assistantBubble}>
                <span className={styles.assistantLabel}>{t("ASSISTANT")}</span>
                <p>{t(assistantMessage)}</p>
            </div>

            {/* Checklist */}
            <div className={styles.checklistSection}>
                <div className={styles.checklistHeader}>
                    <h4>{t("YOUR CHECKLIST")}</h4>
                    <span>{doneCount} {t("of 5 done")}</span>
                </div>
                <div className={styles.checklistList}>
                    {checklist.map(item => {
                        const st = getStatus(item.key)
                        return (
                            <div
                                key={item.key}
                                className={styles.checklistItem}
                                style={{ opacity: st === 'todo' ? 0.55 : 1 }}
                            >
                                <div
                                    className={styles.checkIconBox}
                                    style={
                                        st === 'done'
                                            ? { background: '#22c55e', borderColor: '#22c55e' }
                                            : st === 'inprogress'
                                            ? { background: '#4A32E3', borderColor: '#4A32E3' }
                                            : {}
                                    }
                                >
                                    {st === 'done' && <Check size={11} color="#fff" />}
                                    {st !== 'done' && (
                                        <div
                                            className={styles.checkDot}
                                            style={st === 'inprogress' ? { background: '#fff' } : {}}
                                        />
                                    )}
                                </div>

                                <span
                                    className={styles.checklistLabel}
                                    style={st === 'done' ? { color: '#9ca3af', textDecoration: 'line-through' } : {}}
                                >
                                    {item.label}
                                </span>

                                <span
                                    style={{
                                        fontSize: '10px', fontWeight: 600,
                                        padding: '2px 7px', borderRadius: '100px',
                                        color:      st === 'done' ? '#16a34a' : st === 'inprogress' ? '#4A32E3' : '#9ca3af',
                                        background: st === 'done' ? '#dcfce7' : st === 'inprogress' ? '#EBF0FE' : '#f1f5f9',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    {st === 'done'       && t('Done')}
                                    {st === 'inprogress' && t('In progress')}
                                    {st === 'todo'       && t('To do')}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Ask button */}
            <button className={styles.askAssistantBtn}>
                <MessageSquare size={15} />
                {t("Ask the assistant")}
            </button>
        </div>
    )
}

export default SidebarProgress
