import React, { useContext, useEffect } from 'react'
import { UserContext } from '../../Context/UserContext'
import { useNavigate, useParams } from 'react-router'

const QRScan = () => {
    const { userDetails } = useContext(UserContext)
    const { wallet_id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (userDetails) {
            sessionStorage.setItem("path", `/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${wallet_id?.toUpperCase()}`)
            navigate(`/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${wallet_id?.toUpperCase()}`)
        } else {
            sessionStorage.setItem("path", `/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${wallet_id?.toUpperCase()}`)
            navigate("/login")
        }
    }, [userDetails])

    return (
        <div>{wallet_id}</div>
    )
}

export default QRScan