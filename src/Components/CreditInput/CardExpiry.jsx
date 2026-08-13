import { useRef, useEffect, useState } from 'react';
import styles from "./styles/card_cvc.module.css";
import { useTranslation } from 'react-i18next';

const CardExpiry = ({ content, setContent, isinVVC = false, guest }) => {
    const divRef = useRef(null);
    const { t } = useTranslation()

    // Function to sanitize input
    const sanitizeInput = (input) => {
        return input.replace(/\D/g, '');
    };

    // Set caret to the end (prevents digit reordering issues)
    const setCaretToEnd = () => {
        const selection = window.getSelection();
        const div = divRef.current;
        if (!div) return;
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    };

    // Handle input event
    const handleInput = (event) => {
        let sanitizedContent = sanitizeInput(event.target.innerText).slice(0, 4); // keep max 4 digits

        // Format the content
        const formattedContent = formatExpiry(sanitizedContent);

        // Defer content setting and caret placement slightly to allow DOM updates
        setTimeout(() => {
            setContent(formattedContent);
            event.target.innerText = formattedContent;
            setCaretToEnd();
        }, 0);
    };


    // Format the expiry in MM/YY format
    const formatExpiry = (input) => {
        if (input.length === 0) return '';

        let month = input.slice(0, 2);
        let year = input.slice(2);

        // Ensure month is within range
        // month = Math.min(parseInt(month), 12).toString();

        // Ensure year doesn't have more than 4 digits
        year = year.slice(0, 2);

        if (input.length < 3) {
            return month
        }
        return `${month} / ${year}`;
    };

    useEffect(() => {
        const div = divRef.current;
        if (div) {
            div.addEventListener('input', handleInput);
            return () => {
                div.removeEventListener('input', handleInput);
            };
        }
    }, []);

    const [error, setError] = useState("")

    // useEffect(() => {
    //     const isValidExpiry = new Date(new Date("01-" + content?.split(" / ")?.join("-")))?.getFullYear() > new Date()?.getFullYear();
    //     setError(isValidExpiry ? "" : "Invalid Date")
    // }, [content])
    useEffect(() => {
        const [contentMonth, contentYear] = content.split("/").map(Number);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear() % 100;

        const isValidExpiry = contentYear > currentYear ||
            (contentYear === currentYear && contentMonth > currentMonth);
        setError(isValidExpiry && contentMonth <= 12 ? "" : "Invalid Date");
    }, [content]);
    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
            {guest && <label htmlFor="" style={{ fontWeight: 600 }}>{t("Expiry Date")}:</label>}
            <div className={styles.main}>
                <div
                    ref={divRef}
                    className={styles.input_container}
                    contentEditable="true"
                    style={{ padding: isinVVC && "8px 14px", borderRadius: isinVVC && "6px" }}
                    role="textbox"
                    aria-label="Secure Input Field"
                    suppressContentEditableWarning={true}
                >
                    {content}
                </div>
                {
                    content.length < 1 &&
                    <span style={{ display: isinVVC && "none" }} className={styles.placeholder}>{t("MM / YY")}</span>
                }
                {
                    error && content.length > 3
                    &&
                    <div className={styles.error}>
                        {t(error)}
                    </div>
                }
            </div>
        </div>
    );
};

export default CardExpiry;
