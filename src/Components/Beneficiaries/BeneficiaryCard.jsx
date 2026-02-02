import styles from "./styles/BeneficiaryCard.module.scss"
import countries from "../PaymentsNewer/CountriesData.json"
import bank from "../PaymentsNewer/files/bd.png"
import ins from "../../assets/images/logo/logo_white.png"
import mw from "../PaymentsNewer/files/mw.png"
import pc from "../PaymentsNewer/files/pc.png"
import cw from "../PaymentsNewer/files/cw.png"
import { ChevronDown, ChevronUp, MoreHorizontal } from "react-feather"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import { Button } from "reactstrap"
import DeleteBeneficiary from "./DeleteBeneficiary"

const BeneficiaryCard = ({ user }) => {
    const { t } = useTranslation()
    const normalizeName = (s) => (s || "").toLowerCase().replace(/[^a-z]/g, "")
    const exact = countries.find(c => normalizeName(c.name) === normalizeName(user?.country_name))
    const loose = countries.find(c => normalizeName(c.name).includes(normalizeName(user?.country_name)) || normalizeName(user?.country_name).includes(normalizeName(c.name)) || user?.country_iso_code === c.alpha3)
    const country = exact || loose
    const itemCheck = (item) => user?.account_type.some(acc => acc.toLowerCase() === item);
    const { verifyToken } = useContext(UserContext)
    const [showMore, setShowMore] = useState(false);
    const toggleShowMore = () => setShowMore(!showMore)
    const [showDelete, setShowDelete] = useState(false);
    const toggleShowDelete = () => setShowDelete(!showDelete)
    const [showFull, setShowFull] = useState(window.innerWidth > 1000)

    const normalizeFlagUrl = (url) => {
        if (!url) return ""
        return url.startsWith("//") ? `https:${url}` : url
    }
    const primaryFlagSrc = normalizeFlagUrl(country?.file_url)
    const [flagSrc, setFlagSrc] = useState(primaryFlagSrc || ins)

    useEffect(() => {
        setFlagSrc(primaryFlagSrc || ins)
    }, [primaryFlagSrc])


    return (
        <div className={styles.container}>
            {
                window.innerWidth > 1000
                    ?
                    <Link to={`/beneficiaries/edit?user_id=${user._id}`} className={styles.left} onClick={() => {
                        if (window.innerWidth < 1000) {
                            setShowFull(!showFull)
                        }
                    }}>
                        <div>
                            <div style={{
                                display: "grid",
                                placeItems: "center",
                                background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                color: "white",
                                fontWeight: 800,
                                flexShrink: 0
                            }} className={styles.dp}>{user?.beneficiary_type === "individual" ? user?.first_name[0]?.toUpperCase() : user?.company_name[0]?.toUpperCase() ?? ""}</div>
                            {/* <Link to={`/beneficiaries/edit?user_id=${user._id}`} onClick={verifyToken}> */}
                            {
                                user?.beneficiary_type === "individual"
                                &&
                                <h5 style={{
                                    whiteSpace: "nowrap",
                                    maxWidth: "40ch",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}>{user?.first_name} {user?.last_name}</h5>
                            }
                            {
                                user?.beneficiary_type === "business"
                                &&
                                user?.company_name
                                &&
                                <h5>{user?.company_name?.split(" ")[0].slice(0, 10)}</h5>
                            }
                            {/* </Link> */}
                            <img src={flagSrc} alt={country?.alpha3 || user?.country_name || "flag"} style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", }} className={styles.flag} draggable="false" onError={() => setFlagSrc(ins)} loading="lazy" />
                            <div className={styles.type_badge}>{t(user?.beneficiary_type[0]?.toUpperCase() + user?.beneficiary_type?.slice(1)?.toLowerCase())}</div>
                        </div>
                        <button className={styles.toggle} onClick={e => {
                            e.stopPropagation()
                            setShowFull(!showFull)
                        }}>
                            <ChevronDown />
                        </button>
                    </Link>
                    :
                    <div className={styles.left} onClick={() => {
                        setShowFull(!showFull)
                    }}>
                        {
                            showFull
                                ?
                                <div style={{ flexDirection: 'column', alignItems: "flex-start" }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: ".75rem"
                                    }}>
                                        <div style={{
                                            display: "grid",
                                            placeItems: "center",
                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                            color: "white",
                                            fontWeight: 800
                                        }} className={styles.dp}>{user?.beneficiary_type === "individual" ? user?.first_name[0]?.toUpperCase() : user?.company_name[0]?.toUpperCase() ?? ""}</div>
                                        {/* <Link to={`/beneficiaries/edit?user_id=${user._id}`} onClick={verifyToken}> */}
                                        {
                                            user?.beneficiary_type === "individual"
                                            &&
                                            <h5 style={{ maxWidth: showFull ? "fit-content" : "23vw" }}>{user?.first_name} {user?.last_name}</h5>
                                        }
                                        {
                                            user?.beneficiary_type === "business"
                                            &&
                                            user?.company_name
                                            &&
                                            <h5 style={{ maxWidth: showFull ? "fit-content" : "23vw" }}>{user?.company_name?.split(" ")[0].slice(0, 10)}</h5>
                                        }
                                    </div>
                                    {/* </Link> */}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: ".75rem",
                                        paddingLeft: "45px"
                                    }}>
                                        <img src={flagSrc} alt={country?.alpha3 || user?.country_name || "flag"} style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", }} className={styles.flag} draggable="false" onError={() => setFlagSrc(ins)} loading="lazy" />
                                        <div className={styles.type_badge}>{t(user?.beneficiary_type)}</div>
                                    </div>

                                </div>
                                :
                                <div>
                                    <div style={{
                                        display: "grid",
                                        placeItems: "center",
                                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                        color: "white",
                                        fontWeight: 800
                                    }} className={styles.dp}>{user?.beneficiary_type === "individual" ? user?.first_name[0]?.toUpperCase() : user?.company_name[0]?.toUpperCase() ?? ""}</div>
                                    {/* <Link to={`/beneficiaries/edit?user_id=${user._id}`} onClick={verifyToken}> */}
                                    {
                                        user?.beneficiary_type === "individual"
                                        &&
                                        <h5 style={{ maxWidth: showFull ? "fit-content" : "25vw" }}>{user?.first_name} {user?.last_name}</h5>
                                    }
                                    {
                                        user?.beneficiary_type === "business"
                                        &&
                                        user?.company_name
                                        &&
                                        <h5 style={{ maxWidth: showFull ? "fit-content" : "25vw" }}>{user?.company_name?.split(" ")[0].slice(0, 10)}</h5>
                                    }
                                    {/* </Link> */}
                                    <img src={flagSrc} alt={country?.alpha3 || user?.country_name || "flag"} style={{ borderRadius: "4px", boxShadow: "0 0 10px rgba(0,0,0,.3)", }} className={styles.flag} draggable="false" onError={() => setFlagSrc(ins)} loading="lazy" />
                                    <div className={styles.type_badge}>{t(user?.beneficiary_type)}</div>

                                </div>
                        }
                        <button className={styles.toggle}>
                            {
                                showFull
                                    ?
                                    <ChevronUp />
                                    :
                                    <ChevronDown />
                            }
                        </button>
                    </div>
            }
            {
                showFull
                &&
                <div className={styles.right}>
                    <p>{t("Connected Accounts")}: </p>
                    <div className={styles.icon_con} style={{
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        filter: itemCheck("bank") ? "none" : "grayscale(100%)",
                        opacity: itemCheck("bank") ? 1 : .5
                    }}>
                        <img src={bank} draggable="false" alt={"bank"} style={{
                            // width: "20px",
                            // height: "20px",
                            // objectFit: "contain",
                            // aspectRatio: 1
                        }} />
                    </div>
                    <div className={styles.icon_con} style={{
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        filter: itemCheck("wallet") ? "none" : "grayscale(100%)",
                        opacity: itemCheck("wallet") ? 1 : .5
                    }}>
                        <img src={ins} draggable="false" alt={"Instapay"} style={{
                            // width: "21px",
                            // height: "21px",
                            // objectFit: "contain",
                            // aspectRatio: 1
                        }} />
                    </div>
                    <div className={styles.icon_con} style={{
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        filter: itemCheck("mobile") ? "none" : "grayscale(100%)",
                        opacity: itemCheck("mobile") ? 1 : .5
                    }}>
                        <img src={mw} draggable="false" alt={"Mobile Wallet"} style={{
                            // width: "19px",
                            // height: "19px",
                            // objectFit: "contain",
                            // aspectRatio: 1
                        }} />
                    </div>
                    <div className={styles.icon_con} style={{
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        filter: itemCheck("card") ? "none" : "grayscale(100%)",
                        opacity: itemCheck("card") ? 1 : .5
                    }}>
                        <img src={pc} draggable="false" alt={"Card"} style={{
                            // width: "21px",
                            // height: "21px",
                            // objectFit: "contain",
                            // aspectRatio: 1
                        }} />
                    </div>
                    {/* <div className={styles.icon_con} style={{
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)",
                        filter: itemCheck("crypto") ? "none" : "grayscale(100%)",
                        opacity: itemCheck("crypto") ? 1 : .5
                    }}>
                        <img src={cw} draggable="false" alt={"Crypto"} style={{
                            // width: "19px",
                            // height: "19px",
                            // objectFit: "contain",
                            // aspectRatio: 1
                        }} />
                    </div> */}
                    <div className={styles.t_d} onClick={toggleShowMore}>
                        <MoreHorizontal style={{ transform: "translateY(-7px)" }} />
                        {
                            showMore
                            &&
                            <div style={{ top: window.innerWidth < 1000 && "inherit", bottom: window.innerWidth < 1000 && "100%", zIndex: 12 }} className={styles.showMore}>
                                <Link to={`/beneficiaries/edit?user_id=${user._id}&edit=true`}>
                                    <Button color='transparent' className={styles.btn} style={{ padding: ".5rem 1rem" }}>
                                        {t("Edit") + " " + t("Beneficiary")}
                                    </Button>
                                </Link>
                                <Link to={`/beneficiaries/edit?user_id=${user._id}&view=true`}>
                                    <Button color='transparent' className={styles.btn} style={{ padding: ".5rem 1rem" }}>
                                        {t("View") + " " + t("Beneficiary")}
                                    </Button>
                                </Link>
                                <Button color='transparent' className={styles.btn} style={{ padding: ".5rem 1rem" }} onClick={toggleShowDelete}>
                                    {t("Delete") + " " + t("Beneficiary")}
                                </Button>
                            </div>
                        }
                    </div>
                    <DeleteBeneficiary
                        isOpen={showDelete}
                        toggle={toggleShowDelete}
                        benef={user}
                    />
                </div>
            }
        </div>
    )
}

export default BeneficiaryCard