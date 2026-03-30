import QRCodeStyling from 'qr-code-styling';
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import axios from 'axios';
import logo from "../../assets/images/logo/logo.webp"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";


const QrGenerate = ({ wallets = [], setMessage = () => { }, chatbot = false, platform, isInvoice, invoiceQrGenerateFn, invoiceUrl, invoiceId, downloadFileSetter, qrUrl }) => {
    const ref = useRef(null);
    const qrRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [generated, setGenerated] = useState(0)

    useEffect(() => {
        qrRef.current = new QRCodeStyling({
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

        const setup = async () => {
            try {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.src = logo;
                if (typeof img.decode === 'function') {
                    await img.decode();
                } else {
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                }
                if (qrRef.current) {
                    qrRef.current.update({ image: logo });
                    if (ref.current) {
                        qrRef.current.append(ref.current);
                    }
                }
                setIsReady(true);
            } catch (err) {
                console.error("Image failed to load:", err);
                if (ref.current) {
                    qrRef.current && qrRef.current.append(ref.current);
                }
                setIsReady(true);
            }
        };
        setup();

        return () => {
            if (ref.current) ref.current.innerHTML = "";
        };
    }, []);

    const waitForReady = async (timeoutMs = 3000) => {
        const start = Date.now();
        while ((!qrRef.current || !isReady) && Date.now() - start < timeoutMs) {
            await new Promise(r => setTimeout(r, 50));
        }
    };

    const preparingFormData = async (url) => {
        await waitForReady();
        if (!qrRef.current) throw new Error("QR generator not ready");

        qrRef.current.update({ data: url, image: logo });
        await new Promise(resolve => requestAnimationFrame(resolve));

        const fileName = `qrcode.png`;
        const mimeType = `image/png`;
        const blob = await qrRef.current.getRawData("png");

        if (downloadFileSetter) {
            downloadFileSetter(blob)
            return;
        }
        const file = new File([blob], fileName, { type: mimeType });
        const formData = new FormData();
        formData.append("qrCode", file)

        return formData
    }

    const uploadQR = async (item) => {
        setMessage("Generating Qr Code sticker.")

        const url = `https://my.insta-pay.ch/q/${item?.wallet_id}`

        const formData = await preparingFormData(url)

        formData.append("wallet_id", item?.wallet_id)
        formData.append("chatbot", chatbot)

        if (platform === "telegram") {
            formData.append("platform", platform)
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/wallet/upload-qrcode`, formData)
            const dec = decryptData(res.data.data)
            console.log("wallet_res = ", dec)
            console.log("url = ", url)
            console.log("set url = ", qrRef.current?._options?.data)
            setMessage("QR Code sticker generated successfully!")
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            setMessage(dec?.message ?? "Something went wrong while generating QR Code sticker.")
            console.log(dec)
        } finally {
            setGenerated(prev => prev + 1)
        }
    }

    useLayoutEffect(() => {
        if (isInvoice) return
        if (generated < wallets.length) {
            const generateQR = async () => {
                if (wallets.length > 0) {
                    for (const item of wallets) {
                        if (item?.wallet_type === "insta") {
                            await uploadQR(item);
                        }
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
    }, [wallets, generated, isInvoice])


    useEffect(() => {
        const generateQr = async () => {
            const formData = await preparingFormData(invoiceUrl)
            formData.append("invoiceId", invoiceId)
            invoiceQrGenerateFn(formData)
        }
        if (isInvoice && invoiceQrGenerateFn) {
            generateQr()
        }
    }, [isInvoice])

    useEffect(() => {
        if (downloadFileSetter) {
            preparingFormData(qrUrl)
        }
    }, [downloadFileSetter])

    return (
        <div style={{ position: "absolute", top: "-1000vh", left: "-100vw" }}>
            <div ref={ref} />
        </div>
    )
}

export default QrGenerate