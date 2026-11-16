import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import download from "./download.svg";
import edit from "./edit.svg";
import styles from "./styles/Mobile.module.css";
import s from "../PaymentsNewer/files/PaymentsNewFiles/share.png";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import axios from "axios";
import SocialModal from "../ShareBtn/SocialModal";
import DownloadQR from "./DownloadQR";
import { Button } from "reactstrap";
import { Toggle } from "../MyMasterCard/CardPurchased";

const MobileComponent = ({ wallet, current }) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(wallet?.qrCode?.title);
  const [description, setDescription] = useState(wallet?.qrCode?.description);
  const [status, setStatus] = useState(wallet?.qrCode?.status === "true" ? true : false);
  const [saving, setSaving] = useState(false);
  const { setWalletRefresh, authHeader } = useContext(UserContext);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    setEditMode(false);
    setSaving(false);
    setShowFullDesc(false);
    setTitle(wallet?.qrCode?.title ?? "");
    setDescription(wallet?.qrCode?.description ?? "");
    setStatus(wallet?.qrCode?.status === "true" || wallet?.qrCode?.status === true ? true : false);
  }, [current, wallet?.wallet_id]);

  const switchStyle = {
    display: "inline-block",
    width: "80px",
    height: "36px",
    backgroundColor: "#ededed",
    borderRadius: "100px",
    position: "relative",
    cursor: "pointer",
  };

  const thumbStyle = {
    width: "20px",
    height: "20px",
    backgroundColor: status ? "#1fd531" : "#fd0d1b",
    borderRadius: "50%",
    position: "absolute",
    top: "8px",
    left: status ? "53px" : "7px",
    transition: "left 0.2s",
  };

  const updateQr = (e, setter = null) => {
    if (e) e.preventDefault();
    if (saving) return;
    setSaving(true);
    const data = {
      title: title || wallet?.currency?.code + " Wallet" || "Wallet",
      description: description || wallet?.currency?.code + " QR" || "QR",
      status: setter ? `${!status}` : `${status}`,
      wallet_id: wallet?.wallet_id,
    };

    const encrypted = encryptData(data);

    axios
      .post(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/update-qr-details`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        // setWalletRefresh(prev => prev + 1)
        if (setter) {
          setter((prev) => !prev);
        }
        setEditMode(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setSaving(false));
  };

  console.log(status, "status");
  const [showShareModal, setShowShareModal] = useState();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  return (
    <div className={styles.container}>
      <DownloadQR
        isOpen={showDownloadModal}
        toggle={() => setShowDownloadModal(false)}
        qrCode={wallet?.qrCode?.url}
        wallet={wallet}
      />
      {editMode ? (
        <form className={styles.form} onSubmit={updateQr}>
          <div className={styles.inp_con}>
            <label htmlFor="title">{t("QR Code Title")}</label>
            <input
              type="text"
              id="title"
              placeholder={t("Title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={styles.inp_con}>
            <label htmlFor="description">
              {t("QR Code Description")} (
              <span style={{ fontSize: "80%" }}>
                {description?.length}
                {t("/180 characters")}
              </span>
              )
            </label>
            <textarea
              id="description"
              placeholder={t("Description")}
              value={description}
              onChange={(e) =>
                e.target.value?.length >= 180 ? "" : setDescription(e.target.value)
              }
            />
          </div>
          <button disabled={saving || !description || !title}>{t("Save")}</button>
        </form>
      ) : (
        <>
          <h5>{title}</h5>
          <p>
            {description?.length > 20 && !showFullDesc
              ? description?.slice(0, 20) + ".."
              : wallet?.currency?.code}
            {description?.length > 20 ? (
              <span
                onClick={() => setShowFullDesc(!showFullDesc)}
                style={{ textDecoration: "underline" }}
              >
                {showFullDesc ? "Show less" : "Show more"}
              </span>
            ) : (
              ""
            )}
          </p>
        </>
      )}
      <div className={styles.qr}>
        <img src={wallet?.qrCode?.url} alt={title} />
      </div>
      {/* <a href={wallet?.qrCode?.url} download={true} className={styles.download}>
                <img src={download} alt="d" />
                <span>{t("Download QR")}</span>
                </a> */}
      <Button
        onClick={() => setShowDownloadModal(true)}
        className={styles.download}
        color="primary"
      >
        <img src={download} alt="d" />
        <span>{t("Download QR")}</span>
      </Button>
      {!editMode && (
        <div className={styles.row}>
          <button className={styles.edit} onClick={() => setEditMode(true)}>
            <img src={edit} alt="e" />
            <span>{t("Edit")}</span>
          </button>
          <button className={styles.share} onClick={() => setShowShareModal(true)}>
            <img src={s} alt="s" />
          </button>
        </div>
      )}
      <div className={styles.switch__container}>
        {t("QR Status")}

        <Toggle
          bottom={"5px"}
          checked={status}
          disabled={saving}
          onChange={() => updateQr(null, setStatus)}
        />
      </div>
      <SocialModal
        isOpen={showShareModal}
        link={wallet?.qrCode?.url}
        toggle={() => setShowShareModal(!showShareModal)}
      />
    </div>
  );
};

export default MobileComponent;
