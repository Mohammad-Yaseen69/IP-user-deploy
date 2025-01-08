import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input, Progress } from 'reactstrap';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import CSVMTabs from './CSVMTabs';

const AddCSVModal = ({ isOpen, toggleModal, srr, showInfo, setShowInfo }) => {
    const [fileData, setFileData] = useState([]);
    const [error, setError] = useState("")
    const [csvProgress, setCSVProgress] = useState(0);

    const handleFile = (event) => {
        const file = event.target.files[0];

        // json
        if (file.type === "application/json") {
            setCSVProgress(0)
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const formattedData = data.ID.map((item, index) => {
                        return {
                            ID: item,
                            Amount: data.Amount[index],
                            Currency: data.Currency[index],
                            Moded: "Yes",
                            availableCurrencies: ["USD", "PKR", "EUR"],
                            u_id: `${Date.now()}${Math.round(Math.random() * 1000000)}`,
                        };
                    });
                    setFileData(formattedData);
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                }
            };

            reader.readAsText(file);
            setCSVProgress(100)
        }

        // csv
        else if (file.type === "text/csv" || file.type === "text/plain") {
            setCSVProgress(0)
            Papa.parse(file, {
                complete: (results) => {
                    const data = results.data.map((item) => {
                        return {
                            ...item,
                            Moded: "Yes",
                            availableCurrencies: ["USD", "PKR", "EUR"],
                            u_id: `${Date.now()}${Math.round(Math.random() * 1000000)}`,
                        };
                    });
                    setFileData(data);
                },
                header: true,
            });
            setCSVProgress(100)
        }

        // xls and xlsx
        else if (file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            const reader = new FileReader();
            setCSVProgress(0)

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const formattedData = jsonData.map(item => {
                        return {
                            ID: item[0],
                            Amount: item[1],
                            Currency: item[2],
                            Moded: "Yes",
                            availableCurrencies: ["USD", "PKR", "EUR"],
                            u_id: `${Date.now()}${Math.round(Math.random() * 1000000)}`,
                        }
                    })
                    setFileData(formattedData);
                } catch (error) {
                    console.error("Error parsing Excel file:", error);
                }
            };
            reader.readAsArrayBuffer(file);
            setCSVProgress(100)
        }

        // XML
        else if (file.type === "application/xml" || file.type === "text/xml") {
            const reader = new FileReader();
            setCSVProgress(0)


            reader.onload = (e) => {
                try {
                    const xmlData = e.target.result;
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlData, "text/xml");

                    const persons = xmlDoc.getElementsByTagName("person");
                    const jsonData = Array.from(persons).map((person) => ({
                        ID: person.querySelector("ID").textContent,
                        Amount: person.querySelector("Amount").textContent,
                        Currency: person.querySelector("Currency").textContent,
                        Moded: "Yes",
                        availableCurrencies: ["USD", "PKR", "EUR"],
                        u_id: `${Date.now()}${Math.round(Math.random() * 1000000)}`,
                    }));

                    // console.log(jsonData)
                    setFileData(jsonData);
                } catch (error) {
                    console.error("Error reading XML file:", error);
                }
            };

            reader.readAsText(file);
            setCSVProgress(100)
        }
        else {
            setError("File type not supported.")
            setCSVProgress(0)
            setTimeout(() => {
                setError("")
            }, 3000);
        }
    };

    const handleSubmit = () => {
        toggleModal();
        srr(prev => [...fileData, ...prev]);
        setCSVProgress(0)
    };

    return (
        <Modal isOpen={isOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>
                <span
                    style={{ cursor: showInfo && "pointer" }}
                    onClick={() => {
                        if (showInfo) setShowInfo(false)
                    }}>
                    {
                        showInfo
                            ?
                            <>
                                &larr; Go Back
                            </>
                            :
                            "Add A File"
                    }
                </span>
            </ModalHeader>
            {
                showInfo
                    ?
                    <ModalBody>
                        <CSVMTabs />
                    </ModalBody>
                    :
                    <>
                        <ModalBody>
                            <FormGroup style={{ width: "100%", marginBottom: 0 }}>
                                <Label>Upload A File Here</Label>
                                <input className='form-control' type="file" accept=".csv,.xls,.xlsx,.txt,.json,.xml" onChange={handleFile} />
                                {error && <span style={{ color: "red", fontSize: ".8rem", fontWeight: 600 }}>{error}</span>}
                            </FormGroup>
                            <div style={{
                                display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: ".8rem"
                            }}>
                                <span>Supported Extensions: CSV, JSON, XML, TXT, XLS, XLSX.</span>
                                <span style={{ textDecoration: "underline", color: "var(--theme-default)", cursor: "pointer" }}
                                    onClick={_ => setShowInfo(true)}
                                >View Info</span>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <div style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "1rem"
                            }}>
                                <Progress value={csvProgress} color='primary' style={{ width: "100%", borderRadius: "20px", background: "white" }} />
                                <Button
                                    disabled={fileData.length === 0}
                                    onClick={handleSubmit}
                                    style={{
                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                        border: "none",
                                        outline: "none",
                                    }}
                                >
                                    Upload
                                </Button>
                            </div>
                        </ModalFooter>
                    </>
            }
        </Modal>
    );
};

export default AddCSVModal;