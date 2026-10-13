import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { NO_PERCENT_FEE_IDS } from "./feeSchedule";

const blockNegativeInput = (e) => {
  if (["-", "e", "E"].includes(e.key)) e.preventDefault();
};

const feeInputProps = { min: 0, step: "any", onKeyDown: blockNegativeInput };

const FeeModelForm = ({
  heading,
  title,
  onTitleChange,
  feeSchedule,
  onFeeChange,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  submittingLabel,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit}>
      {heading && (
        <Typography
          component="h3"
          sx={{ fontSize: "18px", fontWeight: 700, mb: 2, color: "#111827" }}
        >
          {heading}
        </Typography>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography
          component="label"
          htmlFor="fee-model-title"
          sx={{
            display: "block",
            fontWeight: 600,
            fontSize: "14px",
            color: "#374151",
            mb: 1,
          }}
        >
          {t("Fee Model Title / Name")} <span style={{ color: "red" }}>*</span>
        </Typography>
        <TextField
          id="fee-model-title"
          size="small"
          fullWidth
          placeholder={t("e.g. VIP Corporate Pricing Plan")}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          sx={{ maxWidth: "500px" }}
        />
        <Typography
          component="small"
          sx={{ display: "block", fontSize: "12px", color: "#6B7280", mt: 0.5 }}
        >
          {t("Give this fee model a descriptive title for your reference.")}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 3,
          mb: 2,
          fontWeight: 700,
          fontSize: "16px",
          color: "#111827",
        }}
      >
        {t("Fee Schedule Configuration")}
      </Typography>

      <TableContainer sx={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: "#F9FAFB" }}>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("Fee Line Item")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("Flat Amount (€ EUR)")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("Percentage (%)")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feeSchedule.map((item, idx) => {
              const isNoPercent = NO_PERCENT_FEE_IDS.includes(item.id);
              return (
                <TableRow key={item.id} hover>
                  <TableCell
                    sx={{ fontWeight: 600, fontSize: "13px", color: "#374151" }}
                  >
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      inputProps={feeInputProps}
                      value={item.flatEuro}
                      onChange={(e) =>
                        onFeeChange(idx, "flatEuro", e.target.value)
                      }
                      sx={{ width: "130px" }}
                    />
                  </TableCell>
                  <TableCell>
                    {!isNoPercent && (
                      <TextField
                        type="number"
                        size="small"
                        inputProps={feeInputProps}
                        value={item.percentAmount}
                        onChange={(e) =>
                          onFeeChange(idx, "percentAmount", e.target.value)
                        }
                        sx={{ width: "130px" }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{ display: "flex", justifyContent: "flex-end", gap: "12px", mt: 3 }}
      >
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          sx={{ textTransform: "none" }}
        >
          {t("Cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{
            textTransform: "none",
            background: "#5926F0",
            padding: "10px 24px",
            "&:hover": { background: "#4A1FD0" },
          }}
        >
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </Box>
    </form>
  );
};

export default FeeModelForm;
