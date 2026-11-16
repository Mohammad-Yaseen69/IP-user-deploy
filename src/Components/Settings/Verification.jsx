import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  Badge,
} from "reactstrap";
import { H4 } from "../../AbstractElements";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import { useTranslation } from "react-i18next";
import VerificationAlert from "./VerificationAlert";
import VerificationPayment from "./VerificationPayment";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle, XCircle } from "react-feather";
import { toast } from "react-toastify";
import VerificationGuide from "./VerificationGuide";
import errors from "../AddFunds/TrustPaymentErrors.json";
import { AiOutlineClockCircle } from "react-icons/ai";
import { logger } from "@sentry/react";
import { useMutation } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import AdditionalFilesSection from "./AdditionalFilesSection";
import { useIdempotency } from "../../hooks/Payments/useIdempotency";

const industries = [
  "Arts & Entertainment",
  "Banking & Finance",
  "Education & Research",
  "Engineering & Construction",
  "Healthcare & Medicine",
  "Information Technology & Services",
  "Legal & Compliance",
  "Manufacturing & Production",
  "Marketing & Sales",
  "Non-profit & Charity",
  "Real Estate & Property",
  "Retail & Wholesale",
  "Science & Pharmaceuticals",
  "Transport & Logistics",
  "Travel & Tourism",
  "Unemployed",
  "Other",
];

export const sourceOfFunds = ["Cash", "Business", "Gift", "Salary", "Lottery", "Savings", "Other"];

const getApiErrorMessage = (error) => {
  try {
    return decryptData(error?.response?.data?.data)?.message;
  } catch {
    return undefined;
  }
};

