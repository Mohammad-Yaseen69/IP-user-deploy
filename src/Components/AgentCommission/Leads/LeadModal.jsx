import {
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { ArrowRight, ChevronDown, X } from "react-feather";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import CountryDropDown from "../../AddBeneficiary/CountryDropDown";
import PhoneInput from "../../PhoneInput";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import styles from "../styles/leadModal.module.css";
import { UserContext } from "../../../Context/UserContext";
import citiesData from "../../CitiesDropDown/CitiesData.json";

// same text (and translation key) as UpdateFeePackModal
const NO_APPROVED_PACKS_MESSAGE =
  "No approved fee packs available. Request a custom fee model from the Fee Requests tab first.";

const LeadModal = ({ open, onClose, onSubmit, initialEntityType = "corporate" }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { userDetails } = useContext(UserContext);

  const [entityType, setEntityType] = useState(
    initialEntityType === "corporate" ? "business" : initialEntityType,
  );
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    country: userDetails?.country?.country_name ? userDetails.country.country_name : "Switzerland",
    email: "",
    phone: "",
    fee_pack: "",
    sendInvite: true,
  });

  const { data: feePacks = [], isLoading: loadingPacks } = useQuery({
    queryKey: ["agentApprovedFeeRequests"],
    queryFn: async () => {
      const dec = await apiWrapper({
        endpoint: "/api/iban-fees/agent-requests",
        method: "GET",
        isDecrypted: true,
      });
      const list = Array.isArray(dec) ? dec : Array.isArray(dec?.data) ? dec.data : [];
      const approved = list
        .filter((r) => r.status === "approved")
        .map((r) => ({
          _id: r.created_pack_id || r._id,
          name: r.title,
          pricing_summary: r.pricing_summary || "Approved Fee Schedule",
          model_code: r.model_code,
        }));
      return approved;
    },
    enabled: open,
  });
  const noApprovedPacks = !loadingPacks && feePacks.length === 0;

  useEffect(() => {
    if (open) {
      setEntityType(initialEntityType === "corporate" ? "business" : initialEntityType);
      setFormData({
        company_name: "",
        first_name: "",
        last_name: "",
        country: userDetails?.country?.country_name
          ? userDetails.country.country_name
          : "Switzerland",
        email: "",
        phone: "",
        fee_pack: feePacks.length > 0 ? feePacks[0]._id : "",
        sendInvite: true,
      });
      setErrorMsg("");
    }
  }, [open, initialEntityType]);

  useEffect(() => {
    if (feePacks.length > 0 && !formData.fee_pack) {
      setFormData((prev) => ({ ...prev, fee_pack: feePacks[0]._id }));
    }
  }, [feePacks]);

  const createLeadMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiWrapper({
        endpoint: "/api/agent-leads",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agentLeads"] });
      if (onSubmit) {
        onSubmit(data);
      }
      onClose();
    },
    onError: (err) => {
      let msg = "";
      const rawData = err?.response?.data?.data;
      if (rawData) {
        try {
          const dec = decryptData(rawData);
          msg = typeof dec === "string" ? dec : dec?.message || dec?.info;
        } catch {
          msg = typeof rawData === "string" ? rawData : err?.message;
        }
      }
      setErrorMsg(msg || err?.message || t("Failed to create lead. Please try again."));
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (entityType === "business" && !formData.company_name?.trim()) {
      setErrorMsg(t("Company name is required for business leads."));
      return;
    }

    if (entityType === "individual" && !formData.first_name?.trim()) {
      setErrorMsg(t("First name is required for individual leads."));
      return;
    }

    if (entityType === "business" && !formData.email?.trim()) {
      setErrorMsg(t("Contact email is required for business leads."));
      return;
    }

    if (entityType === "individual" && !formData.phone?.trim() && !formData.email?.trim()) {
      setErrorMsg(t("Phone number or Email is required for individual leads."));
      return;
    }

    if (!formData.fee_pack) {
      setErrorMsg(
        t(noApprovedPacks ? NO_APPROVED_PACKS_MESSAGE : "Please select a fee pack for this lead."),
      );
      return;
    }

    const payload = {
      leadType: entityType,
      company_name: formData.company_name,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      fee_pack: formData.fee_pack,
    };

    createLeadMutation.mutate(payload);
  };

  console.log(formData.country, "countr");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ className: styles.modalPaper }}
      BackdropProps={{ className: styles.backdrop }}
    >
      <DialogContent className={styles.modalContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("Submit new lead")}</h2>
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.entityToggleContainer}>
          <div
            onClick={() => setEntityType("individual")}
            className={`${styles.entityTab} ${entityType === "individual" ? styles.entityTabActive : ""}`}
          >
            <span
              className={`${styles.tabTitle} ${entityType === "individual" ? styles.tabTitleActive : ""}`}
            >
              {t("Private individual")}
            </span>
            <span className={styles.tabSubtitle}>{t("KYC required")}</span>
          </div>

          <div
            onClick={() => setEntityType("business")}
            className={`${styles.entityTab} ${entityType === "business" ? styles.entityTabActive : ""}`}
          >
            <span
              className={`${styles.tabTitle} ${entityType === "business" ? styles.tabTitleActive : ""}`}
            >
              {t("Corporate / Business")}
            </span>
            <span className={styles.tabSubtitle}>{t("KYB required")}</span>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {entityType === "business" ? (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t("Company Name")}</label>
              <TextField
                fullWidth
                size="small"
                placeholder={t("e.g. GreenBean Traders")}
                value={formData.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className={styles.inputControl}
              />
            </div>
          ) : (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("First Name")}</label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("e.g. John")}
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className={styles.inputControl}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("Last Name")}</label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("e.g. Doe")}
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  className={styles.inputControl}
                />
              </div>
            </>
          )}

          {entityType === "business" ? (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("Country")}</label>
                <CountryDropDown
                  country={formData.country}
                  onSelect={(selected) => {
                    handleChange(
                      "country",
                      selected?.country_name || selected?.name || selected?.alpha3 || "",
                    );
                  }}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("Company Email")}</label>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  placeholder="contact@client.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={styles.inputControl}
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>{t("Phone Number")}</label>
                <PhoneInput
                  country={citiesData.find((c) => c.name === formData.country)?.iso3 || "USA"}
                  phone={formData.phone}
                  setPhone={(val) => handleChange("phone", val)}
                  setCountry={(selected) => {
                    const cName =
                      selected?.country_name ||
                      selected?.name ||
                      selected?.alpha3 ||
                      selected?.country_iso_code ||
                      "";
                    handleChange("country", cName);
                  }}
                />
              </div>
              {/* <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>{t('Email (Optional)')}</label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className={styles.inputControl}
                                />
                            </div> */}
            </>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t("Attached Approved Fee Pack")}</label>
            <TextField
              select
              fullWidth
              size="small"
              value={formData.fee_pack}
              onChange={(e) => handleChange("fee_pack", e.target.value)}
              className={styles.inputControl}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  const match = feePacks.find((p) => p._id === selected);
                  if (!match)
                    return (
                      <span className={styles.placeholderText}>
                        {t(noApprovedPacks ? NO_APPROVED_PACKS_MESSAGE : "Select Fee Pack")}
                      </span>
                    );
                  return `${match.name} (${match.pricing_summary || match.pack_type})`;
                },
                IconComponent: ChevronDown,
              }}
            >
              {noApprovedPacks && (
                <MenuItem
                  disabled
                  sx={{ fontFamily: "Inter", fontSize: "14px", whiteSpace: "normal" }}
                >
                  {t(NO_APPROVED_PACKS_MESSAGE)}
                </MenuItem>
              )}
              {feePacks.map((pack) => (
                <MenuItem
                  key={pack._id}
                  value={pack._id}
                  sx={{ fontFamily: "Inter", fontSize: "14px" }}
                >
                  {pack.name} - {pack.pricing_summary || pack.pack_type}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className={styles.infoNoticeBox}>
            <p className={styles.infoNoticeText}>
              {t(
                "You submit the introduction only. Your client receives a secure link to complete their own KYC/KYB e-form — you don't collect or handle their documents. You can then track their onboarding status and any compliance request here.",
              )}
            </p>
          </div>

          <div className={styles.checkboxRow}>
            <FormControlLabel
              className={styles.checkboxControl}
              control={
                <Checkbox
                  checked={formData.sendInvite}
                  onChange={(e) => handleChange("sendInvite", e.target.checked)}
                  size="small"
                  sx={{
                    color: "#4A32E3",
                    "&.Mui-checked": { color: "#4A32E3" },
                    padding: "4px",
                  }}
                />
              }
              label={
                <span className={styles.checkboxLabel}>
                  {t("Send secure self-onboarding invite to the client")}
                </span>
              }
            />
          </div>

          <button
            type="submit"
            disabled={createLeadMutation.isPending || loadingPacks}
            className={styles.submitBtn}
          >
            {createLeadMutation.isPending ? t("Submitting...") : t("Submit lead & invite")}
            <ArrowRight size={18} />
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;
