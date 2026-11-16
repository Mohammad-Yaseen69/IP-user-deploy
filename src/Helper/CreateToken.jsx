import CryptoJS from "./cryptoJs";

export const createJwtToken = (payload) => {
  const headerString = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payloadString = JSON.stringify(payload);

  const encodedHeader = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(headerString))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const encodedPayload = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(payloadString))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const signature = CryptoJS.HmacSHA256(
    tokenData,
    "j9KxV3q4BtpZ8mN6oR2fE1jYlFqH5sWk7TjV0gO4XcP8bD6qN1mZ3hYvLrQ2wE9fU7sJkO8tP4hG5yWqX2bF6jV1pT8eZ4nL9oC3x",
  );

  const encodedSignature = CryptoJS.enc.Base64.stringify(signature)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwtToken = `${tokenData}.${encodedSignature}`;

  return jwtToken;
};

export const createShambeToken = (data) => {
  const reversed = `${data?.cardNumber?.replaceAll(" ", "")}:${data?.cvc || data?.cardCVC}:${(
    data?.expiry || data?.cardExpiry
  )
    ?.split("/")
    ?.map((item) => item?.trim())
    ?.join(":")}`
    ?.split(":")
    ?.reverse()
    ?.join(":");
  const gurhaku = { gurhaku: reversed };
  const shambeToken = createJwtToken(gurhaku);
  return shambeToken;
};
