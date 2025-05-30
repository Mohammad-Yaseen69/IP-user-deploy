import { useTranslation } from "react-i18next"
import styles from "./styles/index.module.scss"
import { UserContext } from "../../Context/UserContext"
import { useContext, useState, lazy, Suspense } from "react"
import InstaPayLoader from "../Loader";
import TopRight from "../topRight"
import Tabs from "./Tabs"
import Basic from "./Basic"
import Password from "./Password"
import SecurityQuestions from "./SecurityQuestion"
import TwoFactorAuth from "./TwoFactorAuth"
import Nominee from "./Nominee"
import Notifications from "./Notifications"
import Verification from "./Verification"
import Accounts from "./Accounts"
import Sessions from "./Sessions"
import WithdrawalChannels from "./WithdrawalChannels"
import DeleteAccount from "./DeleteAccount"
import DownloadData from "./DownloadAccountData"
import ApiKey from "./ApiKey"
import KYB from "./KYB"
import Cover from "./Cover"
import Header from "./Header"
import HowOthersFindYou from "./HowOthersFindYou"
import { Button, Card, CardBody } from "reactstrap";
import WithdrawalsNew from "./WithdrawalsNew";
import { useNavigate } from "react-router";
import Threshold from "./Threshold";

const Settings = () => {
    const { t } = useTranslation()
    const [currentTab, setCurrentTab] = useState("Basic Info")
    const { userDetails, verifyToken, profileCompletedPercentage, authHeader, setUpdateToken } = useContext(UserContext)
    const navigate = useNavigate()

    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <h4>{t("Settings")}</h4>
                            <TopRight />
                        </div>
                        <div style={{ marginBottom: "-50px" }}>
                            <Cover />
                            <Header />
                        </div>
                        <div className={styles.bottom}>
                            <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} account_type={userDetails?.account_type} verifyToken={verifyToken} />
                            <div className={styles.right}>
                                {
                                    currentTab === "Basic Info"
                                    &&
                                    <Basic setCurrentTab={setCurrentTab} />}
                                {
                                    currentTab === "Change Password"
                                    &&
                                    <Password />
                                }
                                {
                                    currentTab === "Security Questions"
                                    &&
                                    <SecurityQuestions />
                                }
                                {
                                    currentTab === "Two Factor Authentication"
                                    &&
                                    <TwoFactorAuth />
                                }
                                {
                                    currentTab === "Nominee Information"
                                    &&
                                    <Nominee />
                                }
                                {
                                    currentTab === "Notifications"
                                    &&
                                    <Notifications />
                                }
                                {
                                    currentTab === "Identity Verification"
                                    &&
                                    (
                                        profileCompletedPercentage === 100
                                            ?
                                            <Verification />
                                            :
                                            <Card>
                                                <CardBody style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    textAlign: "center",
                                                    padding: "2.5rem 1rem"
                                                }}>
                                                    <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                                                        Complete your profile data before proceeding with identity verification.
                                                    </div>
                                                    <span>Note: Fill in all required fields in the "Basic Info".</span>
                                                    {/* and "Security Questions" section */}
                                                    <div style={{
                                                        display: "flex",
                                                        gap: "1rem",
                                                        flexWrap: "wrap",
                                                        marginTop: "1.5rem"
                                                    }}>
                                                        <Button
                                                            style={{
                                                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                border: "none",
                                                                outline: "none",
                                                                borderRadius: "10px"
                                                            }}
                                                            onClick={() => {
                                                                setCurrentTab("Basic Info")
                                                                navigate("/settings?tab=basic&editmode=true")
                                                            }}
                                                        >
                                                            {t("Go to Basic Info")}
                                                        </Button>
                                                        {/* <Button
                                                            style={{
                                                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                                                border: "none",
                                                                outline: "none",
                                                                borderRadius: "10px"
                                                            }}
                                                            onClick={() => setCurrentTab("Security Questions")}
                                                        >
                                                            Go to Security Questions
                                                        </Button> */}
                                                    </div>
                                                </CardBody>
                                            </Card>
                                    )
                                }
                                {
                                    currentTab === "My Social Network Accounts"
                                    &&
                                    <Accounts />
                                }
                                {
                                    currentTab === "Login Activity"
                                    &&
                                    <Sessions />
                                }
                                {
                                    currentTab === "Receiving Accounts"
                                    &&
                                    // <WithdrawalChannels />
                                    <WithdrawalsNew />
                                }
                                {currentTab === "Payment Threshold" && <Threshold setUpdateToken={setUpdateToken} userDetails={userDetails} authHeader={authHeader} />}
                                {
                                    currentTab === "Download Your Data"
                                    &&
                                    <DownloadData />
                                }
                                {
                                    currentTab === "Delete Your Account"
                                    &&
                                    <DeleteAccount />
                                }
                                {
                                    currentTab === "API Key"
                                    &&
                                    <ApiKey />
                                }
                                {
                                    currentTab === "Business Verification"
                                    &&
                                    (
                                        profileCompletedPercentage === 100
                                            ?
                                            <KYB />

                                            :
                                            "Complete Your Profile First"
                                    )
                                }
                                {
                                    currentTab === "How Others Can Find You"
                                    &&
                                    <HowOthersFindYou />
                                }
                                {/* </Suspense> */}
                            </div>
                        </div>
                    </div>
                    :
                    <div className={styles.mobile}>
                        <div className={styles.top}>
                            <h4>{t("Settings")}</h4>
                        </div>
                        {
                            profileCompletedPercentage < 100
                            &&
                            <div className={styles.profile_complete}>
                                <div className={styles.left}>
                                    <h4>{profileCompletedPercentage.toFixed(0)}%</h4>
                                    <span>{t("of your profile is complete")}</span>
                                </div>
                                <div className={styles.right}>
                                    <div className={styles.progress} style={{ "--progress": `${profileCompletedPercentage}%` }}></div>
                                    <div className={styles.bottom}>
                                        <span>{t("Complete your profile to smooth your transaction process.")}</span>
                                        <div>
                                            <span style={{
                                                color: "#bba5ff",
                                                fontSize: "7px",
                                                marginBottom: ".5rem",
                                                display: "block",
                                                textAlign: "center"
                                            }}>{t("Why is this important?")}</span>
                                            <button>{t("Complete Now")} &rarr;</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className={styles.dp_cover}>
                            <Cover />
                            <Header />
                        </div>
                        <div className={styles.bottom}>
                            <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} account_type={userDetails?.account_type} verifyToken={verifyToken} />
                            <div className={styles.right}>
                                {
                                    currentTab === "Basic Info"
                                    &&
                                    <Basic setCurrentTab={setCurrentTab} />
                                }
                                {
                                    currentTab === "Change Password"
                                    &&
                                    <Password />
                                }
                                {
                                    currentTab === "Security Questions"
                                    &&
                                    <SecurityQuestions />
                                }
                                {currentTab === "Payment Threshold" && <Threshold userDetails={userDetails} authHeader={authHeader} />}
                                {
                                    currentTab === "Two Factor Authentication"
                                    &&
                                    <TwoFactorAuth />
                                }
                                {
                                    currentTab === "Nominee Information"
                                    &&
                                    <Nominee />
                                }
                                {
                                    currentTab === "Notifications"
                                    &&
                                    <Notifications />
                                }
                                {
                                    currentTab === "Identity Verification"
                                    &&
                                    <Verification />
                                }
                                {
                                    currentTab === "My Social Network Accounts"
                                    &&
                                    <Accounts />
                                }
                                {
                                    currentTab === "Login Activity"
                                    &&
                                    <Sessions />
                                }
                                {
                                    currentTab === "Receiving Accounts"
                                    &&
                                    // <WithdrawalChannels />
                                    <WithdrawalsNew />
                                }
                                {
                                    currentTab === "Download Your Data"
                                    &&
                                    <DownloadData />
                                }
                                {
                                    currentTab === "Delete Your Account"
                                    &&
                                    <DeleteAccount />
                                }
                                {
                                    currentTab === "API Key"
                                    &&
                                    <ApiKey />
                                }
                                {
                                    currentTab === "Business Verification"
                                    &&
                                    <KYB />
                                }
                                {
                                    currentTab === "How Others Can Find You"
                                    &&
                                    <HowOthersFindYou />
                                }
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default Settings