import useWindowWidth from "../../utils/useWindowWidth"
import styles from "./styles/PAC.module.scss"
import coverPlaceHolder from "./banner.png"
import { useNavigate } from "react-router"
import verified from "../../assets/verified.png"
import { useTranslation } from "react-i18next"
import LanguagePicker from "../LanguagePicker"


const UserDets = ({ croppedCover, cover, dp, croppedDp, userDetails, user_name, userCountry, setShowVerTT, showVerTT, invoicePaid, AmountComponent, paymentAddress, }) => {
    const width = useWindowWidth()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const actionButtons = [
        {
            label: "View Profile",
            onClick: () => navigate(`/profile/${user_name}`),
            disable: false,
            purple: true,
        },
        // {
        //     label: "View Plans",
        //     onClick: () => { },
        //     disable: true,
        //     purple: false,
        // },
        // {
        //     label: "Explore eShop",
        //     onClick: () => { },
        //     disable: true,
        //     purple: false,
        // },
    ]

    return (
        <div className={styles.userDets} style={{ position: "relative" }} >

            <div className={styles.cover_container} style={{ position: "relative" }}>
                <img src={(croppedCover || cover) || coverPlaceHolder} alt="cover" className={styles.cover} style={{ height: "135px", width: "100%", objectFit: "cover", borderRadius: window.innerWidth > 1000 ? "30px 30px 0 0 !important" : "0 0 30px 30px !important", objectPosition: (!croppedCover || !cover) && "right" }} />
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: "16px", padding: "14px", maxHeight: "fit-content" }}>
                <div style={{ flexDirection: "column", gap: "0", padding: "0px", position: 'relative', }} className={styles.top}>
                    <div style={{ flexDirection: "column", width: "100%", }} className={styles.left}>
                        <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: width < 1000 ? "center" : "space-between" }}>
                            <div className={styles.dp_container}>
                                {
                                    dp
                                        ?
                                        <img src={croppedDp || dp} className={styles.dp} alt="profile" style={{ background: "transparent" }} />
                                        :
                                        <div className={styles.dp} style={{ overflow: "hidden" }}>{userDetails?.first_name?.[0] || userDetails?.company_name?.[0]}</div>
                                }
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexDirection: width < 1000 && "column", position: "relative" }}>
                            <div style={{ alignItems: 'flex-start',  }} className={styles.basic_dets}>
                                <div className={styles.badge}>{userDetails?.account_type === "individual" ? t("Personal") : t("Business")} {t("Account")}</div>
                                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: ".3rem" }}>
                                    <h4
                                        style={{
                                            margin: "0 6px 0 0",
                                            fontWeight: 700,
                                            whiteSpace: "wrap",
                                            textAlign: width < 1000 && 'center',
                                        }}
                                    >
                                        {userDetails?.first_name || userDetails?.company_name} {userDetails?.last_name}
                                        {(userDetails?.kyc_status === "approved" || userDetails?.kyb_status === "approved") && (
                                            <>
                                                <img
                                                    onMouseEnter={() => setShowVerTT(true)}
                                                    onMouseLeave={() => setShowVerTT(false)}
                                                    src={verified}
                                                    alt=""
                                                    style={{
                                                        height: window.innerWidth > 780 ? "25px" : "17px",
                                                        width: window.innerWidth > 780 ? "25px" : "17px",
                                                        objectFit: "contain",
                                                        transform: "translateY(-3px)",
                                                    }}
                                                />
                                                {showVerTT && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: "100%",
                                                            right: "0",
                                                            background: "#5926f0",
                                                            color: "white",
                                                            fontSize: window.innerWidth > 780 ? ".8rem" : ".65rem",
                                                            fontWeight: 500,
                                                            padding: window.innerWidth > 780 ? "6px 18px" : "3px 10px",
                                                            borderRadius: window.innerWidth > 780 ? "8px" : "4px",
                                                            whiteSpace: "nowrap"
                                                        }}
                                                    >
                                                        {t("User Identity Verified")}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </h4>

                                </div>
                                <div className={styles.country}>
                                    <img src={userCountry?.file_url} alt={userCountry?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                                    <span>{t(userCountry?.name)}</span>
                                </div>
                            </div>
                            {width < 1000 &&
                                <div style={{ position: "absolute", top: "0px", right: "-13px" }}>
                                    <LanguagePicker newUI={true} backgroundWhite={true} />
                                </div>
                            }

                            {invoicePaid && AmountComponent}
                        </div>
                    </div>
                </div>
            </div>

            {paymentAddress &&
                <div style={{ display: "flex", gap: "8px", alignItems: width > 500 ? "center" : "stretch", padding: "0px 15px 15px 15px", flexWrap: "wrap", justifyContent: width < 1000 && "center", flexDirection: width < 500 && "column" }}>
                    {actionButtons.map((button, idx) => (
                        <button
                            key={idx}
                            onClick={button.onClick}
                            disabled={button.disable}
                            style={{
                                padding: "10px 20px",
                                background: button.purple ? "#5926F0" : '#EBEBEB',
                                border: 'none',
                                outline: 'none',
                                fontWeight: 600,
                                borderRadius: "4px",
                                color: button.purple ? "white" : "black"
                            }}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}

export default UserDets