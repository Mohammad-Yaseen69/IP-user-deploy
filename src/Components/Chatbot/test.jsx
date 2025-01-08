import React from "react";

const IframeComponent = () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIiwiYmFzZWFtb3VudCI6IjE1MCIsImN1cnJlbmN5aXNvM2EiOiJVU0QiLCJzaXRlcmVmZXJlbmNlIjoidGVzdF9rZW1pdGtpbmdkb203OTEwOSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIlRIUkVFRFFVRVJZIiwiQVVUSCJdLCJwYW4iOiI0MDAwMDAwMDAwMDAxMDkxIiwiZXhwaXJ5ZGF0ZSI6IjEyLzIwMjUiLCJzZWN1cml0eWNvZGUiOiIxMjMifSwiaWF0IjoxNzEwODYxNjk3LCJpc3MiOiJqd3RAa2VtaXRraW5nZG9tIn0.Q8l30f17Jvd7rG8n-QJJwOmZM2W_2tGv6BcbQWBnwlk";
  const htmlString = `
    <html>
      <head>
      </head>
      <body>
        <div id="st-notification-frame"></div>
        <form style="display:none;" id="stform" action="https://webhook.site/8e3f413f-1e33-4a31-acf2-d10a19e04556" method="POST">
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

  return (
    <iframe
      title="testng"
      srcDoc={htmlString}
      style={{ width: "100%", height: "500px", borderWidth: "6px black" }}
    ></iframe>
  );
};

export default IframeComponent;
