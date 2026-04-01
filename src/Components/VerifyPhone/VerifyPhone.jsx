import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from "../../assets/images/logo/logo.webp"
import OtpForm from './OtpForm'
import PhoneNumberForm from './PhoneNumberForm'

const VerifyPhone = () => {
    const [showPhoneForm, setShowPhoneForm] = useState(true)
    return (
        <section style={{
            backgroundImage: `url(/bg.jpg)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center', display: 'block'
        }}>
            <Link to={'/'} style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                position: "absolute",
                padding: "2rem",
                top: "0",
                left: "0",
            }}>
                <img src={logo} alt="" style={{ height: "40px" }} />
                <span style={{ color: "black", fontSize: "1.2rem" }}>InstaPay</span>
            </Link>
            {
                showPhoneForm
                    ?
                    <PhoneNumberForm setPhoneTab={setShowPhoneForm} />
                    :
                    <OtpForm />
            }
        </section >
    )
}

export default VerifyPhone