import React, { useContext, useEffect, useState } from 'react';
import { Badge, Modal, ModalBody, ModalHeader, Table } from 'reactstrap';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';

const FundsHistory = ({ isOpen, toggle }) => {
    const [funds, setFunds] = useState([]);
    const { userDetails, authHeader } = useContext(UserContext);

    useEffect(() => {
        const getFunds = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/collection/get-user-funds/${userDetails?._id}`, {
                    headers: authHeader,
                });
                const data = await decryptData(res.data.data);
                setFunds(data?.collections);
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                if (dec?.message === "Unauthorize to access this route") {
                    const coun = localStorage.getItem("ip_country")
                    localStorage.clear()
                    localStorage.setItem("ip_country", coun)
                    window.location.pathname = "/auth/login";
                }
                // console.log(decryptData(error.response.data.data));
            }
        };

        if (userDetails) {
            getFunds();
        }
    }, [userDetails]);

    return (
        <Modal isOpen={isOpen} toggle={toggle} style={{ minWidth: "80vw", maxWidth: "600px" }}>
            <ModalHeader toggle={toggle}>Funds History</ModalHeader>
            <ModalBody style={{ maxHeight: "80vh", overflowY: "auto" }}>
                <Table style={{ minWidth: "700px" }}>
                    <thead>
                        <tr>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Date</th>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Country Code</th>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Currency</th>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Amount</th>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Payment Order ID</th>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Payment Client</th>
                            <th style={{ background: "#fafafa", textAlign: "center" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funds.map((fund) => (
                            <tr key={fund?._id}>
                                <td className='text-center'>{fund?.createdAt?.split("T")?.[0]?.split("-")?.reverse()?.join("-")}</td>
                                <td className='text-center'>{fund?.country_code}</td>
                                <td className='text-center'>{fund?.currency}</td>
                                <td className='text-center'>{fund?.amount}</td>
                                <td className='text-center'>{fund?.paymentOrderId}</td>
                                <td className='text-center'>{fund?.payment_method?.toUpperCase()}</td>
                                <td className='text-center'>
                                    <Badge color='success'>{fund?.status?.toUpperCase()}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </ModalBody>
        </Modal>
    );
};

export default FundsHistory;