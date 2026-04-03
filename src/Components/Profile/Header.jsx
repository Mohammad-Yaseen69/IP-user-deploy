import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import { Modal, ModalBody, ModalHeader } from "reactstrap"
import countries from "../PaymentsNewer/CountriesData.json"
import styles from "./styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import verified from "../../assets/verified.png"

const Header = () => {
    const { userDetails, croppedImages } = useContext(UserContext)
    const [userCountry, setUserCountry] = useState({})
    const [showAboutModal, setShowAboutModal] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const filteredCountry = countries.find(item => item.alpha3 === userDetails?.country_iso_code)
        setUserCountry(filteredCountry);
    }, [userDetails])

    return (
        <div className={styles.top}>
            <div className={styles.left}>
                {
                    userDetails?.profileImage?.url
                        ?
                        <div className={styles.dp} style={{ overflow: "hidden" }}>
  {
    userDetails?.user?.first_name?.[0] ||
    userDetails?.company_name?.[0] ||
    "U"
  }
</div>
                        :
                        <div className={styles.dp} style={{ overflow: "hidden" }}>{userDetails?.user?.first_name?.[0]}</div>
                }
                <div className={styles.basic_dets}>
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                        <div className={styles.badge}>{userDetails?.account_type === "individual" ? "Personal" : "Business"} Account</div>
                        {/* <div className={styles.badge} style={{ background: userDetails?.user?.kyc_status === "approved" ? "green" : "grey" }}>{userDetails?.user?.kyc_status === "approved" ? "Verified" : "Unverified"}</div> */}
                        {
                            userDetails?.kyc_status === "approved"
                            &&
                            <img src={verified} alt="" style={{ height: "20px", width: "20px", objectFit: "contain" }} />
                        }
                    </div>
                    <h4 style={{ marginBottom: "-.5rem" }}>{userDetails?.user?.first_name} {userDetails?.user?.last_name}</h4>
                    <div style={{ fontSize: ".8rem" }}>@{userDetails?.username}</div>
                    <div className={styles.country}>
                        <img src={userCountry?.file_url} alt={userCountry?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                        <span>{userCountry?.name}</span>
                    </div>
                </div>
            </div>
            <div className={styles.top_right}>
                {
                    userDetails?.about_me
                    &&
                    <div className={styles.about}>
                        <h5>{t("About Me")}:</h5>
                        <p>{userDetails?.about_me?.length > 150 ? userDetails?.about_me + ".." : userDetails?.about_me}</p>
                        {
                            userDetails?.about_me?.length > 150
                            &&
                            <p style={{ fontSize: "12px", color: "black", cursor: "pointer" }} onClick={() => setShowAboutModal(!showAboutModal)}>Read more {">"}</p>
                        }
                        <Modal isOpen={showAboutModal} toggle={() => setShowAboutModal(!showAboutModal)}>
                            <ModalHeader toggle={() => setShowAboutModal(!showAboutModal)}>
                                {t("About")}
                            </ModalHeader>
                            <ModalBody>{userDetails?.about_me}</ModalBody>
                        </Modal>
                    </div>
                }
            </div>
        </div>
    )
}

export default Header