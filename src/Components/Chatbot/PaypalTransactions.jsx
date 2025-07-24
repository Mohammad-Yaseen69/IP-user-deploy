import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import InstaPayLoader from '../Loader'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { CustomDatePickerContainer, SuccessImage } from './schedule-calendar'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import RedirectButton from '../../CommonElements/RedirectButton'

const PaypalTransactions = () => {
    const { status, id } = useParams()
    const [completed, setCompleted] = useState(false)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const flow = queryParams.get("flow")
    const platform = queryParams.get("platform")


    useEffect(() => {

        const hitNotification = async () => {
            try {
                const data = {
                    "referenceId": id,
                    "flow": flow,
                    "method": "paypal"
                }

                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/paypal/send-bot-notification`, {
                    data: encryptData(data)
                })

                const dec = decryptData(res.data.data)
                console.log(dec)
                setCompleted(true)
            } catch (error) {
                const err = decryptData(error?.response?.data?.data)
                console.log(err)
                toast.error(err?.message)
            }
        }

        const hitNotificationTelegram = async () => {
            try {
                const data = {
                    "referenceId": id,
                    "flow": flow,
                    "method": "paypal"
                }

                const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/paypal/send-bot-notification-telegram`, {
                    data: encryptData(data)
                })

                const dec = decryptData(res.data.data)
                console.log(dec)
                setCompleted(true)
            } catch (error) {
                const err = decryptData(error?.response?.data?.data)
                console.log(err)
                toast.error(err?.message)
            }
        }


        if (status && id) {
            if (platform && platform === "telegram") {
                hitNotificationTelegram()
            } else {
                hitNotification()
            }
        }
    }, [status, id])

    return (
        completed
            ?
            <CustomDatePickerContainer>
                <DotLottieReact
                    src="https://lottie.host/dc9844a3-b41b-4ddc-97c8-0039376f3ac8/DGe7bLZyug.json"
                    backgroundColor="transparent"
                    speed="1"
                    style={{ width: "225px", height: "225px" }}
                    playMode="normal"
                    loop={true}
                    autoplay={true}
                />
                <h5 style={{ padding: "1rem", textAlign: "center", fontSize: ".9rem", fontWeight: 600 }}>
                    You can now close this webpage and go back to {platform === "telegram" ? "Telegram" : "Instagram"}.
                </h5>
                <RedirectButton platform={platform} />
            </CustomDatePickerContainer>
            :
            <div style={{ height: "100vh", width: "100vw" }}>
                <InstaPayLoader />
            </div>
    )
}

export default PaypalTransactions