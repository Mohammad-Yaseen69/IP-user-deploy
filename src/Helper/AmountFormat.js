const formatNumber = (num, isDecimalPart = false) => {
  if (isDecimalPart) {
    return num.replace(/[^\d-]/g, "");
  }
  return num.replace(/[^\d-]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getDecimalPointIndex = (val) => {
  if (val) {
    const decimals = val?.toString()?.split(".")?.[1];

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

export const formatCurrency = (
  inputValue,
  blur,
  setValue = undefined,
  centeredInput,
  e,
) => {
  if (inputValue === "") return "";
  if (inputValue === 0) return "0.00";
  if (!inputValue) return "";

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
    const rawNumberForDecimals = Number(inputVal.toString().replace(/,/g, ""));
    const numDecimals =
      rawNumberForDecimals >= 0.01 ? 2 : getDecimalPointIndex(inputVal);

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
      const rawNumberForDecimals = Number(
        inputVal.toString().replace(/,/g, ""),
      );
      const numDecimals =
        rawNumberForDecimals >= 0.01 ? 2 : getDecimalPointIndex(inputVal);
      inputVal += "." + "0".repeat(numDecimals);
    }
  }

  if (centeredInput) {
    const split = inputVal.split(".");
    console.log("split", split[1]);
    if (split?.[1]?.length <= 2) {
      e.target.size = Math.max(inputVal.length, 1);
    }
  }
  if (setValue) {
    setValue(inputVal);
  } else {
    return inputVal;
  }
};
