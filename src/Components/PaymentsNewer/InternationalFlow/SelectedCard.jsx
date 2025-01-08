import { useTranslation } from "react-i18next"
import styles from "./styles/selectedcard.module.css"

const SelectedCard = ({ title = "", list = [], changeHandler }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.card}>
            <div className={styles.top}>
                <span>{t(title)}</span>
                <button onClick={changeHandler}>{t("change")}</button>
            </div>
            <div className={styles.list}>
                {
                    list.map((item, index) => (
                        <div key={index} className={styles.item}>
                            {
                                item?.url
                                &&
                                (
                                    item?.flag
                                        ?
                                        <img src={item?.url} alt="" />
                                        :
                                        <div className={styles.grad_icon}>
                                            <img src={item?.url} alt="" />
                                        </div>
                                )
                            }
                            <span>{item?.text}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default SelectedCard