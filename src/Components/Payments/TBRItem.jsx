import React, { useState, useEffect } from 'react';
import { Edit, Save, Trash2 } from 'react-feather';
import { FormGroup, Input } from 'reactstrap';
import PaymentsConfirmationModal from './PaymentsConfirmationModal';
import { ToolTip } from '../../AbstractElements';

const TBRItem = (props) => {
    const {
        item,
        index,
        editRowIndex,
        editedData,
        handleInputChange,
        setTempAmount,
        setTempCurrency,
        handleEdit,
        handleSave,
        showConfirm,
        handleCancel,
        handleConfirm,
        handleDelete, // Added handleDelete prop
    } = props;

    const [tooltip, setToolTip] = useState(false);
    const [showDelModal, setShowDelModal] = useState(false)
    const toggleDel = () => setShowDelModal(!showDelModal)

    useEffect(() => {
        if (tooltip) {
            setTimeout(() => {
                setToolTip(false);
            }, 1000);
        }
    }, [tooltip]);

    const toggle = () => setToolTip(!tooltip);
    return (
        <tr>
            <td>
                {editRowIndex === index ? (
                    <Input
                        type="text"
                        value={editedData[index].ID}
                        onChange={(e) => {
                            handleInputChange(e, index, "ID");
                        }}
                    />
                ) : (
                    item.ID
                )}
            </td>
            <td>
                {editRowIndex === index ? (
                    <Input
                        type="text"
                        value={editedData[index].Amount}
                        onChange={(e) => {
                            handleInputChange(e, index, "Amount");
                            setTempAmount(e.target.value);
                        }}
                    />
                ) : (
                    item.Amount || "N/A"
                )}
            </td>
            <td>
                {editRowIndex === index ? (
                    <FormGroup>
                        <Input
                            type="select"
                            value={editedData[index].Currency}
                            onChange={(e) => {
                                handleInputChange(e, index, 'Currency')
                                setTempCurrency(e.target.value)
                            }}
                        >
                            <option value="">--Select--</option>
                            {item.availableCurrencies.map((currency, i) => (
                                <option key={i} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                ) : (
                    item.Currency || 'N/A'
                )}
            </td>
            <td style={{ display: "flex", alignItems: "center" }}>
                {editRowIndex !== index ? (
                    <>
                        <Edit
                            onClick={() => handleEdit(index)}
                            cursor={"pointer"}
                            id={`pr-edit${item.u_id}`}
                        />

                        <ToolTip attrToolTip={{ placement: 'top', isOpen: tooltip, target: `pr-edit${item.u_id}`, toggle: toggle }}>
                            Edit Recipient Details
                        </ToolTip>
                    </>
                ) : (
                    <>
                        <Save onClick={() => handleSave(item.Moded)} cursor={"pointer"} />
                        <PaymentsConfirmationModal
                            isOpen={showConfirm}
                            message={"Do you want to set the same amount for all requests?"}
                            title={"Confirm"}
                            onCancel={handleCancel}
                            onConfirm={handleConfirm}
                        />
                        <Trash2
                            onClick={() => toggleDel()}
                            cursor={"pointer"}
                            style={{ marginLeft: '0.5rem' }}
                        />
                        <PaymentsConfirmationModal
                            isOpen={showDelModal}
                            message={"Are you sure, you want to delete the current row?"}
                            title={"Confirm"}
                            onCancel={toggleDel}
                            onConfirm={() => handleDelete(index)}
                            btnOneText='Cancel'
                            btnTwoText='Confirm'
                        />
                    </>
                )}
            </td>
        </tr>
    );
};

export default TBRItem;