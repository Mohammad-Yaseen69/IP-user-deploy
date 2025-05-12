export const addDecimals = (value) => {
    const splitted = value.toString().split(".")

    if (splitted.length >= 2) {
        if (splitted[1][0].length >= 2) {
            return value
        }
        else if (splitted[1][0].length === 1) {
            return `${value}0`
        }
        else {
            return `${value}00`
        }
    }
    else {
        return `${value}.00`
    }
}