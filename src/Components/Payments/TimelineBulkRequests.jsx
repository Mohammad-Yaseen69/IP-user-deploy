import React, { useState } from 'react';
import { Table, Button } from 'reactstrap';
import { Check, Edit } from 'react-feather';
import { VerticalTimelineElement } from 'react-vertical-timeline-component';
import TBRItem from './TBRItem';

const TimelineBulkRequests = ({ mobileView, setStepNumber, beneficiaries, srr }) => {
    const [completed, setCompleted] = useState(false);
    const [data, setData] = useState(beneficiaries);
    const [editRowIndex, setEditRowIndex] = useState(-1);
    const [editedData, setEditedData] = useState([...data]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tempAmount, setTempAmount] = useState("");
    const [tempCurrency, setTempCurrency] = useState("");

    const handleEdit = (index) => {
        setEditRowIndex(index);
        setEditedData([...data]);
    };

    const handleSave = (moded) => {
        if (data.length === 1) {
            setData([...editedData]);
            setEditRowIndex(-1);
        } else {
            if (moded === "Yes") {
                setData([...editedData]);
                setEditRowIndex(-1);
            } else {
                if (data.some((item) => item.Moded === "No")) {
                    setShowConfirm(true);
                } else {
                    setData([...editedData]);
                    setEditRowIndex(-1);
                }
            }
        }
    };

    const handleDelete = (index) => {
        if (editRowIndex === index) {
            setEditRowIndex(-1)
            const updatedData = data.filter((_, ind) => index !== ind)
            setData(updatedData);
        } else {
            const updatedData = data.filter((_, ind) => index !== ind)
            setData(updatedData);
        }
    };

    const handleInputChange = (e, index, field) => {
        const updatedData = [...editedData];
        updatedData[index][field] = e.target.value;
        setEditedData(updatedData);
    };

    const handleConfirm = () => {
        beneficiaries.forEach((item) => {
            item.Amount = tempAmount;
            item.Currency = tempCurrency;
            item.Moded = "Yes";
        });
        srr(beneficiaries);
        setData(beneficiaries);
        setEditRowIndex(-1);
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setData([...editedData]);
        setEditRowIndex(-1);
        beneficiaries.forEach((item) => {
            item.Moded = "Yes";
        });
        srr(beneficiaries);
        setShowConfirm(false);
    };

    return (
        // <VerticalTimelineElement
        //     className="vertical-timeline-element--work"
        //     animate={true}
        //     icon={
        //         <div
        //             style={{
        //                 borderRadius: "100%",
        //                 height: "100%",
        //                 width: "100%",
        //             }}
        //         >
        //             {completed && <Check />}
        //         </div>
        //     }
        //     iconStyle={{
        //         boxShadow: "none",
        //         padding: "5px",
        //         background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
        //     }}
        //     contentStyle={{
        //         background: "transparent",
        //         padding: "1rem 1rem 0 1rem",
        //         height: "fit-content",
        //         transform: completed && "translateY(-11px)",
        //         marginLeft: mobileView ? "45px" : "60px",
        //     }}
        // >
        //     {completed ? (
        //         <div
        //             style={{
        //                 display: "flex",
        //                 alignItems: "center",
        //                 gap: "1rem",
        //             }}
        //         >
        //             <p style={{ margin: 0, padding: 0 }}>
        //                 You request money from {"{recipient name}"}.
        //             </p>
        //             <span
        //                 style={{
        //                     cursor: "pointer",
        //                     padding: 0,
        //                     margin: 0,
        //                 }}
        //                 onClick={() => setCompleted(false)}
        //             >
        //                 <Edit />
        //             </span>
        //         </div>
        //     ) : (
        //         <div>
        //             <div>
        //                 <h3>Recipients</h3>
        <>
            <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                <Table responsive>
                    <thead>
                        <tr>
                            <th>Recipients</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Action</th> {/* Added Action column */}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <TBRItem
                                item={item}
                                index={index}
                                editRowIndex={editRowIndex}
                                editedData={editedData}
                                handleInputChange={handleInputChange}
                                setTempAmount={setTempAmount}
                                setTempCurrency={setTempCurrency}
                                handleEdit={handleEdit}
                                handleSave={handleSave}
                                showConfirm={showConfirm}
                                handleCancel={handleCancel}
                                handleConfirm={handleConfirm}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </tbody>
                </Table>
            </div>
            {/* <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "1rem",
                }}
            >
                <Button
                    style={{
                        border: "none",
                        outline: "none",
                        background:
                            "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                    }}
                    onClick={() => {
                        setStepNumber(4);
                        setCompleted(true);
                    }}
                    disabled={beneficiaries.some((item) => !item.Amount || !item.Currency)}
                >
                    Send Requests
                </Button>
            </div> */}
        </>
        //     </div>
        // </div>
        //     )}
        // </VerticalTimelineElement>
    );
};

export default TimelineBulkRequests;