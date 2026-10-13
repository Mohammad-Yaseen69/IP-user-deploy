import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./styles/Settings.module.scss";
import { Button, Card, CardBody } from "reactstrap";
import cover from "../UserProfilePublic/files/cover_1.png";
import Header from "./Header";
import Tabs from "./Tabs";
import Basic from "./Basic";
import Password from "../User/UserSettings/Password";
import SecurityQuestions from "../User/UserSettings/SecurityQuestions";
import TwoFactorAuth from "../User/UserSettings/TwoFactorAuth";
import Accounts from "../User/UserSettings/Accounts";
import Notifications from "../User/UserSettings/Notifications";
import Sessions from "../User/UserSettings/Sessions";
import Verification from "../User/UserSettings/Verification";
import WithdrawalChannels from "../User/UserSettings/WithdrawalChannels";
import DownloadData from "../User/UserSettings/DownloadAccountData";
import DeleteAccount from "../User/UserSettings/DeleteAccount";
import { Camera, MoreHorizontal, Trash2 } from "react-feather";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import DeleteImageModal from "./DeleteImageModal";
import ApiKey from "./ApiKey";
import AvatarEditor from "react-avatar-editor";
import Nominee from "./Nominee";
import KYB from "./KYB";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const { t } = useTranslation();
  const { userDetails, authHeader, setUserRefresh } = useContext(UserContext);
  const [coverPhoto, setCoverPhoto] = useState(cover);
  const [showDelModal, setShowDelModal] = useState(false);
  // cover
  const [isEditing, setIsEditing] = useState(false);
  const [editor, setEditor] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [isSaving, setIsSaving] = useState(false);
  const mainContainerRef = useRef(null);

  useEffect(() => {
    if (userDetails) {
      setCoverPhoto(userDetails?.coverImage?.url || cover);
    }
  }, [userDetails]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPhoto(reader.result);
    };
    reader.readAsDataURL(file);
    if (file) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    const canvas = editor.getImageScaledToCanvas();
    const file = canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append("file", blob, `cover_image_${Date.now()}.png`);
      formData.forEach((item) => "a"); // console.log(item))
      axios
        .post(
          `${import.meta.env.VITE_IP_DEV_API}/api/account/upload-cover-image/${userDetails._id}`,
          formData,
          {
            headers: authHeader,
          },
        )
        .then((res) => {
          const decrypted = decryptData(res.data.data);
          // console.log(decrypted);
          setUserRefresh((prev) => prev + 1);
        })
        .catch((err) => {
          const decrypted = decryptData(err.response.data.data);
          // console.log(decrypted);
          setUserRefresh((prev) => prev + 1);
        })
        .finally(() => {
          setIsSaving(false);
          setIsEditing(false);
          setScale(1);
          setPosition({ x: 0.5, y: 0.5 });
        });
    }, "image/png");
  };

  // more menu
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  const menuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.cover_container} ref={mainContainerRef}>
        {isEditing ? (
          <div className={styles.editor_container}>
            <AvatarEditor
              ref={(editor) => setEditor(editor)}
              image={coverPhoto || ""}
              width={mainContainerRef?.current?.offsetWidth}
              height={mainContainerRef?.current?.offsetHeight}
              border={0}
              color={[255, 255, 255, 0.6]}
              scale={scale}
            />
          </div>
        ) : (
          <img
            src={coverPhoto}
            alt="cover"
            loading="lazy"
            className={styles.cover}
          />
        )}
        {isEditing ? (
          <div
            style={{
              position: "absolute",
              top: "30px",
              right: "30px",
              display: "flex",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                width: "150px",
              }}
            >
              <button
                onClick={() =>
                  setScale((prev) => (prev > 1 ? prev - 0.25 : prev))
                }
                style={{
                  border: "none",
                  outline: "none",
                  width: "50px",
                  height: "50x",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1rem",
                  fontWeight: "700",
                }}
              >
                -
              </button>
              <span
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: ".8rem",
                  fontWeight: 600,
                  alignSelf: "center",
                }}
              >
                {scale}x
              </span>
              <button
                onClick={() =>
                  setScale((prev) => (prev < 4 ? prev + 0.25 : prev))
                }
                style={{
                  border: "none",
                  outline: "none",
                  width: "50px",
                  height: "50x",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1rem",
                  fontWeight: "700",
                }}
              >
                +
              </button>
            </div>
            <Button
              color="primary"
              style={{
                background: "white",
                border: "none",
                outline: "none",
                borderRadius: "10px",
              }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving" : "Save"}
            </Button>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "15px",
              right: "20px",
              filter: "drop-shadow(0 0 2px black)",
            }}
            ref={menuRef}
          >
            <MoreHorizontal
              onClick={toggleMenu}
              color="white"
              size={30}
              style={{ cursor: "pointer" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "10px",
                overflow: "hidden",
                position: "absolute",
                top: showMenu ? "20px" : "-100px",
                opacity: showMenu ? "1" : "-0",
                pointerEvents: showMenu ? "all" : "none",
                right: 0,
                background: "white",
              }}
            >
              <label
                htmlFor="cover_photo"
                onClick={toggleMenu}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  marginBottom: "0",
                  cursor: "pointer",
                }}
              >
                <Camera size={18} />
                <span style={{ whiteSpace: "nowrap" }}>
                  {t("Edit Cover Photo")}
                </span>
              </label>
              {userDetails?.profileImage?.url && (
                <>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      marginBottom: "0",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      toggleMenu();
                      setIsEditing(true);
                    }}
                  >
                    <Camera size={18} />
                    <span style={{ whiteSpace: "nowrap" }}>
                      {t("Adjust Cover Photo")}
                    </span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      marginBottom: "0",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowDelModal(true);
                      toggleMenu();
                    }}
                  >
                    <Trash2 size={18} />
                    <span style={{ whiteSpace: "nowrap" }}>
                      {t("Remove Cover Photo")}
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}
        <DeleteImageModal
          imageType={"Cover"}
          isOpen={showDelModal}
          toggle={() => setShowDelModal(!showDelModal)}
        />
        <input
          type="file"
          name="cover_photo"
          id="cover_photo"
          hidden
          onChange={handleFileSelect}
        />
      </div>
      <Card style={{ marginBottom: "0" }} className={styles.sub_container}>
        <CardBody className={styles.sc_body}>
          <Header />
          <div className={styles.bottom}>
            {/* <Tabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}
            <div className={styles.right}>
              {/* <Basic isCollapsed={activeTab !== "basic"} setIsCollapsed={setActiveTab} /> */}
              <Password
                isCollapsed={activeTab !== "password"}
                setIsCollapsed={setActiveTab}
              />
              <SecurityQuestions
                isCollapsed={activeTab !== "security"}
                setIsCollapsed={setActiveTab}
              />
              <TwoFactorAuth
                isCollapsed={activeTab !== "two factor"}
                setIsCollapsed={setActiveTab}
              />
              <Nominee
                isCollapsed={activeTab !== "nominee"}
                setIsCollapsed={setActiveTab}
              />
              {userDetails?.account_type !== "individual" && (
                <ApiKey
                  isCollapsed={activeTab !== "api"}
                  setIsCollapsed={setActiveTab}
                />
              )}
              <Accounts
                isCollapsed={activeTab !== "accounts"}
                setIsCollapsed={setActiveTab}
              />
              <Notifications
                isCollapsed={activeTab !== "notifications"}
                setIsCollapsed={setActiveTab}
              />
              <Sessions
                isCollapsed={activeTab !== "sessions"}
                setIsCollapsed={setActiveTab}
              />
              {userDetails?.account_type !== "individual" && (
                <KYB
                  isCollapsed={activeTab !== "business"}
                  setIsCollapsed={setActiveTab}
                />
              )}
              {userDetails?.account_type === "individual" && (
                <Verification
                  isCollapsed={activeTab !== "verification"}
                  setIsCollapsed={setActiveTab}
                />
              )}
              <WithdrawalChannels
                isCollapsed={activeTab !== "withdrawal"}
                setIsCollapsed={setActiveTab}
              />
              <DownloadData
                isCollapsed={activeTab !== "download"}
                setIsCollapsed={setActiveTab}
              />
              <DeleteAccount
                isCollapsed={activeTab !== "delete"}
                setIsCollapsed={setActiveTab}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
