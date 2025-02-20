import { useTranslation } from "react-i18next";
import styles from "./styles/card_cvc.module.css"

const CardHolderName = ({ content, setContent }) => {
    const handleChange = (e) => {
        // Remove non-alphabetic characters and spaces from the input value
        const filteredValue = e.target.value.replace(/[^A-Za-z\s]/g, '');
        setContent(filteredValue);
    };

    const {t} = useTranslation()
    return (
        <div className={styles.main}>
            <input
                className={styles.input_container}
                value={content}
                onChange={handleChange}
            />
            {
                content.length < 1 &&
                <span className={styles.placeholder}>{t("Card Holder Name")}</span>
            }
        </div>
    );
};

export default CardHolderName;