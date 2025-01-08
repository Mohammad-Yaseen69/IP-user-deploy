export const shuffle = (str) => {
    if (str.length === 0) {
        throw new Error('Wrong parameter count for str_shuffle()')
    }
    if (str === null) {
        return ''
    }
    str += ''
    let newStr = ''
    let rand
    let i = str.length
    while (i) {
        rand = Math.floor(Math.random() * i)
        newStr += str.charAt(rand)
        str = str.substring(0, rand) + str.substr(rand + 1)
        i--
    }
    return newStr
}