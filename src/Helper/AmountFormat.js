const formatNumber = (num, isDecimalPart = false) => {
    // Don't add commas if it's the decimal part
    if (isDecimalPart) {
        return num.replace(/\D/g, "");
    }
    // Format number 1000000 to 1,234,567
    return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getDecimalPointIndex = (val) => {
    if (val) {
        const [_, decimals] = val?.toString()?.split(".");

        if (decimals) {
            for (let idx = 0; idx < decimals.length; idx++) {
                if (decimals[idx] !== "0") {
                    return idx + 1;
                }
            }
        }
    }
    return 2; 
};

export const formatCurrency = (inputValue, blur, setValue) => {
    if (inputValue === "") return "";

    let inputVal = inputValue.toString();

    if (inputVal.indexOf(".") >= 0) {
        const decimalPos = inputVal.indexOf(".");
        let leftSide = inputVal.substring(0, decimalPos);
        let rightSide = inputVal.substring(decimalPos);

        // Format left side
        leftSide = formatNumber(leftSide);

        // Validate right side
        rightSide = formatNumber(rightSide.replace(".", ""), true);

        // Get number of decimal places based on value
        const numDecimals = Number(inputVal) >= 0.01 ? 2 : getDecimalPointIndex(inputVal);

        // On blur, ensure proper decimal places
        if (blur) rightSide += "0".repeat(numDecimals);

        // Limit decimal to calculated number of digits
        rightSide = rightSide.substring(0, numDecimals);

        // Combine left and right sides
        inputVal = `${leftSide}.${rightSide}`;
    } else {
        // No decimal entered
        inputVal = formatNumber(inputVal);

        // Final formatting on blur
        if (blur) {
            const numDecimals = Number(inputVal) >= 0.01 ? 2 : getDecimalPointIndex(inputVal);
            inputVal += "." + "0".repeat(numDecimals);
        }
    }

    setValue(inputVal);
};