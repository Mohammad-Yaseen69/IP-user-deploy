import React, { useEffect, useState } from 'react'
import CardNumberInput from './CardNumberInput'
import CardCVC from './CardCvc';
import { CARD_TYPES } from './CreditCardTypes';
import CardExpiry from './CardExpiry';
import CardHolderName from './CardHolderName';

export const PLACEHOLDER_CARD_TYPE = {
    type: 'placeholder',
    format: "",
    startPattern: "",
    maxCardNumberLength: 16,
    cvcLength: 3
}

const CreditCardInput = ({
    cardHolderName = "",
    setCardHolderName,
    cardNumber = "",
    setCardNumber,
    cardCvc = "",
    setCardCvc,
    cardExpiry = "",
    setCardExpiry,
    cardNumberError = "",
    setCardNumberError = () => { }
}) => {
    // card type
    const [cardType, setCardType] = useState(PLACEHOLDER_CARD_TYPE);

    useEffect(() => {
        const getCardTypeByValue = function getCardTypeByValue(value) {
            return CARD_TYPES.filter(function (cardType) {
                return cardType.startPattern.test(value);
            })[0];
        };
        const type = getCardTypeByValue(cardNumber)
        if (!type || cardNumber.length < type?.maxCardNumberLength) {
            setCardNumberError("Invalid Card Number")
        } else {
            setCardNumberError("")
        }
        setCardType(type ?? PLACEHOLDER_CARD_TYPE)
    }, [cardNumber])

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: ".6rem"
        }}>
            <CardHolderName
                content={cardHolderName}
                setContent={setCardHolderName}
            />
            <CardNumberInput
                content={cardNumber}
                setContent={setCardNumber}
                cardType={cardType}
                cardError={cardNumberError}
            />
            <div style={{ display: "flex", gap: ".6rem" }}>
                <CardCVC
                    content={cardCvc}
                    setContent={setCardCvc}
                    maxLength={cardType?.cvcLength}
                />
                <CardExpiry
                    content={cardExpiry}
                    setContent={setCardExpiry}
                />
            </div>
        </div>
    )
}

export default CreditCardInput