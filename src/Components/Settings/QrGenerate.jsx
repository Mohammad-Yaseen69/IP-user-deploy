import QRCodeStyling from 'qr-code-styling';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import logo from "../../assets/images/logo/logo.png";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

// Helper function to preload image
const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = "anonymous";
        img.src = src;
    });
};

// Create QR code configuration
const createQRConfig = (platform) => ({
    width: platform === "telegram" ? 500 : 300,
    height: platform === "telegram" ? 500 : 300,
    qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
    },
    image: logo,
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.15,
        margin: 5,
        crossOrigin: "anonymous",
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
    cornersSquareOptions: {
        type: "extra-rounded",
        color: "#6a1a4c",
    },
    cornersDotOptions: {
        type: "dot",
        color: "#6a1a4c",
    },
    backgroundOptions: { 
        color: "#ffffff",
        clearBackground: true,
    },
});

const QrGenerate = ({ wallets = [], setMessage = () => { }, chatbot = false, platform }) => {
    const ref = useRef(null);
    const [generated, setGenerated] = useState(0);
    const [qrInstance, setQrInstance] = useState(null);

    // Initialize QR code instance
    useEffect(() => {
        const initQR = async () => {
            try {
                await preloadImage(logo);
                const config = createQRConfig(platform);
                const qrCode = new QRCodeStyling(config);
                setQrInstance(qrCode);
                
                if (ref.current) {
                    qrCode.append(ref.current);
                }
            } catch (error) {
                console.error('Error initializing QR:', error);
                setMessage("Error generating QR code");
            }
        };

        initQR();
        
        return () => {
            if (ref.current) {
                ref.current.innerHTML = '';
            }
        };
    }, [platform]);

    const uploadQR = async (walletId) => {
        if (!qrInstance) return;

        try {
            setMessage("Generating QR Code sticker.");
            const url = `https://my.insta-pay.ch/q/${walletId}`;
            
            await qrInstance.update({ 
                data: url,
                width: platform === "telegram" ? 500 : 300,
                height: platform === "telegram" ? 500 : 300,
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            const blob = await qrInstance.getRawData("png");
            const file = new File([blob], "qrcode.png", { type: "image/png" });
            
            const formData = new FormData();
            formData.append('qrCode', file);
            formData.append("wallet_id", walletId);
            formData.append("chatbot", chatbot);
            
            if (platform === "telegram") {
                formData.append("platform", platform);
            }

            const res = await axios.post(
                `${process.env.REACT_APP_IP_DEV_API}/api/wallet/upload-qrcode`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const dec = decryptData(res.data.data);
            console.log("wallet_res = ", dec);
            console.log("url = ", url);
            setMessage("QR Code sticker generated successfully!");
        } catch (error) {
            console.error('Upload error:', error);
            const dec = error.response?.data?.data ? decryptData(error.response.data.data) : null;
            setMessage(dec?.message ?? "Something went wrong while generating QR Code sticker.");
        } finally {
            setGenerated(prev => prev + 1);
        }
    };

    useLayoutEffect(() => {
        if (generated < wallets.length) {
            const generateQR = async () => {
                for (const item of wallets) {
                    if (item?.wallet_type === "insta") {
                        await uploadQR(item.wallet_id);
                    }
                }
            };

            const timeout = setTimeout(generateQR, 3000);
            return () => clearTimeout(timeout);
        }
    }, [wallets, generated]);

    return (
        <div style={{ 
            position: "absolute", 
            top: "-1000vh", 
            left: "-100vw",
            width: platform === "telegram" ? "500px" : "300px",
            height: platform === "telegram" ? "500px" : "300px",
        }}>
            <div ref={ref} />
        </div>
    );
};

export default QrGenerate;