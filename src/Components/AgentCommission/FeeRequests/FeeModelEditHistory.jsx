import {
  Box,
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
  pending: "#B45309",
  approved: "#047857",
  rejected: "#DC2626",
};

const toHistoryRow = (entry) => ({
  title: entry.title,
  timestamp: entry.edited_at ?? entry.timestamp ?? entry.updatedAt ?? entry.createdAt,
  previousStatus: entry.previous_status ?? entry.previousStatus ?? entry.status,
});

const FeeModelEditHistory = ({ history, loading }) => {
  const { t } = useTranslation();

  const rows = Array.isArray(history) ? history.map(toHistoryRow) : [];

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "12px",
        borderColor: "#E5E7EB",
        padding: "20px",
        mt: 1,
      }}
    >
      <Typography
        component="h4"
        sx={{ fontSize: "16px", fontWeight: 700, mb: 1.5, color: "#111827" }}
      >
        {t("Edit History")} ({rows.length})
      </Typography>

      {loading ? (
        <Box sx={{ p: 2.5, textAlign: "center" }}>
          <CircularProgress size={20} sx={{ color: "#5926F0" }} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
          {t("No edits made yet.")}
        </Typography>
      ) : (
        <TableContainer sx={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: "#F9FAFB" }}>
                <TableCell sx={{ fontWeight: 700 }}>{t("Title")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t("Timestamp")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t("Previous Status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontSize: "13px" }}>{row.title || "-"}</TableCell>
                  <TableCell sx={{ fontSize: "13px" }}>
                    {row.timestamp ? new Date(row.timestamp).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: STATUS_COLORS[row.previousStatus] || "#374151",
                    }}
                  >
                    {row.previousStatus ? t(row.previousStatus) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
};

export default FeeModelEditHistory;
