import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import Tabs from "./Tabs";
import { useState } from "react";
import "./styles/accordian.css"
import Basic from "./Basic";
import Password from "./Password";
import SecurityQuestions from "./SecurityQuestions";
import Nominee from "./Nominee";
import TwoFactorAuth from "./TwoFactorAuth";
import Accounts from "./Accounts";
import Notifications from "./Notifications";
import Sessions from "./Sessions";
import Verification from "./Verification";
import WithdrawalChannels from "./WithdrawalChannels";
import DownloadData from "./DownloadAccountData";
import DeleteAccount from "./DeleteAccount";
import ApiKey from "./ApiKey";
import KYB from "./KYB";
import Cover from "./Cover";
import Header from "./Header";
import { Card, CardBody } from "reactstrap";

const UserSettingsUpdated = () => {
    const { t } = useTranslation()
    const [current, setCurrent] = useState("Basic Info");
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h4>{t("Settings (New)")}</h4>
                <TopRight />
            </div>
            {/* <Cover /> */}
            {/* <Card style={{ marginBottom: "0" }} className={styles.sub_container}>
                <CardBody className={styles.sc_body}>
                    <Header /> */}
            <div className={styles.bottom}>
                <Tabs current={current} setCurrent={setCurrent} />
                <div className={styles.content}>
                    {
                        current === "Basic Info"
                        &&
                        <Basic />
                    }
                    {
                        current === "Change Password"
                        &&
                        <Password />
                    }
                    {
                        current === "Security Questions"
                        &&
                        <SecurityQuestions />
                    }
                    {
                        current === "Nominee"
                        &&
                        <Nominee />
                    }
                    {
                        current === "Two Factor Authentication"
                        &&
                        <TwoFactorAuth />
                    }
                    {
                        current === "Social Accounts"
                        &&
                        <Accounts />
                    }
                    {
                        current === "Notifications"
                        &&
                        <Notifications />
                    }
                    {
                        current === "API Key"
                        &&
                        <ApiKey />
                    }
                    {
                        current === "Sessions"
                        &&
                        <Sessions />
                    }
                    {
                        current === "Identity Verification"
                        &&
                        <Verification />
                    }
                    {
                        current === "Business Verification"
                        &&
                        <KYB />
                    }
                    {
                        current === "My Withdrawal Channels"
                        &&
                        <WithdrawalChannels />
                    }
                    {
                        current === "Download Your Data"
                        &&
                        <DownloadData />
                    }
                    {
                        current === "Delete Your Account"
                        &&
                        <DeleteAccount />
                    }
                </div>
            </div>
            {/* </CardBody>
            </Card>*/}
        </div>
    )
}

export default UserSettingsUpdated;