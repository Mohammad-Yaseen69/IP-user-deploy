import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CardCVC from "./CardCvc";
import CardExpiry from "./CardExpiry";
import CardHolderName from "./CardHolderName";
import CardNumberInput from "./CardNumberInput";
import { CARD_TYPES } from "./CreditCardTypes";

export const PLACEHOLDER_CARD_TYPE = {
  type: "placeholder",
  format: "",
  startPattern: "",
  maxCardNumberLength: 16,
  cvcLength: 3,
};

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
  setCardNumberError = () => {},
  guest,
}) => {
  const [cardType, setCardType] = useState(PLACEHOLDER_CARD_TYPE);
  const { t } = useTranslation();
  useEffect(() => {
    const getCardTypeByValue = function getCardTypeByValue(value) {
      return CARD_TYPES.filter(function (cardType) {
        return cardType.startPattern.test(value);
      })[0];
    };
    const type = getCardTypeByValue(cardNumber);
    if (!type || cardNumber.length < type?.maxCardNumberLength) {
      setCardNumberError(t("Invalid Card Number"));
    } else {
      setCardNumberError("");
    }
    setCardType(type ?? PLACEHOLDER_CARD_TYPE);
  }, [cardNumber]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: ".6rem",
      }}
    >
      <CardHolderName content={cardHolderName} setContent={setCardHolderName} guest={guest} />
      <CardNumberInput
        content={cardNumber}
        setContent={setCardNumber}
        cardType={cardType}
        cardError={cardNumberError}
        guest={guest}
      />
      <div style={{ display: "flex", gap: ".6rem" }}>
        <CardCVC content={cardCvc} setContent={setCardCvc} maxLength={4} guest={guest} />
        <CardExpiry content={cardExpiry} guest={guest} setContent={setCardExpiry} />
      </div>
    </div>
  );
};

export default CreditCardInput;
