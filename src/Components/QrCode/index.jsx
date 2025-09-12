import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
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

const QrCode = () => {
    const [fileExt, setFileExt] = useState("png");
    const ref = useRef(null);

    useEffect(() => {
        qrCode.append(ref.current);
    }, []);

    const onExtensionChange = (event) => {
        setFileExt(event.target.value);
    };

    const uploadQR = async (item) => {
        // const url = `https://my.instapay.ch/payments?payment_action=send_money&send_type=qr_pay&wallet_id=${item?.wallet_id}`
        const url = `https://my.insta-pay.ch/q/${item?.wallet_id}`
        qrCode.update({ data: url });
        const fileName = `qrcode.${fileExt}`;
        const mimeType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

        // Get raw QR code data as a Blob
        const blob = await qrCode.getRawData(fileExt);

        // Convert Blob to File
        const file = new File([blob], fileName, { type: mimeType });
        const formData = new FormData();
        formData.append('qrCode', file);
        formData.append("wallet_id", item?.wallet_id)
        try {
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/upload-qrcode`, formData)
            const dec = decryptData(res.data.data)
            console.log("wallet_res = ", dec)
            console.log("url = ", url)
            console.log("set url = ", qrCode._options.data)
        } catch (error) {
            console.log(item?.wallet_id, "error")
        }
    }

    const onUploadClick = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/wallet/get-all-wallets-temp`)
            const wallets = res.data

            for (const item of wallets) {
                if (item?.wallet_type === "insta") {
                    await uploadQR(item);
                }
            }
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
        }
    };

    return (
        <div className="App">
            <div style={styles.inputWrapper}>
                <select onChange={onExtensionChange} value={fileExt}>
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WEBP</option>
                </select>
                <button onClick={onUploadClick}>Upload</button>
            </div>
            <div ref={ref} />
        </div>
    );
};

const styles = {
    inputWrapper: {
        margin: "20px 0",
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
    },
    inputBox: {
        flexGrow: 1,
        marginRight: 20,
    },
};

export default QrCode;