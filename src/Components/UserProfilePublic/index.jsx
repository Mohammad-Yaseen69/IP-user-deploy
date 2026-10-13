import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import SearchComponent from "../HomeNewUpdated/Search";
import LanguagePicker from "../LanguagePicker";
import TopRight from "../topRight";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import ProfileComponent from "./ProfileComponent";

const UserProfilePublic = () => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  return (
    <>
      {window.innerWidth > 1000 ? (
        <div className={styles.container}>
          <div
            className={styles.top}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: userDetails?._id
                ? "space-between"
                : "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <h4 style={{ marginBottom: 0 }}>{t("User Profile")}</h4>

              {userDetails && <SearchComponent showOthers={false} />}
            </div>

            {userDetails?._id ? (
              <TopRight />
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <LanguagePicker />
              </div>
            )}
          </div>
          <ProfileComponent />
        </div>
      ) : (
        <div
          className={styles.mobile}
          style={{ padding: 0, position: "relative" }}
        >
          <ProfileComponent />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "1rem",
              zIndex: 1000,
              mixBlendMode: "normal",
              height: "fit-content",
            }}
          >
            {userDetails && <SearchComponent showOthers={false} />}
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfilePublic;
