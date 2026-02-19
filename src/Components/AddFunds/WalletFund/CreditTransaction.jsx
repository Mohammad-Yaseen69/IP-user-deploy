import { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';


const TrustpaymentPage = ({ transaction, type = "add_fund", url, paymentWithSavedCard = false, tokenUrl = undefined, isPartner }) => {
  const [token, setToken] = useState(null);

  const webhook_url = url ?? (paymentWithSavedCard ? `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/confirm-pan-transaction/${transaction?.transaction_id}` : `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/payment${type === "add_fund" ? "" : isPartner ? "-partner-kyc" : type === 'kyc_fee' ? "-kyc" : "-kyb"}-confirmation/${transaction?.transaction_id}`)


  useEffect(() => {
    // const createJWT = (header, payload, secret) => {
    //   const headerString = JSON.stringify(header);
    //   const payloadString = JSON.stringify(payload);

    //   const encodedHeader = CryptoJS.enc.Base64.stringify(
    //     CryptoJS.enc.Utf8.parse(headerString)
    //   )
    //     .replace(/=/g, "")
    //     .replace(/\+/g, "-")
    //     .replace(/\//g, "_");

    //   const encodedPayload = CryptoJS.enc.Base64.stringify(
    //     CryptoJS.enc.Utf8.parse(payloadString)
    //   )
    //     .replace(/=/g, "")
    //     .replace(/\+/g, "-")
    //     .replace(/\//g, "_");

    //   const tokenData = `${encodedHeader}.${encodedPayload}`;

    //   const signature = CryptoJS.HmacSHA256(tokenData, secret);

    //   const encodedSignature = CryptoJS.enc.Base64.stringify(signature)
    //     .replace(/=/g, "")
    //     .replace(/\+/g, "-")
    //     .replace(/\//g, "_");

    //   const jwtToken = `${tokenData}.${encodedSignature}`;
    //   setToken(jwtToken)
    //   return jwtToken;
    // };

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
      console.log(htmlString)
      window.document.write(htmlString)
      // navigate("/")
    }
  }, [htmlString, token])

  return (
    ""
  );
};

export default TrustpaymentPage;
