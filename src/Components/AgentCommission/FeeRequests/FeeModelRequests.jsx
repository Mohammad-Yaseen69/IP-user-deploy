import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Copy,
  Edit2,
  Plus,
  Shield,
  Trash,
  X,
  XCircle,
} from "react-feather";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../../Helper/EssentilaMethods/Encryption";
import useWindowWidth from "../../../utils/useWindowWidth";
import TopRight from "../../topRight";
import styles from "../styles/index.module.css";
import FeeModelEditHistory from "./FeeModelEditHistory";
import FeeModelForm from "./FeeModelForm";
import {
  useEditFeeRequest,
  useFeeRequestEditHistory,
} from "./hooks/useFeeRequestEdit";
import { useIdempotency } from "../../../hooks/Payments/useIdempotency";
import { useMutation } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import {
  DEFAULT_FEE_ITEMS,
  NO_PERCENT_FEE_IDS,
  sanitizeFeeSchedule,
  scheduleFromRequest,
  updateFeeItem,
} from "./feeSchedule";

const primaryButtonSx = {
  textTransform: "none",
  background: "#5926F0",
  "&:hover": { background: "#4A1FD0" },
};
const chipSx = { fontWeight: 600, fontSize: "12px", px: 0.5 };

const FeeModelRequests = () => {
  const { t } = useTranslation();
  const width = useWindowWidth();
  const { userDetails, authHeader } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("list");
  const [title, setTitle] = useState("");
  const [revenueModel, setRevenueModel] = useState("markup");
  const [feeSchedule, setFeeSchedule] = useState(DEFAULT_FEE_ITEMS);
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [editingRequest, setEditingRequest] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFeeSchedule, setEditFeeSchedule] = useState(DEFAULT_FEE_ITEMS);
  const { getKey: getEditKey, reset: resetEditKey } = useIdempotency();

  const { data: editHistory = [], isLoading: loadingEditHistory } =
    useFeeRequestEditHistory();

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/agent-requests`,
        {
          headers: authHeader,
        },
      );
      const raw = res.data?.data || res.data;
      let dec = raw;
      if (typeof raw === "string") {
        dec = decryptData(raw);
      }
      const list = Array.isArray(dec)
        ? dec
        : Array.isArray(dec?.data)
          ? dec.data
          : Array.isArray(dec?.requests)
            ? dec.requests
            : [];
      setRequests(list);
    } catch (err) {
      console.error("Error fetching agent fee requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const { mutate: editFeeRequest, isPending: savingEdit } = useEditFeeRequest({
    onSuccess: (dec) => {
      toast.success(
        dec?.message || t("Fee model request updated successfully!"),
      );
      resetEditKey();
      setEditingRequest(null);
      fetchRequests();
    },
    onError: (decErr) => {
      toast.error(decErr?.message || t("Failed to update fee model request."));
    },
  });

  const { mutate: deleteRequest, isPending: deleting } = useMutation({
    mutationFn: (requestId) =>
      apiWrapper({
        endpoint: `/api/iban-fees/delete-request-pack/${requestId}`,
        method: "DELETE",
        isEncrypted: true,
        isDecrypted: true,
      }),
    onSuccess: (res) => {
      fetchRequests();
      toast.success(res?.message ?? t("Request deleted successfully."));
    },
    onError: (error) => {
      const message = error?.message || error?.data?.message;
      toast.error(message ?? t("Failed to delete request."));
    },
  });

  const handleFeeChange = (index, field, value) => {
    setFeeSchedule((prev) => updateFeeItem(prev, index, field, value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t("Please enter a title for the fee model request."));
      return;
    }

    setSubmitting(true);
    try {
      const sanitizedSchedule = sanitizeFeeSchedule(feeSchedule);

      const payload = {
        account_id: userDetails?._id,
        title: title.trim(),
        fee_schedule: sanitizedSchedule,
        agent_revenue_model: revenueModel,
      };

      const encrypted = encryptData(payload);
      const res = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/iban-fees/request-pack`,
        { data: encrypted },
        { headers: authHeader },
      );

      const dec = decryptData(res.data?.data);
      toast.success(
        dec?.message || t("Fee model request submitted successfully!"),
      );
      setTitle("");
      setFeeSchedule(DEFAULT_FEE_ITEMS);
      setActiveTab("list");
      fetchRequests();
    } catch (err) {
      const decErr = decryptData(err?.response?.data?.data);
      toast.error(decErr?.message || t("Failed to submit fee model request."));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (req) => {
    resetEditKey();
    setEditingRequest(req);
    setEditTitle(req.title || "");
    setEditFeeSchedule(scheduleFromRequest(req.fee_schedule));
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingRequest(null);
  };
  const handleEditFeeChange = (index, field, value) => {
    setEditFeeSchedule((prev) => updateFeeItem(prev, index, field, value));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error(t("Please enter a title for the fee model request."));
      return;
    }

    editFeeRequest({
      requestId: editingRequest._id,
      idempotencyKey: getEditKey(),
      payload: {
        account_id: userDetails?._id,
        title: editTitle.trim(),
        fee_schedule: sanitizeFeeSchedule(editFeeSchedule),
        agent_revenue_model: editingRequest.agent_revenue_model || revenueModel,
      },
    });
  };

  const copyToClipboard = (text, type = "code") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      toast.success(t("Signup link copied to clipboard!"));
    } else {
      toast.info(t("Copied referral code: ") + text);
    }
  };

  const tabButtonStyle = (tab) => ({
    padding: "12px 20px",
    background: "none",
    border: "none",
    fontSize: "15px",
    fontWeight: 600,
    color: activeTab === tab ? "#5926F0" : "#6B7280",
    borderBottom:
      activeTab === tab ? "2px solid #5926F0" : "2px solid transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.headerTitle}>
          <h1>{t("Fee Model Requests")}</h1>
          <p>
            {t(
              "Request custom client pricing models and manage your approved referral codes.",
            )}
          </p>
        </div>
        <div className={styles.topright}>{width > 1000 && <TopRight />}</div>
      </div>

      <div className={styles.main}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "16px",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <button
              onClick={() => setActiveTab("list")}
              style={tabButtonStyle("list")}
            >
              {t("Requested Models")} ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              style={tabButtonStyle("create")}
            >
              <Plus size={16} /> {t("New Model Request")}
            </button>
          </Box>

          {activeTab === "list" && (
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              sx={primaryButtonSx}
              onClick={() => setActiveTab("create")}
            >
              {t("Request New Fee Model")}
            </Button>
          )}
        </Box>

        {activeTab === "list" ? (
          <div>
            {loadingRequests ? (
              <Box sx={{ p: "60px", textAlign: "center" }}>
                <CircularProgress sx={{ color: "#5926F0" }} />
                <Typography
                  sx={{ mt: 1.5, fontSize: "14px", color: "#6B7280" }}
                >
                  {t("Loading fee model requests...")}
                </Typography>
              </Box>
            ) : requests.length === 0 ? (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "12px",
                  borderColor: "#E5E7EB",
                  p: "40px",
                  textAlign: "center",
                }}
              >
                <Shield
                  size={42}
                  color="#9CA3AF"
                  style={{ marginBottom: "12px" }}
                />
                <Typography
                  component="h3"
                  sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}
                >
                  {t("No Fee Model Requests Submitted")}
                </Typography>
                <Typography
                  sx={{ fontSize: "14px", color: "#6B7280", mt: 0.75, mb: 2.5 }}
                >
                  {t(
                    "Request custom fee schedules for your clients. Once approved by admin, you will receive a unique referral code.",
                  )}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  sx={primaryButtonSx}
                  onClick={() => setActiveTab("create")}
                >
                  {t("Create Your First Request")}
                </Button>
              </Card>
            ) : (
              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                {requests.map((req) => (
                  <Grid item xs={12} lg={6} key={req._id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: "12px",
                        borderColor: "#E5E7EB",
                        height: "100%",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Box
                        sx={{
                          background: "#FFFFFF",
                          borderBottom: "1px solid #F3F4F6",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                          p: "16px 20px",
                        }}
                      >
                        <div>
                          <Typography
                            component="h4"
                            sx={{
                              fontSize: "17px",
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {req?.title}
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "12px", color: "#6B7280" }}
                          >
                            {t("Requested on")}:{" "}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit2 size={12} />}
                            sx={{
                              textTransform: "none",
                              color: "#5926F0",
                              borderColor: "#5926F0",
                              p: "2px 10px",
                              minWidth: 0,
                            }}
                            onClick={() => openEditModal(req)}
                          >
                            {t("Edit")}
                          </Button>
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "#e64067",
                              color: "white",
                              "&:hover": { bgcolor: "#c9365a" },
                            }}
                            onClick={() => deleteRequest(req._id)}
                            disabled={deleting}
                          >
                            <Trash size={14} />
                          </IconButton>
                          {req.status === "pending" && (
                            <Chip
                              size="small"
                              color="warning"
                              icon={<Clock size={12} />}
                              label={t("PENDING REVIEW")}
                              sx={chipSx}
                            />
                          )}
                          {req.status === "approved" && (
                            <Chip
                              size="small"
                              color="success"
                              icon={<CheckCircle size={12} />}
                              label={t("APPROVED")}
                              sx={chipSx}
                            />
                          )}
                          {req.status === "rejected" && (
                            <Chip
                              size="small"
                              color="error"
                              icon={<XCircle size={12} />}
                              label={t("REJECTED")}
                              sx={chipSx}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          p: "20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            background: "#F9FAFB",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #F3F4F6",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6B7280",
                              fontWeight: 600,
                              marginBottom: "2px",
                            }}
                          >
                            {t("PRICING SUMMARY")}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            {req.pricing_summary || "Custom Fee Schedule"}
                          </div>
                        </div>

                        {req.status === "approved" &&
                          (() => {
                            const cType =
                              req.comissionType ||
                              req.created_pack_id?.comissionType ||
                              "percentage";
                            const cVal =
                              req.feesCommisionValue ??
                              req.created_pack_id?.feesCommisionValue ??
                              0;
                            const cFix =
                              req.feesCommisionFixed ??
                              req.created_pack_id?.feesCommisionFixed ??
                              0;

                            const hasCommission = cVal > 0 || cFix > 0;

                            return (
                              <div
                                style={{
                                  background: hasCommission
                                    ? "#ECFDF5"
                                    : "#F3F4F6",
                                  padding: "14px 16px",
                                  borderRadius: "8px",
                                  border: `1px solid ${hasCommission ? "#A7F3D0" : "#E5E7EB"}`,
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: hasCommission
                                          ? "#065F46"
                                          : "#4B5563",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {t("APPROVED COMMISSION")}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: 800,
                                        color: hasCommission
                                          ? "#047857"
                                          : "#374151",
                                        marginTop: "2px",
                                      }}
                                    >
                                      {cType === "both"
                                        ? `${cVal}% + €${cFix}`
                                        : cType === "fixed"
                                          ? `€${cFix > 0 ? cFix : cVal}`
                                          : `${cVal}%`}
                                    </div>
                                  </div>

                                  <Chip
                                    size="small"
                                    color={
                                      hasCommission ? "success" : "default"
                                    }
                                    label={
                                      hasCommission
                                        ? t("Commission Active")
                                        : t("No Commission")
                                    }
                                    sx={{ ...chipSx, fontSize: "11px" }}
                                  />
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: hasCommission
                                      ? "#047857"
                                      : "#6B7280",
                                  }}
                                >
                                  {hasCommission
                                    ? t(
                                        "You earn this commission payout on all fees collected from clients under this referral model.",
                                      )
                                    : t(
                                        "This model is active with standard zero-commission payout.",
                                      )}
                                </div>
                              </div>
                            );
                          })()}
                        {req.status === "approved" && req.model_code && (
                          <div
                            style={{
                              background: "#EEF2FF",
                              padding: "14px 16px",
                              borderRadius: "8px",
                              border: "1px solid #C7D2FE",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#4338CA",
                                    fontWeight: 600,
                                  }}
                                >
                                  {t("CLIENT REFERRAL CODE")}
                                </div>
                                <div
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: 800,
                                    color: "#4F46E5",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {req.model_code}
                                </div>
                              </div>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Copy size={14} />}
                                sx={{
                                  textTransform: "none",
                                  background: "#4F46E5",
                                  "&:hover": { background: "#4338CA" },
                                }}
                                onClick={() =>
                                  copyToClipboard(req.model_code, "code")
                                }
                              >
                                {t("Copy Code")}
                              </Button>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderTop: "1px solid #C7D2FE",
                                paddingTop: "10px",
                              }}
                            >
                              <div
                                style={{ overflow: "hidden", maxWidth: "70%" }}
                              >
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#4338CA",
                                    fontWeight: 600,
                                  }}
                                >
                                  {t("FULL SIGNUP LINK")}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#3730A3",
                                    wordBreak: "break-all",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {`${window.location.origin}/signup/${req.model_code}`}
                                </div>
                              </div>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Copy size={14} />}
                                sx={{
                                  textTransform: "none",
                                  color: "#4F46E5",
                                  borderColor: "#4F46E5",
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() =>
                                  copyToClipboard(
                                    `${window.location.origin}/signup/${req.model_code}`,
                                    "link",
                                  )
                                }
                              >
                                {t("Copy Link")}
                              </Button>
                            </div>
                          </div>
                        )}

                        {req.status === "rejected" && req.rejection_reason && (
                          <div
                            style={{
                              background: "#FEE2E2",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              color: "#DC2626",
                              fontSize: "13px",
                            }}
                          >
                            <strong>{t("Rejection Reason")}:</strong>{" "}
                            {req.rejection_reason}
                          </div>
                        )}

                        <div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#374151",
                              marginBottom: "8px",
                            }}
                          >
                            {t("Fee Breakdown")}:
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(160px, 1fr))",
                              gap: "8px",
                            }}
                          >
                            {req.fee_schedule?.map((f, i) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: "12px",
                                  background: "#FFFFFF",
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #E5E7EB",
                                }}
                              >
                                <div
                                  style={{ color: "#6B7280", fontSize: "11px" }}
                                >
                                  {f.name}
                                </div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "#111827",
                                    marginTop: "2px",
                                  }}
                                >
                                  €{f.flatEuro || 0}{" "}
                                  {f.percentAmount &&
                                  !NO_PERCENT_FEE_IDS.includes(f.id)
                                    ? `+ ${f.percentAmount}%`
                                    : ""}
                                </div>
                                {req.status === "approved" && (
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#059669",
                                      fontWeight: 600,
                                      marginTop: "4px",
                                    }}
                                  >
                                    {t("Commission")}:{" "}
                                    {(() => {
                                      const iType =
                                        f.comissionType ||
                                        req.comissionType ||
                                        req.created_pack_id?.comissionType ||
                                        "percentage";
                                      const iVal =
                                        typeof f.feesCommisionValue === "number"
                                          ? f.feesCommisionValue
                                          : (req.feesCommisionValue ??
                                            req.created_pack_id
                                              ?.feesCommisionValue ??
                                            0);
                                      const iFix =
                                        typeof f.feesCommisionFixed === "number"
                                          ? f.feesCommisionFixed
                                          : (req.feesCommisionFixed ??
                                            req.created_pack_id
                                              ?.feesCommisionFixed ??
                                            0);
                                      if (iType === "both")
                                        return `${iVal}% + €${iFix}`;
                                      if (iType === "fixed")
                                        return `€${iFix > 0 ? iFix : iVal}`;
                                      return `${iVal}%`;
                                    })()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <FeeModelEditHistory
              history={editHistory}
              loading={loadingEditHistory}
            />
          </div>
        ) : (
          <Card
            variant="outlined"
            sx={{ borderRadius: "12px", borderColor: "#E5E7EB", p: "24px" }}
          >
            <FeeModelForm
              heading={t("Request New Fee Model")}
              title={title}
              onTitleChange={setTitle}
              feeSchedule={feeSchedule}
              onFeeChange={handleFeeChange}
              onSubmit={handleSubmit}
              onCancel={() => setActiveTab("list")}
              submitting={submitting}
              submitLabel={t("Submit Request to Admin")}
              submittingLabel={t("Submitting Request...")}
            />
          </Card>
        )}
      </div>

      <Dialog
        open={!!editingRequest}
        onClose={closeEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
          }}
        >
          {t("Edit Fee Model Request")}
          <IconButton
            onClick={closeEditModal}
            disabled={savingEdit}
            size="small"
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: "24px" }}>
          {editingRequest && (
            <FeeModelForm
              title={editTitle}
              onTitleChange={setEditTitle}
              feeSchedule={editFeeSchedule}
              onFeeChange={handleEditFeeChange}
              onSubmit={handleEditSubmit}
              onCancel={closeEditModal}
              submitting={savingEdit}
              submitLabel={t("Save Changes")}
              submittingLabel={t("Saving...")}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeModelRequests;