const Verification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userDetails, authHeader, verifyToken } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [occupation, setOccupation] = useState("");
  const [sourceOfFund, setSourceOfFund] = useState("");
  const [occupationOther, setOccupationOther] = useState("");
  const [loading, setLoading] = useState(false);
  const { getKey } = useIdempotency();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: `/api/user/update-kyc-details`,
        method: "PUT",
        payload,
        isEncrypted: true,
        idempotencyKey: getKey(),
      }),
  });

  const isVerificationButtonHidden =
    userDetails?.user?.kyc_status === "approved" ||
    userDetails?.user?.kyc_status === "needs-review" ||
    userDetails?.paypal_transaction === "processing";

  useEffect(() => {
    setMessage(userDetails?.user?.desc ?? "");
    setOccupation(userDetails?.user?.occupation ?? "");
    setSourceOfFund(userDetails?.user?.source_of_funds ?? "");
  }, [userDetails]);

  console.log(userDetails);

  const handleVerify = async () => {
    setLoading(true);
    const postData = {
      first_name: userDetails?.user?.first_name,
      last_name: userDetails?.user?.last_name,
      address: userDetails?.address ?? "N/A",
      dob: userDetails?.dob?.split("-")?.reverse()?.join("-"),
      nationality: userDetails?.country_iso_code,
      language_code: userDetails?.language ?? "en",
    };

    // console.log(postData);
    const encrypted = encryptData(postData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/user/verification-1/user_${userDetails?.user?._id}`,
        { data: encrypted },
        { headers: authHeader },
      );

      const decrypted = decryptData(response.data.data);
      if (decrypted?.status) {
        const verificationLink = decryptData(response.data.data)?.tokenized_link;
        const newWindow = window.open(verificationLink, "_blank");

        if (!newWindow || newWindow.closed || typeof newWindow.closed == "undefined") {
          window.location.href = verificationLink;
        }
      }

      // console.log("try ran in handlesend");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) ||
          t("We cannot process your request at the moment, please try again later."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    // const isChanged =
    //     message !== (userDetails?.user?.desc || "") ||
    //     occupation !== (userDetails?.user?.occupation || "") ||
    //     sourceOfFund !== (userDetails?.user?.source_of_funds || "");
    let paymentRequired = true;

    try {
      const response = await mutateAsync({
        account_id: userDetails?._id,
        occupation: occupation === "Other" ? occupationOther : occupation,
        desc: message,
        source_of_funds: sourceOfFund,
      });

      console.log(response, "response from api");
      if (response.isPaymentRequired === false) {
        paymentRequired = false;
      }

      await verifyToken(true);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) ||
          t("We are unable to process your request at the moment. Please try again later."),
      );
      return;
    }

    if (userDetails?.kyc_verification_paid || !paymentRequired) {
      handleVerify();
    } else {
      setShowVerificationModal(true);
    }
  };

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");
  const code = queryParams.get("code");
  const payment_through = queryParams.get("payment_through");
  const refreshData = queryParams.get("refreshData");
  const ft = queryParams.get("ft");
  const scroll = queryParams.get("scroll");
  const [statusModal, setStatusModal] = useState(false);
  const [processing, setProcessing] = useState("");
  const [showRefreshScreen, setShowRefreshScreen] = useState(refreshData === "true");

  useEffect(() => {
    if (scroll === "additional-files") {
      setTimeout(() => {
        const element = document.getElementById("additional-files-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
    }
  }, [scroll, userDetails]);

  useEffect(() => {
    if (refreshData) {
      // Remove refreshData from URL on initial load
      const url = new URL(window.location.href);
      url.searchParams.delete("refreshData");
      window.history.replaceState({}, "", url.toString());
      setShowRefreshScreen(true);
    }
  }, [refreshData]);

  useEffect(() => {
    const updateProcessingCheck = async () => {
      const data = {
        paypal_transaction: "processing",
      };

      const res = await axios.put(
        `${import.meta.env.VITE_IP_DEV_API}/api/account/update-${userDetails?.account_type}/${userDetails?._id}`,
        { data: encryptData(data) },
        {
          headers: authHeader,
        },
      );

      console.log(decryptData(res.data.data));
    };

    if (
      status?.toLowerCase() === "success" &&
      !userDetails?.kyc_verification_paid &&
      userDetails?.user?.kyc_status !== "approved" &&
      userDetails?.user?.kyc_status !== "verified"
    ) {
      if (userDetails?.paypal_transaction !== "processing" && payment_through === "paypal") {
        updateProcessingCheck();
        setProcessing("processing");
      }
    }
  }, [status, userDetails]);

  const clearStatus = () => {
    setStatusModal("");
    navigate(
      {
        pathname: location.pathname,
        search: "?tab=verification",
      },
      { replace: true },
    );
  };

  useEffect(() => {
    setProcessing(userDetails?.paypal_transaction);

    if (status) {
      if (
        userDetails?.user?.kyc_status !== "approved" &&
        userDetails?.user?.kyc_status !== "verified"
      ) {
        setStatusModal(status?.toLowerCase());
      } else {
        clearStatus();
      }
    }
  }, [status, userDetails]);

  const [showGuide, setShowGuide] = useState(true);

  useLayoutEffect(() => {
    if (
      userDetails?.user?.kyc_status === "approved" ||
      userDetails?.user?.kyc_status === "needs-review" ||
      userDetails?.user?.kyc_status === "processing" ||
      userDetails?.paypal_transaction === "processing" ||
      !status
    ) {
      setShowGuide(false);
    }
  }, [userDetails, status]);

  const error_message = () => {
    return (
      errors.find((item) => item?.code == code)?.message ??
      "We cannot process your request at the moment, please try again later."
    );
  };

  if (showRefreshScreen) {
    return (
      <div
        style={{
          // width: "100vw",
          // height: "100vh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <AiOutlineClockCircle size={80} className="text-warning" />
        <h2
          style={{
            color: "#1a1a1a",
            fontWeight: 600,
            textAlign: "center",
            maxWidth: "500px",
            lineHeight: 1.4,
          }}
        >
          {t("Your KYC Verification is currently being processed")}
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: "1rem",
            textAlign: "center",
            maxWidth: "400px",
            lineHeight: 1.6,
          }}
        >
          {t(
            "Please refresh the page to get the latest verification status. This may take a few moments.",
          )}
        </p>
        <Button
          style={{
            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
            border: "none",
            outline: "none",
            borderRadius: "10px",
            padding: "12px 32px",
            fontSize: "1rem",
            fontWeight: 500,
            marginTop: "0.5rem",
          }}
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete("refreshData");
            window.location.href = url.toString();
          }}
        >
          {t("Refresh Page")}
        </Button>
      </div>
    );
  }

  return (
    <Card id="verification">
      {showGuide && (
        <Modal isOpen={showGuide} style={{ width: "100vw", maxWidth: "1200px" }}>
          <ModalHeader
            toggle={() => {
              setShowGuide(false);
            }}
          >
            {t("Identity Verification Guide")}
          </ModalHeader>
          <ModalBody style={{ padding: 0 }}>
            <VerificationGuide setShowGuide={setShowGuide} />
          </ModalBody>
        </Modal>
      )}
      {statusModal && (
        <Modal isOpen={statusModal} toggle={clearStatus}>
          <ModalBody>
            {processing === "processing" ? (
              <h5
                className="modal-title"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <AiOutlineClockCircle size={64} className="text-warning" />
                {t("Payment is in Processing!")}
              </h5>
            ) : statusModal === "success" ? (
              <h5
                className="modal-title"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <CheckCircle size={64} className="text-success" />
                {t("Payment Successful!")}
              </h5>
            ) : (
              <h5
                className="modal-title"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <XCircle size={64} className="text-danger" />
                {t("Payment Failed!")}
              </h5>
            )}
            <div className="text-center">
              {processing === "processing" ? (
                <p className="mb-0">
                  {t(
                    "Your payment is being processed. Please wait or refresh the page for updates",
                  )}
                </p>
              ) : statusModal === "success" ? (
                <p className="mb-0">
                  {t("KYC Fee has been paid successfully!")}
                  <span
                    style={{
                      color: "#5926f0",
                      fontWeight: 600,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (userDetails?.kyc_verification_paid) {
                        handleVerify();
                      }
                      clearStatus();
                    }}
                  >
                    {t("Continue")}
                  </span>
                </p>
              ) : (
                <p className="mb-0">
                  {t(error_message())} <br />{" "}
                  <span
                    style={{
                      color: "#5926f0",
                      fontWeight: 600,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowVerificationModal(true);
                      clearStatus();
                    }}
                  >
                    {t("Start again!")}
                  </span>
                </p>
              )}
            </div>
          </ModalBody>
        </Modal>
      )}
      <CardHeader className={`pb-0 expanded`}>
        <div>
          <H4 attrH4={{ className: "card-title mb-0" }}>{t("Identity Verification")}</H4>
          {/* {
                                    userDetails &&
                                        (
                                            !userDetails?.user?.kyc_status
                                            ||
                                            userDetails?.user?.kyc_status !== "approved"
                                        )
                                        ? */}
          <p
            style={{
              marginTop: ".5rem",
              color: "black",
              fontWeight: "300",
              display: "flex",
              gap: ".75rem",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowGuide(true);
            }}
          >
            {/* {
                                                userDetails?.user?.kyc_status === "declined"
                                                    ?
                                                    // <VerificationAlert />
                                                    ""
                                                    :
                                                    <>
                                                        {t("Verify Your Identity")}
                                                    </>
                                            } */}
            {t("View Identity Verification Guide")}
          </p>
          {/* :
                                        <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("Identity Verified.")}</p>
                                } */}
        </div>
      </CardHeader>
      <div className={`accordion-body expanded`}>
        <CardBody>
          <Col
            md="12"
            className="mb-4"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5>{t("Identity Verification Status:")} </h5>
            <h5
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                color:
                  userDetails?.user?.kyc_status === "approved"
                    ? "green"
                    : userDetails?.user?.kyc_status === "declined"
                      ? "red"
                      : userDetails?.user?.kyc_status === "needs-review"
                        ? "orange"
                        : "red",
              }}
            >
              {userDetails?.user?.kyc_status === "declined" ? <VerificationAlert /> : ""}
              {`${
                userDetails?.user?.kyc_status === "approved"
                  ? t("Verified")
                  : userDetails?.user?.kyc_status === "declined"
                    ? t("Declined")
                    : userDetails?.user?.kyc_status === "needs-review"
                      ? t("Under Review")
                      : userDetails?.user?.kyc_status === "initiated"
                        ? t("Initiated")
                        : userDetails?.user?.kyc_status === "processing"
                          ? t("Processing")
                          : t("Unverified")
              }`}
            </h5>
          </Col>
          <Col md="12" className="mb-4">
            <div>
              <Label className="form-label">
                {t("Briefly describe yourself and explain your reasons for using InstaPay.")}
              </Label>
              <Input
                type="textarea"
                className="form-control"
                rows="5"
                placeholder={t("Enter Your Message")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isVerificationButtonHidden}
              />
            </div>
          </Col>
          <Col md="12" className="mb-4">
            <div>
              <Label className="form-label">{t("Select Occupation")}</Label>
              <Input
                type="select"
                className="form-control"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                disabled={isVerificationButtonHidden}
              >
                <option value="" disabled="">
                  {t("Select")}
                </option>
                {industries.map((item) => (
                  <option value={item} key={item}>
                    {t(item)}
                  </option>
                ))}
                {occupationOther && <option value={occupationOther}>{occupationOther}</option>}
              </Input>
              {occupation === "Other" && (
                <Input
                  type="text"
                  value={occupationOther}
                  onChange={(e) => setOccupationOther(e.target.value)}
                  placeholder="Enter your occupation"
                />
              )}
            </div>
          </Col>
          <Col md="12" className="mb-4">
            <div>
              <Label className="form-label">{t("Select Source Of Fund")}</Label>
              <Input
                type="select"
                className="form-control"
                disabled={isVerificationButtonHidden}
                value={sourceOfFund}
                onChange={(e) => setSourceOfFund(e.target.value)}
              >
                <option value="" disabled="">
                  {t("Select")}
                </option>
                {sourceOfFunds.map((item) => (
                  <option value={item.toUpperCase()}>{t(item)}</option>
                ))}
              </Input>
            </div>
          </Col>
          <Col md="12" className="mb-4">
            <h4 style={{ fontSize: "18px" }}>{t("Identity Verification")}:</h4>
            <p>
              {t(
                "It must be a government-issued identification document with a photo. All identification documents must be written in the Latin alphabet. If not, a certified \ntranslation is required.",
              )}
            </p>
          </Col>
          <Col md="12" className="mb-4">
            <p style={{ marginBottom: 0, fontSize: "110%" }}>{t("Accepted Documents")}:</p>
            <ul style={{ listStyleType: "initial", paddingLeft: "1rem" }}>
              <li>{t("A national identity card")}</li>
              <li>{t("A valid passport")}</li>
              <li>
                {t(
                  "Valid residence permits (accepted only if issued by a European country or in Switzerland)",
                )}
              </li>
              <li>{t("Biometric Facial Recognition: Comparing video with passport photograph")}</li>
            </ul>
          </Col>
          <Col md="12" className="mb-4">
            <h4 style={{ fontSize: "18px" }}>{t("Address Verification:")}</h4>
            <ul style={{ listStyleType: "initial", paddingLeft: "1rem" }}>
              <li>
                {t(
                  "Provide a bank statement or utility bill (less than 3 months old) as proof of address",
                )}
              </li>
            </ul>
          </Col>
          <Col md="12" className="mb-4">
            <h4 style={{ fontSize: "18px" }}>{t("Additional Documents:")}</h4>
            <p>
              {t(
                "Kemit Kingdom reserves the right to request any additional documents (Enhanced Due Diligence - EDD) or further information necessary for conducting thorough \nverifications, in accordance with its legal obligations.",
              )}
            </p>
          </Col>
          {userDetails?.user?.kyc_additional_file?.filter(
            (file) => file?.purpose !== "mastercard_kyc",
          )?.length > 0 && (
            <AdditionalFilesSection
              files={userDetails.user.kyc_additional_file?.filter(
                (file) => file?.purpose !== "mastercard_kyc",
              )}
              userId={userDetails?._id}
              uploadEndpoint={`${import.meta.env.VITE_IP_DEV_API}/api/user/upload-additional-file/${userDetails?._id}`}
              authHeader={authHeader}
              verifyToken={verifyToken}
            />
          )}
          <Col className="mb-4" style={{ display: "flex", justifyContent: "flex-end" }}>
            {userDetails?.user?.kyc_status !== "approved" &&
            userDetails?.user?.kyc_status !== "needs-review" &&
            userDetails?.paypal_transaction !== "processing" ? (
              <Button
                style={{
                  background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                  border: "none",
                  outline: "none",
                  borderRadius: "10px",
                }}
                disabled={
                  loading ||
                  isPending ||
                  !message ||
                  !(occupation === "Other" ? occupationOther : occupation) ||
                  !(
                    userDetails?.user?.kyc_status !== "declined" ||
                    userDetails?.user?.kyc_status !== "unverified"
                  )
                }
                onClick={() => {
                  logger.info(
                    `User ${userDetails?.first_name || userDetails?.company_name} ${userDetails?.last_name} clicked on start verification his status is ${userDetails?.user?.kyc_status} and paid status is ${userDetails?.kyc_verification_paid}`,
                  );
                  handleStartVerification();
                }}
              >
                {t("Start Verification")}
              </Button>
            ) : (
              ""
            )}
          </Col>
        </CardBody>
        <VerificationPayment
          loading={loading}
          isOpen={showVerificationModal}
          toggle={() => setShowVerificationModal(!showVerificationModal)}
          verify={handleVerify}
          desc={message}
          occupation={occupation === "Other" ? occupationOther : occupation}
          source_of_funds={sourceOfFund}
        />
      </div>
    </Card>
  );
};

export default Verification;
