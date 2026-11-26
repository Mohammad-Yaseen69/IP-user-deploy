// guest pay
export const isEmailValid = (email) =>
  !email || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

export const WEBSITE_REGEX =
  /^(https?:\/\/)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(:\d{1,5})?([/?#]\S*)?$/i;

export const isWebsiteValid = (website) => WEBSITE_REGEX.test(String(website ?? "").trim());

export const isShippingValid = (shipping) =>
  shipping.country &&
  shipping.city &&
  shipping.houseNo &&
  shipping.state &&
  shipping.street &&
  shipping.zipCode;

export const isPersonalInfoValid = (data, isReferenceRequired) =>
  data.fullName?.length >= 3 &&
  data.phone?.length >= 9 &&
  data.dob &&
  isEmailValid(data.email) &&
  (!isReferenceRequired || data.paymentRef);

export const isCardValid = (data) => {
  if (data.selectedSavedCard?._id) return true;

  if (!data.cardNumber || !data.expiry || !data.cvc || !data.cardHolderName) {
    return false;
  }

  if (data.cvc.length < 3) return false;

  const [month, year] = data.expiry.split("/").map(Number);
  const now = new Date();

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;

  return year > currentYear || (year === currentYear && month > currentMonth);
};

export const getMaxDate = (min = 18) => {
  const currentDate = new Date();
  return new Date(currentDate.getFullYear() - min, currentDate.getMonth(), currentDate.getDate());
};
