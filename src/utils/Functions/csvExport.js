import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { authHeader } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { formatCurrency } from "../../Helper/AmountFormat";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver"

const formatHeader = (header) => {
    return header
        .split(".")
        .map((part) => part?.split("_")?.map((word) => word[0]?.toUpperCase() + word?.slice(1)).filter(word => !word.includes("undefined"))?.join(" "))
        .join(" ");
};

const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
        const propName = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
                acc[propName] = obj[key].map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return JSON.stringify(item);
                    }
                    return item;
                }).join(' | ');
            } else {
                Object.assign(acc, flattenObject(obj[key], propName));
            }
        } else {
            acc[propName] = obj[key];
        }
        return acc;
    }, {});
};

export const exportToExcel = async (transactions, userDetails, setExportLoading, apiCall = true) => {
    setExportLoading(true)
    if (!transactions || transactions.length === 0) {
        toast.error("No Transactions to import")
        setExportLoading(false)
        return;
    }
    try {
        let allTransactions;

        if (apiCall) {
            const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/account-transactions/${userDetails?._id}/1/99999999999`, {
                headers: authHeader
            });
            const dec = decryptData(res.data.data);

            allTransactions = dec?.transactionList || [];
        } else {
            allTransactions = transactions
        }

        const desiredHeaders = [
            "CreatedAt",
            "Reference Id",
            "Currency Code",
            "Recipient Name",
            "Payment Type",
            'Transaction Type',
            "Type",
            "Status",
            "Amount",
            "Payment Reference",
            "Wallet Id",
        ];

        const flatTransactions = allTransactions.map(transaction => flattenObject(transaction));

        const formatDate = (dateString) => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            } catch {
                return dateString;
            }
        };

        const rowsWithDesiredHeaders = flatTransactions.map(obj => {
            const outputRow = {};

            const receiverFirstName = obj["receiver.user.first_name"] || obj["receiver.user.firstName"] || obj["receiver.company.company_name"] || obj["account.user.first_name"];
            const receiverLastName = obj["receiver.user.last_name"] || obj["receiver.user.lastName"] || obj["account.user.first_name"]
            const guestDetailsName = obj["guest_details.name"] || obj["guestDetails.name"];

            if (receiverFirstName) {
                outputRow["Recipient Name"] = receiverFirstName + "" + (receiverLastName ?? "");
            } else if (guestDetailsName) {
                outputRow["Recipient Name"] = guestDetailsName;
            } else {
                outputRow["Recipient Name"] = "";
            }

            outputRow["Payment Reference"] = obj['client_reference'] || "-"

            Object.keys(obj).forEach(originalKey => {
                const formatted = formatHeader(originalKey);
                if (desiredHeaders.includes(formatted) && formatted !== "Recipient Name") {
                    let value = obj[originalKey];
                    if (formatted === "CreatedAt" && value) {
                        value = formatDate(value);
                    } else if (formatted === "Amount" && value) {
                        value = formatCurrency(value, true)
                    }
                    outputRow[formatted] = value;
                }
            });
            desiredHeaders.forEach(h => {
                if (!(h in outputRow)) outputRow[h] = undefined;
            });
            return outputRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(rowsWithDesiredHeaders, { header: desiredHeaders });

        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            if (!worksheet[address]) continue;
            worksheet[address].v = desiredHeaders[C] || worksheet[address].v;
            worksheet[address].s = {
                font: { bold: true },
                alignment: { horizontal: "center" },
                fill: { fgColor: { rgb: "D3D3D3" } },
            };
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "transactions.xlsx");

        toast.success("Transaction export successfully")
    } catch {
        toast.error("Something went wrong while exporting Please Try again!")
    }
    setExportLoading(false)


};