export const cleanString = (str) => {
    return typeof str === "string" ? str.replaceAll(",", "") : str
}