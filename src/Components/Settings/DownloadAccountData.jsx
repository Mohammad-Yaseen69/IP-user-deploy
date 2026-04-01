import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, CreditCard, Home, Mail, Phone, User } from "react-feather";
import { Button, Card, CardBody, CardHeader, Input, Label } from "reactstrap";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserContext } from "../../Context/UserContext";
import img from "../../assets/images/logo/logo2.webp"
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
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const DownloadData = ({ isCollapsed, setIsCollapsed }) => {
    const [nameDob, setNameDob] = useState(true);
    const [address, setAddress] = useState(true);
    const [email, setEmail] = useState(true);
    const [number, setNumber] = useState(true);
    const [bankAccount, setBankAccount] = useState(true);
    const [cards, setCards] = useState(true);
    const [creditInfo, setCreditInfo] = useState(true);
    const [otherInfo, setOtherInfo] = useState(true);
    const [type, setType] = useState("");
    const [downloading, setDownloading] = useState(false)
    const { t } = useTranslation();
    const [savedCards, setSavedCards] = useState([])
    // userdetails and transactions files generators and states
    const { userDetails, authHeader } = useContext(UserContext)

    useEffect(() => {
        const getSavedCards = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                setSavedCards(dec?.panList)
            } catch (error) {

            }
        }

        if (userDetails) {
            getSavedCards()
        }
    }, [userDetails])

    const checkAll = () => {
        if (
            nameDob &&
            address &&
            email &&
            number &&
            bankAccount &&
            cards &&
            creditInfo &&
            otherInfo
        ) {
            setNameDob(false)
            setAddress(false)
            setEmail(false)
            setNumber(false)
            setBankAccount(false)
            setCards(false)
            setCreditInfo(false)
            setOtherInfo(false)
        } else {
            setNameDob(true)
            setAddress(true)
            setEmail(true)
            setNumber(true)
            setBankAccount(true)
            setCards(true)
            setCreditInfo(true)
            setOtherInfo(true)
        }
    }

    const options = [
        {
            value: "pdf",
            label: "PDF",
        },
        {
            value: "docx",
            label: "DOCX",
        },
    ];




    const generatePDF = () => {
        setDownloading(true)
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
        doc.setFont("sans-serif", "normal", "normal");
        doc.setFontSize(10);
        doc.text(`Below are the requested details of ${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`} includes their requested info available on InstaPay.`, 14, 32, { maxWidth: 200 });
        const currentDate = new Date();
        const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFont("sans-serif", "normal", "bold");
        doc.setFontSize(10);
        doc.text(formattedDate, 148, 17.5);

        doc.setFont("sans-serif", "normal", "bold");
        doc.setFontSize(17);
        doc.text("Personal Details: ", 14, 45);

        const personalBody = [
            nameDob ? ["Full Name", userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`] : null,
            nameDob ? ["InstaPay Username", `${userDetails?.username ?? "N/A"}`] : null,
            nameDob ? ["Date Of Birth", `${userDetails?.dob ?? "N/A"}`] : null,
            nameDob ? ["Gender", `${userDetails?.gender ?? "N/A"}`] : null,
            email ? ["Email Address", `${userDetails?.email ?? "N/A"}`] : null,
            number ? ["Phone Number", `+${userDetails?.phone ?? "N/A"}`] : null,
            address ? ["Address", `${userDetails?.address ?? "N/A"}`] : null,
            address ? ["City", `${userDetails?.city ?? "N/A"}`] : null,
            address ? ["Postal/Zip Code", `${userDetails?.postal_code ?? "N/A"}`] : null,
            address ? ["Country", `${userDetails?.country_name ?? "N/A"}`] : null,
            userDetails?.account_type ? ["Account Type", `${userDetails?.account_type ?? "N/A"}`] : null,
            userDetails?.insta_bot ? ["Linked Instagram", `${userDetails?.insta_bot ?? "N/A"}`] : null,
            userDetails?.user?.createdAt ? ["Member Since", `${new Date(userDetails?.user?.createdAt).toLocaleString() ?? "N/A"}`] : null,
        ]
        if (cards) {
            if (savedCards.length > 0) {
                savedCards?.forEach((item, i) => personalBody.push([`Credit Card ${i + 1}`, `XXXX XXXX XXXX ${item?.last4}`]))
            } else {
                personalBody.push([`Credit Cards`, `N/A`])
            }
        }

        const personalTable = {
            head: [['Title', 'Details']],
            body: personalBody.filter(item => item !== null),
            startY: 50,
            styles: tableStyles,
            headStyles: tableHeaderStyles,
        };

        doc.autoTable(personalTable);

        doc.save(`${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}.pdf`);
        // console.log(doc)
        setDownloading(false)
    };

    function generateTableRows() {
        const rows = [];
        if (nameDob) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Full Name")],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph(
                                    userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`
                                ),
                            ],
                        }),
                    ],
                })
            );

            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("InstaPay Username")],
                        }),
                        new TableCell({
                            children: [new Paragraph(userDetails?.username ?? "N/A")],
                        }),
                    ],
                })
            );
        }

        if (email) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Email Address")],
                        }),
                        new TableCell({
                            children: [new Paragraph(userDetails?.email ?? "N/A")],
                        }),
                    ],
                })
            );
        }

        if (number) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Phone number")],
                        }),
                        new TableCell({
                            children: [new Paragraph(userDetails?.phone ?? "N/A")],
                        }),
                    ],
                })
            );
        }

        if (address) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Address")],
                        }),
                        new TableCell({
                            children: [new Paragraph(`${userDetails?.address}`)],
                        }),
                    ],
                })
            );
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("City")],
                        }),
                        new TableCell({
                            children: [new Paragraph(`${userDetails?.city}`)],
                        }),
                    ],
                })
            );
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Country")],
                        }),
                        new TableCell({
                            children: [new Paragraph(`${userDetails?.country_name}`)],
                        }),
                    ],
                }
                ))

            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Account Type")],
                        }),
                        new TableCell({
                            children: [new Paragraph(`${userDetails?.account_type}`)],
                        }),
                    ],
                })
            );

            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Connected Instagram Bot")],
                        }),
                        new TableCell({
                            children: [new Paragraph(`${userDetails?.insta_bot}`)],
                        }),
                    ],
                })
            );
            if (cards) {
                if (savedCards.length > 0) {
                    savedCards?.forEach((item, i) => {
                        rows.push(
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph(`Credit Card ${i + 1}`)],
                                    }),
                                    new TableCell({
                                        children: [new Paragraph(`XXXX XXXX XXXX ${item?.last4}`)],
                                    }),
                                ],
                            })
                        )
                    })
                } else {
                    rows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph(`Credit Cards`)],
                                }),
                                new TableCell({
                                    children: [new Paragraph(`N/A`)],
                                }),
                            ],
                        })
                    )
                }
            }

            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph("Member Since")],
                        }),
                        new TableCell({
                            children: [
                                new Paragraph(
                                    `${userDetails?.user?.createdAt
                                        ?.split("T")[0]
                                        ?.split("-")
                                        ?.reverse()
                                        ?.join("-") ?? "N/A"
                                    }`
                                ),
                            ],
                        }),
                    ],
                })
            );

            return rows;
        }
    }

    const generateDOCX = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`,
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
                                    text: `Below are the requested details of ${userDetails?.user?.first_name} ${userDetails?.user?.last_name} includes their requested info available on InstaPay.`,
                                    size: 18,
                                    spacing: {
                                        before: 240,
                                        after: 240,
                                    },
                                }),
                            ],
                        }),
                        new Paragraph({
                            text: `Personal Information`,
                            heading: HeadingLevel.HEADING_1,
                            bold: true,
                            spacing: {
                                before: 240,
                                after: 240,
                            },
                        }),

                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph("Key")],
                                            shading: {
                                                fill: "A9A9A9",
                                            },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph("Value")],
                                            shading: {
                                                fill: "A9A9A9",
                                            },
                                        }),
                                    ],
                                }),
                                ...generateTableRows(),
                            ],
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
            FileSaver.saveAs(blob, `${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}.docx`);
            // console.log("Document created successfully");
        });
    };



    return (
        <Card>
            <CardHeader style={{ padding: "30px 30px 0" }}>
                <h4>{t("Download Your Data")}</h4>
            </CardHeader>
            <CardBody style={{ padding: "30px" }}>
                <div className="mt-5">
                    <div className="mt-5">
                        <h4>
                            {t("Request a Copy of Your Data")}
                        </h4>
                        <p>
                            {t("Submit a request to download a copy of your data")}
                        </p>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-5" style={{
                        flexWrap: "wrap"
                    }}>
                        <h5>
                            {t("Which Data Should Be Included in the Download?")}
                        </h5>
                        <span className="cursor-pointer font-weight-bold" onClick={checkAll} style={{ cursor: "pointer" }}>
                            {t("Select all applicable options.")}
                        </span>
                    </div>
                    <hr className="mt-2 mb-5" />
                    <div>
                        <div>
                            <h6>
                                {t("Personal Information")}
                            </h6>
                            <span className="text-secondary">
                                {t(
                                    "This information is used to secure your account, tailor your experience, and contact you as necessary."
                                )}
                            </span>
                        </div>
                        <div className="mt-3">
                            <ul className="list-unstyled">
                                <li className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-3 flex-grow-1" onClick={() => setNameDob(!nameDob)} style={{ cursor: "pointer" }}>
                                        <div className="h1 text-primary" style={{ marginBottom: 0, flexShrink: 0 }}>
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <div className="text-secondary">
                                                {t("Name and Date Of Birth")}
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="checkbox" checked={nameDob} onChange={e => setNameDob(e.target.checked)} style={{ flexShrink: 0, marginLeft: "1rem" }} />
                                </li>

                                <li className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-3 flex-grow-1" onClick={() => setAddress(!address)} style={{ cursor: "pointer" }}>
                                        <div className="h1 text-primary" style={{ marginBottom: 0, flexShrink: 0 }}>
                                            <Home size={24} />
                                        </div>
                                        <div>
                                            <div className="text-secondary">
                                                {t("Address")}
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="checkbox" checked={address} onChange={e => setAddress(e.target.checked)} style={{ flexShrink: 0, marginLeft: "1rem" }} />
                                </li>
                                <li className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center gap-3 flex-grow-1" onClick={() => setEmail(!email)} style={{ cursor: "pointer" }}>
                                        <div className="h1 text-primary" style={{ marginBottom: 0, flexShrink: 0 }}>
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <div className="text-secondary">
                                                {t("Email")}
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} style={{ flexShrink: 0, marginLeft: "1rem" }} />
                                </li>
                                <li className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3 flex-grow-1" onClick={() => setNumber(!number)} style={{ cursor: "pointer" }}>
                                        <div className="h1 text-primary" style={{ marginBottom: 0, flexShrink: 0 }}>
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <div className="text-secondary">
                                                {t("Phone number")}
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="checkbox" checked={number} onChange={e => setNumber(e.target.checked)} style={{ flexShrink: 0, marginLeft: "1rem" }} />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-5" />
                    <div>
                        <h6>
                            {t("Financial Information")}
                        </h6>
                        <span className="text-secondary">
                            {t(
                                "We use this information to enable faster checkout and to send or receive money in just a few clicks."
                            )}
                        </span>
                    </div>
                    <div className="mt-3">
                        <ul className="list-unstyled">
                            <li className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-3 flex-grow-1" onClick={() => setBankAccount(!bankAccount)} style={{ cursor: "pointer" }}>
                                    <div className="h1 text-primary" style={{ marginBottom: 0, flexShrink: 0 }}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="text-secondary">
                                            {t("Bank accounts")}
                                        </div>
                                    </div>
                                </div>
                                <Input type="checkbox" checked={bankAccount} onChange={e => setBankAccount(e.target.checked)} style={{ flexShrink: 0, marginLeft: "1rem" }} />
                            </li>

                            <li className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3 flex-grow-1" onClick={() => setCards(!cards)} style={{ cursor: "pointer" }}>
                                    <div className="h1 text-primary" style={{ marginBottom: 0, flexShrink: 0 }}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <div className="text-secondary">
                                            {t("Debit or credit cards")}
                                        </div>
                                    </div>
                                </div>
                                <Input type="checkbox" checked={cards} onChange={e => setCards(e.target.checked)} style={{ flexShrink: 0, marginLeft: "1rem" }} />
                            </li>
                        </ul>
                    </div>
                    <hr className="my-5" />
                    <div className="mt-3">
                        <ul className="list-unstyled">
                            <li className="mb-3">
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div className="flex-grow-1" onClick={() => setCreditInfo(!creditInfo)} style={{ cursor: "pointer" }}>
                                        <h6 style={{ marginBottom: "0.5rem" }}>
                                            {t("Credit Information")}
                                        </h6>
                                        <span className="text-secondary small d-block">{t("Includes your credit application information")}</span>
                                    </div>
                                    <Input type="checkbox" checked={creditInfo} onChange={e => setCreditInfo(e.target.checked)} style={{ flexShrink: 0, marginTop: "0.25rem" }} />
                                </div>
                            </li>
                            <li>
                                <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div className="flex-grow-1" onClick={() => setOtherInfo(!otherInfo)} style={{ cursor: "pointer" }}>
                                        <h6 style={{ marginBottom: "0.5rem" }}>
                                            {t("Other Information (not included in file)")}
                                        </h6>
                                        <span className="text-secondary small d-block">
                                            {t("Includes device info, technical usage data, geolocation information, marketing preferences, consent history, and data used for other services such as credit, identity verification, communications with PayPal, and third-party processors.")}
                                        </span>
                                    </div>
                                    <Input type="checkbox" checked={otherInfo} onChange={e => setOtherInfo(e.target.checked)} style={{ flexShrink: 0, marginTop: "0.25rem" }} />
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="border-bottom border-dashed border-secondary mt-5">
                        <h5>
                            {t("Choose file type:")}
                        </h5>
                    </div>

                    <div className="mt-2">
                        <Label>
                            {t("Select file type")}
                        </Label>
                        <Input type="select" className="mb-1" value={type} onChange={e => setType(e.target.value)}>
                            <option value="" disabled>{t("Select File Type")}</option>
                            {options.map(item => (
                                <option value={item.value} key={item.value}>{item.label}</option>
                            ))}
                        </Input>
                        <span className="text-secondary small">
                            {t("PDF file can be easily opened on any computer")}
                        </span>
                    </div>
                    <div className="mt-5 d-flex justify-content-end">
                        <Button style={{
                            background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                            border: "none",
                            outline: "none",
                            borderRadius: "10px"
                        }}
                            disabled={(
                                !nameDob &&
                                !address &&
                                !email &&
                                !number &&
                                !bankAccount &&
                                !cards &&
                                !creditInfo &&
                                !otherInfo ||
                                !type ||
                                downloading
                            )}
                            onClick={type === "pdf" ? generatePDF : generateDOCX}
                        >{downloading ? t("Downloading") + "..." : t("Download Data")}</Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};
export default DownloadData;
