export const possibleErrors = {
    sdl400: "Daily Sending Limit exceeded",
    sml400: "Monthly Sending Limit exceeded",
    syl400: "Yearly Sending Limit exceeded",
    tal400: "Transaction Amount Limit exceeded",
    dtc400: "Daily Transaction Count Limit exceeded",
    mtc400: "Monthly Transaction Count Limit exceeded",
    ytc400: "Yearly Transaction Count Limit exceeded",
    rdl400: "Receiver's Daily Receiving Limit exceeded",
    rml400: "Receiver's Monthly Receiving Limit exceeded",
    ryl400: "Receiver's Yearly Receiving Limit exceeded",
    rbl400: "Receiver's Balance Limit Reached.",
    "Feature not available!": "Feature not available!",
    tpl400: "Topup Amount Limit exceeded"
}

export const LimitsErrorMessage = (message = "") => {
    let error;

    for (const key in possibleErrors) {
        if (message.includes(key)) {
            error = possibleErrors[key]
            break
        }
    }

    return error ?? false
}