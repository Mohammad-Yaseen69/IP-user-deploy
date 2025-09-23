import React, { useContext, useState } from 'react'
import Dropzone from 'react-dropzone-uploader'
import { Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const MainContent = () => {
    const [file, setFile] = useState(null)
    const [csvData, setCsvData] = useState([])
    const [successCount, setSuccessCount] = useState(0)
    const [errorCount, setErrorCount] = useState(0)
    const { authHeader } = useContext(UserContext)
    const [uploadStarted, setUploadStarted] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [processedUsers, setProcessedUsers] = useState([])
    const navigate = useNavigate()

    const handleChangeStatus = ({ meta, file }, status) => {

        if (file) {
            setFile(file)
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;

                if (file.name.endsWith(".csv")) {
                    // Parse CSV file using PapaParse
                    Papa.parse(content, {
                        complete: (result) => {
                            setCsvData(result.data);
                        },
                        header: true, // Set to true if your CSV file has a header row
                    });
                } else if (file.name.endsWith(".xlsx")) {
                    // Parse XLSX file using XLSX
                    const workbook = XLSX.read(content, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    // Assuming the first row contains headers
                    const [header, ...rows] = jsonData;
                    const formattedData = rows.map((row) =>
                        row.reduce((acc, value, index) => {
                            acc[header[index]] = value;
                            return acc;
                        }, {})
                    )

                    setCsvData(formattedData);
                } else {
                    // Handle other file formats or show an error
                    console.error("Unsupported file format");
                }
            };

            reader.readAsBinaryString(file);
        }
    };


    const uploadData = async (data, index) => {
        let status;
        setUploadStarted(true)
        setIsUploading(true)
        const { email, number, firstName, lastName, account_type, kyc_status } = data;
        const body = {
            email,
            phone: number,
            first_name: firstName,
            last_name: lastName,
            account_type,
            kyc_status
        };
        const url = `${import.meta.env.VITE_IP_DEV_API}/api/account/registration/multiple`;
        const encrypted = encryptData(body);

        try {
            if (email || number || firstName || lastName) {
                const response = await axios.post(
                    url,
                    { data: encrypted },
                    { headers: authHeader }
                );
                status = true;
                setSuccessCount(prev => prev + 1)
            }
        } catch (error) {
            setErrorCount(prev => prev + 1)
            status = false;
            console.error(decryptData(error?.response?.data?.data), email);
        } finally {
            setProcessedUsers(prev => [...prev, { ...data, status: status }])
            if (index + 1 === csvData.length) {
                if (successCount > 0) {
                    toast.success("Successfully sent emails to " + successCount + " users")
                }
                if (errorCount > 0) {
                    toast.error("Failed to send emails to " + errorCount + " users")
                }
                setIsUploading(false)
            }
        }
    };

    const handleUploadData = async () => {
        await Promise.all(csvData.map((data, index) => {
            uploadData(data, index)
        }))
    };

    const handleExtractFailedUsers = () => {
        const failedUsers = processedUsers.filter((user) => user.status === false);

        // Create Excel file for failed users
        const ws = XLSX.utils.json_to_sheet(failedUsers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FailedUsers");
        XLSX.writeFile(wb, "failed_users.xlsx");
    };

    return (
        <Card>
            <CardHeader>
                <h4>
                    Add Onboarding Users
                </h4>
            </CardHeader>
            <CardBody>
                <h5>Upload/Drop XLSX File Here: </h5>
                <div style={{ display: "flex", gap: "2rem" }}>
                    <Dropzone
                        onChangeStatus={handleChangeStatus}
                        maxFiles={1}
                        multiple={false}
                        canCancel={false}
                        inputContent="Upload/Drop XLSX File Here"
                        styles={{
                            dropzone: { height: 200, flex: 1 },
                            dropzoneActive: { borderColor: "green" },
                        }}
                        disabled={file}
                        accept='.xlsx, .csv'
                    />
                    <Card style={{ flex: 1, height: "200px" }}>
                        <CardBody>
                            {
                                file
                                    ?
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem", height: "100%" }}>
                                        {
                                            uploadStarted
                                                ?
                                                <>
                                                    <div>
                                                        <p>Successfully sent Email to {successCount}/{csvData.length} users.</p>
                                                        <p>Failed to send Email to {errorCount}/{csvData.length} users.</p>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                        <Button style={{
                                                            background: 'linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)',
                                                            border: 'none',
                                                            outline: 'none',
                                                        }} onClick={() => navigate("/onboarding/add-users")}>Reset</Button>
                                                    </div>
                                                </>
                                                :
                                                <>
                                                    <p>{csvData.length} users fetched from file, Do you want to start the process?</p>
                                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                                                        <Button style={{
                                                            background: 'linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)',
                                                            border: 'none',
                                                            outline: 'none',
                                                        }} disabled={isUploading} onClick={() => navigate("/onboarding/add-users")}>Cancel</Button>
                                                        <Button style={{
                                                            background: 'linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)',
                                                            border: 'none',
                                                            outline: 'none',
                                                        }} disabled={isUploading} onClick={handleUploadData}>Yes, Start It.</Button>
                                                    </div>
                                                </>
                                        }
                                    </div>
                                    :
                                    <p style={{ textAlign: "center" }}>Upload The File To Start The Process!</p>
                            }
                        </CardBody>
                    </Card>
                </div>
                {
                    processedUsers.length > 0
                    &&
                    <Card>
                        <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h5>Fetched Users</h5>
                            <Button style={{
                                background: 'linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)',
                                border: 'none',
                                outline: 'none',
                            }} onClick={handleExtractFailedUsers}>Extract Failed Users</Button>
                        </CardHeader>
                        <CardBody>
                            <Table>
                                <thead>
                                    <tr>
                                        <td>First Name</td>
                                        <td>Last Name</td>
                                        <td>Email Address</td>
                                        <td>Phone Number</td>
                                        <td>Status</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        processedUsers.map(item => (
                                            <tr key={item.email}>
                                                <td>{item?.firstName}</td>
                                                <td>{item?.lastName}</td>
                                                <td>{item?.email}</td>
                                                <td>{item?.number}</td>
                                                <td>{item?.status ? "Success" : "Failed"}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                }
            </CardBody>
        </Card>
    )
}

export default MainContent
