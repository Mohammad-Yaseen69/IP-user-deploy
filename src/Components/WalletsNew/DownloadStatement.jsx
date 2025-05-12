import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { DateRangePicker } from 'react-date-range'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import calendar from "./files/calendar.svg"
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import jsPDF from 'jspdf'
import img from "../../assets/images/logo/logo2.png"
import { toast } from 'react-toastify'
import "jspdf-autotable";
import { service_name_formatter } from '../TransactionsNewApi/TransactionItem'

const DownloadStatement = ({ showModal, setShowModal, wallet }) => {
    const { userDetails, authHeader, beneficiaries } = useContext(UserContext)
    const { t } = useTranslation()
    const [dateString, setDateString] = useState("")
    const [fileType, setFileType] = useState("")
    const [downlaoding, setDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState("")
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
    const [apiDates, setApiDates] = useState(null)
    const handleChange = (ranges) => {
        if (ranges.selection) {
            const startDate = new Date(ranges.selection.startDate);
            startDate.setDate(startDate.getDate() + 1);

            const endDate = new Date(ranges.selection.endDate);
            endDate.setDate(endDate.getDate() + 1);

            const formattedDateRange = {
                from: startDate.toISOString().split('T')[0],
                to: endDate.toISOString().split('T')[0],
            };
            setDateString(`Selected from "${startDate.toDateString()}" to "${endDate.toDateString()}"`)
            setApiDates(formattedDateRange)
            setDateRange(ranges.selection);
        }
    };
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    }, []);

    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    const getTransactions = (callback) => {
        setDownloadError("")
        const data = {
            ...apiDates,
            query: ""
        }
        const encrypted = encryptData(data)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/search-account-transactions-wallet-by-date/${wallet.wallet_id}/0/0`,
            {
                data: encrypted
            }, {
            headers: authHeader,
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                callback(decrypted.transactionList)
                setShowModal(false)
                setApiDates(null)
                setFileType("")
                setDateString("")
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                console.log(decrypted)
                setDownloadError("No transactions found within the date range!")
                toast.error(decrypted?.message)
            })
            .finally(() => {
                setDownloading(false)
            })
    }

    const generatePDF = () => {
        setDownloading(true);
        const tableStyles = {
            fontSize: 7,
        };
        const tableHeaderStyles = {
            fontSize: 7,
            fillColor: [89, 38, 240],
            textColor: [255, 255, 255],
        };

        const doc = new jsPDF();


        doc.addImage(img, "png", 14, 10, 46.5, 13)
        // doc.setFont("montserrat", "normal", "bolder");
        // doc.setFontSize(20);
        // doc.text("InstaPay", 14, 25);

        doc.setFont("montserrat", "normal");
        doc.setFontSize(8);
        doc.text(`Wallet ID: INSTA-${wallet.wallet_id}`, 14, 32);
        doc.text(`Name: ${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`, 14, 38);
        doc.text(`Address: ${userDetails?.address ?? "N/A"}`, 14, 44);
        doc.text(`Statement Duration: ${apiDates?.from} to ${apiDates?.to}`, 14, 50);

        const transactionsTable = {
            head: [
                [
                    "Wallet ID",
                    "Wallet Currency",
                    "Current Balance",
                    "Wallet Status",
                ],
            ],
            body: [[
                `INSTA-${wallet?.wallet_id}`,
                wallet?.currency?.code,
                `${Number(wallet?.balance?.available)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${wallet?.currency?.code} `,
                wallet?.status?.toUpperCase()
            ]],
            startY: 60,
            styles: tableStyles,
            headStyles: tableHeaderStyles,
        };

        if (doc.autoTable) {
            doc?.autoTable(transactionsTable);
        }

        // Current Time and Date
        const currentDate = new Date();
        const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFont("montserrat", "normal", "bold");
        doc.setFontSize(8);
        doc.text(formattedDate, 160, 17.5);

        const callback = (arr) => {

            const transactionsTable = {
                head: [
                    [
                        "Date & Time",
                        "Transaction ID",
                        "Payment Type",
                        "Recipient",
                        "Type",
                        "Amount",
                        "Status",
                    ],
                ],
                body: arr.map((item) => {
                    const internationalReceiver = beneficiaries.filter(benef => benef?._id === item?.beneficiary)?.[0]

                    return [
                        new Date(item?.createdAt)?.toLocaleString(),
                        item?.reference_id,
                        item?.service_type === "withdraw_by_admin" || item?.service_type === "deposite_by_admin"
                            ?
                            "Admin Funds"
                            :
                            item?.payment_type?.includes("bank")
                                ?
                                "Bank"
                                :
                                item?.payment_type?.includes("mobile")
                                    ?
                                    "mobile"
                                    :
                                    service_name_formatter(item?.payment_type),
                        item?.service_type === "airtime"
                            ?
                            item?.airtime_number
                            :
                            item?.payment_type === "conversion" || item?.service_type === "withdrawal"
                                ?
                                item?.wallet_id
                                :
                                item?.transaction_type?.toLowerCase() === "debit"
                                    ?
                                    item?.service_type === "withdraw_by_admin"
                                        ?
                                        "Admin"
                                        :
                                        item?.service_type === "kyc_verification"
                                            ?
                                            "InstaPay"
                                            :
                                            item?.service_type === "withdrawal"
                                                ?
                                                `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20)
                                                :
                                                item?.receiver
                                                    ?
                                                    `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)
                                                    :
                                                    `${internationalReceiver?.first_name?? item?.account?.user?.first_name} ${internationalReceiver?.last_name?? item?.account?.user?.last_name}`.slice(0, 20)

                                    :
                                    item?.service_type === "topup"
                                        ?
                                        `${item?.receiver?.user?.first_name} ${item?.receiver?.user?.last_name}`.slice(0, 20)
                                        :
                                        `${item?.sender?.user?.first_name} ${item?.sender?.user?.last_name}`.slice(0, 20),
                        service_name_formatter(item?.service_type),
                        `${item?.transaction_type?.toLowerCase() === "debit" ? "-" : "+"}${item?.total ? Number(item?.total)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""} ${item?.currency?.code} `,
                        item?.status,
                    ]
                }),
                startY: 80,
                styles: tableStyles,
                headStyles: tableHeaderStyles,
            };

            if (doc?.autoTable) {
                doc?.autoTable(transactionsTable);
            }

            doc.save(`${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}_transactions.pdf`);
        };
        getTransactions(callback);
    };

    return (
        <Modal isOpen={showModal}>
            <ModalHeader toggle={() => setShowModal(!showModal)}>
                {t("Download Statement")}
            </ModalHeader>
            <ModalBody>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    position: "relative",
                    marginBottom: ".5rem"
                }}>
                    <div style={{ display: "flex", alignItems: "center", width: "90%", overflowX: "auto", padding: "1rem", background: "rgb(240,240,240)", borderRadius: "7px", whiteSpace: "nowrap" }}>{dateString}</div>
                    <img src={calendar} alt="i" onClick={handleDatePickerClick} />
                    {showDatePicker && (
                        <div ref={datePickerRef} style={{ position: "absolute", top: "50px", right: `0px`, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10px", zIndex: 10000000 }}>
                            <DateRangePicker maxDate={new Date()}
                                ranges={[dateRange]}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </div>
                {
                    downloadError
                    &&
                    <div style={{ color: "red", fontSize: ".65rem", fontWeight: 500, margin: ".5rem 0" }}>{downloadError}</div>
                }
                <Input type='select' value={fileType} onChange={e => setFileType(e.target.value)}>
                    <option value="">{t("-Select-File-Type-")}</option>
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                </Input>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={!fileType || !apiDates || downlaoding}
                    onClick={generatePDF}
                    style={{
                        border: "none",
                        outline: "none",
                        background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
                        backgroundBlendMode: "overlay, normal",
                        boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >{downlaoding ? t("Downloading") + "..." : t("Download Now")}</Button>
            </ModalFooter>
        </Modal>
    )
}

export default DownloadStatement