import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../Context/UserContext'
import styles from "./styles/onboard.module.scss"
import Img from "./files/kyc-img.png"

const Stepthree = () => {
    const { userDetails } = useContext(UserContext)
    const [isKycVerified, setIsKycVerified] = useState(false)

    useEffect(() => {
        if (userDetails.user.kyc_status === "approved") {
            setIsKycVerified(true)
        }
    }, [userDetails])

    return (
        <>
            <div className={styles.top} style={{width: "100%"}}>
                <h2>
                    {!isKycVerified ? "Let's Verify Your Identity" : "You're Already Verified!"}
                </h2>
                <p>
                    {!isKycVerified ?
                        "We need to verify your identity before issuing your InstaPay card. This ensures a secure and smooth experience for you!"
                        :
                        "Good news! We've found your KYC details, so you don't need to verify again. Let's move ahead and set up your InstaPay card!"
                    }
                </p>
            </div>

            <img style={{width: "550px"}} src={Img} alt="" />
        </>
    )
}

export default Stepthree