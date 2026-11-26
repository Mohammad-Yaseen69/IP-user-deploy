import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../Context/UserContext";
import SearchComponent from "../HomeNewUpdated/Search";
import PageHeader from "../../Common/PageHeader";
import styles from "../TransactionsNewApi/styles/index.module.scss";
import ProfileComponent from "./ProfileComponent";

const UserProfilePublic = () => {
  const { t } = useTranslation();
  const { userDetails } = useContext(UserContext);

  return (
    <>
      {window.innerWidth > 1000 ? (
        <div className={styles.container}>
          <PageHeader title={t("User Profile")}>
            {userDetails && <SearchComponent showOthers={false} />}
          </PageHeader>
          <ProfileComponent />
        </div>
      ) : (
        <div className={styles.mobile} style={{ padding: 0, position: "relative" }}>
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
