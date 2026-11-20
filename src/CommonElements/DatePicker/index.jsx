import moment from "moment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";

// Drop-in replacement for the `DatePicker` from @material-ui/pickers v3, which
// depends on @material-ui/core v4 and cannot run on React 19. It keeps the v3
// props and behaviour the forms rely on:
// - `onChange` receives a moment (or null when cleared) only once the user
//   accepts a date, as v3 did, so callers' `date.format("YYYY-MM-DD")` is unchanged;
// - `value`, `minDate` and `maxDate` may be strings, Dates or moments;
// - clicking the field opens a dialog (v3's default variant);
// - `className`, `style`, `InputProps` and `inputProps` style the text field.

const toMoment = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = moment.isMoment(value) ? value : moment(value);
  return parsed.isValid() ? parsed : null;
};

// v3 called the day view "date"; x-date-pickers calls it "day".
const toView = (view) => (view === "date" ? "day" : view);

const DatePicker = ({
  value,
  onChange,
  format,
  minDate,
  maxDate,
  disableFuture,
  disablePast,
  disabled,
  readOnly,
  views,
  openTo,
  autoOk,
  clearable,
  id,
  className,
  style,
  placeholder,
  required,
  InputProps,
  inputProps,
}) => (
  <LocalizationProvider dateAdapter={AdapterMoment}>
    <MobileDatePicker
      value={toMoment(value)}
      onAccept={(next) => onChange?.(next ?? null)}
      format={format}
      minDate={toMoment(minDate) ?? undefined}
      maxDate={toMoment(maxDate) ?? undefined}
      disableFuture={disableFuture}
      disablePast={disablePast}
      disabled={disabled}
      readOnly={readOnly}
      views={views?.map(toView)}
      openTo={openTo ? toView(openTo) : undefined}
      closeOnSelect={!!autoOk}
      slotProps={{
        actionBar: { actions: clearable ? ["clear", "cancel", "accept"] : ["cancel", "accept"] },
        textField: {
          id,
          variant: "standard",
          className,
          style,
          placeholder,
          required,
          InputProps,
          inputProps,
        },
      }}
    />
  </LocalizationProvider>
);

export default DatePicker;
