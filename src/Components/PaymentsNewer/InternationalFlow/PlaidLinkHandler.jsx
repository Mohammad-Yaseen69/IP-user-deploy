import usePlaidLinkPayment from "../../../hooks/Payments/usePlaidLinkPayment";

const PlaidLinkHandler = ({ link, data, onProcessing, onAuthorized, onCancelled }) => {
  usePlaidLinkPayment({
    linkToken: link.linkToken,
    transactionId: link.transactionId,
    data,
    recipientData: { iban: data.recipient_iban, saveForFutureUse: true },
    type: "international",
    autoOpen: true,
    onProcessing,
    onAuthorized,
    onCancelled,
  });

  return null;
};

export default PlaidLinkHandler;
