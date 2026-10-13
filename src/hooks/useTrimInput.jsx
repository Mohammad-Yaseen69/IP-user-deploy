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

export const handleNameInput = (value) => {
  let sanitized = value.replace(/[^A-Za-z\s]/g, "");
  sanitized = sanitized.replace(/^\s+/, "");
  sanitized = sanitized.replace(/\s{2,}/g, " ");
  return sanitized;
};

export const handleEmailInput = (value) => {
  return value.replace(/\s/g, "");
};
export const preventEmailSpaces = (e) => {
  if (e.key === " " || e.code === "Space") {
    e.preventDefault();
  }
};
