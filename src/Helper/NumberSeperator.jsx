export const NumberSeperator = (value, setter) => {
  const formattedValue = value
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  setter(formattedValue);
};
