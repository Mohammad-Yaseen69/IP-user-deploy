import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "react-feather";
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from "reactstrap";
import InstaPayLoader from "../Loader";
import { t } from "i18next";

const Dropzone = ({ file, setFile, setFileType, pAddress, tempFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [temp, setTemp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(0);

  useEffect(() => {
    if (tempFile) {
      setTemp(tempFile);
    }
  }, [tempFile]);
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    setIsUploading(10);
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile.size > 1024 * 1024 * 1024) {
      // Show modal if file size exceeds 20MB
      setShowModal(true);
      return;
    }

    setFile(droppedFile);
    if (setFileType) {
      setFileType(droppedFile?.type?.split("/")[0]);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTemp(reader.result);
      setIsUploading(100);
    };
    reader.readAsDataURL(droppedFile);
  };

  const handleFileChange = (e) => {
    setIsUploading(10);
    const selectedFile = e.target.files[0];

    if (selectedFile.size > 1024 * 1024 * 1024) {
      // Show modal if file size exceeds 20MB
      setShowModal(true);
      setIsUploading(100);
      return;
    }

    setFile(selectedFile);
    if (setFileType) {
      setFileType(selectedFile?.type?.split("/")[0]);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTemp(reader.result);
      setIsUploading(100);
    };
    reader.readAsDataURL(selectedFile);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div
      className="dropzone"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        background: "rgba(255, 217, 100, 0.10)",
        border: "3px dashed #d6a30a",
        borderRadius: "23px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
        height: pAddress ? "250px" : "200px",
      }}
      onClick={() => {
        if (inputRef.current) {
          inputRef.current.click();
        }
      }}
    >
      {temp && file ? (
        <>
          {file?.type?.includes("video") ? (
            <video
              src={temp}
              controls
              alt="video"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : file?.type?.includes("image") ? (
            <img
              src={temp}
              alt="image"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : file?.type?.includes("audio") ? (
            <audio
              src={temp}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              controls={true}
            ></audio>
          ) : (
            <div
              style={{
                fontSize: ".9rem",
                textAlign: "center",
                maxWidth: "30ch",
                margin: "0 auto",
              }}
            >
              {file?.name} {t("has been selected")}.
            </div>
          )}
        </>
      ) : (
        <>
          {isUploading > 0 && isUploading < 100 ? (
            // <div className="d-flex justify-content-center align-items-center vh-100">
            //     <div className="spinner-grow text-primary" role="status">
            //         <span className="sr-only">Loading...</span>
            //     </div>
            // </div>
            <InstaPayLoader />
          ) : (
            <div style={{ position: "relative", pointerEvents: "none" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="54"
                height="54"
                viewBox="0 0 54 54"
                fill="none"
              >
                <rect
                  x="0.0625"
                  width="53.3617"
                  height="53.3617"
                  rx="12.8746"
                  fill="#787878"
                  fill-opacity="0.1"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M36.3295 17.7593H39.6218C41.7141 17.7593 43.4101 19.4554 43.4101 21.5476V34.9201C43.4101 37.0123 41.7141 38.7084 39.6218 38.7084H15.5148C13.4226 38.7084 11.7266 37.0123 11.7266 34.9201V21.5476C11.7266 19.4554 13.4226 17.7593 15.5148 17.7593H18.8106L20.6462 15.0042C21.3505 13.9645 22.5243 13.3416 23.7801 13.3408H31.3566C32.6124 13.3416 33.7861 13.9646 34.4905 15.0042L36.3295 17.7593ZM19.0379 27.0785C19.0379 31.7897 22.8571 35.6089 27.5683 35.6089C32.2772 35.6032 36.0931 31.7873 36.0987 27.0785C36.0987 22.3672 32.2796 18.548 27.5683 18.548C22.8571 18.548 19.0379 22.3672 19.0379 27.0785ZM39.0191 23.0939C39.0605 23.0962 39.1019 23.0962 39.1433 23.0939C39.7605 23.0596 40.2331 22.5315 40.1987 21.9143C40.1644 21.2971 39.6363 20.8245 39.0191 20.8588H37.6416C37.0722 20.8904 36.6177 21.345 36.5861 21.9143C36.5518 22.5315 37.0243 23.0596 37.6416 23.0939H39.0191ZM22.8579 27.0778C22.8579 24.4549 24.9841 22.3287 27.607 22.3287C30.229 22.3306 32.3542 24.4558 32.3561 27.0778C32.3561 29.7006 30.2298 31.8269 27.607 31.8269C24.9841 31.8269 22.8579 29.7006 22.8579 27.0778Z"
                  fill="black"
                />
              </svg>
              <p
                style={{
                  margin: "14px 0",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {pAddress
                  ? t("Click to upload a video")
                  : t("Drag/Drop or Upload a file (Photo/Video/PDF)")}
              </p>
              <p
                style={{
                  margin: "0",
                  color: "#888",
                  display: "flex",
                  alignItems: "center",
                  gap: ".3rem",
                  justifyContent: "center",
                  fontSize: "9px",
                }}
              >
                <AlertTriangle size={12} />
                {t("Max size 1GB")}
              </p>
              <input type="file" value={""} onChange={handleFileChange} hidden ref={inputRef} />
            </div>
          )}
        </>
      )}
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "23px",
          }}
        ></div>
      )}
      <Modal isOpen={showModal} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>{t("File Size Exceeded")}</ModalHeader>
        <ModalBody>
          {t(
            "The selected file exceeds the maximum allowed size of 1GB. Please choose a smaller file",
          )}
          .
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={closeModal}
            style={{
              border: "none",
              outline: "none",
              background: "#5926f0",
            }}
          >
            {t("OK")}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Dropzone;
