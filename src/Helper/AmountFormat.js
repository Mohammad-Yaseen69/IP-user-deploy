const formatNumber = (num) => {
    // Format number 1000000 to 1,234,567
    return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatCurrency = (inputValue, blur, setValue) => {
    // Format currency, add $ and validate decimal side
    if (inputValue === "") return "";

    // Check for decimal
    let inputVal = inputValue;
    const originalLen = inputVal.length;
    let caretPos = inputVal.length; // fallback caret position

    // inputVal = parseFloat(Number(num.replace(/,/g, '')))

    if (inputVal.indexOf(".") >= 0) {
        const decimalPos = inputVal.indexOf(".");
        let leftSide = inputVal.substring(0, decimalPos);
        let rightSide = inputVal.substring(decimalPos);

        // Format left side
        leftSide = formatNumber(leftSide);

        // Validate right side
        rightSide = formatNumber(rightSide);

        // On blur, ensure 2 decimal places
        if (blur) rightSide += "00";

        // Limit decimal to only 2 digits
        rightSide = rightSide.substring(0, 2);

        // Combine left and right sides
        inputVal = `${leftSide}.${rightSide}`;
    } else {
        // No decimal entered
        inputVal = formatNumber(inputVal);
        inputVal = `${inputVal}`;

        // Final formatting on blur
        if (blur) inputVal += ".00";
    }

    setValue(inputVal);
};