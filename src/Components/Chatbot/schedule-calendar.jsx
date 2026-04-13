import * as React from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import styled from "@emotion/styled";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import axios from "axios";
import { Link, useLocation, useParams } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTimezones } from "../../Context/TimezoneContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Autocomplete, TextField } from "@mui/material";
import RedirectButton from "../../CommonElements/RedirectButton";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

// Define custom styled components
export const CustomDatePickerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 97vh;
  /* max-width: fit-content; */
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
  /* background-color: #007bff; */
  background: rgb(3, 51, 164);
  background: linear-gradient(
    310deg,
    rgba(3, 51, 164, 0.8) 16%,
    rgba(240, 11, 240, 0.8) 97%
  );
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: rgb(3, 51, 164);
    background: linear-gradient(
      310deg,
      rgba(3, 51, 164, 0.9668242296918768) 16%,
      rgba(240, 11, 240, 0.9472163865546218) 97%
    );
  }
`;

const LogoImage = styled.img`
  width: 240px; /* Adjust width as needed */
  height: 140px;
  margin-bottom: 20px; /* Add some spacing between the logo and the form */
`;
export const SuccessImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
`;
const SuccessTick = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="green"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 16.2l-2.5-2.5L5 15l4 4 8-8-1.4-1.4-6.6 6.6z" />
  </svg>
);

const SubscriptionCalendar = () => {
  const { timezones } = useTimezones();
  const { token } = useParams();
  const tomorrow = dayjs().add(1, "day"); // Get tomorrow's date

  const [selectedDate, setSelectedDate] = React.useState(tomorrow);
  const [selectedTime, setSelectedTime] = React.useState(dayjs().add(5, "minute"));
  const [selectedTimezone, setSelectedTimezone] = React.useState(
    timezones?.length > 0 ? timezones[0]?.timezone : ""
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const method = queryParams.get("method")
  const { t } = useTranslation()
  const platform = queryParams.get("platform")
  const lang = queryParams.get("lang") || "en"

  React.useEffect(() => {
    i18next.changeLanguage(lang)
  }, [lang])

  React.useEffect(() => {
    timezones.sort((a, b) => a.name.localeCompare(b.name))
  }, [])
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const formattedTimezone = String(selectedTimezone ?? "").split(" - ")?.[1]?.split(" GMT")[0]

    try {
      const apiUrl =
        "https://fontawesomev23.com/api/webhook/set-schedule-calendar";
      const requestBody = {
        data: {
          token,
          date: selectedDate.format("DD-MM-YYYY"),
          time: selectedTime.format("h:mm A"),
          timezone: formattedTimezone,
          type: method
        },
      };
      console.log(requestBody);

      await axios.post(apiUrl, requestBody);
      console.log("Data submitted successfully");
      setSuccess(true);
      // Automatically close the page after 3 seconds
      //   setTimeout(() => {
      //     window.close();
      //   }, 3000);
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("Error submitting data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const defaul = queryParams.get("default")

  React.useEffect(() => {
    if (defaul) {
      let urlObj = new URL(window.location.href);
      let defaultParam = urlObj.searchParams.get('default');
      let cleanString = decodeURIComponent(defaultParam);

      const timezone = timezones?.find(item => item?.timezone?.toLowerCase()?.startsWith(cleanString?.toLowerCase()))
      setSelectedTimezone(timezone?.name + "-" + timezone?.timezone)
    }
  }, [defaul, timezones])

  console.log(selectedTimezone)

  const isDateValid = selectedDate.isAfter(dayjs(), "day") || selectedDate.isSame(dayjs(), "day");
  const isTimeValid = selectedDate.isSame(dayjs(), "day")
    ? selectedTime.isAfter(dayjs().add(5, "minute"))
    : true;

  const isFormValid = isDateValid && isTimeValid;

  // Example usage of platform for conditional UI (add where needed)
  // e.g., show a message or button based on platform
  // <div>{platform === "telegram" ? "Telegram flow" : "Instagram flow"}</div>

  const handleTimezoneFilter = (options, { inputValue }) => {
    const normalizedInput = inputValue.replace(/^(\+)([1-9])$/, '$10$2') // Remove leading zeros
    return options.filter(option =>
      option.toLowerCase().includes(normalizedInput.toLowerCase())
    );
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
              {t("You can now close this webpage and go back to {{platform}}.", { platform: platform === "telegram" ? "Telegram" : "Instagram" })}
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
                <CustomLabel htmlFor="datepicker">{t("Select a Date:")}</CustomLabel>
                <MobileDatePicker
                  minDate={dayjs()}
                  id="datepicker"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>
              <div
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CustomLabel htmlFor="timepicker">{t('Select a Time:')}</CustomLabel>
                <MobileTimePicker
                  minTime={selectedDate.isSame(dayjs(), "day") ? dayjs().add(5, "minute") : null}
                  id="timepicker"
                  value={selectedTime}
                  onChange={setSelectedTime}
                />
              </div>
              <div
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CustomLabel htmlFor="timezone">{t("Select a Timezone:")}</CustomLabel>
                <Autocomplete
                  fullWidth={true}
                  disablePortal
                  options={["System Default", ...timezones?.map(option => `${option.name} - ${option.timezone}`)]}
                  getOptionLabel={(option) => option}
                  value={selectedTimezone?.includes("undefined") ? "" : selectedTimezone}
                  onChange={(e, newValue) => {
                    setSelectedTimezone(newValue);
                  }}
                  filterOptions={handleTimezoneFilter}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      value={selectedTimezone?.includes("undefined") ? "" : selectedTimezone}
                    />
                  )}
                />
              </div>
              {!isTimeValid && (
                <p style={{ color: "red", margin: ".7rem 0" }}>{t("Please select a time at least 5 minutes from now.")}</p>
              )}
              <CustomSubmitButton
                onClick={handleSubmit}
                disabled={loading || !isFormValid}
                style={{
                  cursor: `${loading ? "default" : "pointer"}`,
                }}
              >
                {loading ? "Proceeding..." : "Proceed"}
              </CustomSubmitButton>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {/* {success && <SuccessTick />} */}
            </CustomDatePickerWrapper>
          </CustomDatePickerContainer>
        )}
      </LocalizationProvider>
    </div>
  );
};

export default SubscriptionCalendar;