import { useTranslation } from "react-i18next";
import styles from "./styles/card_cvc.module.css"

const CardHolderName = ({ content, setContent, isinVVC = false, guest }) => {
    const handleChange = (e) => {
        // Remove non-alphabetic characters and spaces from the input value
        const filteredValue = e.target.value.replace(/[^A-Za-z\s]/g, '');
        setContent(filteredValue);
    };

    const { t } = useTranslation()
    return (
        <div className={styles.main}>
            {guest && <label htmlFor="" style={{ fontWeight: 600 }}>{t("Card Holder Name")}:</label>}
            <input
                className={styles.input_container}
                style={{ padding: isinVVC && "8px 14px", borderRadius: isinVVC && "6px" }}
                value={content}
                onChange={handleChange}
            />
            {
                content.length < 1 &&
                <span style={{ display: isinVVC && "none", top: guest && "45px" }} className={styles.placeholder}>{t("Card Holder Name")}</span>
            }
            {(content.length < 1 && guest) && <svg className={styles.icon} style={{top: '42px'}}  xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <path d="M20 21.689C20 20.2934 20 19.5956 19.8278 19.0278C19.44 17.7494 18.4395 16.749 17.1611 16.3612C16.5933 16.189 15.8956 16.189 14.5 16.189H9.5C8.10444 16.189 7.40665 16.189 6.83886 16.3612C5.56045 16.749 4.56004 17.7494 4.17224 19.0278C4 19.5956 4 20.2934 4 21.689M16.5 8.18896C16.5 10.6742 14.4853 12.689 12 12.689C9.51472 12.689 7.5 10.6742 7.5 8.18896C7.5 5.70368 9.51472 3.68896 12 3.68896C14.4853 3.68896 16.5 5.70368 16.5 8.18896Z" stroke="#AAAAAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>}
        </div>
    );
};

export default CardHolderName;