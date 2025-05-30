import { useNavigate } from 'react-router'
import { Modal, ModalBody, } from 'reactstrap'
import styles from "./styles/MissingStepsModal.module.scss"
import { auth, bank, passport, social } from "./Modal_Icons"
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'

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
        text: "Verify identity",
        link: "Identity Verification",
        icon: passport,
        type: "kyc"
    }
]

const NextStepModal = ({ isOpen, toggle, setCurrentTab }) => {
    const navigate = useNavigate()
    const { missingTabsData } = useContext(UserContext)
    const [data, setData] = useState([])



    useEffect(() => {
        const getData = () => {
            const arr = []
            missingTabsData.forEach(item => {
                const m = steps.find(step => step.type === item)
                arr.push(m)
            });
            setData(arr)
        }

        getData()
    }, [missingTabsData])
    return (
        <Modal style={{ margin: '0 auto' }} className="next-step-modal" centered={true} isOpen={isOpen} toggle={toggle}>
            <ModalBody>
                <div style={{ alignItems: window.innerWidth < 1000 && "center" }} className={styles.container}>
                    <h1>
                        Please complete these important steps for a seamless experience.
                    </h1>

                    <p>
                        Click on an option to get started
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
                                    <span>{step.text}</span>
                                </div>
                            ))
                        }
                    </div>

                    <button onClick={toggle}>Close</button>
                </div>
            </ModalBody>
        </Modal >
    )
}

export default NextStepModal
