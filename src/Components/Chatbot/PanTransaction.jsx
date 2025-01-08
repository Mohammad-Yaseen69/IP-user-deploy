import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import pending from "../AuthNew/files/signup_anim.gif"

const PanTransaction = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get("token")
  const transaction_id = queryParams.get("transaction_id")
  const w2w_token = queryParams.get("w2w_token")
  const intl_token = queryParams.get("intl_token")
  const slug = queryParams.get("slug")
  // const reference_id = queryParams.get("reference_id")


  const [isLoading, setIsLoading] = useState(true)

  const htmlString = `
    <html>
      <head>
      </head>
      <body>
        <div id="st-notification-frame"></div>
         <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center",position:"fixed", top: 0, left:0,zIndex:100 }}>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
                height: "90%",
                width: "90%",
                maxWidth: "450px"
            }}>
                        <img src={${pending}} alt="" style={{ width: "100%", objectFit: "cover", aspectRatio: "1" }} />
            </div>
            <h5>Loading...</h5>
        </div>
        <form style="opacity: 0;" id="stform" action="${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/${slug}/${transaction_id}${slug !== "confirm-chatbot-pan-topup" ? `/${w2w_token ?? intl_token}` : ""}" method="POST">
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

  useEffect(() => {
    if (token && htmlString) {
      window.document.write(htmlString)
    }
  }, [htmlString, token])
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        height: "90%",
        width: "90%",
        maxWidth: "450px"
      }}>
        {
          isLoading
            ?
            <img src={pending} alt="" style={{ width: "100%", objectFit: "cover", aspectRatio: "1" }} />
            :
            <></>
        }
      </div>
    </div>
  )
}

export default PanTransaction