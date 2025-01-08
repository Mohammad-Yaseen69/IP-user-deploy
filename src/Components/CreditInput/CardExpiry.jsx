import React, { useRef, useEffect, useState } from 'react';
import styles from "./styles/card_cvc.module.css";

const CardExpiry = ({ content, setContent }) => {
    const divRef = useRef(null);
    const caretPositionRef = useRef(0);

    // Function to save caret position
    const saveCaretPosition = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(divRef.current);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretPositionRef.current = preCaretRange.toString().replace(/\D/g, '').length;
        }
    };

    // Function to restore caret position
    const restoreCaretPosition = () => {
        const selection = window.getSelection();
        const div = divRef.current;
        let charIndex = caretPositionRef.current;
        let node, offset = 0;

        const findNodeAndOffset = (root, index) => {
            for (node of root.childNodes) {
                if (node.nodeType === 3) { // Text node
                    const cleanText = node.textContent.replace(/\D/g, '');
                    const cleanTextLength = cleanText.length;
                    if (cleanTextLength >= index) {
                        let charCount = 0;
                        for (let i = 0; i < node.textContent.length; i++) {
                            if (/\d/.test(node.textContent[i])) {
                                charCount++;
                            }
                            if (charCount === index) {
                                offset = i + 1;
                                return node;
                            }
                        }
                    } else {
                        index -= cleanTextLength;
                    }
                } else {
                    node = findNodeAndOffset(node, index);
                    if (node) return node;
                }
            }
            return null;
        };

        node = findNodeAndOffset(div, charIndex);
        if (node) {
            const range = document.createRange();
            range.setStart(node, offset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    // Function to sanitize input
    const sanitizeInput = (input) => {
        return input.replace(/\D/g, '');
    };

    // Handle input event
    const handleInput = (event) => {
        saveCaretPosition(); // Save the caret position before modifying the content.
        let sanitizedContent = sanitizeInput(event.target.innerText);

        // Format the content
        const formattedContent = formatExpiry(sanitizedContent);

        // Defer content setting and caret restoration slightly to allow DOM updates
        setTimeout(() => {
            setContent(formattedContent);
            event.target.innerText = formattedContent;
            restoreCaretPosition();
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
        <div className={styles.main}>
            <div
                ref={divRef}
                className={styles.input_container}
                contentEditable="true"
                role="textbox"
                aria-label="Secure Input Field"
                suppressContentEditableWarning={true}
            >
                {content}
            </div>
            {
                content.length < 1 &&
                <span className={styles.placeholder}>MM / YY</span>
            }
            {
                error && content.length > 3
                &&
                <div className={styles.error}>
                    {error}
                </div>
            }
        </div>
    );
};

export default CardExpiry;
