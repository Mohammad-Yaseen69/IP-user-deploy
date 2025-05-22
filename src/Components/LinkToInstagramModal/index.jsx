import { Modal, ModalBody } from 'reactstrap'
import styles from "./styles/index.module.css"
import guide_video from "./files/right.mp4"
import { useTranslation } from 'react-i18next'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { useLocation, useNavigate } from 'react-router'
import SuccessModal from '../AddBeneficiary/SuccessModal'
import close from "./files/close.svg"
import { Instagram } from 'react-feather'
import isnta from "./files/insta.mp4"

const steps = [
    {
        step: "Step 01 – From Instagram App",
        name: "Step 01 – From Instagram App",
        desc: `Open the Instagram app, search for the \"InstaPay\" profile page, select \"Message\" to open the chat box, type/say \"Hi\" and click send to initiate the conversation with the InstaPay chatbot.`
    },
    {
        step: "Step 02 – From InstaPay Instagram Profile Page ",
        name: "Step 02 – From InstaPay Instagram Profile Page ",
        desc: `InstaPay chatbot will display two action buttons: \"Register\" and \"Connect.\" Select \"Connect,\" and the chatbot will prompt you to enter your InstaPay username.`
    },
    {
        step: "Step 03 – From InstaPay Instagram Profile Page",
        name: "Step 03 – From InstaPay Instagram Profile Page",
        desc: `The InstaPay chatbot will then ask for the InstaPay verification code. Enter the code you obtained from the InstaPay settings under \"My Social Network Accounts\" and click send.`
    },
    {
        step: "Step 04 – From InstaPay Instagram Profile Page",
        name: "Step 04 – From InstaPay Instagram Profile Page",
        desc: `You will receive a congratulatory message confirming that your Instagram account is now synced with InstaPay. Click on \"Main Menu\" to start using InstaPay services.`
    }
]

const tips = [
    {
        strong: "Secure Your Account",
        desc: "1.\tSecure Your Account: Ensure your Instagram account is secure by enabling two-factor authentication (2FA) to protect your linked InstaPay services."
    },
    {
        strong: "Explore More",
        desc: "2.\tExplore More: Once linked, explore the wide range of services InstaPay offers, from seamless transactions to instant withdrawals."
    },
    {
        strong: "Stay Updated",
        desc: "3.\tStay Updated: Keep an eye on our updates, as we will soon support linking other social media accounts to make your experience even more integrated."
    },
    {
        strong: "Help & Support",
        desc: "4.\tHelp & Support: If you face any issues during the linking process, contact our support team for assistance."
    },
]

const LinkToInstagramModal = ({ isOpen, toggle }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { userDetails, verifyToken } = useContext(UserContext)
    const [linkCode, setLinkCode] = useState("")
    const [timer, setTimer] = useState(120)
    const [showSuccess, setShowSuccess] = useState(false)

  
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setTimeout(() => {
                setTimer(timer - 1);
            }, 1000);
        } else {
            setLinkCode("")
        }

        return () => {
            clearInterval(interval);
        };
    }, [timer])

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const ft = queryParams.get("ft")

    useEffect(() => {
        let interval;
        if (userDetails?.insta_username) {
            setShowSuccess(true)
        }
        else if (linkCode && !userDetails?.insta_username) {
            interval = setInterval(() => {
                verifyToken()
            }, 3000)
        }

        return () => clearInterval(interval);
    }, [linkCode, userDetails])

    return (
        <>
            {
                !showSuccess
                    ?
                    <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "920px", width: "100vw" }} contentClassName={styles.content}>
                        <ModalBody className={styles.container}>
                            <div className={styles.left}>
                                {
                                    window.innerWidth > 900
                                    &&
                                    <h1>{t("Link Your Instagram Account to InstaPay")}</h1>
                                }
                                <div className={styles.guide}>
                                    {
                                        steps.map(item => (
                                            <div className={styles.guide_item} key={item.step}>
                                                <h2 className={styles.step_count}>{t(item.step).split(" – ")[0]}</h2>
                                                <div className={styles.gi_right}>
                                                    <h3>{t(item.name).split(" – ")[1]}</h3>
                                                    <p>{t(item.desc)}</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    <h4>{t("Additional Tips")}: </h4>
                                    <ul className={styles.tips}>
                                        {
                                            tips.map(item => (
                                                <li key={item.strong}>
                                                    {/* <strong>{item.strong}: </strong> */}
                                                    {t(item.desc)}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                    <h4>{t("Future Enhancements")}</h4>
                                    <p>{t("In the near future, InstaPay will allow you to link more social media accounts, providing you with even more flexibility and convenience. Stay tuned for exciting updates!")}</p>
                                </div>
                                {
                                    linkCode
                                        ?
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                                            <button style={{ outline: "none", border: "none", display: "flex", alignItems: "center", color: "black", fontSize: "1rem", fontWeight: 500, background: "transparent", gap: "1rem", padding: ".6rem 1rem", justifyContent: "center" }} onClick={() => window.open("https://www.instagram.com/instapay_swiss/", "_blank")}>
                                                <div style={{ borderRadius: "10px", height: "35px", width: "35px", display: "flex", justifyContent: "center", alignItems: "center", background: "#5926f0" }}>
                                                    <Instagram color='white' size={20} />
                                                </div>
                                                {t("Go to InstaPay Instagram account")}
                                            </button>
                                        </div>
                                        :
                                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                                            <button className={styles.button} style={{ color: "white" }} onClick={() => window.open("https://www.instagram.com/instapay_swiss/", "_blank")}>{t("Go to InstaPay Instagram account")}</button>
                                        </div>
                                }
                            </div>
                            <div className={styles.right}>
                                {
                                    window.innerWidth < 900
                                    &&
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem" }}>
                                        <h1>{t("Link Your Instagram Account to InstaPay")}</h1>
                                        <img src={close} alt="close" style={{ height: "50px", width: "50px" }} onClick={() => {
                                            if (ft) {
                                                navigate("/settings?tab=withdrawal&ft=true")
                                            } else {
                                                toggle()
                                            }
                                        }} />
                                    </div>
                                }
                                <video src={window.innerWidth > 1000 ? guide_video : isnta} autoPlay={true} muted loop></video>
                                <button style={{ border: "none", outline: "none", backgroundColor: "transparent", padding: "0", cursor: "pointer", textAlign: "right", marginLeft: "7px", marginTop: "1rem" }} onClick={toggle}>{t("Skip")}</button>
                            </div>
                        </ModalBody>
                    </Modal>
                    :
                    <SuccessModal
                        isOpen={showSuccess}
                        message={`Your InstaPay account has been connected to ${userDetails?.insta_username}.`}
                        subMessage={"Instagram Linked Successfully!"}
                        toggle={() => {
                            toggle()
                            setShowSuccess(false)
                            if (ft) {
                                navigate("/settings?tab=withdrawal&ft=true")
                            }
                        }}
                    />
            }
        </>
    )
}

export default LinkToInstagramModal