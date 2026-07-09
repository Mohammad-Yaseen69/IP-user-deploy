import { Check, MessageSquare } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styles from '../style/onboardingSteps.module.css'
import Magicsvg from '../magicsvg'
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

    const ORDER = ['account', 'company', 'activity', 'owners', 'documents']

    const getStatus = (itemKey) => {
        const currentIdx = ORDER.indexOf(currentStepKey)
        const itemIdx = ORDER.indexOf(itemKey)
        if (itemIdx < currentIdx) return 'done'
        if (itemIdx === currentIdx) return 'inprogress'
        return 'todo'
    }

    const radius = 40
    const sw = 6
    const nr = radius - sw * 2
    const circ = nr * 2 * Math.PI
    const dashOffset = circ - (percent / 100) * circ

    const doneCount = checklist.filter(i => getStatus(i.key) === 'done').length

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logoRow}>
                    <div className={styles.logoIcon}>
                        <Magicsvg />
                    </div>

                    <div>
                        <h3>{t("InstaPay Assistant")}</h3>
                        <p>{t("Tracking your activation")}</p>
                    </div>
                </div>
            </div>

            <div className={styles.progressSection}>
                <div className={styles.progressWrapper}>
                    <svg
                        className={styles.progressSvg}
                        width="118"
                        height="118"
                        viewBox="0 0 118 118"
                    >
                        <circle
                            cx="59"
                            cy="59"
                            r="46"
                            stroke="#ECE9FF"
                            strokeWidth="8"
                            fill="none"
                        />

                        <circle
                            cx="59"
                            cy="59"
                            r="46"
                            stroke="#5B3DF5"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${circ}`}
                            strokeDashoffset={dashOffset}
                            transform="rotate(-90 59 59)"
                        />
                    </svg>

                    <div className={styles.progressCenter}>
                        <h2>{percent}%</h2>
                        <span>{t("READY")}</span>
                    </div>
                </div>

                <div className={styles.stepsBadge}>
                    {stepsLeft} {t("steps left")}
                </div>
            </div>

            <div className={styles.assistantCard}>
                <div className={styles.assistantTop}>
                    <MessageSquare size={11} />

                    <span>{t("ASSISTANT")}</span>
                </div>

                <p>{t(assistantMessage)}</p>
            </div>


            <div className={styles.checklist}>
                <div className={styles.checklistHeader}>
                    <span>{t("YOUR CHECKLIST")}</span>

                    <span>
                        {doneCount} {t("of 5 done")}
                    </span>
                </div>

                {checklist.map((item) => {
                    const status = getStatus(item.key);

                    return (
                        <div
                            key={item.key}
                            className={`${styles.checkItem} ${status === "done"
                                ? styles.done
                                : status === "inprogress"
                                    ? styles.inprogress
                                    : styles.todo
                                }`}
                        >
                            <div className={styles.left}>
                                <div className={styles.iconWrap}>
                                    {status === "done" ? (
                                        <Check size={11} />
                                    ) : (
                                        <div className={styles.dot} />
                                    )}
                                </div>

                                <span className={styles.label}>
                                    {item.label}
                                </span>
                            </div>

                            <div className={styles.right}>
                                {status === "done" && (
                                    <span className={styles.doneBadge}>
                                        {t("Done")}
                                    </span>
                                )}

                                {status === "inprogress" && (
                                    <span className={styles.progressBadge}>
                                        {t("In progress")}
                                    </span>
                                )}

                                {status === "todo" && (
                                    <span className={styles.todoBadge}>
                                        {t("To do")}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>


            <button className={styles.askBtn}>
                <MessageSquare size={15} />

                <span>{t("Ask the assistant")}</span>
            </button>
        </aside>
    );
}

export default SidebarProgress
