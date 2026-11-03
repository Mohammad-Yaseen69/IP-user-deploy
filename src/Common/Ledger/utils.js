export const capitalizeStatus = (str = "") =>
  str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const initials = (name = "") =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const DOT_COLORS = {
  initiated: "#5926f0",
  processing: "#5926f0",
  available: "#5926f0",
  completed: "#12b76a",
  success: "#12b76a",
  confirmed: "#12b76a",
  pending: "#ca9a04",
  submitted: "#ca9a04",
  abandoned: "#ca9a04",
  reversed: "#ca9a04",
  refunded: "#9f83f2",
  reverted: "#9f83f2",
  rejected: "#dc3545",
  cancelled: "#dc3545",
  declined: "#dc3545",
  failed: "#dc3545",
};

export const statusDot = (status) => DOT_COLORS[status?.toLowerCase()] ?? "#9aa3b2";

export const isVoid = (status) =>
  ["failed", "cancelled", "declined", "rejected"].includes(status?.toLowerCase());

export const partyName = ({ user, company, company_name } = {}) =>
  [user?.first_name || company?.company_name || company_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
