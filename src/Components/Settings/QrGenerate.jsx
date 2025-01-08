import QRCodeStyling from 'qr-code-styling';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import axios from 'axios';
import logo from "../../assets/images/logo/logo.png"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    qrOptions: {
        typeNumber: "0",
        mode: "Byte",
        errorCorrectionLevel: "Q",
    },
    image: logo,
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.2,
        margin: 10,
    },
    dotsOptions: {
        type: "extra-rounded",
        color: "#6a1a4c",
        gradient: {
            type: "linear",
            rotation: 0.3141592653589793,
            colorStops: [
                { offset: 0, color: "#4b1135" },
                { offset: 1, color: "#3c087d" },
            ],
        },
    },
    backgroundOptions: { color: "#ffffff" },
});

const QrGenerate = ({ wallets = [], setMessage = () => { }, chatbot = false }) => {
    const ref = useRef(null);
    const [generated, setGenerated] = useState(0)

    useEffect(() => {
        qrCode.append(ref.current);
    }, []);

    const uploadQR = async (item) => {
        setMessage("Generating Qr Code sticker.")
        const url = `https://my.insta-pay.ch/q/${item?.wallet_id}`
        qrCode.update({ data: url });
        const fileName = `qrcode.png`;
        const mimeType = `image/png`;

        // Get raw QR code data as a Blob
        const blob = await qrCode.getRawData("png");

        // Convert Blob to File
        const file = new File([blob], fileName, { type: mimeType });
        const formData = new FormData();
        formData.append('qrCode', file);
        formData.append("wallet_id", item?.wallet_id)
        formData.append("chatbot", chatbot)
        try {
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/upload-qrcode`, formData)
            const dec = decryptData(res.data.data)
            console.log("wallet_res = ", dec)
            console.log("url = ", url)
            console.log("set url = ", qrCode._options.data)
            setMessage("QR Code sticker generated successfully!")
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            setMessage(dec?.message ?? "Something went wrong while generating QR Code sticker.")
            console.log(item?.wallet_id, "error")
        } finally {
            setGenerated(prev => prev + 1)
        }
    }

    useLayoutEffect(() => {
        if (generated < wallets.length) {
            const generateQR = async () => {
                for (const item of wallets) {
                    if (item?.wallet_type === "insta") {
                        await uploadQR(item);
                    }
                }
            }
            const timeout = setTimeout(() => {
                generateQR()
            }, 3000)

            return () => {
                clearTimeout(timeout)
            }
        }
    }, [wallets, generated])

    return (
        <div style={{ position: "absolute", top: "-1000vh", left: "-100vw" }}>
            <div ref={ref} />
        </div>
    )
}

export default QrGenerate