import useWindowWidth from "../../../utils/useWindowWidth"
import styles from "../WithdrawBalanceModal/withdrawBalance.module.scss"
import { useTranslation } from "react-i18next"

const SidebarProgress = ({
    isActive,
    isCompleted,
    stepLabel,
    label,
    Icon,
    showBar,
}) => {
    const { t } = useTranslation()
    const width = useWindowWidth()
    return (
        <>
            <div className={styles.progress}>
                <div
                    style={{
                        border: isActive ? "2.5px solid #C8B7FA" : "",
                        backgroundColor: isActive
                            ? "#5926F0"
                            : isCompleted
                                ? "#1FC16B"
                                : "#D2D2D2",
                    }}
                    className={styles.circle}
                >
                    {isCompleted ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="19"
                            height="19"
                            viewBox="0 0 19 19"
                            fill="none"
                        >
                            <path
                                d="M15.6865 5L7.43652 13.25L3.68652 9.5"
                                stroke="white"
                                strokeWidth="1.46484"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        typeof Icon === "string" ? (
                            <img src={Icon} alt="" />
                        ) : Icon ? (
                            <Icon size={18} style={{ color: "white" }} />
                        ) : null
                    )}
                </div>
                {
                    width > 700 &&
                    <div className={styles.textCont}>
                        <span>{t(stepLabel)}</span>
                        <p>{t(label)}</p>
                    </div>
                }
            </div>
            {showBar && (
                <div className={styles.bar}>
                    <span></span>
                </div>
            )}
        </>
    )
}

export default SidebarProgress
