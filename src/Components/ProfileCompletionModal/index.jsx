import styles from "./styles/index.module.css"
import { ChevronRight } from "react-feather";
import { Link, useNavigate } from "react-router-dom";
import logout from "../../Layout/SidebarNew/files/logout_a.svg"
import LanguagePicker from "../LanguagePicker";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

const ProfileCompletionModal = ({ setShowModal, profileIncompleteReason, kyc = false }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { clearData } = useContext(UserContext)
    return (
        <div className={styles.modal}>
            <div className={styles.modal_dialog} style={{ position: "relative" }}>
                <div style={{
                    position: "absolute",
                    top: "1rem",
                    right: "20px",
                    display: "flex",
                    gap: "1rem",
                    flexDirection: "row-reverse",
                    alignItems: "flex-end"
                }}>
                    <div
                        onClick={() => {
                            const coun = localStorage.getItem("ip_country")
                            localStorage.clear()
                            localStorage.setItem("ip_country", coun)
                            clearData()
                            navigate("/login")
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".75rem",
                            flexDirection: "column"
                        }}
                    >
                        <img src={logout} alt="logout" style={{
                            height: window.innerWidth < 1000 ? "20px" : "25px",
                            width: window.innerWidth < 1000 ? "20px" : "25px",
                            objectFit: "contain",
                        }}
                        />
                        <span style={{ color: "white", fontSize: "1rem", fontWeight: "500" }}>{t("Logout")}</span>
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".25rem",
                        flexDirection: "column"
                    }}>
                        <div style={{
                            borderRadius: "10px", background: "white", width: "33px", height: "33px", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <LanguagePicker size={"16"} />
                        </div>
                        <span style={{ color: "white", fontSize: "1rem", fontWeight: "500" }}>{("Language")}</span>
                    </div>
                </div>
                <div className={styles.extra}>.</div>
                <div className={styles.content}>
                    <div className={styles.con_text}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M41.25 4.58333C46.3054 4.58333 50.4167 8.69458 50.4167 13.75V41.25C50.4167 45.5927 47.3829 49.2387 43.323 50.1804C42.1221 42.527 35.4846 36.6667 27.4999 36.6667C19.5153 36.6667 12.8778 42.527 11.6769 50.1804C7.61701 49.2386 4.58333 45.5927 4.58333 41.25V13.75C4.58333 8.69458 8.69458 4.58333 13.75 4.58333H41.25ZM16.2708 50.4167H38.7291C37.6749 45.1917 33.0457 41.2501 27.4999 41.2501C21.9541 41.2501 17.325 45.1917 16.2708 50.4167ZM41.25 0H13.75C6.15542 0 0 6.15542 0 13.75V41.25C0 48.8446 6.15542 55 13.75 55H41.25C48.8446 55 55 48.8446 55 41.25V13.75C55 6.15542 48.8446 0 41.25 0ZM27.4998 34.3749C21.1817 34.3749 16.0415 29.2347 16.0415 22.9166C16.0415 16.5985 21.1817 11.4583 27.4998 11.4583C33.818 11.4583 38.9582 16.5985 38.9582 22.9166C38.9582 29.2347 33.818 34.3749 27.4998 34.3749ZM27.4998 16.0416C23.7094 16.0416 20.6248 19.1262 20.6248 22.9166C20.6248 26.707 23.7094 29.7916 27.4998 29.7916C31.2903 29.7916 34.3748 26.707 34.3748 22.9166C34.3748 19.1262 31.2903 16.0416 27.4998 16.0416Z" fill="white" />
                        </svg>
                        <h4>
                            {!kyc ? t("Complete your profile to smooth your transaction process.") : t("Verify Your KYC Details to keep using Instapay!")}
                        </h4>
                    </div>
                    <div className={styles.btn_con}>
                        {/* <button style={{ background: "transparent" }} onClick={() => setShowModal(false)}>Skip</button> */}
                        <Link to={!kyc ? `/settings?tab=${profileIncompleteReason}&editmode=true` : "/settings?tab=verification"} style={{ width: "100%" }}>
                            <button onClick={() => setShowModal(false)} style={{
                                borderRadius: window.innerWidth > 700 ? "16px" : "10px",
                                background: "linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(277deg, #E64067 -9.52%, #5926F0 62.22%, #4828A0 119.38%)",
                                backgroundBlendMode: "overlay, normal",
                                padding: "10px",
                                flex: 1,
                                width: "100%"
                            }}>
                                {!kyc ? t("Complete your profile"):  t("Verify your kyc")}
                                <ChevronRight size={16} /></button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileCompletionModal;