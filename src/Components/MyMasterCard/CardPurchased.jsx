import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from './styles/index.module.scss'
import Giftpng from "./files/gift-png.png"
import IpLogo from "./files/ip.svg"
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from 'swiper'
import { Freeze, plus, CreditCardR, Wallet2, FileDown, CreditCardP, Notification, Speaker, Apay, Gpay, Samsung, Copy, checktoggle, ApayWhite, GpayWhite } from "./files"
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
// import { useStateManager } from 'react-select';
import InstaPayLoader from '../Loader';
import { toast } from 'react-toastify';
import AddFundsModal from "./AddFundsModal"
import { useLocation, useNavigate } from 'react-router';
import useWindowWidth from '../../utils/useWindowWidth';
import CardtoCard from './CardtoCardModal';
import { Modal, ModalBody, ModalHeader, Input, ModalFooter } from 'reactstrap';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import OTPConfirmation from "../UserSettingsNew/OTPConfirmation"
import { getDecimalPointIndex } from '../../Helper/getDecimalIndex';
import CardtoWallet from './CardtoWallet';
import { useTranslation } from 'react-i18next';
import { DateRangePicker } from 'react-date-range';
import CountriesData from "../PaymentsNewer/CountriesData.json"
import "./styles/modal.reset.css"
// Add PDF and DOCX generation imports
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    Packer,
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    WidthType,
} from "docx";
import * as FileSaver from "file-saver";
import img from "../../assets/images/logo/logo2.png"
import { useQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../utils/Functions/apiWrapper';
import { localCurrency } from '../../utils/Functions';
import { formatCurrency } from '../../Helper/AmountFormat';

export const Toggle = ({ checked, onChange, isCheckbox = false }) => (
    <label className={isCheckbox ? styles.checkbox : styles.toggle}>

        <input
            type={isCheckbox ? "checkbox" : "checkbox"}
            checked={checked}
            onChange={onChange}
        />

        <span className={isCheckbox ? styles.checkmark : styles.slider}>
            {checked && <img src={checktoggle} alt="" />}
        </span>
    </label>
);

// Tooltip component for local use
const Tooltip = ({ children, targetId, isOpen, setIsOpen }) => {
    return (
        <>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#333',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    pointerEvents: 'none',
                }}>
                    {children}
                </div>
            )}
        </>
    );
};

// 1. Add a reusable DisabledOverlay component for the blur+message effect
const DisabledOverlay = ({ message, t }) => (
    <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: 16,
        color: '#421cb1',
        textAlign: 'center',
        pointerEvents: 'none',
    }}>
        {t(message)}
    </div>
);

