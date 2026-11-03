import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./styles/DownloadData.module.scss";
import { Check, DownloadSimpleLarge } from "./Icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserContext } from "../../Context/UserContext";
import img from "../../assets/images/logo/logo2.png";
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
import { usePermission } from "../../hooks/GeneralUse/usePermission";

const DownloadData = ({ isCollapsed, setIsCollapsed }) => {
  const [nameDob, setNameDob] = useState(true);
  const [address, setAddress] = useState(true);
  const [email, setEmail] = useState(true);
  const [number, setNumber] = useState(true);
  const [bankAccount, setBankAccount] = useState(true);
  const [cards, setCards] = useState(true);
  const [creditInfo, setCreditInfo] = useState(true);
  const [otherInfo, setOtherInfo] = useState(true);
  const [type, setType] = useState("pdf");
  const [downloading, setDownloading] = useState(false);
  const { t } = useTranslation();
  const [savedCards, setSavedCards] = useState([]);
  // userdetails and transactions files generators and states
  const { userDetails, authHeader } = useContext(UserContext);

  useEffect(() => {
    const getSavedCards = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`,
          {
            headers: authHeader,
          },
        );
        const dec = decryptData(res.data.data);
        setSavedCards(dec?.panList);
      } catch (error) {}
    };

    if (userDetails) {
      getSavedCards();
    }
  }, [userDetails]);

  const checkAll = () => {
    if (nameDob && address && email && number && bankAccount && cards && creditInfo && otherInfo) {
      setNameDob(false);
      setAddress(false);
      setEmail(false);
      setNumber(false);
      setBankAccount(false);
      setCards(false);
      setCreditInfo(false);
      setOtherInfo(false);
    } else {
      setNameDob(true);
      setAddress(true);
      setEmail(true);
      setNumber(true);
      setBankAccount(true);
      setCards(true);
      setCreditInfo(true);
      setOtherInfo(true);
    }
  };

  const options = [
    {
      value: "csv",
      label: "CSV",
      hint: "Opens in Excel, Numbers or Google Sheets.",
    },
    {
      value: "pdf",
      label: "PDF",
      hint: "PDF file can be easily opened on any computer",
    },
    {
      value: "docx",
      label: "DOCX",
      hint: "Opens in Word, Pages or Google Docs.",
    },
  ];

  const getPersonalRows = () => {
    const personalBody = [
      nameDob
        ? [
            "Full Name",
            userDetails?.account_type === "individual"
              ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`
              : `${userDetails?.company?.company_name}`,
          ]
        : null,
      nameDob ? ["InstaPay Username", `${userDetails?.username ?? "N/A"}`] : null,
      nameDob ? ["Date Of Birth", `${userDetails?.dob ?? "N/A"}`] : null,
      nameDob && userDetails?.gender ? ["Gender", `${userDetails?.gender ?? "N/A"}`] : null,
      email ? ["Email Address", `${userDetails?.email ?? "N/A"}`] : null,
      number ? ["Phone Number", `+${userDetails?.phone ?? "N/A"}`] : null,
      address ? ["Address", `${userDetails?.address ?? "N/A"}`] : null,
      address ? ["City", `${userDetails?.city ?? "N/A"}`] : null,
      address ? ["Postal/Zip Code", `${userDetails?.postal_code ?? "N/A"}`] : null,
      address ? ["Country", `${userDetails?.country_name ?? "N/A"}`] : null,
      userDetails?.account_type ? ["Account Type", `${userDetails?.account_type ?? "N/A"}`] : null,
      userDetails?.insta_bot ? ["Linked Instagram", `${userDetails?.insta_bot ?? "N/A"}`] : null,
      userDetails?.user?.createdAt
        ? ["Member Since", `${new Date(userDetails?.user?.createdAt).toLocaleString() ?? "N/A"}`]
        : null,
    ];
    if (cards) {
      if (savedCards.length > 0) {
        savedCards?.forEach((item, i) =>
          personalBody.push([`Credit Card ${i + 1}`, `XXXX XXXX XXXX ${item?.last4}`]),
        );
      } else {
        personalBody.push([`Credit Cards`, `N/A`]);
      }
    }
    return personalBody.filter((item) => item !== null);
  };

  const generateCSV = () => {
    setDownloading(true);
    const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [["Title", "Details"], ...getPersonalRows()]
      .map((row) => row.map(cell).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    FileSaver.saveAs(
      blob,
      `${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}.csv`,
    );
    setDownloading(false);
  };

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

    doc.addImage(img, "png", 14, 10, 46.5, 13);
    doc.setFont("sans-serif", "normal", "normal");
    doc.setFontSize(10);
    doc.text(
      `Below are the requested details of ${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`} includes their requested info available on InstaPay.`,
      14,
      32,
      { maxWidth: 200 },
    );
    const currentDate = new Date();
    const formattedDate = `As of ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    doc.setFont("sans-serif", "normal", "bold");
    doc.setFontSize(10);
    doc.text(formattedDate, 148, 17.5);

    doc.setFont("sans-serif", "normal", "bold");
    doc.setFontSize(17);
    doc.text("Personal Details: ", 14, 45);

    const personalTable = {
      head: [["Title", "Details"]],
      body: getPersonalRows(),
      startY: 50,
      styles: tableStyles,
      headStyles: tableHeaderStyles,
    };

    doc.autoTable(personalTable);

    doc.save(
      `${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}.pdf`,
    );
    // console.log(doc)
    setDownloading(false);
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
                  userDetails?.account_type === "individual"
                    ? `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`
                    : `${userDetails?.company?.company_name}`,
                ),
              ],
            }),
          ],
        }),
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
        }),
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
        }),
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
        }),
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
        }),
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
        }),
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
        }),
      );
    }

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
      }),
    );

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("Connected Instagram Bot")],
          }),
          new TableCell({
            children: [new Paragraph(`${userDetails?.insta_bot ?? "N/A"}`)],
          }),
        ],
      }),
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
            }),
          );
        });
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
          }),
        );
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
                `${
                  userDetails?.user?.createdAt?.split("T")[0]?.split("-")?.reverse()?.join("-") ??
                  "N/A"
                }`,
              ),
            ],
          }),
        ],
      }),
    );

    return rows;
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
      FileSaver.saveAs(
        blob,
        `${userDetails?.account_type === "individual" ? `${userDetails?.user?.first_name}_${userDetails?.user?.last_name}` : `${userDetails?.company?.company_name}`}${new Date().toLocaleString()}.docx`,
      );
      // console.log("Document created successfully");
    });
  };

  const can = usePermission();
  const isEdit = can("settings.download-data.download");

  const groups = [
    {
      key: "personal",
      title: "Personal Information",
      description: "Name, date of birth, address, email and phone number",
      values: [nameDob, address, email, number],
      setters: [setNameDob, setAddress, setEmail, setNumber],
    },
    {
      key: "financial",
      title: "Financial Information",
      description: "Bank accounts and debit or credit cards",
      values: [bankAccount, cards],
      setters: [setBankAccount, setCards],
    },
    {
      key: "other",
      title: "Credit and other information",
      description: "Credit applications and other data (not included in file)",
      values: [creditInfo, otherInfo],
      setters: [setCreditInfo, setOtherInfo],
    },
  ];
  const isGroupOn = (group) => group.values.every(Boolean);
  const toggleGroup = (group) => {
    const next = !isGroupOn(group);
    group.setters.forEach((set) => set(next));
  };
  const selectedCount = groups.filter(isGroupOn).length;
  const allSelected =
    nameDob && address && email && number && bankAccount && cards && creditInfo && otherInfo;
  const currentOption = options.find((item) => item.value === type);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionText}>
          <h4 className={styles.sectionTitle}>{t("Export your data")}</h4>
          <p className={styles.sectionSubtitle}>
            {t("Get a copy of what InstaPay holds about you. Your file downloads straight away.")}
          </p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <h4 className={styles.cardTitle}>{t("What to include")}</h4>
            <p className={styles.cardSubtitle}>
              {t("{{count}} of {{total}} selected", {
                count: selectedCount,
                total: groups.length,
              })}
            </p>
          </div>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonTertiary}`}
            onClick={checkAll}
          >
            {allSelected ? t("Clear all") : t("Select all")}
          </button>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.options}>
            {groups.map((group) => {
              const on = isGroupOn(group);
              return (
                <label key={group.key} className={`${styles.option} ${on ? styles.optionOn : ""}`}>
                  <input
                    type="checkbox"
                    className={styles.hiddenInput}
                    checked={on}
                    onChange={() => toggleGroup(group)}
                  />
                  <span className={styles.checkbox} aria-hidden="true">
                    {on && <Check />}
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>{t(group.title)}</span>
                    <span className={styles.optionDescription}>{t(group.description)}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className={styles.format}>
            <p className={styles.formatLabel}>{t("File format")}</p>
            <div className={styles.segmented} role="radiogroup" aria-label={t("File format")}>
              {options.map((item) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === item.value}
                  key={item.value}
                  className={`${styles.segment} ${type === item.value ? styles.segmentOn : ""}`}
                  onClick={() => setType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {currentOption && <p className={styles.formatHint}>{t(currentOption.hint)}</p>}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={
              (!nameDob &&
                !address &&
                !email &&
                !number &&
                !bankAccount &&
                !cards &&
                !creditInfo &&
                !otherInfo) ||
              !type ||
              downloading ||
              !isEdit
            }
            onClick={type === "pdf" ? generatePDF : type === "csv" ? generateCSV : generateDOCX}
          >
            <DownloadSimpleLarge />
            {downloading ? t("Downloading") + "..." : t("Download data")}
          </button>
        </div>
      </section>
    </div>
  );
};
export default DownloadData;
