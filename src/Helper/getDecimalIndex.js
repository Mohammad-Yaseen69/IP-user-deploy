export const getDecimalPointIndex = (val) => {
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
}