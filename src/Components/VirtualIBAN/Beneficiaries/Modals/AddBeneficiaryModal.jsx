import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Modal,
  TextField,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { X, User, Briefcase } from "react-feather";
import { useTranslation } from "react-i18next";
import { apiWrapper } from "../../../../utils/Functions/apiWrapper";
import CountryDropDown from "../../../AddBeneficiary/CountryDropDown";
import CitiesDropDown from "../../../CitiesDropDown";
import PhoneInput from "../../../PhoneInput";
import { toast } from "react-toastify";
import { UserContext } from "../../../../Context/UserContext";
import {
  handleEmailInput,
  handleNameInput,
  preventEdgeSpaces,
  preventEmailSpaces,
} from "../../../../hooks/useTrimInput";
import { handlePaymentApiError } from "../../../../utils/Functions/handlePaymentApiError";
import { useNavigate } from "react-router";
const nameRegex = /^[A-Za-z\s]+$/;

const AddBeneficiaryModal = ({
  open,
  handleClose,
  onSaveSuccess,
  beneficiaryToEdit,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [loading, setLoading] = useState(false);
  const [beneficiaryType, setBeneficiaryType] = useState("individual");
  const [phoneKey, setPhoneKey] = useState(0);
  const { allowedCountries, setProfileLockTime } = useContext(UserContext);
  const navigate = useNavigate();
  const prefillPhoneRef = useRef("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    country_name: "",
    country_iso_code: "",
    city: "",
    address: "",
    zip_code: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (beneficiaryToEdit) {
      setBeneficiaryType(beneficiaryToEdit.beneficiary_type || "individual");
      const iso = beneficiaryToEdit.country_iso_code || "";
      const rawPhone = String(beneficiaryToEdit.phone || "");
      setFormData({
        first_name: beneficiaryToEdit.first_name || "",
        last_name: beneficiaryToEdit.last_name || "",
        company_name: beneficiaryToEdit.company_name || "",
        country_name: beneficiaryToEdit.country_name || "",
        country_iso_code: iso,
        city: beneficiaryToEdit.city || "",
        address: beneficiaryToEdit.address || "",
        zip_code: beneficiaryToEdit.zip_code || "",
        email: beneficiaryToEdit.email || "",
        phone: rawPhone,
      });
      prefillPhoneRef.current = rawPhone;
      setPhoneKey((prev) => prev + 1);
    } else {
      setBeneficiaryType("individual");
      setFormData({
        first_name: "",
        last_name: "",
        company_name: "",
        country_name: "",
        country_iso_code: "",
        city: "",
        address: "",
        zip_code: "",
        email: "",
        phone: "",
      });
      prefillPhoneRef.current = "";
      setPhoneKey((prev) => prev + 1);
    }
  }, [beneficiaryToEdit, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isCountrySelected = !!(
    formData.country_iso_code || formData.country_name
  );
  const isCountryDisabled = !isCountrySelected;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (beneficiaryType === "individual") {
      const firstName = formData.first_name?.trim() || "";
      const lastName = formData.last_name?.trim() || "";

      if (!firstName) {
        toast.error(t("First name is required for individual beneficiaries"));
        return;
      }

      if (!lastName) {
        toast.error(t("Last name is required for individual beneficiaries"));
        return;
      }

      if (!nameRegex.test(firstName)) {
        toast.error(t("First name can only contain letters and spaces"));
        return;
      }

      if (!nameRegex.test(lastName)) {
        toast.error(t("Last name can only contain letters and spaces"));
        return;
      }

      if (!formData.phone || !formData.phone.trim()) {
        toast.error(t("Phone number is required for individual beneficiaries"));
        return;
      }
    }

    if (beneficiaryType === "business") {
      if (!formData.company_name || !formData.company_name.trim()) {
        toast.error(t("Company name is required for business beneficiaries"));
        return;
      }
      if (!formData.email || !formData.email.trim()) {
        toast.error(t("Email address is required for business beneficiaries"));
        return;
      }
    }

    if (!formData.country_iso_code && !formData.country_name) {
      toast.error(t("Country is required"));
      return;
    }

    if (!formData.city || !formData.city.trim()) {
      toast.error(t("City is required"));
      return;
    }

    if (!formData.address || !formData.address.trim()) {
      toast.error(t("Address is required"));
      return;
    }

    if (!formData.zip_code || !formData.zip_code.trim()) {
      toast.error(t("Postal / Zip code is required"));
      return;
    }

    setLoading(true);

    const countryId = allowedCountries.find(
      (c) => c.country_iso_code === formData.country_iso_code,
    )?._id;

    const payload = {
      beneficiary_type: beneficiaryType,
      first_name:
        beneficiaryType === "individual" ? formData.first_name.trim() : "",
      last_name:
        beneficiaryType === "individual" ? formData.last_name.trim() : "",
      company_name:
        beneficiaryType === "business" ? formData.company_name.trim() : "",
      country_name: formData.country_name,
      country_iso_code: formData.country_iso_code,
      city: formData.city.trim(),
      address: formData.address.trim(),
      zip_code: formData.zip_code.trim(),
      email: formData.email ? formData.email.trim() : "",
      phone: formData.phone ? formData.phone.trim() : "",
      country: countryId,
    };

    try {
      let res;
      if (beneficiaryToEdit?._id) {
        res = await apiWrapper({
          endpoint: `/api/beneficiary/v2/${beneficiaryToEdit._id}`,
          method: "PUT",
          payload,
          isEncrypted: true,
          isDecrypted: true,
        });
        toast.success(t("Beneficiary updated successfully"));
      } else {
        res = await apiWrapper({
          endpoint: "/api/beneficiary/v2/add",
          method: "POST",
          payload,
          isEncrypted: true,
          isDecrypted: true,
        });
        toast.success(t("Beneficiary created successfully"));
      }

      const createdOrUpdated = res?.data || res;
      if (onSaveSuccess) onSaveSuccess(createdOrUpdated, !beneficiaryToEdit);
      handleClose();
    } catch (err) {
      handlePaymentApiError({
        error: err,
        navigate,
        setProfileLockTime,
        fallback: t("Failed to save beneficiary"),
        setError: (message) => toast.error(message),
      });
    } finally {
      setLoading(false);
    }
  };

  const commonInputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "11px",
      background: isMobile ? "#fff" : "#FAF9FD",
      border: isMobile ? "1px solid #1412201F" : "1px solid #ECE9F5",
      transition: "all 0.2s ease-in-out",
      boxShadow: isMobile ? "0px 1px 2px 0px #1412200D" : "none",
      "& fieldset": { border: "none" },
      "&:hover": { borderColor: "#D1C9E9" },
      "&.Mui-focused": { border: "1px solid #4F46E5", background: "#FFFFFF" },
    },
    "& .MuiOutlinedInput-input": {
      padding: "11px 13px",
      fontSize: "14px",
      color: "#101828",
    },
  };

  const getBeneficiaryTypeButtonStyle = (type) => ({
    flex: 1,
    padding: "8px 12px",
    borderRadius: isMobile ? "10px" : "8px",
    border: "none",
    background:
      beneficiaryType === type
        ? isMobile
          ? "#7040FF"
          : "#FFFFFF"
        : "transparent",
    color:
      beneficiaryType === type
        ? isMobile
          ? "white"
          : "#4F46E5"
        : isMobile
          ? "#65627A"
          : "#6B7280",
    fontWeight: isMobile ? 600 : beneficiaryType === type ? 600 : 500,
    fontSize: isMobile ? "13px" : "14px",
    cursor: beneficiaryToEdit ? "not-allowed" : "pointer",
    boxShadow: beneficiaryType === type ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  });

  const labelStyle = {
    display: "block",
    fontSize: isMobile ? "10px" : "13px",
    fontWeight: isMobile ? 600 : 500,
    color: isMobile ? "#9793A8" : "#374151",
    marginBottom: "6px",
    letterSpacing: isMobile ? "1.1px" : "normal",
    textTransform: isMobile ? "uppercase" : "none",
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-beneficiary-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: { xs: "90%", sm: 540 },
          maxHeight: "90vh",
          bgcolor: "#FFFFFF",
          borderRadius: "20px",
          p: 0,
          boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.12)",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "15px 20px" : "20px 24px",
            borderBottom: "1px solid #F3F4F6",
            flexShrink: 0,
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                minWidth: "40px",
                minHeight: "40px",
                borderRadius: "12px",
                background: isMobile ? "#7040FF" : "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isMobile ? "white" : "#4F46E5",
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {beneficiaryToEdit
                  ? t("Edit Beneficiary")
                  : t("Add Beneficiary")}
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: isMobile ? "12px" : "13px",
                  color: isMobile ? "#65627A" : "#6B7280",
                }}
              >
                {t("Step 1: Enter recipient personal or company details")}
              </p>
            </div>
          </div>
          <IconButton
            onClick={handleClose}
            size="small"
            style={{ color: "#9CA3AF" }}
          >
            <X size={18} />
          </IconButton>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                background: isMobile ? "#F3F3F7" : "#F3F4F6",
                padding: "4px",
                borderRadius: isMobile ? "13px" : "12px",
                marginBottom: isMobile ? "15px" : "20px",
                opacity: beneficiaryToEdit ? 0.6 : 1,
                pointerEvents: beneficiaryToEdit ? "none" : "auto",
              }}
            >
              <button
                type="button"
                disabled={!!beneficiaryToEdit}
                onClick={() => setBeneficiaryType("individual")}
                style={getBeneficiaryTypeButtonStyle("individual")}
              >
                {!isMobile && <User size={15} />}
                {t("Individual")}
              </button>
              <button
                type="button"
                disabled={!!beneficiaryToEdit}
                onClick={() => setBeneficiaryType("business")}
                style={getBeneficiaryTypeButtonStyle("business")}
              >
                {!isMobile && <Briefcase size={15} />}
                {t("Business")}
              </button>
            </div>

            {beneficiaryType === "individual" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: isMobile ? "10px" : "14px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label style={labelStyle}>{t("First Name")} *</label>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    required
                    placeholder={t("e.g. Arnold")}
                    value={formData.first_name}
                    onChange={(e) =>
                      handleChange(
                        "first_name",
                        handleNameInput(e.target.value),
                      )
                    }
                    sx={commonInputStyles}
                    onKeyDown={preventEdgeSpaces}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{t("Last Name")} *</label>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    required
                    placeholder={t("e.g. Mbuka")}
                    value={formData.last_name}
                    onChange={(e) =>
                      handleChange("last_name", handleNameInput(e.target.value))
                    }
                    sx={commonInputStyles}
                    onKeyDown={preventEdgeSpaces}
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>{t("Company Name")} *</label>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  required
                  placeholder={t("e.g. System Pay Services Solutions")}
                  value={formData.company_name}
                  onKeyDown={preventEdgeSpaces}
                  onChange={(e) =>
                    handleChange(
                      "company_name",
                      handleNameInput(e.target.value),
                    )
                  }
                  sx={commonInputStyles}
                />
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>{t("Country")} *</label>
              <CountryDropDown
                country={formData.country_iso_code || formData.country_name}
                onSelect={(selected) => {
                  const cName =
                    selected?.country_name ||
                    selected?.name ||
                    selected?.alpha3 ||
                    "";
                  const cCode =
                    selected?.alpha3 || selected?.country_iso_code || "";
                  handleChange("country_name", cName);
                  handleChange("country_iso_code", cCode);
                  handleChange("city", "");
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? "10px" : "14px",
                marginBottom: "14px",
              }}
            >
              <div
                title={
                  isCountryDisabled ? t("Please select country first") : ""
                }
              >
                <label
                  style={{
                    ...labelStyle,
                    color: isCountryDisabled
                      ? "#9CA3AF"
                      : isMobile
                        ? "#9793A8"
                        : "#374151",
                  }}
                >
                  {t("City")} *
                </label>
                <CitiesDropDown
                  userCity={formData.city}
                  setUserCity={(val) => handleChange("city", val)}
                  iso_3={formData.country_iso_code}
                  disabled={isCountryDisabled}
                  title="Select City"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  {t("Email")} {beneficiaryType === "business" ? "*" : ""}
                </label>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="email"
                  required={beneficiaryType === "business"}
                  placeholder="name@example.com"
                  value={formData.email}
                  onKeyDown={preventEmailSpaces}
                  onChange={(e) =>
                    handleChange("email", handleEmailInput(e.target.value))
                  }
                  sx={commonInputStyles}
                />
              </div>
            </div>

            <div
              title={isCountryDisabled ? t("Please select country first") : ""}
              style={{ marginBottom: "14px" }}
            >
              <label
                style={{
                  ...labelStyle,
                  color: isCountryDisabled
                    ? "#9CA3AF"
                    : isMobile
                      ? "#9793A8"
                      : "#374151",
                }}
              >
                {t("Phone Number")}{" "}
                {beneficiaryType === "individual" ? "*" : ""}
              </label>
              <PhoneInput
                key={phoneKey}
                country={formData.country_iso_code || formData.country_name}
                phone={prefillPhoneRef.current}
                disabled={isCountryDisabled}
                setPhone={(val) => handleChange("phone", val)}
                setCountry={(selected) => {
                  const cName =
                    selected?.country_name ||
                    selected?.name ||
                    selected?.alpha3 ||
                    selected?.country_iso_code ||
                    "";
                  const cCode =
                    selected?.alpha3 || selected?.country_iso_code || "";
                  if (cName) handleChange("country_name", cName);
                  if (cCode) handleChange("country_iso_code", cCode);
                }}
                inputStyles={
                  isMobile
                    ? {
                        width: "100%",
                        fontWeight: 500,
                      }
                    : {}
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>{t("Address")} *</label>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  required
                  placeholder={t("Street address, building, suite")}
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  sx={commonInputStyles}
                />
              </div>
              <div>
                <label style={labelStyle}>{t("Postal / Zip Code")} *</label>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  required
                  placeholder={t("e.g. 10001")}
                  value={formData.zip_code}
                  onChange={(e) => handleChange("zip_code", e.target.value)}
                  sx={commonInputStyles}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              padding: "16px 24px",
              borderTop: "1px solid #F3F4F6",
              background: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: isMobile ? "7px 20px" : "10px 18px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                color: "#374151",
                fontWeight: 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: isMobile ? "7px 20px" : "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: loading
                  ? "#9CA3AF"
                  : isMobile
                    ? "#7040FF"
                    : "#4F46E5",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
                height: isMobile ? "fit-content" : "auto",
              }}
            >
              {loading
                ? t("Saving...")
                : beneficiaryToEdit
                  ? t("Update Beneficiary")
                  : t("Next")}
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default AddBeneficiaryModal;
