export const preventEdgeSpaces = (e) => {
    if (e.key === " " && e.currentTarget.selectionStart === 0) {
        e.preventDefault();
    }

    if (
        e.key === " " &&
        e.currentTarget.selectionStart === e.currentTarget.value.length &&
        e.currentTarget.value.endsWith(" ")
    ) {
        e.preventDefault();
    }
};