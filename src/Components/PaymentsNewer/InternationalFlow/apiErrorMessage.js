const apiErrors = {
  internal_server_error:
    "We are unable to process your request at the moment please try again later.",
  invalid_token:
    "You took too long to initiate the payment and for security reasons we have terminated the process. Please start again",
  token_expired:
    "You took too long to initiate the payment and for security reasons we have terminated the process. Please start again",
  invalid_card_details: "The card details you entered don't match your selected country.",
  incorrect_card: "This card does not belong to your account. Please use a valid card.",
  transaction_failed:
    "The transaction couldn't be completed. Please try again or use a different method.",
  feature_not_allowed:
    "This feature is currently disabled for your account. Contact support for assistance.",
  currency_not_supported:
    "Card top-up isn't available for this wallet's currency. Please use a different payment method.",
  amount_too_large:
    "This amount is too large for card payment. Please enter a smaller amount or use a different method.",
  beneficiary_details_missing:
    "It appears that some required beneficiary details are either missing or incorrect. Please review and update the beneficiary information, ensuring all fields are properly filled, and try again.",
  insufficient_funds: "You don't have enough funds for this transaction.",
  invoice_not_found_or_inactive:
    "The invoice you're trying to pay is either inactive or the invoice id is not correct!",
  invoice_not_found:
    "The invoice you're trying to pay is either inactive or the invoice id is not correct!",
  invoice_already_paid: "This invoice is already paid!",
  receiver_wallet_not_found: "Recipient wallet is either disabled, blocked or does not exists.",
  shipping_details_required:
    "Please fill all the required shipping details before proceeding with the transaction.",
  "Onafriq API failed":
    "Mobile wallet payment method is currently not available for your account. please select a different method.",
};

export const apiErrorMessage = (code) => {
  let error;
  // console.log(code, "lololo")
  for (const key in apiErrors) {
    if (code?.includes(key)) {
      error = apiErrors[key];
      break;
    }
  }

  return error ?? false;
};
