import { useContext, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import InstaPayLoader from '../Loader'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'

const PaymentStatus = () => {
    const { getUserBeneficiaries, beneficiaries, authHeader } = useContext(UserContext)
    const { type, status, code } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const add_funds = queryParams.get("add_funds")

    useEffect(() => {
        const searchUser = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_IP_DEV_API}/api/account/search-users/${code}`,
                    {
                        headers: authHeader,
                    }
                );
                const data = await decryptData(response.data.data);
                return `${data?.users?.[0]?.first_name || data?.users?.[0]?.company_name} ${data?.users?.[0]?.last_name}`
            } catch {
                return ""
            }
        };

        const fetchDetailsAndRedirect = () => {
            if (type === "international") {
                getUserBeneficiaries()
                    .then(() => {
                        const benef = beneficiaries.find(item => item._id === code)
                        navigate(`/payments?payment_action=send_money&send_type=${type}&transaction_status=${status}&transaction_id=test&code=${code}&title=${benef?.first_name || benef?.company_name || "Recipient's"} ${benef?.last_name || ""}`)
                    })
            } else {
                searchUser()
                    .then(res => {
                        navigate(`/payments?payment_action=send_money&send_type=${type === "wallet_to_wallet" ? "wallet" : type}&transaction_status=${status}&transaction_id=test&code=${code}&title=${res}`)
                    })
            }
        }

        if (status === "success") {
            fetchDetailsAndRedirect()
        } else {
            const url = type === "airtime"
                ?
                `/payments?payment_action=airtime&transaction_status=${status}&transaction_id=test&code=${code}&title=nope&error_in_funds=${!add_funds ? true : false}`
                :
                `/payments?payment_action=send_money&send_type=${type}&transaction_status=${status}&transaction_id=test&code=${code}&title=nope&error_in_funds=${!add_funds ? true : false}`
            navigate(url)
        }
    }, [type, status])
    return (
        <div style={{
            height: "100vh",
            width: "100vw"
        }}>
            <InstaPayLoader />
        </div>
    )
}

export default PaymentStatus