import { useRef } from "react"
import styles from "../styles/ActionCard.module.scss"
import { useTranslation } from "react-i18next"

const ActionCard = (props) => {
    const { bg, title, icon, desc, setter, setterValue, setStep, disabled = false } = props
    const {language} = useTranslation().i18n
    const itemRef = useRef(null)


    console.log(language)
    return (
        <div className={styles.wrapper} style={{ pointerEvents: disabled ? "none" : "all" }}>
            <div ref={itemRef} className={styles.container} onClick={() => {
                setter(setterValue)
                setStep(prev => prev + 1)
            }} onMouseOver={() => itemRef?.current.scrollIntoView({ behavior: "smooth" })}>
                <img src={bg} alt={title} className={styles.bg} />
                <div className={styles.item_dets}>
                    <div>
                        <img src={icon} alt={title} />
                        <h5 style={{ height: "48px", fontSize: (language === "de" || language === "fr" || language === "pt" || language === "ru" || language === "es" || language === "uk" || language === "tr") && "20px" }}>{title}       </h5>
                    </div>
                    <p>{desc}</p>
                </div>
            </div>
        </div>
    )
}

export default ActionCard;