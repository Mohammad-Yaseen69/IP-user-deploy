import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronDown, ChevronUp, CreditCard, Home, Mail, Phone, User } from "react-feather";
import { Button, Card, CardBody, CardHeader, Input, Label } from "reactstrap";
import GradientButton from "./GradientButton";
import { H4 } from "../../../AbstractElements";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserContext } from "../../../Context/UserContext";
// import axios from "axios";
// import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
// import DownloadModal from "./DownloadModal";
// import * as XLSX from "xlsx"
import img from "../../../assets/images/logo/logo2.png"
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
    AlignmentType,
    Spacing,
} from "docx";
import * as FileSaver from "file-saver";

const DownloadData = ({ isCollapsed, setIsCollapsed }) => {
    const [nameDob, setNameDob] = useState(false);
    const [address, setAddress] = useState(false);
    const [email, setEmail] = useState(false);
    const [number, setNumber] = useState(false);
    const [bankAccount, setBankAccount] = useState(false);
    const [cards, setCards] = useState(false);
    const [creditInfo, setCreditInfo] = useState(false);
    const [otherInfo, setOtherInfo] = useState(false);
    const [type, setType] = useState("");
    // const [showModal, setShowModal] = useState(false)
    // const [modalMessage, setModalMessage] = useState("")
    // const [progress, setProgress] = useState(0)
    const [downloading, setDownloading] = useState(false)
    const { t } = useTranslation();

    // useEffect(() => {
    //     if (progress < 50) {
    //         setModalMessage("Fetching Details...")
    //     } else if (progress > 50 && progress < 80) {
    //         setModalMessage("Compiling Details...")
    //     } else if (progress > 80 && progress < 100) {
    //         setModalMessage("Almost There...")
    //     } else {
    //         setModalMessage("File Downloaded Successfully!")
    //     }
    // }, [progress])

    const checkAll = () => {
        setNameDob(true)
        setAddress(true)
        setEmail(true)
        setNumber(true)
        setBankAccount(true)
        setCards(true)
        setCreditInfo(true)
        setOtherInfo(true)
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



    const toggleAccordion = () => {
        setIsCollapsed(isCollapsed ? "download" : "");
    };


    // userdetails and transactions files generators and states
    const { userDetails, authHeader } = useContext(UserContext)


    const generatePDF = () => {
        setDownloading(true)
        const tableStyles = {
            fontSize: 7,
        };
        const tableHeaderStyles = {
            fontSize: 7,
            fillColor: [100, 100, 100],
            textColor: [255, 255, 255],
        };

        const doc = new jsPDF();


        doc.addImage(img, "png", 14, 10, 46.5, 13)
        doc.setFont("montserrat", "normal", "normal");
        doc.setFontSize(10);
        doc.text(`Below are the requested details of ${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`} includes their requested info available on InstaPay.`, 14, 32, { maxWidth: 200 });
        const currentDate = new Date();
        const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFont("montserrat", "normal", "bold");
        doc.setFontSize(10);
        doc.text(formattedDate, 148, 17.5);

        doc.setFont("", "normal", "bold");
        doc.setFontSize(17);
        doc.text("Personal Details: ", 14, 45);

        const personalBody = [
            nameDob ? ["Full Name", `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`] : null,
            nameDob ? ["InstaPay Username", `${userDetails?.username ?? "N/A"}`] : null,
            email ? ["Email Address", `${userDetails?.email ?? "N/A"}`] : null,
            number ? ["Phone Number", `+${userDetails?.phone ?? "N/A"}`] : null,
            address ? ["Address", `${userDetails?.address ?? "N/A"}`] : null,
            address ? ["City", `${userDetails?.city ?? "N/A"}`] : null,
            address ? ["Postal/Zip Code", `${userDetails?.postal_code ?? "N/A"}`] : null,
            address ? ["Country", `${userDetails?.country_name ?? "N/A"}`] : null,
            ["Account Type", `${userDetails?.account_type ?? "N/A"}`],
            ["Linked Instagram", `${userDetails?.insta_bot ?? "N/A"}`],
            ["Member Since", `${userDetails?.user?.createdAt?.split("T")[0]?.split("-")?.reverse()?.join("-") ?? "N/A"}`],
        ]

        const personalTable = {
            head: [['Key', 'Value']],
            body: personalBody.filter(item => item !== null),
            startY: 50,
            styles: tableStyles,
            headStyles: tableHeaderStyles,
        };

        doc.autoTable(personalTable);

        doc.save(`${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}.pdf`);
        setDownloading(false)
    };

    // const generateXLSX = () => {
    //     const data = [
    //         {
    //             "Key": "Full Name",
    //             "Value": `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`,
    //         },
    //         {
    //             "Key": "InstaPay Username",
    //             "Value": userDetails?.username ?? "N/A",
    //         },
    //         {
    //             "Key": "Email Address",
    //             "Value": userDetails?.email ?? "N/A",
    //         },
    //         {
    //             "Key": "Phone Number",
    //             "Value": `+${userDetails?.phone ?? "N/A"}`,
    //         },
    //         {
    //             "Key": "Address",
    //             "Value": userDetails?.address ?? "N/A",
    //         },
    //         {
    //             "Key": "City",
    //             "Value": userDetails?.city ?? "N/A",
    //         },
    //         {
    //             "Key": "Country",
    //             "Value": userDetails?.country_name ?? "N/A",
    //         },
    //         {
    //             "Key": "Account Type",
    //             "Value": userDetails?.account_type ?? "N/A",
    //         },
    //         {
    //             "Key": "Linked Instagram",
    //             "Value": userDetails?.insta_bot ?? "N/A",
    //         },
    //         {
    //             "Key": "Member Since",
    //             "Value": userDetails?.user?.createdAt?.split("T")[0]?.split("-")?.reverse()?.join("-") ?? "N/A",
    //         },
    //     ];

    //     const ws = XLSX.utils.json_to_sheet(data);

    //     const wb = XLSX.utils.book_new();

    //     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    //     XLSX.writeFile(wb, `${userDetails?.user?.first_name ?? 'user_details'}.docx`);
    // };

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
                            children: [new Paragraph("WaOne Username")],
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
                                    text: `Below are the requested details of ${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`} includes their requested info available on InstaPay.`,
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
        <Card id="download_data">
            <CardHeader className={`pb-0 ${isCollapsed ? 'collapsed' : 'expanded'}`} onClick={toggleAccordion}>
                {/* <DownloadModal isOpen={showModal} setIsOpen={setShowModal} generatePDF={generatePDF} modalMessage={modalMessage} progressValue={progress} /> */}
                <H4 attrH4={{ className: 'card-title mb-0' }}>{t("Download Your Data")}</H4>
                <div className="card-options">
                    {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
            </CardHeader>
            <div className={`accordion-body ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <CardBody>
                    <div className="container mt-5">
                        <div className="mt-5">
                            <h4>
                                {t("Get a copy of your data")}
                            </h4>
                            <p>
                                {t("Submit a request to download a copy of your data")}
                            </p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-5">
                            <h5>
                                {t("What data should we include?")}
                            </h5>
                            <span className="cursor-pointer font-weight-bold" onClick={checkAll} style={{ cursor: "pointer" }}>
                                {t("Select all")}
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
                                        "We use this information to keep your account safe, personalized, your experience and contact you when needed"
                                    )}
                                </span>
                            </div>
                            <div className="mt-5">
                                <ul className="list-unstyled">
                                    <li className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3" onClick={_ => setNameDob(!nameDob)}>
                                            <div className="flex-none h1 text-primary">
                                                <Calendar />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-secondary mb-1">
                                                    {t("Name and Date Of Birth")}
                                                </div>
                                            </div>
                                        </div>
                                        <Input type="checkbox" checked={nameDob} onChange={e => setNameDob(e.target.checked)} />
                                    </li>

                                    <li className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3" onClick={_ => setAddress(!address)}>
                                            <div className="flex-none h1 text-primary">
                                                <Home />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-secondary mb-1">
                                                    {t("Address")}
                                                </div>
                                            </div>
                                        </div>
                                        <Input type="checkbox" checked={address} onChange={e => setAddress(e.target.checked)} />
                                    </li>
                                    <li className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3" onClick={_ => setEmail(!email)}>
                                            <div className="flex-none h1 text-primary">
                                                <Mail />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-secondary mb-1">
                                                    {t("Email")}
                                                </div>
                                            </div>
                                        </div>
                                        <Input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} />
                                    </li>
                                    <li className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3" onClick={_ => setNumber(!number)}>
                                            <div className="flex-none h1 text-primary">
                                                <Phone />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-secondary mb-1">
                                                    {t("Phone number")}
                                                </div>
                                            </div>
                                        </div>
                                        <Input type="checkbox" checked={number} onChange={e => setNumber(e.target.checked)} />
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
                                    "We use this information to enable you checkout faster, and send or receive money, in just a few clicks."
                                )}
                            </span>
                        </div>
                        <div className="mt-5">
                            <ul className="list-unstyled">
                                <li className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3" onClick={_ => setBankAccount(!bankAccount)}>
                                        <div className="flex-none h1 text-primary">
                                            <User />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-secondary mb-1">
                                                {t("Bank accounts")}
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="checkbox" checked={bankAccount} onChange={e => setBankAccount(e.target.checked)} />
                                </li>

                                <li className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3" onClick={_ => setCards(!cards)}>
                                        <div className="flex-none h1 text-primary">
                                            <CreditCard />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-secondary mb-1">
                                                {t("Debit or credit cards")}
                                            </div>
                                        </div>
                                    </div>
                                    <Input type="checkbox" checked={cards} onChange={e => setCards(e.target.checked)} />
                                </li>
                            </ul>
                        </div>
                        <hr className="my-5" />
                        <div className="mt-5">
                            <ul className="list-unstyled">
                                <li className="d-flex flex-column gap-2">
                                    <div className="d-flex gap-2 justify-content-between align-items-center mb-2">
                                        <div style={{ maxWidth: "90%" }} onClick={_ => setCreditInfo(!creditInfo)}>
                                            <h6 style={{ marginBottom: 0 }}>
                                                {t("Credit Information")}
                                            </h6>
                                            <span>{t("Includes your credit application information")}</span>
                                        </div>
                                        <Input type="checkbox" checked={creditInfo} onChange={e => setCreditInfo(e.target.checked)} />
                                    </div>
                                    <div className="d-flex gap-2 justify-content-between align-items-center">
                                        <div style={{ maxWidth: "90%" }} onClick={_ => setOtherInfo(!otherInfo)}>
                                            <h6 style={{ marginBottom: 0 }}>
                                                {t("Other Information")}  {t("(not included in file)")}
                                            </h6>
                                            <span className="text-secondary">
                                                {t(
                                                    "Includes device info, technical usage data, geolocation info marketing preferences, consent history, and data used for other services such as credit, identify verification, communications with paypal, and third-party processors."
                                                )}
                                            </span>
                                        </div>
                                        <Input type="checkbox" checked={otherInfo} onChange={e => setOtherInfo(e.target.checked)} />
                                    </div>
                                </li>
                            </ul >
                        </div >
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
                                <option value="" disabled>Select File Type</option>
                                {options.map(item => (
                                    <option value={item.value} key={item.value}>{item.label}</option>
                                ))}
                            </Input>
                            <span className="text-secondary small">
                                {t("PDF file can be easily opened on any computer")}
                            </span>
                        </div>
                        <div className="mt-5 d-flex justify-content-end">
                            <GradientButton value={downloading ? "Downloading..." : "Submit Request"} size="m" attr={{
                                disabled: (
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
                                ),
                                onClick: type === "pdf" ? generatePDF : generateDOCX
                            }} />
                        </div>
                    </div>
                </CardBody>
            </div>
        </Card>
    );
};
export default DownloadData;
