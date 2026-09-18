import { ArrowRight, Check, File, MessageSquare } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Magicsvg from '../magicsvg'
import styles from '../style/onboardingSteps.module.css'
import MobileProgress from './MobileProgress'
const SidebarProgress = ({
    percent = 15,
    stepsLeft = 5,
    assistantMessage = "Let's get you verified first, this only takes a minute, then we'll move to your company details.",
    currentStepKey = 'account',
    mobileView = false
}) => {
    const { t } = useTranslation()

    const checklist = [
        { key: 'account', label: t('Account'), icon: <Check size={15} /> },
        { key: 'company', label: t('Company details'), icon: <ArrowRight size={15} />, },
        {
            key: 'activity', label: t('Activity'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12" fill="none">
                <path d="M10.875 9.75C10.875 9.85156 10.8379 9.93945 10.7637 10.0137C10.6895 10.0879 10.6016 10.125 10.5 10.125H1.5C1.39844 10.125 1.31055 10.0879 1.23633 10.0137C1.16211 9.93945 1.125 9.85156 1.125 9.75V2.25C1.125 2.14844 1.16211 2.06055 1.23633 1.98633C1.31055 1.91211 1.39844 1.875 1.5 1.875C1.60156 1.875 1.68945 1.91211 1.76367 1.98633C1.83789 2.06055 1.875 2.14844 1.875 2.25V7.34766L4.23047 4.98047C4.26953 4.94922 4.31055 4.92383 4.35352 4.9043C4.39648 4.88477 4.44531 4.875 4.5 4.875C4.55469 4.875 4.60352 4.88477 4.64648 4.9043C4.68945 4.92383 4.73047 4.94922 4.76953 4.98047L6 6.22266L8.47266 3.75H7.5C7.39844 3.75 7.31055 3.71289 7.23633 3.63867C7.16211 3.56445 7.125 3.47656 7.125 3.375C7.125 3.27344 7.16211 3.18555 7.23633 3.11133C7.31055 3.03711 7.39844 3 7.5 3H9.375C9.47656 3 9.56445 3.03711 9.63867 3.11133C9.71289 3.18555 9.75 3.27344 9.75 3.375V5.25C9.75 5.35156 9.71289 5.43945 9.63867 5.51367C9.56445 5.58789 9.47656 5.625 9.375 5.625C9.27344 5.625 9.18555 5.58789 9.11133 5.51367C9.03711 5.43945 9 5.35156 9 5.25V4.27734L6.26953 7.01953C6.23047 7.05078 6.18945 7.07617 6.14648 7.0957C6.10352 7.11523 6.05469 7.125 6 7.125C5.94531 7.125 5.89648 7.11523 5.85352 7.0957C5.81055 7.07617 5.76953 7.05078 5.73047 7.01953L4.5 5.77734L1.875 8.40234V9.375H10.5C10.6016 9.375 10.6895 9.41211 10.7637 9.48633C10.8379 9.56055 10.875 9.64844 10.875 9.75Z" fill="#9AA3B2" />
            </svg>,
        },
        {
            key: 'owners', label: t('Owners verified'), icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12" fill="none">
                <path d="M11.4727 7.05469C11.4414 7.07812 11.4062 7.0957 11.3672 7.10742C11.3281 7.11914 11.2891 7.125 11.25 7.125C11.1875 7.125 11.1309 7.11133 11.0801 7.08398C11.0293 7.05664 10.9844 7.01953 10.9453 6.97266C10.7266 6.67578 10.4473 6.43945 10.1074 6.26367C9.76758 6.08789 9.40234 6 9.01172 6C9.01172 6 9.00977 6 9.00586 6C9.00195 6 9 6 9 6C8.92188 6 8.85156 5.97852 8.78906 5.93555C8.72656 5.89258 8.68359 5.83984 8.66016 5.77734V5.76562C8.64453 5.75 8.63477 5.72852 8.63086 5.70117C8.62695 5.67383 8.625 5.64844 8.625 5.625C8.625 5.60156 8.62695 5.57617 8.63086 5.54883C8.63477 5.52148 8.64453 5.49609 8.66016 5.47266V5.48438C8.68359 5.41406 8.72656 5.35742 8.78906 5.31445C8.85156 5.27148 8.92188 5.25 9 5.25C9.3125 5.25 9.57812 5.14062 9.79688 4.92188C10.0156 4.70312 10.125 4.4375 10.125 4.125C10.125 3.8125 10.0156 3.54688 9.79688 3.32812C9.57812 3.10938 9.3125 3 9 3C8.74219 3 8.51172 3.08008 8.30859 3.24023C8.10547 3.40039 7.97266 3.59766 7.91016 3.83203V3.84375C7.88672 3.92188 7.8418 3.98828 7.77539 4.04297C7.70898 4.09766 7.63281 4.125 7.54688 4.125C7.44531 4.125 7.35742 4.08789 7.2832 4.01367C7.20898 3.93945 7.17188 3.85156 7.17188 3.75C7.17188 3.73438 7.17383 3.71875 7.17773 3.70312C7.18164 3.6875 7.18359 3.67188 7.18359 3.65625C7.29297 3.25 7.51367 2.91406 7.8457 2.64844C8.17773 2.38281 8.5625 2.25 9 2.25C9.51562 2.25 9.95703 2.43359 10.3242 2.80078C10.6914 3.16797 10.875 3.60938 10.875 4.125C10.875 4.39844 10.8203 4.6543 10.7109 4.89258C10.6016 5.13086 10.4531 5.33594 10.2656 5.50781C10.5234 5.625 10.7598 5.76758 10.9746 5.93555C11.1895 6.10352 11.3789 6.29688 11.543 6.51562L11.5547 6.52734C11.5781 6.55859 11.5957 6.59375 11.6074 6.63281C11.6191 6.67188 11.625 6.71094 11.625 6.75C11.625 6.8125 11.6113 6.86914 11.584 6.91992C11.5566 6.9707 11.5195 7.01562 11.4727 7.05469ZM8.95312 9.9375C8.96875 9.96875 8.98242 10 8.99414 10.0312C9.00586 10.0625 9.01172 10.0977 9.01172 10.1367C9.01172 10.2383 8.97461 10.3262 8.90039 10.4004C8.82617 10.4746 8.73828 10.5117 8.63672 10.5117C8.55859 10.5117 8.49023 10.4941 8.43164 10.459C8.37305 10.4238 8.32812 10.375 8.29688 10.3125C8.0625 9.91406 7.74219 9.5957 7.33594 9.35742C6.92969 9.11914 6.48438 9 6 9C5.51562 9 5.07031 9.11914 4.66406 9.35742C4.25781 9.5957 3.9375 9.91016 3.70312 10.3008V10.3125C3.67188 10.375 3.62695 10.4238 3.56836 10.459C3.50977 10.4941 3.44141 10.5117 3.36328 10.5117C3.26172 10.5117 3.17383 10.4746 3.09961 10.4004C3.02539 10.3262 2.98828 10.2383 2.98828 10.1367C2.98828 10.0977 2.99414 10.0625 3.00586 10.0312C3.01758 10 3.03125 9.96875 3.04688 9.9375C3.23438 9.625 3.46094 9.34961 3.72656 9.11133C3.99219 8.87305 4.28516 8.68359 4.60547 8.54297L4.62891 8.53125C4.36328 8.32812 4.15039 8.07031 3.99023 7.75781C3.83008 7.44531 3.75 7.10938 3.75 6.75C3.75 6.125 3.96875 5.59375 4.40625 5.15625C4.84375 4.71875 5.375 4.5 6 4.5C6.625 4.5 7.15625 4.71875 7.59375 5.15625C8.03125 5.59375 8.25 6.125 8.25 6.75C8.25 7.10938 8.16992 7.44531 8.00977 7.75781C7.84961 8.07031 7.63672 8.32812 7.37109 8.53125C7.70703 8.67969 8.00781 8.87305 8.27344 9.11133C8.53906 9.34961 8.76172 9.62109 8.94141 9.92578L8.95312 9.9375ZM6 8.25C6.41406 8.25 6.76758 8.10352 7.06055 7.81055C7.35352 7.51758 7.5 7.16406 7.5 6.75C7.5 6.33594 7.35352 5.98242 7.06055 5.68945C6.76758 5.39648 6.41406 5.25 6 5.25C5.58594 5.25 5.23242 5.39648 4.93945 5.68945C4.64648 5.98242 4.5 6.33594 4.5 6.75C4.5 7.16406 4.64648 7.51758 4.93945 7.81055C5.23242 8.10352 5.58594 8.25 6 8.25ZM3.375 5.625C3.375 5.52344 3.33789 5.43555 3.26367 5.36133C3.18945 5.28711 3.10156 5.25 3 5.25C2.6875 5.25 2.42188 5.14062 2.20312 4.92188C1.98438 4.70312 1.875 4.4375 1.875 4.125C1.875 3.8125 1.98438 3.54688 2.20312 3.32812C2.42188 3.10938 2.6875 3 3 3C3.25781 3 3.48828 3.08008 3.69141 3.24023C3.89453 3.40039 4.02734 3.59766 4.08984 3.83203V3.84375C4.11328 3.92188 4.1582 3.98828 4.22461 4.04297C4.29102 4.09766 4.36719 4.125 4.45312 4.125C4.55469 4.125 4.64258 4.08789 4.7168 4.01367C4.79102 3.93945 4.82812 3.85156 4.82812 3.75C4.82812 3.73438 4.82617 3.71875 4.82227 3.70312C4.81836 3.6875 4.81641 3.67188 4.81641 3.65625C4.70703 3.25 4.48633 2.91406 4.1543 2.64844C3.82227 2.38281 3.4375 2.25 3 2.25C2.48438 2.25 2.04297 2.43359 1.67578 2.80078C1.30859 3.16797 1.125 3.60938 1.125 4.125C1.125 4.39844 1.17969 4.6543 1.28906 4.89258C1.39844 5.13086 1.54688 5.33594 1.73438 5.50781C1.47656 5.625 1.24023 5.76758 1.02539 5.93555C0.810547 6.10352 0.621094 6.29688 0.457031 6.51562L0.445312 6.52734C0.421875 6.55859 0.404297 6.59375 0.392578 6.63281C0.380859 6.67188 0.375 6.71094 0.375 6.75C0.375 6.85156 0.412109 6.93945 0.486328 7.01367C0.560547 7.08789 0.648438 7.125 0.75 7.125C0.8125 7.125 0.869141 7.11133 0.919922 7.08398C0.970703 7.05664 1.01562 7.01953 1.05469 6.97266C1.27344 6.67578 1.55273 6.43945 1.89258 6.26367C2.23242 6.08789 2.59766 6 2.98828 6C2.98828 6 2.99023 6 2.99414 6C2.99805 6 3 6 3 6C3.10156 6 3.18945 5.96289 3.26367 5.88867C3.33789 5.81445 3.375 5.72656 3.375 5.625Z" fill="#9AA3B2" />
            </svg>
        },
        { key: 'documents', label: t('Documents'), icon: <File size={15} />, }
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

    if(mobileView) {
        return  <MobileProgress 
                    percent={percent} 
                    stepsLeft={stepsLeft} 
                    doneCount={doneCount}
                    checklist={checklist}
                    getStatus={getStatus}
                />;
    }

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
                                        item.icon
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


            <button
                type="button"
                className={styles.askBtn}
                onClick={() => window.open('https://wa.me/41783192428', '_blank', 'noopener,noreferrer')}
            >
                <MessageSquare size={15} />

                <span>{t("Ask the assistant")}</span>
            </button>
        </aside>
    );
}

export default SidebarProgress
