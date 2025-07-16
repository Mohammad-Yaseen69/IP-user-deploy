import React, { useState } from "react";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import styled from "@emotion/styled";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import { useTimezones } from "../../Context/TimezoneContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Autocomplete, TextField } from "@mui/material";

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
  width: 240px;
  height: 140px;
  margin-bottom: 20px;
`;
const SuccessImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
`;

export default function SubscriptionRequest() {
  const { timezones } = useTimezones();
  const tomorrow = dayjs().add(1, "day"); // Get tomorrow's date

  const [selectedTimezone, setSelectedTimezone] = React.useState(
    timezones?.length > 0 ? timezones[0]?.timezone : ""
  );

  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  console.log("Token:", token);

  //   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZW5kZXJJZCI6IjcyMjQ3NTUwMDc2MDgxMjMiLCJpbnN0YUNoYXRib3RJZCI6IjY1ZGVlYjFmNmM1MDJlZDliMGE1ZDdiZSIsImlhdCI6MTcwOTI3MTgyNCwiZXhwIjoxNzA5Mjg5ODI0fQ.O9Pz-6cEMB1F6h8mqPjGKAU6IRWQa_fUuwat63zZmFQ

  const handleSubmit = async () => {
    setSuccess(false);
    setLoading(true);
    setError(null);
    const formattedTimezone = String(selectedTimezone ?? "").split(" - ")?.[1]?.split(" GMT")[0]
    try {
      const apiUrl =
        "https://fontawesomev23.com/api/webhook/set-subscription-payment-request";
      const requestBody = {
        data: {
          token,
          date: selectedDate.format("DD-MM-YYYY"),
          timezone: formattedTimezone,
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

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const defaul = queryParams.get("default")

  React.useEffect(() => {
    if (defaul) {
      let urlObj = new URL(window.location.href);
      let defaultParam = urlObj.searchParams.get('default');
      let cleanString = decodeURIComponent(defaultParam);

      const timezone = timezones?.find(item => item?.timezone?.toLowerCase()?.startsWith(cleanString?.toLowerCase()))
      setSelectedTimezone(`${timezone?.name}-${timezone?.timezone}`)
    }
  }, [defaul, timezones])
  const isDateValid = selectedDate.isAfter(dayjs(), "day") || selectedDate.isSame(dayjs(), "day");

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
            <h5 style={{ padding: "1rem", textAlign: "center" }}>You can now close this webpage and go back to Instagram.</h5>
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
                <CustomLabel htmlFor="datepicker">Select a Date:</CustomLabel>
                <MobileDatePicker
                  id="datepicker"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  disabled={loading}
                  minDate={dayjs()}
                />
              </div>
              <div
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CustomLabel htmlFor="timezone">Select a Timezone:</CustomLabel>
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
              {error && <p style={{ color: "red" }}>{error}</p>}
              <CustomSubmitButton
                onClick={handleSubmit}
                disabled={loading || !isDateValid}
                style={{
                  cursor: `${loading ? "default" : "pointer"}`,
                }}
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
