import { useContext } from "react";
import styles from "./styles/index.module.css"
import { UserContext } from "../../Context/UserContext";
import { Col } from "reactstrap";
import Notifications from "../../Components/Notifications";
import msg from "../../Components/topRight/msg.svg"
import { MobileSbContext } from "../Layout";
import LanguagePicker from "../../Components/LanguagePicker";
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const TopBar = () => {
    const { userDetails } = useContext(UserContext)
    const { toggleSidebar } = useContext(MobileSbContext)
    const can = usePermission()
    return (
        <header className={styles.header}>
            <div className={styles.top}>
                <div className={styles.profile} onClick={toggleSidebar}>
                    {
                        userDetails?.profileImage?.url
                            ?
                            <img src={userDetails?.profileImage?.url} alt={userDetails?.user?.first_name} className={styles.dp} />
                            :
                            <div className={styles.dp}>
                                {
                                    userDetails?.account_type?.toLowerCase() === "individual"
                                        ?
                                        userDetails?.user?.first_name?.[0]?.toUpperCase()
                                        :
                                        userDetails?.company?.company_name?.[0]?.toUpperCase()
                                }
                            </div>
                    }
                    <p>
                        {
                            userDetails?.account_type?.toLowerCase() === "individual"
                                ?
                                `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`
                                :
                                userDetails?.company?.company_name
                        }
                    </p>
                    <p>
                        {">"}
                    </p>
                </div>
                <div className={styles.right}>
                    <LanguagePicker />
                    {/* <Col xs="auto" style={{
                        padding: ".5rem",
                        boxShadow: "0px 9.94788px 10.7769px rgba(109, 41, 220, 0.17)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "10px",
                        border: "1.11414px solid rgba(0, 0, 0, 0.08)",
                        cursor: "pointer",
                        width: "43px",
                        height: "43px"
                    }}>
                        <img src={msg} alt="" />
                    </Col> */}
                    {can("notifications.view") && <Notifications />}
                </div>
            </div>
        </header>
    )
}

export default TopBar;