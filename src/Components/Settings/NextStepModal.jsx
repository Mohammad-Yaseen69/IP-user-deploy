import { Modal, ModalBody, } from 'reactstrap'
import styles from "./styles/MissingStepsModal.module.scss"
import { auth, bank, passport, social } from "./Modal_Icons"
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { useTranslation } from 'react-i18next'

const NextStepModal = ({ isOpen, toggle, setCurrentTab }) => {
    const { missingTabsData, userDetails } = useContext(UserContext)
    const [data, setData] = useState([])
    const { t } = useTranslation()

    const steps = [
        {
            text: "Google Authenticator",
            link: "Two Factor Authentication",
            icon: auth,
            type: "tfa"
        },
        {
            text: "Add receiving/withdrawal account",
            link: "Receiving Accounts",
            icon: bank,
            type: "withdrawls"
        },
        {
            text: "Connect chatbot (Instagram/Telegram)",
            link: "My Social Network Accounts",
            icon: social,
            type: "social"
        },
        {
            text: userDetails?.account_type === "business" ? "Verify Business" : "Verify identity",
            link: userDetails?.account_type === "business" ? "Business Verification" : "Identity Verification",
            icon: passport,
            type: "kyc"
        }
    ]

    useEffect(() => {
        const getData = () => {
            const arr = []
            missingTabsData.forEach(item => {
                const m = steps.find(step => step.type === item)
                if (m) {
                    arr.push(m)
                }
            });
            setData(arr)
        }

        getData()
    }, [missingTabsData, userDetails?.account_type])

    return (
        <Modal style={{ margin: '0 auto' }} className="next-step-modal" centered={true} isOpen={isOpen} toggle={toggle}>
            <ModalBody>
                <div style={{ alignItems: window.innerWidth < 1000 && "center" }} className={styles.container}>
                    <h1>
                        {t("Please complete these important steps for a seamless experience.")}
                    </h1>

                    <p>
                        {t("Click on an option to get started")}
                    </p>


                    <div className={styles.steps}>
                        {
                            data.map((step, index) => (
                                <div
                                    key={index}
                                    className={styles.step}
                                    onClick={() => {
                                        toggle()
                                        setCurrentTab(step.link)
                                    }}
                                >
                                    <img src={step.icon} alt="" />
                                    <span>{t(step.text)}</span>
                                </div>
                            ))
                        }
                    </div>

                    <button onClick={toggle}>{t("Close")}</button>
                </div>
            </ModalBody>
        </Modal >
    )
}

export default NextStepModal
