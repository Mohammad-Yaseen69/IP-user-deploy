export const NumberInputValidator = (event) => {
  const charCode = event.charCode;
  if (!/\d/.test(String.fromCharCode(charCode))) {
    event.preventDefault();
  }
};
