import { useContext, useEffect, useMemo, useState } from 'react';
import CryptoJS from 'crypto-js';
import { UserContext } from '../../../Context/UserContext';
import countriesIso from "./countries_iso2.json"

const TrustpaymentPage = ({ amount, currency, card_number, card_expiry, card_cvc, transaction, type = "add_fund", url, paymentWithSavedCard = false, tokenUrl = undefined, guestUserName, guestWallet, guestUser, guestDetails, compareToken = true }) => {
  const [token, setToken] = useState(null);
  const { userDetails, userWallets } = useContext(UserContext)
  const wallet = useMemo(() => userWallets?.[0], [userWallets])

  const webhook_url = url ?? (paymentWithSavedCard ? `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/confirm-pan-transaction/${transaction?.transaction_id}` : `${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/payment${type === "add_fund" ? "" : "-kyc"}-confirmation/${transaction?.transaction_id}`)

  let iat = Math.floor(Date.now() / 1000);
  useEffect(() => {
    const createJWT = (header, payload, secret) => {
      const headerString = JSON.stringify(header);
      const payloadString = JSON.stringify(payload);

      const encodedHeader = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(headerString)
      )
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const encodedPayload = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(payloadString)
      )
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const tokenData = `${encodedHeader}.${encodedPayload}`;

      const signature = CryptoJS.HmacSHA256(tokenData, secret);

      const encodedSignature = CryptoJS.enc.Base64.stringify(signature)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const jwtToken = `${tokenData}.${encodedSignature}`;
      setToken(jwtToken)
      return jwtToken;
    };

    // const payload = {
    //   "payload": {
    //     "accounttypedescription": "ECOM",
    //     "baseamount": `${amount * 100}`,
    //     "currencyiso3a": `${type === "add_fund" ? currency : "USD"}`,
    //     "sitereference": `${process.env.REACT_APP_SITE_REF}`,
    //     "requesttypedescriptions": ["THREEDQUERY", "AUTH"],
    //     "pan": `${card_number?.replaceAll(" ", "")}`,
    //     "expirydate": `${card_expiry?.replaceAll(" ", "")}`,
    //     "securitycode": `${card_cvc}`,
    //     "orderreference": `${guestUserName ?? userDetails?.username}_${type === "add_fund" ? (guestWallet?.wallet_id ?? wallet?.wallet_id) : "kyc"}_${transaction?.transaction_ref}`,
    //     "billingfirstname": guestUser?.first_name ?? userDetails?.first_name,
    //     "billinglastname": guestUser?.last_name ?? userDetails?.last_name,
    //     "billingstreet": guestUser?.address ?? userDetails?.address,
    //     "billingtown": guestUser?.city ?? userDetails?.city,
    //     "billingcounty": guestUser?.country_name ?? userDetails?.country_name,
    //     "billingpostcode": guestUser?.postal_code ?? userDetails?.postal_code,
    //     "billingcountryiso2a": `${countriesIso[guestUser?.country_iso_code ?? userDetails?.country_iso_code] || "CH"}` || "",
    //     "billingemail": guestUser?.email ?? userDetails?.email,
    //     "billingtelephone": guestUser?.phone ?? userDetails?.phone,
    //     "billingtelephonetype": "M",
    //     "customerfirstname": guestUserName ?? userDetails?.username,
    //     "customermiddlename": guestWallet?.wallet_id ?? wallet?.wallet_id,
    //     "customerlastname": transaction?.transaction_ref,
    //     // "customerstreet": guestUser?.address ?? userDetails?.address,
    //     // "customertown": guestUser?.city ?? userDetails?.city,
    //     "customercountryiso2a": `${countriesIso[guestUser?.country_iso_code ?? userDetails?.country_iso_code] || "CH"}` || "",
    //     // "customerpostcode": guestUser?.postal_code ?? userDetails?.postal_code,
    //     "customeremail": guestDetails?.email ?? "",
    //     "customertelephone": guestDetails?.phone ?? "",
    //     // "customertelephonetype": "M",,
    //     "customerpremise": guestDetails?.name ?? ""
    //   },
    //   "iat": iat,
    //   "iss": `${process.env.REACT_APP_ISS}`
    // };
    // console.log("payload = ", payload.payload)
    // console.log("payload = ", payload)
    // const secretKey = `${process.env.REACT_APP_SEC_KEY}`;
    // const header = { alg: "HS256", typ: "JWT" };

    // if (transaction?.token && compareToken) {
    //   setToken(transaction?.token)
    // } else {
    //   createJWT(header, payload, secretKey);
    // }
    setToken(transaction?.trustPaymentToken ?? transaction?.token)
  }, [])

  console.log(token)
  const htmlString = `
    <html>
      <head>
      </head>
      <body>
        <div id="st-notification-frame"></div>
        <h2>Fetching resources... <br> Please be patient.</h2>
        <form style="opacity: 0;" id="stform" action="${tokenUrl ? tokenUrl(token) : webhook_url}" method="POST">
          <div id="st-card-number" class="st-card-number"></div>
          <div id="st-expiration-date" class="st-expiration-date"></div>
          <div id="st-security-code" class="st-security-code"></div>
          <button type="submit" id="st-form_submit" class="st-form_submit">
            Pay securely
          </button>
        </form>

        <script src="https://cdn.eu.trustpayments.com/js/latest/st.js"></script>
        <script>
          (function() {
            var st = SecureTrading({ 
              jwt: "${token}",
              formId: "stform",
              submitOnError: true
            }); 
            st.Components({startOnLoad: true}); 
          })(); 
        </script>
      </body>
    </html>
  `;
  // console.log(htmlString)

  console.log(tokenUrl ? tokenUrl(token) : webhook_url)
  useEffect(() => {
    if (token && htmlString) {
      // const newTab = window.open()
      window.document.write(htmlString)
      // navigate("/")
    }
  }, [htmlString, token])

  return (
    ""
  );
};

export default TrustpaymentPage;
