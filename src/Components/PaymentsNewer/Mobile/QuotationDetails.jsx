import { useContext, useEffect, useState } from "react";
import { Plus, Trash2 } from "react-feather";
import { useTranslation } from "react-i18next";
import { FaRegFilePdf, FaRegFileVideo } from "react-icons/fa";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { UserContext } from "../../../Context/UserContext";
import { formatCurrency } from "../../../Helper/AmountFormat.js";
import ImagePreviewModal from "../../ImagePreviewModal.jsx";
import styles from "./styles/AmountAndCurrency.module.css";

let timeout;

const QuotationDetails = ({
  amount,
  currency,
  setAmount,
  setCurrency,
  title,
  setTitle,
  description,
  setDescription,
  files,
  setFiles,
  bargainable,
  setBargainable,
  setStep,
}) => {
  const { userWallets } = useContext(UserContext);
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = useState({
    src: "",
    index: "",
  });
  const [currentItem, setCurrentItem] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showDelModal, setShowDelModal] = useState(false);
  useEffect(() => {
    setCurrency(
      userWallets?.filter(
        (item) =>
          item?.wallet_type === "insta" &&
          !item?.blocked &&
          !item?.admin_blocked &&
          !item?.blocked &&
          !item?.admin_blocked &&
          item?.status === "active",
      )?.[0]?.currency?.code,
    );
  }, [userWallets]);

  // useEffect(() => {
  //     const formatAmount = () => {
  //         let value = amount
  //         if (String(value).includes(".") && !String(value).endsWith(".") && String(value).split(".")?.[1]?.length === 2) {
  //             return
  //         } else {
  //             if (!String(value).includes(".")) {
  //                 value = `${value}.00`
  //             }
  //             if (String(value).endsWith(".")) {
  //                 value = `${value}00`
  //             }
  //             if (String(value).split(".")?.[1]?.length === 1) {
  //                 value = `${value}0`
  //             }
  //             setAmount(value)
  //         }
  //     }

  //     if (timeout) {
  //         clearTimeout(timeout)
  //     }

  //     timeout = setTimeout(() => {
  //         formatAmount()
  //     }, 2000)

  //     return () => clearTimeout(timeout)
  // }, [amount])

  const [formattedAmount, setFormattedAmount] = useState("1.00");
  const handleKeyUp = (e) => {
    formatCurrency(e.target.value, false, setFormattedAmount);
  };

  const handleBlur = (e) => {
    formatCurrency(e.target.value, true, setFormattedAmount);
  };

  useEffect(() => {
    setAmount(formattedAmount?.replaceAll(",", ""));
  }, [formattedAmount]);
  return (
    <div className={styles.container}>
      <div className={`${styles.top} mb-4`}>
        <label htmlFor="Amount">{t("Enter the amount")}</label>
        <div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {userWallets
              ?.filter(
                (item) =>
                  item?.wallet_type === "insta" &&
                  !item?.blocked &&
                  !item?.admin_blocked &&
                  !item?.blocked &&
                  !item?.admin_blocked &&
                  item?.status,
              )
              ?.map((item) => (
                <option value={item.currency?.code} key={item.currency?.code}>
                  {item.currency?.code}{" "}
                </option>
              ))}
          </select>
          {/* <input type="number"

                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                        }}
                    /> */}
          <input
            type="text"
            value={formattedAmount}
            onChange={(e) => setFormattedAmount(e.target.value)}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
            placeholder="Enter Amount"
            data-type="currency"
          />
        </div>
      </div>
      <Input
        className="mb-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("Enter the Title for Your Quotation.")}
        maxLength={120}
      />
      <div
        className="text-end"
        style={{ fontSize: "0.8rem", color: "#666", marginBottom: "1rem" }}
      >
        {title.length}/120
      </div>
      <Input
        className="mb-1"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        type="textarea"
        placeholder={t("Enter the Description for Your Quotation")}
        maxLength={500}
        style={{
          resize: "none",
          height: "100%",
        }}
      />
      <div
        className="text-end"
        style={{ fontSize: "0.8rem", color: "#666", marginBottom: "1rem" }}
      >
        {description.length}/500
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Label>{t("Attachments")}:</Label>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            overflowX: "auto",
            background: "white",
            borderRadius: "10px",
            padding: "10px",
            minHeight: "75px",
            overflowY: "hidden",
          }}
        >
          {files.length < 5 && (
            <Label
              htmlFor="files"
              style={{
                height: "50px",
                width: "50px",
                borderRadius: "5px",
                boxShadow: "0 0 3px #1111113e",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Plus />
              <input
                id="files"
                accept="image/*"
                hidden
                multiple={false}
                type="file"
                onChange={(e) => {
                  const file = e.target?.files?.[0];
                  if (file) {
                    setFiles((prevFiles) => [...prevFiles, file]);
                  }
                }}
              />
            </Label>
          )}
          {files.map((file, index) => {
            const previewURL = URL.createObjectURL(file);
            // console.log(file.type)
            return (
              <div
                key={index}
                title={file?.name}
                style={{
                  height: "50px",
                  width: "50px",
                  borderRadius: "5px",
                  boxShadow: "0 0 3px #1111113e",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {file?.type?.toLowerCase()?.includes("image") && (
                  <img
                    key={previewURL}
                    src={previewURL}
                    alt="img"
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    onClick={() => {
                      setCurrentImage({ src: previewURL, index });
                      setShowPreview(true);
                    }}
                  />
                )}
                {file?.type?.toLowerCase()?.includes("video") && (
                  <div
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FaRegFileVideo size={30} color="white" />
                  </div>
                )}
                {file?.type?.toLowerCase()?.includes("application/pdf") && (
                  <div
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FaRegFilePdf size={30} color="white" />
                  </div>
                )}
                <div
                  style={{
                    height: "19px",
                    width: "19px",
                    background: "#ff00003e",
                    borderRadius: "2px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    cursor: "pointer",
                  }}
                >
                  <Trash2
                    color="red"
                    size={14}
                    onClick={() => {
                      setCurrentItem(index);
                      setShowDelModal(true);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ImagePreviewModal
        isOpen={showPreview}
        toggle={() => setShowPreview(!showPreview)}
        currentImage={currentImage}
      />

      <Modal
        isOpen={showDelModal}
        toggle={() => setShowDelModal(!showDelModal)}
      >
        <ModalHeader toggle={() => setShowDelModal(!showDelModal)}>
          {t("Confirm Removing File")}
        </ModalHeader>
        <ModalBody>
          {t("Are you sure, you want to remove this file?")}
        </ModalBody>
        <ModalFooter>
          <Button
            style={{
              background:
                "linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
              border: "none",
              outline: "none",
            }}
            onClick={() => {
              const filtered = files.filter((_, i) => i !== currentItem);
              setFiles(filtered);
              setShowDelModal(false);
            }}
          >
            {t("Remove")}
          </Button>
        </ModalFooter>
      </Modal>

      <Label
        htmlFor="check"
        className="mx-2"
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".75rem",
          fontSize: ".8rem",
          fontWeight: 600,
        }}
      >
        <Input
          type="checkbox"
          id="check"
          checked={bargainable}
          onChange={(e) => setBargainable(e.target.checked)}
        />
        <span>{t("Allow Receiver to Bargain")}</span>
      </Label>
      <Button
        className={styles.button}
        disabled={!amount || !currency || !title || !description}
        onClick={() => setStep((prev) => prev + 1)}
      >
        {t("Continue")}
      </Button>
    </div>
  );
};

export default QuotationDetails;