const CardPurchased = ({ cards, setCardPurchased, current, setCurrent, currentCardDetails, setCurrentCardDetails, transactions }) => {
    const [checks, setChecks] = useState({
        cardStatus: true,
        onlinePurchases: false,
        bAndG: false,
        contactlessPay: false
    });
    const swiperRef = useRef()
    const [showModals, setShowModals] = useState({
        addFunds: false,
        ctc: false,
        ctw: false,
        download: false
    })
    const [dateRanges, setDateRanges] = useState({
        startDate: "",
        endDate: "",
        key: 'selection',
    })
    const [fileType, setFileType] = useState("pdf")
    const [downloading, setDownloading] = useState(false)

    const { authHeader, userDetails, setUserDetails } = useContext(UserContext)
    const [cardLoading, setCardLoading] = useState(true)
    const width = useWindowWidth()
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [flippedCards, setFlippedCards] = useState({});
    const { t } = useTranslation()
    const [tooltipOpen, setTooltipOpen] = useState({
        onlinePurchases: false,
        bAndG: false,
        contactlessPay: false,
        blockedCountries: false,
        notificationSettings: false,
        reportLost: false
    });
    const [cardStatus, setCardStatus] = useState("active")
    const [freezeLoading, setFreezeLoading] = useState(false);
    const { data: balanceInLocal } = useQuery({
        queryKey: ["MasterCardBalanceConversion", currentCardDetails?.balance],
        queryFn: () => apiWrapper({
            endpoint: `/api/wallet/get-plain-exchange-rate?from=${currentCardDetails?.currency}&to=${localCurrency(userDetails)}&amount=${currentCardDetails?.balance}`
        }).then(dec => dec.exchangeRate?.result),
        enabled: !!currentCardDetails?.balance,
        staleTime: 100000,
    })

    const handleCardFlip = (cardId) => {
        setFlippedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const formatCardNumber = (number) => {
        if (!number) return '';
        return number.replace(/(.{4})/g, '$1-').slice(0, -1);
    };



    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success('Copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy!');
            });
    };

    useEffect(() => {
        setCardLoading(true)
        const getCardDetail = async () => {

            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/get-card-details/${cards[current]._id}`, {
                    headers: authHeader
                })

                const dec = decryptData(res.data.data)
                setCurrentCardDetails(dec.data)
                setCardStatus(dec?.data?.status === '1' ? "activate" : "deactive")
                console.log(dec, "lala")
            } catch (error) {
                console.log(error)
                const dec = decryptData(error.response?.data?.data)
                console.log(dec, "lala")
            }
            finally {
                setCardLoading(false)
            }
        }

        getCardDetail()
    }, [current])


    const freezeToggle = async () => {
        setFreezeLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/${cardStatus === "deactive" ? "activate" : "freeze"}`,
                {
                    data: encryptData({ card_id: cards[current]._id })
                },
                {
                    headers: authHeader
                }
            )

            console.log(decryptData(res.data?.data))
            if (cardStatus === "deactive") {
                setCardStatus("active")
            } else {
                setCardStatus("deactive")
            }
        } catch (error) {
            const dec = decryptData(error?.response?.data?.data)
            console.log(dec)
        }
        setFreezeLoading(false);
    }
    const handleToggle = (property) => {
        setChecks(prev => ({
            ...prev,
            [property]: !prev[property]
        }));
    };

    const navigate = useNavigate()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const addFundsMobile = queryParams.get("addFundsMobile")
    const ctcMobile = queryParams.get("ctcMobile")
    const ctwMobile = queryParams.get("ctwMobile")


    const openModal = (modalName) => {
        setShowModals({
            addFunds: false,
            ctc: false,
            [modalName]: true
        });
    };

    const [missingEmail, setMissingEmail] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [otpType, setOtpType] = useState("sms")
    const [otpToken, setOtpToken] = useState(null)
    const [showOtp, setShowOtp] = useState(false)
    const [codeType, setCodeType] = useState("sms")

    const sendOtp = async (type = "") => {
        setIsSaving(true)
        setOtpType(type === "email" ? "email" : "phone")

        try {
            const body = {
                email: missingEmail,
                account_id: userDetails?._id,
                authenticator: otpType === "authenticator"
            }

            const encrypted = encryptData(body)
            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/set-${type}-otp`, {
                data: encrypted
            }, {
                headers: authHeader
            })

            const data = decryptData(res.data.data)

            setOtpToken(data?.token)
            setShowOtp(true)
        } catch (err) {
            const dec = decryptData(err.response.data.data)
            console.log(dec)
            toast.error("Something went wrong while sending otp to your " + type)
        }
        setIsSaving(false)
    }

    const updateCardEmail = async () => {
        try {
            const data = {
                card_id: cards[current]._id,
                card_email: missingEmail,
            }

            const res = await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/mastercard/update-email`, { data: encryptData(data) }, {
                headers: authHeader
            })

            const dec = decryptData(res.data.data)
            setShowOtp(false)
            console.log(dec)
        } catch (err) {
            const dec = decryptData(err.response.data.data)
            console.log(dec)
        }
    }
    const verifyOTP = async (setter, type = "", otp) => {
        setIsSaving(true)
        try {
            const data = {
                token: otpToken,
                otp,
                email: missingEmail,
                account_id: userDetails?._id
            }

            await axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/verify-${type}-otp`, {
                data: encryptData(data)
            }, {
                headers: authHeader
            })

            setUserDetails(prev => ({
                ...prev,
                email: missingEmail
            }))
            setShowEmailModal(false)
            updateCardEmail()

        } catch (err) {
            toast.error("Something went wrong while verifying otp!")
        }
        setIsSaving(false)
    }

    const handleChange = (ranges) => {
        console.log(ranges)
        if (ranges.selection) {
            setDateRanges(ranges.selection)
        }
    }
    const handleDownload = () => {
        let filteredTransactions = transactions;
        if (dateRanges.startDate && dateRanges.endDate) {
            const startDate = new Date(dateRanges.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateRanges.endDate);
            endDate.setHours(23, 59, 59, 999);

            filteredTransactions = filteredTransactions.filter(t => {
                const txDate = new Date(t.createdAt);
                return txDate >= startDate && txDate <= endDate;
            });
        }

        if (fileType === "pdf") {
            generatePDF(filteredTransactions);
        } else {
            generateDOCX(filteredTransactions);
        }
    };

    const generatePDF = (filteredTransactions) => {
        setDownloading(true);
        const tableStyles = {
            fontSize: 8,
        };
        const tableHeaderStyles = {
            fontSize: 8,
            fillColor: [89, 38, 240],
            textColor: [255, 255, 255],
        };

        const doc = new jsPDF();

        // Add logo
        doc.addImage(img, "png", 14, 10, 46.5, 13);
        doc.setFont("sans-serif", "normal", "normal");
        doc.setFontSize(10);
        doc.text(`Transaction Statement for ${userDetails?.first_name || userDetails?.company_name} ${userDetails?.last_name}`, 14, 32, { maxWidth: 200 });

        const currentDate = new Date();
        const formattedDate = `Generated on ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFont("sans-serif", "normal", "bold");
        doc.setFontSize(10);
        doc.text(formattedDate, 148, 17.5);

        // Add card info
        doc.setFont("sans-serif", "normal", "bold");
        doc.setFontSize(12);
        doc.text("Card Information:", 14, 45);
        doc.setFont("sans-serif", "normal", "normal");
        doc.setFontSize(10);
        doc.text(`Card Number: •••• •••• •••• ${currentCardDetails?.card_number?.slice(-4)}`, 14, 55);
        doc.text(`Card Type: ${cards[current]?.type === "standard" ? "Standard" : "Premium"}`, 14, 62);

        // Add date range if selected
        if (dateRanges.startDate && dateRanges.endDate) {
            const startDate = new Date(dateRanges.startDate).toLocaleDateString();
            const endDate = new Date(dateRanges.endDate).toLocaleDateString();
            doc.text(`Period: ${startDate} to ${endDate}`, 14, 69);
        }

        doc.setFont("sans-serif", "normal", "bold");
        doc.setFontSize(14);
        doc.text("Transaction Details:", 14, 85);

        // Prepare transaction data
        const transactionBody = filteredTransactions.map(tx => [
            new Date(tx.createdAt).toLocaleString(),
            tx.transactionId,
            `•••• •••• •••• ${tx.cardNo?.slice(-4) || "N/A"}`,
            tx.type?.toUpperCase() || "N/A",
            tx.transaction_type?.replace(/_/g, ' ').toUpperCase() || "N/A",
            tx.reason || tx.merchantName || "N/A",
            `${tx.currency} ${tx.txAmount?.toFixed(2) || "0.00"}`,
            tx.status || "N/A"
        ]);

        const transactionTable = {
            head: [['Date & Time', 'Transaction ID', 'Card No', 'Type', 'Transaction Type', 'Reason', 'Amount', 'Status']],
            body: transactionBody,
            startY: 95,
            styles: tableStyles,
            headStyles: tableHeaderStyles,
        };

        doc.autoTable(transactionTable);

        const fileName = `transaction_statement_${userDetails?.first_name || userDetails?.company_name}_${userDetails?.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        setDownloading(false);
    };

    const generateDOCX = (filteredTransactions) => {
        setDownloading(true);

        const generateTableRows = () => {
            const rows = [];

            // Add header row
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Date & Time")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Transaction ID")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Card No")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Type")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Transaction Type")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Reason")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Amount")],
                            shading: { fill: "A9A9A9" },
                        }),
                        new TableCell({
                            children: [new Paragraph("Status")],
                            shading: { fill: "A9A9A9" },
                        }),
                    ],
                })
            );

            // Add transaction rows
            filteredTransactions.forEach(tx => {
                rows.push(
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph(new Date(tx.createdAt).toLocaleString())],
                            }),
                            new TableCell({
                                children: [new Paragraph(tx.transactionId || "N/A")],
                            }),
                            new TableCell({
                                children: [new Paragraph(`•••• •••• •••• ${tx.cardNo?.slice(-4) || "N/A"}`)],
                            }),
                            new TableCell({
                                children: [new Paragraph(tx.type?.toUpperCase() || "N/A")],
                            }),
                            new TableCell({
                                children: [new Paragraph(tx.transaction_type?.replace(/_/g, ' ').toUpperCase() || "N/A")],
                            }),
                            new TableCell({
                                children: [new Paragraph(tx.reason || tx.merchantName || "N/A")],
                            }),
                            new TableCell({
                                children: [new Paragraph(`${tx.currency} ${tx.txAmount?.toFixed(2) || "0.00"}`)],
                            }),
                            new TableCell({
                                children: [new Paragraph(tx.status || "N/A")],
                            }),
                        ],
                    })
                );
            });

            return rows;
        };

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: `Transaction Statement`,
                            heading: HeadingLevel.HEADING_1,
                            bold: true,
                            spacing: {
                                before: 240,
                                after: 240,
                            },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Transaction Statement for ${userDetails?.first_name || userDetails?.company_name} ${userDetails?.last_name}`,
                                    size: 18,
                                    spacing: {
                                        before: 240,
                                        after: 240,
                                    },
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Card Number: •••• •••• •••• ${currentCardDetails?.card_number?.slice(-4)}`,
                                    size: 16,
                                    spacing: {
                                        before: 120,
                                        after: 120,
                                    },
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Card Type: ${cards[current]?.type === "standard" ? "Standard" : "Premium"}`,
                                    size: 16,
                                    spacing: {
                                        before: 120,
                                        after: 120,
                                    },
                                }),
                            ],
                        }),
                        ...(dateRanges.startDate && dateRanges.endDate ? [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Period: ${new Date(dateRanges.startDate).toLocaleDateString()} to ${new Date(dateRanges.endDate).toLocaleDateString()}`,
                                        size: 16,
                                        spacing: {
                                            before: 120,
                                            after: 240,
                                        },
                                    }),
                                ],
                            })
                        ] : []),
                        new Paragraph({
                            text: "Transaction Details",
                            heading: HeadingLevel.HEADING_2,
                            bold: true,
                            spacing: {
                                before: 240,
                                after: 240,
                            },
                        }),
                        new Table({
                            rows: generateTableRows(),
                            width: {
                                size: 100,
                                type: WidthType.PERCENTAGE,
                            },
                        }),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            const fileName = `transaction_statement_${userDetails?.first_name || userDetails?.company_name}_${userDetails?.last_name}_${new Date().toISOString().split('T')[0]}.docx`;
            FileSaver.saveAs(blob, fileName);
            setDownloading(false);
        });
    };

    console.log(cards, current, cards[current])

    return (
        <>
            {(((!showModals.addFunds && !addFundsMobile) && (!showModals.ctc && !ctcMobile) && (!showModals.ctw && !ctwMobile)) || width > 1000) &&
                <div className={styles.cardContainer} style={{ padding: width < 600 && "0", boxShadow: width < 600 && "none" }}>
                    <div className={styles.left}>
                        <div className={styles.topInfo}>
                            <div>
                                <p>{t("My Cards")}</p>
                                <span>{cards.length}</span>
                            </div>

                            <button style={{ opacity: cards.length === 3 && 0.5 }} disabled={cards.length === 3} onClick={() => setCardPurchased(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M8.67521 4.24182V13.5752M4.00854 8.90849H13.3419" stroke="white" strokeWidth="1.56777" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {t("Add Card")}
                            </button>
                        </div>

                        <h2>{t('My Primary MasterCard')}</h2>

                        <div style={{ width: '100%', position: 'relative' }}>
                            <Swiper
                                slidesPerView={window.innerWidth <= 768 ? 1.5 : 3}
                                effect='coverflow'
                                coverflowEffect={{
                                    rotate: 0,
                                    stretch: 0,
                                    depth: 100,
                                    modifier: 2.5,
                                    slideShadows: false,

                                }}
                                centeredSlides={true}
                                initialSlide={1}
                                spaceBetween={-220}
                                slideToClickedSlide={true}
                                className="mySwiper"
                                grabCursor={true}
                                modules={[EffectCoverflow]}
                                onSlideChange={e => {
                                    setCurrent(e.activeIndex)
                                    setFlippedCards({})
                                }}
                                ref={swiperRef}
                                style={{
                                    width: '100%',
                                    padding: '20px 0',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: '0 auto'
                                }}
                            >

                                {cards?.map((card) => (
                                    <SwiperSlide key={card._id}>
                                        <div

                                            className={`${styles.card} ${card.type === "standard" ? styles.standard : styles.premium} ${flippedCards[card._id] ? styles.flipped : ''}`}
                                            onClick={() => {
                                                if ((cards[current]?.premium_features?.apple_pay === true || cards[current]?.premium_features?.google_pay === true) && !userDetails.email) {
                                                    setShowEmailModal(true)
                                                } else {
                                                    handleCardFlip(card._id)
                                                }
                                            }}
                                        >
                                            <div className={styles.front}>
                                                <div>
                                                    <img src={IpLogo} alt="" />
                                                    <span className={styles.topicon}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="33" height="21" viewBox="0 0 33 21" fill="none">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.1074 17.9641H20.8834V2.23291H12.1074V17.9641Z" fill="#FF5F00" />
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.664 10.0988C12.664 6.90736 14.162 4.06492 16.4947 2.23323C14.7886 0.893439 12.6361 0.0941772 10.2964 0.0941772C4.75752 0.0941772 0.267578 4.57349 0.267578 10.0988C0.267578 15.6242 4.75752 20.1035 10.2964 20.1035C12.6361 20.1035 14.7886 19.3043 16.4947 17.9645C14.162 16.1325 12.664 13.2903 12.664 10.0988Z" fill="#EB001B" />
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M32.4081 16.2984V15.9101H32.3065L32.1897 16.1772L32.0727 15.9101H31.971V16.2984H32.0426V16.0054L32.1524 16.2581H32.2268L32.3365 16.0049V16.2984H32.4081ZM31.7643 16.2984V15.9763H31.8947V15.9107H31.5631V15.9763H31.6933V16.2984H31.7643ZM32.7213 10.0988C32.7213 15.6241 28.2311 20.1035 22.6925 20.1035C20.3528 20.1035 18.2 19.3042 16.4941 17.9644C18.8269 16.1327 20.3249 13.2903 20.3249 10.0988C20.3249 6.90758 18.8269 4.06514 16.4941 2.23317C18.2 0.893378 20.3528 0.0941162 22.6925 0.0941162C28.2311 0.0941162 32.7213 4.57343 32.7213 10.0988Z" fill="#F79E1B" />
                                                        </svg>
                                                    </span>
                                                </div>

                                                <div style={{ alignItems: 'flex-end' }}>
                                                    <h2>{userDetails?.first_name || userDetails?.company_name} {userDetails?.last_name}</h2>

                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: '4px' }}>
                                                        {card?.premium_features?.apple_pay === true && <img src={ApayWhite} alt="" />}
                                                        {card?.premium_features?.google_pay === true && <img src={GpayWhite} alt="" />}
                                                        <h3>
                                                            {t('Virtual')} <br /> {t('Card')}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.back}>
                                                <div>
                                                    <img src={IpLogo} alt="" />
                                                    <span className={styles.topicon}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="33" height="21" viewBox="0 0 33 21" fill="none">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.1074 17.9641H20.8834V2.23291H12.1074V17.9641Z" fill="#FF5F00" />
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.664 10.0988C12.664 6.90736 14.162 4.06492 16.4947 2.23323C14.7886 0.893439 12.6361 0.0941772 10.2964 0.0941772C4.75752 0.0941772 0.267578 4.57349 0.267578 10.0988C0.267578 15.6242 4.75752 20.1035 10.2964 20.1035C12.6361 20.1035 14.7886 19.3043 16.4947 17.9645C14.162 16.1325 12.664 13.2903 12.664 10.0988Z" fill="#EB001B" />
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M32.4081 16.2984V15.9101H32.3065L32.1897 16.1772L32.0727 15.9101H31.971V16.2984H32.0426V16.0054L32.1524 16.2581H32.2268L32.3365 16.0049V16.2984H32.4081ZM31.7643 16.2984V15.9763H31.8947V15.9107H31.5631V15.9763H31.6933V16.2984H31.7643ZM32.7213 10.0988C32.7213 15.6241 28.2311 20.1035 22.6925 20.1035C20.3528 20.1035 18.2 19.3042 16.4941 17.9644C18.8269 16.1327 20.3249 13.2903 20.3249 10.0988C20.3249 6.90758 18.8269 4.06514 16.4941 2.23317C18.2 0.893378 20.3528 0.0941162 22.6925 0.0941162C28.2311 0.0941162 32.7213 4.57343 32.7213 10.0988Z" fill="#F79E1B" />
                                                        </svg>
                                                    </span>
                                                </div>

                                                <div className={styles.cardDets}>
                                                    <div className={styles.num}>
                                                        <h3
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(currentCardDetails?.card_number);
                                                            }}
                                                            className={styles.vals}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {formatCardNumber(currentCardDetails?.card_number)}
                                                        </h3>
                                                        <img
                                                            src={Copy}
                                                            alt="copy"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(currentCardDetails?.card_number);
                                                            }}
                                                        />
                                                    </div>

                                                    <div className={styles.row}>
                                                        <div className={styles.dets}>
                                                            <span className={styles.lab}>{t('VALID THRU')}</span>
                                                            <h3 className={styles.vals}>{currentCardDetails?.exp_date}</h3>
                                                        </div>
                                                        <div className={styles.dets}>
                                                            <span className={styles.lab}>{t('CVV')}</span>
                                                            <h3 className={styles.vals}>{currentCardDetails?.cvv}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        <span style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if ((cards[current]?.premium_features?.apple_pay === true || cards[current]?.premium_features?.google_pay === true) && !userDetails.email) {
                                    setShowEmailModal(true)
                                } else {
                                    handleCardFlip(cards[current]._id)
                                }
                            }}
                            className={styles.tap}
                        >{t('Tap to see details')}</span>

                        <div className={styles.balance}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="222" height="160" viewBox="0 0 222 160" fill="none">
                                <g filter="url(#filter0_f_3023_732)">
                                    <path d="M150.496 -82.8116C127.102 -53.7846 100.534 11.0036 181.415 37.9406C282.517 71.6118 252.58 -130.996 150.496 -82.8116Z" fill="#5926F0" fillOpacity="0.26" />
                                </g>
                                <defs>
                                    <filter id="filter0_f_3023_732" x="0.534958" y="-216.562" width="369.6" height="384.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                        <feGaussianBlur stdDeviation="63.15" result="effect1_foregroundBlur_3023_732" />
                                    </filter>
                                </defs>
                            </svg>
                            <div className={styles.top}>
                                <p>{t('Card Balance')}</p>
                                <span>•• {currentCardDetails?.card_number?.slice(-4)}</span>
                            </div>

                            <div className={styles.bottom}>
                                {!cardLoading &&
                                    <>
                                        <h2>
                                            ${currentCardDetails?.balance >= 0.01 ? Number(currentCardDetails?.balance)?.toFixed(2) : Number(currentCardDetails?.balance).toFixed(getDecimalPointIndex(+currentCardDetails?.balance))}
                                        </h2>

                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <img style={{ width: "25px", borderRadius: "3px", boxShadow: "0px 0px 3px #00000066" }} src={CountriesData.find(c => c.alpha3 === userDetails?.country_iso_code).file_url} alt="" />
                                            <p style={{ fontSize: "20px", color: "#848484", fontWeight: 600, marginBottom: "0px" }}>
                                                {localCurrency(userDetails)} {formatCurrency(balanceInLocal, true)}
                                            </p>
                                        </div>
                                    </>
                                }
                                {cardLoading &&
                                    <div style={{ width: '150px' }}>
                                        <InstaPayLoader />
                                    </div>
                                }
                                {/* <div>
                            <span>
                                +3,8%
                            </span>

                            <p>From Lasth month</p>
                        </div> */}
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.detailsContainer}>
                            <h4 className={styles.title}>{t('Manage My MasterCard')}</h4>
                            <div className={styles.column} style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: "8px" }}>
                                <div className={styles.iconBox} style={{ flex: 2, justifyContent: "space-between", padding: "8px 16px" }}>
                                    <span>{t('Card Label')}</span>
                                    <div className={styles.cardLabel}>
                                        <h3>{t('My Primary MasterCard')}</h3>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <path d="M8.67479 13.7417H14.6748M2.6748 13.7417H3.79117C4.11729 13.7417 4.28035 13.7417 4.4338 13.7049C4.56985 13.6722 4.69991 13.6183 4.8192 13.5452C4.95376 13.4628 5.06906 13.3475 5.29966 13.1169L13.6748 4.74171C14.2271 4.18943 14.2271 3.294 13.6748 2.74171C13.1225 2.18943 12.2271 2.18943 11.6748 2.74171L3.29964 11.1169C3.06904 11.3475 2.95374 11.4628 2.87128 11.5973C2.79818 11.7166 2.74431 11.8467 2.71164 11.9827C2.6748 12.1362 2.6748 12.2992 2.6748 12.6254V13.7417Z" stroke="#71767A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <div style={{ justifyContent: "space-between" }} className={styles.iconBox}>
                                    <span>{t('Card Status')}</span>

                                    <Toggle checked={checks.cardStatus} onChange={() => handleToggle("cardStatus")} />
                                </div>
                                <div onClick={freezeToggle} style={{ cursor: freezeLoading ? "wait" : "pointer", position: 'relative', opacity: freezeLoading ? 0.7 : 1 }} className={styles.iconBox}>
                                    <img src={Freeze} alt="" />
                                    <span>{freezeLoading ? t('Processing') + "..." : (cardStatus !== "deactive" ? t('Freeze Card') : t('Activate Card'))}</span>
                                </div>
                            </div>

                            <div className={styles.column} style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: '12px', justifyContent: "center", flex: 1 }}>
                                    <div
                                        onClick={() => {
                                            if (cardStatus === "deactive") return;
                                            openModal("addFunds")
                                            if (width < 1000) {
                                                navigate("/my-mastercard?addFundsMobile=true")
                                            }
                                        }}
                                        style={{
                                            cursor: cardStatus === "deactive" ? "not-allowed" : "pointer",
                                            opacity: cardStatus === "deactive" ? 0.7 : 1,
                                            position: 'relative'
                                        }}
                                        className={styles.iconBox}
                                        onMouseEnter={e => cardStatus === "deactive" && (e.currentTarget.querySelector('.disabled-overlay').style.display = 'flex')}
                                        onMouseLeave={e => cardStatus === "deactive" && (e.currentTarget.querySelector('.disabled-overlay').style.display = 'none')}
                                    >
                                        <img src={plus} alt="" />
                                        <span>{t('Add Funds')}</span>
                                        {cardStatus === "deactive" && <div className="disabled-overlay" style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}><DisabledOverlay t={t} message="Your card is freeze" /></div>}
                                    </div>
                                    <div
                                        onClick={() => {
                                            if (cardStatus === "deactive") return;
                                            openModal("ctc")
                                            if (width < 1000) {
                                                navigate("/my-mastercard?ctcMobile=true")
                                            }
                                        }}
                                        style={{ cursor: cardStatus === "deactive" ? "not-allowed" : "pointer", opacity: cardStatus === "deactive" ? 0.7 : 1, position: 'relative' }}
                                        className={styles.iconBox}
                                        onMouseEnter={e => cardStatus === "deactive" && (e.currentTarget.querySelector('.disabled-overlay').style.display = 'flex')}
                                        onMouseLeave={e => cardStatus === "deactive" && (e.currentTarget.querySelector('.disabled-overlay').style.display = 'none')}
                                    >
                                        <img src={CreditCardR} alt="" />
                                        <span>{t('Card to Card Transfer')}</span>
                                        {cardStatus === "deactive" && <div className="disabled-overlay" style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}><DisabledOverlay t={t} message="Your card is freeze" /></div>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: '12px', justifyContent: "center", flex: 1 }}>
                                    <div
                                        onClick={() => {
                                            if (cardStatus === "deactive") return;
                                            openModal("ctw")
                                            if (width < 1000) {
                                                navigate("/my-mastercard?ctwMobile=true")
                                            }
                                        }}
                                        style={{ cursor: cardStatus === "deactive" ? "not-allowed" : "pointer", opacity: cardStatus === "deactive" ? 0.7 : 1, position: 'relative' }}
                                        className={styles.iconBox}
                                        onMouseEnter={e => cardStatus === "deactive" && (e.currentTarget.querySelector('.disabled-overlay').style.display = 'flex')}
                                        onMouseLeave={e => cardStatus === "deactive" && (e.currentTarget.querySelector('.disabled-overlay').style.display = 'none')}
                                    >
                                        <img src={Wallet2} alt="" />
                                        <span>{t('Card to Wallet Transfer')}</span>
                                        {cardStatus === "deactive" && <div className="disabled-overlay" style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}><DisabledOverlay t={t} message="Your card is freeze" /></div>}
                                    </div>
                                    <div onClick={() => openModal("download")} style={{ cursor: "pointer" }} className={styles.iconBox}>
                                        <img src={FileDown} alt="" />
                                        <span>{t('Download Statement')}</span>
                                    </div>
                                </div>

                                <div onClick={() => setCardPurchased(false)} className={styles.giftDiv} style={{ alignSelf: "stretch", flex: 2, backgroundColor: "#421cb1", borderRadius: "6px", background: `url(${Giftpng})`, backgroundSize: "cover", backgroundPosition: "right", backgroundRepeat: "no-repeat" }}>
                                    {/* <img src={Giftpng} alt="" /> */}
                                    <div>
                                        <div>
                                            <img style={{ width: "24px" }} src={CreditCardP} alt="" />
                                            <h3>{t('Create an Add-On Card')}</h3>
                                        </div>
                                        <p>{t('Send joy in just a few clicks!')}<br />{t('Create your')} <span>{t('InstaPay Mastercard Gift')}</span> {t('Card now.')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.detailsContainer}>
                            <h4 className={styles.title}>{t('Card Settings')}</h4>

                            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1000 ? "1fr 1fr 1fr" : "1fr", gap: "10px", width: "100%" }}>
                                <div style={{ justifyContent: "space-between", position: 'relative' }} className={styles.iconBox}
                                    onMouseEnter={() => setTooltipOpen(prev => ({ ...prev, onlinePurchases: true }))}
                                    onMouseLeave={() => setTooltipOpen(prev => ({ ...prev, onlinePurchases: false }))}>
                                    <span id="online-purchases-label">{t('Online Purchases')}</span>
                                    <Tooltip isOpen={tooltipOpen.onlinePurchases}>{t('Coming Soon')}</Tooltip>
                                    <Toggle
                                        checked={checks.onlinePurchases}
                                    // onChange={() => handleToggle("onlinePurchases")}
                                    />
                                </div>
                                <div style={{ justifyContent: "space-between", position: 'relative' }} className={styles.iconBox}
                                    onMouseEnter={() => setTooltipOpen(prev => ({ ...prev, bAndG: true }))}
                                    onMouseLeave={() => setTooltipOpen(prev => ({ ...prev, bAndG: false }))}>
                                    <span id="betting-gambling-label">{t('Online Betting and Gambling')}</span>
                                    <Tooltip isOpen={tooltipOpen.bAndG}>{t('Coming Soon')}</Tooltip>
                                    <Toggle
                                        checked={checks.bAndG}
                                    // onChange={() => handleToggle("bAndG")}
                                    />
                                </div>
                                <div style={{ justifyContent: "space-between", position: 'relative' }} className={styles.iconBox}
                                    onMouseEnter={() => setTooltipOpen(prev => ({ ...prev, contactlessPay: true }))}
                                    onMouseLeave={() => setTooltipOpen(prev => ({ ...prev, contactlessPay: false }))}>
                                    <span id="contactless-label">{t('Contactless Payment')}</span>
                                    <Tooltip isOpen={tooltipOpen.contactlessPay}>{t('Coming Soon')}</Tooltip>
                                    <Toggle
                                        checked={checks.contactlessPay}
                                    // onChange={() => handleToggle("contactlessPay")}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 1000 ? "1fr 1fr 1fr" : "1fr", gap: "10px", width: "100%" }}>
                                <div className={styles.iconBox} style={{ position: 'relative' }}
                                    onMouseEnter={() => setTooltipOpen(prev => ({ ...prev, blockedCountries: true }))}
                                    onMouseLeave={() => setTooltipOpen(prev => ({ ...prev, blockedCountries: false }))}>
                                    <img src={CreditCardR} alt="" id="blocked-countries-label" />
                                    <span>{t('Blocked Countries & Regions')}</span>
                                    <Tooltip isOpen={tooltipOpen.blockedCountries}>{t('Coming Soon')}</Tooltip>
                                </div>

                                <div className={styles.iconBox} style={{ position: 'relative' }}
                                    onMouseEnter={() => setTooltipOpen(prev => ({ ...prev, notificationSettings: true }))}
                                    onMouseLeave={() => setTooltipOpen(prev => ({ ...prev, notificationSettings: false }))}>
                                    <img src={Notification} alt="" id="notification-settings-label" />
                                    <span>{t('Notification Settings')}</span>
                                    <Tooltip isOpen={tooltipOpen.notificationSettings}>{t('Coming Soon')}</Tooltip>
                                </div>
                                <div className={styles.iconBox} style={{ position: 'relative' }}
                                    onMouseEnter={() => setTooltipOpen(prev => ({ ...prev, reportLost: true }))}
                                    onMouseLeave={() => setTooltipOpen(prev => ({ ...prev, reportLost: false }))}>
                                    <img src={Speaker} alt="" id="report-lost-label" />
                                    <span>{t('Report Lost/Stolen Card')}</span>
                                    <Tooltip isOpen={tooltipOpen.reportLost}>{t('Coming Soon')}</Tooltip>
                                </div>
                            </div>
                        </div>
                        <div style={{ backgroundColor: "white" }} className={styles.detailsContainer}>
                            <div style={{ display: "flex", justifyContent: "space-between", width: '100%', alignItems: window.innerWidth > 1000 && 'center', flexDirection: window.innerWidth < 1000 && "column", }}>
                                <h4 className={styles.title}>{t('Mobile Payments')}</h4>
                                <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 600 }}>{t('Manage devices and add your card to mobile wallets.')}</span>
                            </div>

                            <div className={styles.walletOptions}>
                                <h4>{t('Wallet Options:')}</h4>

                                <div className={styles.column} style={{ width: window.innerWidth < 1000 && "100%" }} >
                                    <div onClick={() => window.open("https://support.apple.com/en-us/108398", "_blank", "noopener,noreferrer")} className={styles.option}>
                                        <img src={Apay} alt="" />
                                        <h3>{t('Add to Apple Pay')}</h3>
                                    </div>
                                    <div onClick={() => window.open("https://support.google.com/wallet/answer/12058983?hl=en", "_blank", "noopener,noreferrer")} className={styles.option}>
                                        <img src={Gpay} alt="" />
                                        <h3>{t('Add to Google Pay')}</h3>
                                    </div>
                                    <div onClick={() => window.open("https://www.samsung.com/us/support/answer/ANS10002609", "_blank", "noopener,noreferrer")} className={styles.option}>
                                        <img src={Samsung} alt="" />
                                        <h3>{t('Add to Samsung Wallet')}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>}


            <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>Confirm</ModalHeader>
                <ModalBody>
                    <OTPConfirmation type={userDetails?.account_type === "individual" ? "email" : "phone"} callback={verifyOTP} setterValue={true} hideOtp={() => setShowOtp(false)} processing={isSaving} resendHandler={sendOtp} authType={codeType} setAuthType={setCodeType} showAuthToggle={false} hideTfaSwitch={true} otpTypeOnProfile={otpType} />
                </ModalBody>
            </Modal>
            <Modal isOpen={showEmailModal}>
                <ModalHeader toggle={() => setShowEmailModal(false)}    >
                    <h5 style={{ fontWeight: 600, fontSize: "16px", marginBottom: "0px" }}>{t('Email is Required')}</h5>
                </ModalHeader>
                <ModalBody>
                    <p style={{ fontSize: "14px", color: "#71767A", marginBottom: "0px" }}>{t('Please add your email to see Sensitive Information.')}</p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendOtp("email")
                        }}
                        className={styles.emailModal}>
                        <Input
                            label={t('Email')}
                            type="email"
                            placeholder={t('Enter your email')}
                            value={missingEmail}
                            onChange={(e) => setMissingEmail(e.target.value)}
                            style={{ margin: "1rem 0" }}
                        />
                        <button type="submit" style={{ border: 'none', outline: 'none', padding: "10px 18px", fontWeight: 600, fontSize: "15px", borderRadius: "8px", background: "#5926F0", color: "white", float: "inline-end" }} >{t('Submit')}</button>
                    </form>
                </ModalBody>
            </Modal>
            {(showModals.addFunds || addFundsMobile) &&
                <AddFundsModal
                    setCurrentCardDetails={setCurrentCardDetails}
                    card={cards[current]}
                    isOpen={showModals.addFunds || addFundsMobile}
                    setOpen={setShowModals} />
            }

            {(showModals.ctc || ctcMobile) &&
                <CardtoCard
                    currentCardDetails={currentCardDetails}
                    card={cards[current]}
                    setCurrentCardDetails={setCurrentCardDetails}
                    isOpen={showModals.ctc || ctcMobile}
                    setOpen={setShowModals}
                />
            }
            {(showModals.ctw || ctwMobile) &&
                <CardtoWallet
                    currentCardDetails={currentCardDetails}
                    card={cards[current]}
                    setCurrentCardDetails={setCurrentCardDetails}
                    isOpen={showModals.ctw || ctwMobile}
                    setOpen={setShowModals}
                />
            }
            <Modal style={{ minWidth: "700px" }} isOpen={showModals.download} toggle={() => setShowModals({ ...showModals, download: false })}>
                <ModalHeader toggle={() => setShowModals({ ...showModals, download: false })}>
                    {t("Download Your Statement")}
                </ModalHeader>

                <ModalBody>
                    <div className='date-range-ms'>
                        <h5 style={{ fontWeight: 600, marginBottom: "15px" }}>{t("Select The Date Range")}.</h5>
                        <DateRangePicker
                            maxDate={new Date()}
                            ranges={[dateRanges]}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <h5 style={{ fontWeight: 600, marginBottom: "15px" }}>{t("Select The Type")}.</h5>
                        <select
                            style={{ width: "100%", outline: "none", padding: "7px 10px", borderRadius: "5px", borderColor: "lightgray" }}
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                        >
                            <option value="pdf">PDF</option>
                            <option value="docx">DOCX</option>
                        </select>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        style={{
                            border: 'none',
                            outline: "none",
                            padding: "7px 15px",
                            borderRadius: "5px",
                            fontWeight: 600,
                            background: downloading ? "#ccc" : "#5526e0",
                            color: "white",
                            cursor: downloading ? "not-allowed" : "pointer"
                        }}
                    >
                        {downloading ? t("Downloading") : t("Download")}
                    </button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default CardPurchased;