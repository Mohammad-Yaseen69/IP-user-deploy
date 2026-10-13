import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadCloud, Camera, RefreshCw, Trash2 } from "react-feather";
import selfieIllustration from "./files/selfie_with_id.png";
import { ButtonForRequests } from "../ReceiptInvoices/UI/FormElements";

const SelfieModal = ({ isOpen, toggle, onUploadSuccess }) => {
  const { t } = useTranslation();
  const { authHeader } = useContext(UserContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'upload' or 'capture'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setUploadType("upload");
    }
  };

  useEffect(() => {
    if (isCapturing && !streamRef.current) {
      const initCamera = async () => {
        try {
          const isMobile = window.innerWidth < 768;
          const constraints = {
            video: {
              facingMode: "user",
              width: { ideal: isMobile ? 720 : 1280 },
              height: { ideal: isMobile ? 1280 : 720 },
              aspectRatio: { ideal: isMobile ? 9 / 16 : 16 / 9 },
            },
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        } catch (err) {
          toast.error(t("Could not access camera. Please check permissions."));
          console.error("Camera error:", err);
          setIsCapturing(false);
          setUploadType(null);
        }
      };
      initCamera();
    }

    return () => {
      if (!isCapturing && streamRef.current) {
        stopCamera();
      }
    };
  }, [isCapturing]);

  const startCamera = () => {
    setUploadType("capture");
    setIsCapturing(true);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const capturedFile = new File([blob], "selfie.jpg", {
            type: "image/jpeg",
          });
          setFile(capturedFile);
          setPreview(URL.createObjectURL(capturedFile));
          setUploadType("capture");
          stopCamera();
        },
        "image/jpeg",
        0.95,
      );
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setUploadType(null);
    stopCamera();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t("Please select or capture an image first"));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "selfie_with_id");

      await axios.post(
        `${import.meta.env.VITE_IP_DEV_API}/api/mastercard/upload-mastercard-kyc-file`,
        formData,
        { headers: authHeader },
      );

      toast.success(t("Selfie uploaded successfully"));
      onUploadSuccess();
      handleToggle();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          t("Failed to upload selfie. Please try again."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggle = () => {
    stopCamera();
    handleRemove();
    toggle();
  };

  return (
    <Modal
      toggle={handleToggle}
      isOpen={isOpen}
      centered
      backdrop="static"
      size="md"
    >
      <ModalHeader
        toggle={handleToggle}
        style={{ borderBottom: "none", paddingBottom: "0" }}
      >
        <div
          style={{ fontWeight: "700", fontSize: "1.25rem", color: "#1e293b" }}
        >
          {t("Additional Document for Your Mastercard")}
        </div>
      </ModalHeader>
      <ModalBody style={{ padding: "1.5rem" }}>
        {!isCapturing && !preview && (
          <div className="text-center mb-4">
            <img
              src={selfieIllustration}
              alt="Selfie Instructions"
              style={{
                maxWidth: "160px",
                height: "auto",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginTop: "15px",
                lineHeight: "1.5",
              }}
            >
              {t(
                "Please upload a clear selfie of yourself holding your ID card next to your face. Face and ID details must be clearly visible.",
              )}
            </p>
          </div>
        )}

        <div className="upload-section">
          <input
            type="file"
            id="selfie-upload-input"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {!isCapturing && !preview ? (
            <div style={{ display: "flex", gap: "15px" }}>
              <div
                style={{
                  flex: 1,
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() =>
                  document.getElementById("selfie-upload-input").click()
                }
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#5926f0")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.borderColor = "#cbd5e1")
                }
              >
                <div style={{ color: "#5926f0", marginBottom: "8px" }}>
                  <UploadCloud size={32} />
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "14px",
                  }}
                >
                  {t("Upload")}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  border: "2px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={startCamera}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#5926f0")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.borderColor = "#cbd5e1")
                }
              >
                <div style={{ color: "#5926f0", marginBottom: "8px" }}>
                  <Camera size={32} />
                </div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "14px",
                  }}
                >
                  {t("Capture")}
                </div>
              </div>
            </div>
          ) : isCapturing ? (
            <div
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#000",
                height: window.innerWidth < 768 ? "500px" : "450px",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "0",
                  right: "0",
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <Button
                  color="danger"
                  size="sm"
                  onClick={stopCamera}
                  style={{ borderRadius: "20px", padding: "5px 15px" }}
                >
                  {t("Cancel")}
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={captureImage}
                  style={{
                    borderRadius: "20px",
                    padding: "5px 20px",
                    backgroundColor: "#5926f0",
                    border: "none",
                  }}
                >
                  <Camera size={16} className="me-2" />
                  {t("Take Photo")}
                </Button>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  height: window.innerWidth < 768 ? "500px" : "450px",
                }}
              >
                <img
                  src={preview}
                  alt="Selfie Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <ButtonForRequests
                  style={{
                    flex: 1,
                    borderRadius: "8px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    border: "1px solid #80808066",
                    background: "white",
                    color: "black",
                  }}
                  onClick={handleRemove}
                >
                  <Trash2 size={14} />
                  {t("Remove")}
                </ButtonForRequests>

                {uploadType === "capture" ? (
                  <ButtonForRequests
                    style={{
                      flex: 1,
                      borderRadius: "8px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      border: "none",
                    }}
                    onClick={startCamera}
                  >
                    <RefreshCw size={14} />
                    {t("Retake")}
                  </ButtonForRequests>
                ) : (
                  <ButtonForRequests
                    style={{
                      flex: 1,
                      borderRadius: "8px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      border: "none",
                    }}
                    onClick={() =>
                      document.getElementById("selfie-upload-input").click()
                    }
                  >
                    <RefreshCw size={14} />
                    {t("Reupload")}
                  </ButtonForRequests>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter style={{ borderTop: "none", paddingTop: "1rem" }}>
        <Button
          color="link"
          onClick={handleToggle}
          style={{ color: "#64748b", textDecoration: "none" }}
          disabled={isUploading}
        >
          {t("Cancel")}
        </Button>
        <ButtonForRequests
          onClick={handleUpload}
          disabled={isUploading || !file || isCapturing}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "10px 25px",
            fontWeight: "600",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(89, 38, 240, 0.2)",
          }}
        >
          {isUploading ? t("Uploading...") : t("Submit Document")}
        </ButtonForRequests>
      </ModalFooter>
    </Modal>
  );
};

export default SelfieModal;
