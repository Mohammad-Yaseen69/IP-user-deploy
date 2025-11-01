import { useTranslation } from "react-i18next"
import styles from './styles/index.module.scss'

const PaymentActionsButtons = ({ actionButtons, inPlans, isRow, selectedAction, setSelectedAction }) => {
    const { t } = useTranslation()

    return (
        <div className={`${styles.actions} ${isRow && styles.plans}`}>
            {actionButtons.map((btn, idx) => (
                <button 
                    className={styles.button} 
                    key={idx} 
                    onClick={() => inPlans ? setSelectedAction(btn) : btn.onClick()} 
                    style={{ 
                        background: (inPlans && selectedAction?.label === btn.label) ? "#5926F0" : !btn.purple && "white",
                        border: (inPlans && selectedAction?.label === btn.label) ? "none" : "1px solid #e5e7eb"
                    }} 
                >
                    <div style={{ background: (!btn.purple && selectedAction?.label !== btn.label) && "radial-gradient(124.63% 259.09% at 48.48% 152.15%, rgba(230, 64, 103, 0.10) 0%, rgba(89, 38, 240, 0.10) 55.65%, rgba(72, 40, 160, 0.10) 100%), #FFF" }}>
                        <img style={{ width: btn.width }} src={btn.logo} alt="" />
                    </div>

                    <span style={{ color: (inPlans && selectedAction?.label === btn.label) ? "white" : !btn.purple ? "black" : "white", fontSize: inPlans && "13px" }}>
                        {t(btn.label)}
                    </span>
                </button>
            ))}
        </div>
    )
}

export default PaymentActionsButtons
