import React, { useState, useRef, useEffect } from 'react';
import styles from "./styles/card_number.module.css";
import { creditCardImages } from './CreditCardImages';
import { useTranslation } from 'react-i18next';



const CardNumberInput = ({ content, setContent, cardType, cardError }) => {
    const divRef = useRef(null);
    const caretPositionRef = useRef(0);
    const {t} = useTranslation()

    const sanitizeInput = (input) => {
        return input.replace(/\D/g, '');
    };

    const formatInput = (input) => {
        return input.slice(0, cardType?.maxCardNumberLength).replace(/(.{4})/g, '$1 ').trim();
    };

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

    const restoreCaretPosition = () => {
        const selection = window.getSelection();
        const div = divRef.current;
        let charIndex = caretPositionRef.current;
        let node, offset = 0;

        const findNodeAndOffset = (root, index) => {
            for (node of root.childNodes) {
                if (node.nodeType === 3) { // Text node
                    const cleanTextLength = node.textContent.replace(/\D/g, '').length;
                    if (cleanTextLength >= index) {
                        const chars = node.textContent.split('');
                        for (let i = 0; i < chars.length; i++) {
                            if (/\d/.test(chars[i])) {
                                if (--index === 0) {
                                    offset = i + 1;
                                    return node;
                                }
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

    const handleInput = (event) => {
        saveCaretPosition();
        let sanitizedContent = sanitizeInput(event.target.innerText);
        let formattedContent = formatInput(sanitizedContent);
        setContent(formattedContent);
        event.target.innerText = formattedContent;

        requestAnimationFrame(restoreCaretPosition);
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

    return (
        <div className={styles.main}>
            <img src={creditCardImages?.[cardType?.type]} alt="" className={styles.card_img} />
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
                content.length < 1
                &&
                <span className={styles.placeholder}>{t("Card Number")}</span>
            }
            {
                cardError && content.length > 3
                &&
                <div className={styles.error}>
                    {cardError}
                </div>
            }
        </div>
    );
};

export default CardNumberInput;