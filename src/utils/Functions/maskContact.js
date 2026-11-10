// "m.shaheen.alan@gmail.com" -> "m.sh•••@gmail.com"
export const maskEmail = (email = "") => {
  const [local = "", domain] = String(email).split("@");
  if (!domain) return email;
  const visible = local.length > 4 ? local.slice(0, 4) : local.slice(0, 1);
  return `${visible}•••@${domain}`;
};

// "201024837719" -> "+20 ••• ••• 7719"
export const maskPhone = (phone = "", dialCode = "") => {
  const lastFour = String(phone).replace(/\D/g, "").slice(-4);
  const dial = dialCode ? (String(dialCode).startsWith("+") ? dialCode : `+${dialCode}`) : "";
  return `${dial ? `${dial} ` : ""}••• ••• ${lastFour}`;
};
