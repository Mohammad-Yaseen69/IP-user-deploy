import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import styled from "@emotion/styled";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import RedirectButton from "../../CommonElements/RedirectButton";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

// Styled components for custom styling
const CustomDatePickerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 97vh;
`;

const CustomDatePickerWrapper = styled.div`
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 80%;
`;

const CustomLabel = styled.label`
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
`;

const CustomDatePicker = styled(MobileDatePicker)`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const CustomSubmitButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: ${(props) =>
    !props.isValid
      ? "rgb(138, 160, 211)"
      : "linear-gradient(310deg, rgba(240, 11, 240, 0.8) 16%, rgba(3, 51, 164, 0.8) 97%)"}; /* Gradient color if valid, else default gradient color */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: ${(props) =>
    !props.isValid
      ? "pointer"
      : "not-allowed"}; /* Set cursor to pointer or not-allowed based on isValid */
  font-size: 16px;

  &:hover {
    background: ${(props) =>
      !props.isValid
        ? "rgb(138, 160, 211)"
        : "linear-gradient(310deg, rgba(192, 6, 192, 0.8) 16%, rgba(4, 51, 160, 0.8) 97%)"}; /* Gradient color on hover if valid, else default gradient color */
  }
`;

const LogoImage = styled.img`
  width: 240px;
  height: 140px;
  margin-bottom: 20px;
`;
const SuccessImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
`;

export default function SubscriptionRequestEndDate() {
  const tomorrow = dayjs().add(1, "day"); // Get tomorrow's date
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isValidDate, setIsValidDate] = useState(true);
  const { token, date } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const platform = queryParams.get("platform");
  const lang = queryParams.get("lang") || "en";

  useEffect(() => {
    i18next.changeLanguage(lang);
  }, [lang]);

  var bytes = CryptoJS.AES.decrypt(date, "subscription_date_encryption");
  var pass = bytes.toString(CryptoJS.enc.Utf8);

  console.log(pass, "decrypted");

  console.log("Token:", date);

  useEffect(() => {
    if (pass) {
      const providedDate = dayjs(pass, "DD-MM-YYYY");
      const minSelectableDate = providedDate.add(1, "month");
      setSelectedDate((prevDate) =>
        prevDate.isBefore(minSelectableDate) ? minSelectableDate : prevDate,
      );
    }
  }, [pass]);

  //   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZW5kZXJJZCI6IjcyMjQ3NTUwMDc2MDgxMjMiLCJpbnN0YUNoYXRib3RJZCI6IjY1ZGVlYjFmNmM1MDJlZDliMGE1ZDdiZSIsImlhdCI6MTcwOTI3MTgyNCwiZXhwIjoxNzA5Mjg5ODI0fQ.O9Pz-6cEMB1F6h8mqPjGKAU6IRWQa_fUuwat63zZmFQ

  // useEffect(() => {
  //   if (date) {
  //     // Parse the date from the URL parameters
  //     const providedDate = dayjs(date, "DD-MM-YYYY");

  //     // Calculate the minimum selectable date (one month or more from the provided date)
  //     const minSelectableDate = providedDate.add(1, "month");

  //     // Set the minimum selectable date on the date picker
  //     setSelectedDate((prevDate) =>
  //       prevDate.isBefore(minSelectableDate) ? minSelectableDate : prevDate
  //     );
  //   }
  // }, [date]);

  const handleDateChange = (newDate) => {
    const providedDate = dayjs(pass, "DD-MM-YYYY");
    const minSelectableDate = providedDate.add(1, "month");

    setSelectedDate(newDate);

    if (
      newDate.isBefore(minSelectableDate) ||
      newDate.isSame(providedDate, "day")
    ) {
      setIsValidDate(false);
    } else {
      setIsValidDate(true);
    }
  };

  const handleSubmit = async () => {
    if (!isValidDate) {
      return;
    }
    setSuccess(false);
    setLoading(true);
    setError(null);
    try {
      const apiUrl =
        "https://fontawesomev23.com/api/webhook/set-subscription-request-end-date";
      const requestBody = {
        data: {
          token,
          date: selectedDate.format("DD-MM-YYYY"),
        },
      };
      console.log(requestBody);
      await axios.post(apiUrl, requestBody);
      console.log("Data submitted successfully");
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("Error submitting data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      style={{
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        width: "100%",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {success ? (
          <CustomDatePickerContainer>
            <DotLottieReact
              src="https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json"
              backgroundColor="transparent"
              speed="1"
              style={{ width: "225px", height: "225px" }}
              playMode="normal"
              loop={true}
              autoplay={true}
            />
            <h5 style={{ padding: "1rem", textAlign: "center" }}>
              {platform === "telegram"
                ? "You can now close this webpage and go back to Telegram."
                : "You can now close this webpage and go back to Instagram."}
            </h5>
            <RedirectButton platform={platform} />
          </CustomDatePickerContainer>
        ) : (
          <CustomDatePickerContainer>
            <LogoImage
              src="https://ip-user-deploy-e57p.vercel.app/static/media/logo.3bf108bfae968aa09291ca566ff36a4e.svg"
              alt="Logo"
            />
            <CustomDatePickerWrapper>
              <div
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CustomLabel htmlFor="datepicker">
                  {t("Select an Ending Date:")}
                </CustomLabel>
                <MobileDatePicker
                  id="datepicker"
                  value={selectedDate}
                  onChange={handleDateChange}
                  disabled={loading}
                  minDate={dayjs()}
                />
              </div>
              {!isValidDate && (
                <p style={{ color: "red" }}>
                  {t("Please select a date after one month from {{pass}}", {
                    pass,
                  })}{" "}
                </p>
              )}
              {error && <p style={{ color: "red" }}>{error}</p>}
              <CustomSubmitButton
                onClick={handleSubmit}
                disabled={loading || !isValidDate}
                style={{
                  cursor: `${loading || !isValidDate ? "default" : "pointer"}`,
                }}
                isValid={isValidDate}
              >
                {loading ? "Proceeding..." : "Proceed"}
              </CustomSubmitButton>
            </CustomDatePickerWrapper>
          </CustomDatePickerContainer>
        )}
      </LocalizationProvider>
    </div>
  );
}
