import ProfileComponent from "./ProfileComponent"
import styles from "../TransactionsNewApi/styles/index.module.scss"
import { useTranslation } from "react-i18next"
import TopRight from "../topRight"
import { useContext } from "react"
import { UserContext } from "../../Context/UserContext"
import { Button } from "reactstrap"
import SearchComponent from "../HomeNewUpdated/Search"

const UserProfilePublic = () => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)

    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                                <h4 style={{ marginBottom: 0 }}>{t("User Profile")}</h4>
                                {
                                    userDetails
                                    &&
                                    <SearchComponent
                                        showOthers={false}
                                    />
                                }
                            </div>
                            {
                                userDetails?._id
                                &&
                                <TopRight />
                            }
                        </div>
                        <ProfileComponent />
                    </div>
                    :
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
                                height: "fit-content"
                            }}
                        >
                            {
                                userDetails
                                &&
                                <SearchComponent
                                    showOthers={false}
                                />
                            }
                        </div>
                    </div>
            }
        </>
    )
}

export default UserProfilePublic