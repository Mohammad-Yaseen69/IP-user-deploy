import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, FileText } from "react-feather";
import { useTranslation } from "react-i18next";
import styles from "../style/onboardingSteps.module.css";
import StepProgress from "./StepProgress";
import AlertBox from "./AlertBox";
import RiskProfileCard from "./RiskProfileCard";
import { useMediaQuery } from "@mui/material";

const DOC_TITLE_MAP = {
  commercial_register: "Commercial Register Extract / Certificate of Incorporation",
  articles_association: "Articles of Association",
  authority_letter: "Proof of Legal Representative's Authority",
  good_standing: "Certificate of Good Standing",
  registered_extract: "Register Extract (Proof of Address)",
  domiciliation_certificate: "Certificate of Domiciliation",
  lease_agreement: "Professional Lease Agreement",
  utility_bill: "Utility Bill",
  tax_authority_letter: "Official Letter from an Administration / Tax Authority",
  bank_statement: "Recent Business Bank Statement",
  shareholders_register: "Register of Shareholders / Members",
  ownership_chart: "Group Ownership Structure Chart",
  ubo_declaration: "Signed UBO Declaration Form",
  ubo_passport: "UBO Passport / ID",
  ubo_address_proof: "UBO Proof of Residential Address",
  source_of_funds: "Proof of Source of Funds / Wealth",
  aml_policy: "AML & Compliance Policy Document",
};

