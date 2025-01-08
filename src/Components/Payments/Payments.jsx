import styles from "./styles/Payments.module.scss"
// import { Breadcrumbs } from '../../AbstractElements';
import { UserPlus, PlusCircle } from "react-feather";
import PaymentType from "./PaymentType";
import { useEffect, useState } from "react";
// import ModalForm from "./ModalForm";
import { Link } from "react-router-dom";
import banner from "./banner.png"


const Payments = () => {
    const [mobileView, setMobileView] = useState(window?.innerWidth < 600)
    const [bannerText, setBannerText] = useState("Welcome to the Payments section of InstaPay! Here, you can conveniently manage your transactions and money transfers.")

    const setWidth = () => {
        setMobileView(window.innerWidth < 600)
    }

    useEffect(() => {
        window.addEventListener("resize", setWidth)

        return () => window.removeEventListener("resize", setWidth)
    }, [])

    return (
        <div style={{ height: "fit-content", display: "flex", flexDirection: "column", paddingBottom: "1rem" }}>
            {/* <Breadcrumbs mainTitle="Payments" /> */}
            <div className={styles.top} style={{
                background: `url(${banner})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                minHeight: "246px",
                height: "35vh",
                borderRadius: "20px",
                marginBottom: "1rem"
            }}>
                <Link to={"/beneficiaries/add"} style={{ background: "rgba(256,256,256,0.8)", padding: ".5rem", borderRadius: "10px", color: "black" }}>
                    <UserPlus size={16} />
                    {
                        !mobileView
                        &&
                        <span>Add Beneficiary</span>
                    }
                </Link>
                {/* <ModalForm modal={modal} toggle={toggle} /> */}
                <button style={{ background: "rgba(256,256,256,0.8)", padding: ".5rem", borderRadius: "10px", color: "black" }}>
                    <PlusCircle size={16} />
                    {
                        !mobileView
                        &&
                        <span>Add New Account</span>
                    }
                </button>
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: ".5rem",
                    transform: "translateY(-50%)",
                    // textAlign: "center",
                    padding: ".5rem",
                    borderRadius: "20px",
                    color: "black",
                    maxWidth: "45%"
                }}>
                    <h4 style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "2vw"
                    }}>{bannerText}</h4>
                    {/* <h5 style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "1.4vw"
                    }}>Empowering Your Financial Journey!</h5> */}
                </div>
            </div>
            <PaymentType mobileView={mobileView} sbt={setBannerText} />
        </div>
    )
}

export default Payments