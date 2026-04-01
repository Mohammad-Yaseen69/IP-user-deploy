import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { jwtDecode } from 'jwt-decode';
import QrGenerate from '../Settings/QrGenerate';
import pending from "../AuthNew/files/signup_anim.gif"
import success from "../PaymentsNewer/files/confirm.mp4"
import { XCircle } from 'react-feather';

const ChatbotQrCode = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const platform = queryParams.get("platform")
    const [message, setMessage] = useState("Getting details!");
    const [wallet_id, setWalletId] = useState("")
    // const [timer, setTimer] = useState(3)

    useLayoutEffect(() => {
        if (token && !wallet_id) {
            try {
                const decodedToken = jwtDecode(token, "instachat_bot_secret_key_insta_pay");
                console.log(decodedToken);
                setWalletId(decodedToken?.wallet_id)
            } catch (error) {
                setMessage("Error getting token details!");
            }
        }
    }, [token, wallet_id]);

    // useEffect(() => {
    //     let timeout;
    //     if ((message.toLowerCase().includes("success") || message.toLowerCase().includes("generated")) && timer > 0) {
    //         timeout = setTimeout(() => {
    //             setTimer(prev => prev - 1)
    //         }, 1000) 
    //     }

    //     if (timer === 1) {
    //         window.location.href = "https://ig.me/m/instapay_swiss"
    //     }

    //     return () => clearTimeout(timeout)
    // }, [message, timer])

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            height: "100vh",
            width: "100vw",
            flexDirection: "column"
        }}>
            {
                message.toLowerCase().includes("wrong")
                    ?
                    <XCircle size={300} color='red' />
                    :
                    message.toLowerCase().includes("success") || message.toLowerCase().includes("generated")
                        ?
                        <video style={{ width: "300px", height: "300px", objectFit: "cover" }} autoPlay={true} muted={true} loop={true} controls={false} src={success}></video>
                        :
                        <img style={{ width: "300px", height: "300px", objectFit: "cover" }} src={pending} alt="" />
            }
            <h3>{message}</h3>
            {/* {
                message.toLowerCase().includes("success") || message.toLowerCase().includes("generated")
                    ?
                    <span>Redirecting you in {timer} seconds</span>
                    :
                    ""
            } */}
            {
                wallet_id
                &&
                <QrGenerate
                    chatbot={true}
                    setMessage={setMessage}
                    wallets={[
                        { wallet_id, wallet_type: "insta" }
                    ]}
                    platform={platform}
                />
            }
        </div>
    );
};

export default ChatbotQrCode;