const ReviewStep = ({ onSubmit, onBack, allData = {}, onNext, userType, currentStep }) => {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  const company = allData.company || allData.companyDetails || {};
  const activity = allData.activity || {};
  const owners = allData.owners || allData.ownership?.owners || [];
  const rawDocs = allData.documents?.files || allData.documents || {};

  const providedDocs = Object.entries(rawDocs).filter(([_, file]) => {
    if (!file) return false;
    if (typeof file === "object" && (file.name || file instanceof File || file instanceof Blob))
      return true;
    if (typeof file === "string" && file.trim().length > 0) return true;
    return false;
  });

  const handleSubmit = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(allData);
      } else if (onNext) {
        await onNext(allData);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isIndividual = userType === "individual";

  const steps = isIndividual
    ? [
        { num: "01", label: t("Account"), completed: true },
        { num: "02", label: t("Type"), completed: true },
        { num: "03", label: t("Review"), active: true },
      ]
    : [
        { num: "01", label: t("Account"), completed: true },
        { num: "02", label: t("Company"), completed: true },
        { num: "03", label: t("Activity"), completed: true },
        { num: "04", label: t("Ownership"), completed: true },
        { num: "05", label: t("Documents"), completed: true },
        { num: "06", label: t("Review"), active: true },
      ];

  const formatVal = (val) => {
    if (!val) return "—";
    if (Array.isArray(val)) {
      return val.length > 0 ? val.join(", ") : "—";
    }
    if (typeof val === "object") {
      return val.name || val.label || JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className={styles.onboardingLayout}>
      <div>
        <div className={styles.wizardSteps}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.step} ${step.active ? styles.active : ""} ${step.completed ? styles.completed : ""}`}
            >
              <div className={styles.stepLine}></div>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>{step.num}</span>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
        <StepProgress percent={100} currentStep={currentStep} />
      </div>
      <div style={{ width: "100%" }} className={styles.activityHeader}>
        <h2 className={styles.formHeading}>{t("Review your activation request")}</h2>
        <p className={styles.formSubheading}>
          {t(
            "Check everything below before you submit. You can jump back to any step to make changes.",
          )}
        </p>
      </div>

      <div className={styles.mainArea}>
        <div className={styles.summaryWrapper} style={{ width: "100%" }}>
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h4>{t("Company details")}</h4>
              <span className={styles.edit} onClick={() => onBack && onBack("company")}>
                {t("Edit")}
              </span>
            </div>

            <div className={styles.grid}>
              <div className={styles.item}>
                <label>{t("Legal name")}</label>
                <span>{formatVal(company.legalName)}</span>
              </div>

              {company.tradingName && (
                <div className={styles.item}>
                  <label>{t("Trading / Brand name")}</label>
                  <span>{formatVal(company.tradingName)}</span>
                </div>
              )}

              <div className={styles.item}>
                <label>{t("Registration number")}</label>
                <span>{formatVal(company.registrationNumber)}</span>
              </div>

              <div className={styles.item}>
                <label>{t("Jurisdiction / Country")}</label>
                <span>{formatVal(company.countryOfIncorporation)}</span>
              </div>

              {(company.legalStructure || company.legalForm) && (
                <div className={styles.item}>
                  <label>{t("Legal form")}</label>
                  <span>{formatVal(company.legalStructure || company.legalForm)}</span>
                </div>
              )}

              {company.dateOfIncorporation && (
                <div className={styles.item}>
                  <label>{t("Date of incorporation")}</label>
                  <span>{formatVal(company.dateOfIncorporation)}</span>
                </div>
              )}

              {company.taxNumber && (
                <div className={styles.item}>
                  <label>{t("Tax ID / Number")}</label>
                  <span>{formatVal(company.taxNumber)}</span>
                </div>
              )}

              {company.registeredAddress && (
                <div className={styles.item}>
                  <label>{t("Registered address")}</label>
                  <span>{formatVal(company.registeredAddress)}</span>
                </div>
              )}

              {company.website && (
                <div className={styles.item}>
                  <label>{t("Website")}</label>
                  <span>{formatVal(company.website)}</span>
                </div>
              )}

              {company.agent && (
                <div className={styles.item}>
                  <label>{t("Agent")}</label>
                  <span>{formatVal(company.agent)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h4>{t("Activity & intended use")}</h4>
              <span className={styles.edit} onClick={() => onBack && onBack("activity")}>
                {t("Edit")}
              </span>
            </div>

            <div className={styles.grid}>
              <div className={styles.item}>
                <label>{t("Sector / Industry")}</label>
                <span>{formatVal(activity.industry || activity.industryReference?.name)}</span>
              </div>

              {activity.businessDescription && (
                <div className={styles.item}>
                  <label>{t("Business description")}</label>
                  <span>{formatVal(activity.businessDescription)}</span>
                </div>
              )}

              <div className={styles.item}>
                <label>{t("Expected inflow / volume")}</label>
                <span>{formatVal(activity.monthlyVolume)}</span>
              </div>

              <div className={styles.item}>
                <label>{t("Operating countries")}</label>
                <span>{formatVal(activity.countries)}</span>
              </div>

              {activity.currencies && (
                <div className={styles.item}>
                  <label>{t("Currencies")}</label>
                  <span>{formatVal(activity.currencies)}</span>
                </div>
              )}

              {activity.services && (
                <div className={styles.item}>
                  <label>{t("Services required")}</label>
                  <span>{formatVal(activity.services)}</span>
                </div>
              )}

              {activity.paymentRails && (
                <div className={styles.item}>
                  <label>{t("Payment rails")}</label>
                  <span>{formatVal(activity.paymentRails)}</span>
                </div>
              )}

              {activity.purpose && (
                <div className={styles.item}>
                  <label>{t("Account purpose")}</label>
                  <span>{formatVal(activity.purpose)}</span>
                </div>
              )}

              {activity.paymentNature && (
                <div className={styles.item}>
                  <label>{t("Payment nature")}</label>
                  <span>{formatVal(activity.paymentNature)}</span>
                </div>
              )}

              {activity.averageTransaction && (
                <div className={styles.item}>
                  <label>{t("Average transaction")}</label>
                  <span>{formatVal(activity.averageTransaction)} EUR</span>
                </div>
              )}

              {activity.maximumTransaction && (
                <div className={styles.item}>
                  <label>{t("Maximum transaction")}</label>
                  <span>{formatVal(activity.maximumTransaction)} EUR</span>
                </div>
              )}

              {activity.averageBalance && (
                <div className={styles.item}>
                  <label>{t("Average balance")}</label>
                  <span>{formatVal(activity.averageBalance)} EUR</span>
                </div>
              )}

              {activity.incomingPayments && (
                <div className={styles.item}>
                  <label>{t("Incoming payments / month")}</label>
                  <span>{formatVal(activity.incomingPayments)} EUR</span>
                </div>
              )}

              {activity.outgoingPayments && (
                <div className={styles.item}>
                  <label>{t("Outgoing payments / month")}</label>
                  <span>{formatVal(activity.outgoingPayments)} EUR</span>
                </div>
              )}

              {activity.originCountries && (
                <div className={styles.item}>
                  <label>{t("Origin countries")}</label>
                  <span>{formatVal(activity.originCountries)}</span>
                </div>
              )}

              {activity.destinationCountries && (
                <div className={styles.item}>
                  <label>{t("Destination countries")}</label>
                  <span>{formatVal(activity.destinationCountries)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h4>{t("Ownership & control")}</h4>
              <span className={styles.edit} onClick={() => onBack && onBack("ownership")}>
                {t("Edit")}
              </span>
            </div>

            {owners && owners.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {owners.map((o, idx) => (
                  <div
                    key={o.id || idx}
                    style={{
                      padding: "12px 14px",
                      background: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <strong style={{ fontSize: "13px", color: "#111827" }}>
                        {o.fullName || o.name || t("Partner / Owner")}
                      </strong>
                      <span
                        style={{
                          fontSize: "11px",
                          background: "#EEF2FF",
                          color: "#4F46E5",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {o.ownershipPercent
                          ? `${o.ownershipPercent}% ${t("Ownership")}`
                          : t("Signatory")}
                      </span>
                    </div>
                    <div className={styles.grid} style={{ columnGap: "24px", rowGap: "8px" }}>
                      <div className={styles.item}>
                        <label>{t("Role")}</label>
                        <span>{o.role || "Director / UBO"}</span>
                      </div>
                      {o.email && (
                        <div className={styles.item}>
                          <label>{t("Email")}</label>
                          <span>{o.email}</span>
                        </div>
                      )}
                      <div className={styles.item}>
                        <label>{t("PEP Status")}</label>
                        <span>{o.isPep || o.pep ? t("Yes (PEP)") : t("No")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.grid}>
                <div className={styles.item}>
                  <label>{t("Owners")}</label>
                  <span>{t("None specified")}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h4>{t("Documents")}</h4>
              <span className={styles.edit} onClick={() => onBack && onBack("documents")}>
                {t("Edit")}
              </span>
            </div>

            {providedDocs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className={styles.item} style={{ marginBottom: "6px" }}>
                  <label>{t("Provided documents")}</label>
                  <span style={{ fontWeight: 600 }}>
                    {providedDocs.length} {t("document(s) attached")}
                  </span>
                </div>
                {!isMobile &&
                  providedDocs.map(([key, file]) => {
                    const title =
                      DOC_TITLE_MAP[key] ||
                      t(key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
                    const fileName =
                      typeof file === "object" && file?.name ? file.name : String(file);
                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "#F9FAFB",
                          borderRadius: "6px",
                          border: "1px solid #F3F4F6",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <FileText size={14} color="#6D4EFF" />
                          <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>
                            {title}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#059669",
                            background: "#ECFDF5",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontWeight: 500,
                          }}
                        >
                          {fileName}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className={styles.grid}>
                <div className={styles.item}>
                  <label>{t("Provided")}</label>
                  <span>{t("0 documents attached")}</span>
                </div>
              </div>
            )}
          </div>

          {isMobile ? (
            <AlertBox
              icon={<AlertCircle size={12} color="#5926F0" />}
              description={
                "You won't be charged now. There's no pricing to accept at this stage, our team confirms your eligibility and sends a personalized offer with the applicable terms and next steps."
              }
            />
          ) : (
            <div className={styles.infoBox}>
              <span className={styles.infoIcon}>
                <AlertCircle color="white" size={15} />
              </span>
              <p>
                {t(
                  "You won't be charged now. There's no pricing to accept at this stage, our team confirms your eligibility and sends a personalized offer with the applicable terms and next steps.",
                )}
              </p>
            </div>
          )}
          <RiskProfileCard variant="inline" />
          <div className={styles.confirmRow} onClick={() => setAgreed(!agreed)}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>
              {t(
                "I confirm the information provided is true and complete, and I authorise InstaPay to carry out KYB, AML, sanctions, PEP and adverse-media checks. I understand submission does not guarantee approval.",
              )}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.navigationFooter}>
        <button onClick={() => onBack && onBack()} className={styles.backButton}>
          <ArrowLeft size={16} />
          {t("Back")}
        </button>
        <button
          className={styles.continueButton}
          disabled={!agreed || submitting}
          onClick={handleSubmit}
          style={{
            opacity: agreed && !submitting ? 1 : 0.6,
            cursor: agreed && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? t("Submitting...") : t("Request IBAN activation")}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
