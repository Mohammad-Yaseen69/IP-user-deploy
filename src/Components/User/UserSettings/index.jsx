import React, { useState } from 'react'
import Tabs from './Tabs'
import styles from "./styles/index.module.scss"
import BasicInfo from './BasicInfo'
import Password from './Password'
import TwoFactorAuth from './TwoFactorAuth'
import Accounts from './Accounts'
import Notifications from './Notifications'
import Sessions from './Sessions'
import DeleteAccount from './DeleteAccount'
import ProfileHeader from '../UsersProfile/ProfileHeader'
import { Container, Row } from 'reactstrap'
// import UserVerification from './UserVerification'
import SecurityQuestions from './SecurityQuestions'
import DownloadData from './DownloadAccountData'
import "./styles/accordian.css"
import Verification from './Verification'
import WithdrawalChannels from './WithdrawalChannels'

const UserSettings = () => {
    // const [showIdentity, setShowIdentity] = useState(false)
    const [showBasic, setShowBasic] = useState(false)
    const [showPassword, setShowPassword] = useState(true)
    const [showSecurity, setShowSecurity] = useState(true)
    const [showTwoFactor, setShowTwoFactor] = useState(true)
    const [showAccounts, setShowAccounts] = useState(true)
    const [showNotification, setShowNotification] = useState(true)
    const [showSession, setShowSession] = useState(true)
    const [showVerification, setShowVerification] = useState(true)
    const [showWithDrawal, setShowWithDrawal] = useState(true)
    const [showDownload, setShowDownload] = useState(true)
    const [showDelete, setShowDelete] = useState(true)


    return (
        <>
            <Container fluid={true}>
                <div className="user-profile">
                    <Row>
                        <ProfileHeader />
                    </Row>
                </div>
            </Container>
            <div className={styles.container}>
                <Tabs /*ssi={setShowIdentity}*/ setters={[
                    setShowBasic,
                    setShowPassword,
                    setShowSecurity,
                    setShowTwoFactor,
                    setShowAccounts,
                    setShowNotification,
                    setShowSession,
                    setShowDownload,
                    setShowDelete,
                    setShowVerification,
                    setShowWithDrawal
                ]} />
                <div className={styles.sub_container}>
                    {/* {
                        showIdentity
                            ?
                            <UserVerification ssi={setShowIdentity} />
                            :
                            <> */}
                    {/* <BasicInfo isCollapsed={showBasic} setIsCollapsed={setShowBasic} />
                    <Password isCollapsed={showPassword} setIsCollapsed={setShowPassword} />
                    <SecurityQuestions isCollapsed={showSecurity} setIsCollapsed={setShowSecurity} />
                    <TwoFactorAuth isCollapsed={showTwoFactor} setIsCollapsed={setShowTwoFactor} />
                    <Accounts isCollapsed={showAccounts} setIsCollapsed={setShowAccounts} ssb={setShowBasic} />
                    <Notifications isCollapsed={showNotification} setIsCollapsed={setShowNotification} />
                    <Sessions isCollapsed={showSession} setIsCollapsed={setShowSession} />
                    <Verification isCollapsed={showVerification} setIsCollapsed={setShowVerification} />
                    <WithdrawalChannels isCollapsed={showWithDrawal} setIsCollapsed={setShowWithDrawal} />
                    <DownloadData isCollapsed={showDownload} setIsCollapsed={setShowDownload} />
                    <DeleteAccount isCollapsed={showDelete} setIsCollapsed={setShowDelete} /> */}
                    {/* </>
                    } */}
                </div>
            </div>
        </>
    )
}

export default UserSettings