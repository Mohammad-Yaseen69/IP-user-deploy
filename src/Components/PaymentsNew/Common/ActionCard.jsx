import { useRef } from "react"
import styles from "../styles/ActionCard.module.scss"

const ActionCard = (props) => {
    const { bg, title, icon, desc, setter, setterValue, setStep } = props
    const itemRef = useRef(null)
    return (
        <div className={styles.wrapper}>
            <div ref={itemRef} className={styles.container} onClick={() => {
                setter(setterValue)
                setStep(prev => prev + 1)
            }} onMouseOver={() => itemRef?.current.scrollIntoView({ behavior: "smooth" })}>
                <img src={bg} alt={title} className={styles.bg} />
                <div className={styles.item_dets}>
                    <img src={icon} alt={title} />
                    <h5>{title}</h5>
                    <p>{desc}</p>
                </div>
            </div>
        </div>
    )
}

export default ActionCard;