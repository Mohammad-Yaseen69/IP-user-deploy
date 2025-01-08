import { changeRequestStatus, deleteRequest } from "../../store/slices/ChipsInRequests";
import ChipsInConfirmationModal from "./ChipsInConfirmationModal";
import { useState } from "react";
import QrReceipt from "./QrReceipt";
import { CardBody, Dropdown, DropdownItem, DropdownMenu } from "reactstrap";
import { Trash2, Eye, List } from "react-feather"
import { useDispatch } from "react-redux";
import { Btn, ToolTip } from "../../AbstractElements";


const ChipsInTableColumn = ({ item, ssit, sti }) => {
    const [statusModalOpen, setStatusModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [showReceipt, setShowReceipt] = useState(false)
    const [trashTooltip, setTrashTooltip] = useState(false);
    const [eyeTooltip, setEyeTooltip] = useState(false);
    const [listTooltip, setListTooltip] = useState(false);
    const dispatch = useDispatch()

    const toggle = (handler, value) => handler(!value);

    const deleteItemHandler = (id) => {
        dispatch(deleteRequest(id))
        setDeleteModalOpen(false)
    }

    const toggleReceipt = () => {
        setShowReceipt(!showReceipt)
    }

    return (
        <tr key={item.id}>
            <td className="wider">{item.name}</td>
            <td className="wider">{item.wallet.slice(0, item.wallet.length - 5).split("").map(_ => "*")}{item.wallet.slice(item.wallet.length - 5, item.wallet.length)}</td>
            <td>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{item.date}</span>
                    <span>{item.time}</span>
                </div>
            </td>
            <td>${item.amount.toLocaleString()}</td>
            <td>{item.transactions.length}</td>
            <td>${item.total_amount.toLocaleString()}</td>
            <td>
                <CardBody className="dropdown-basic" style={{ padding: 0 }}>
                    <Dropdown>
                        <div className="mb-0">
                            <Btn attrBtn={{ color: item.status === "Active" ? "success" : "danger", className: 'dropbtn', size: "sm", style: { fontSize: ".7rem", padding: ".35rem .75rem", borderRadius: "10px !important" } }} >{item.status} <span><i className="icofont icofont-arrow-down"></i></span></Btn>
                            <DropdownMenu className="dropdown-content" style={{ top: "25px" }}>
                                <DropdownItem
                                    onClick={() => setStatusModalOpen(true)}
                                >{item.status === "Active" ? "Inactive" : "Active"}</DropdownItem>
                            </DropdownMenu>
                        </div>
                    </Dropdown>
                </CardBody>
            </td>
            <td>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className="btn-showcase">
                        <Eye id="chips-in-eye" style={{ cursor: "pointer" }} color="#5826f0" onClick={toggleReceipt} />
                        <ToolTip attrToolTip={{ placement: 'top', isOpen: eyeTooltip, target: 'chips-in-eye', toggle: () => toggle(setEyeTooltip, eyeTooltip) }}>
                            View Request Details
                        </ToolTip>
                    </div>
                    <div className="btn-showcase">
                        <List id="chips-in-list" style={{ cursor: "pointer" }} color="orange" onClick={() => {
                            ssit(true)
                            sti(item)
                        }} />
                        <ToolTip attrToolTip={{ placement: 'top', isOpen: listTooltip, target: 'chips-in-list', toggle: () => toggle(setListTooltip, listTooltip) }}>
                            Show More Details
                        </ToolTip>
                    </div>
                    <div className="btn-showcase">
                        <Trash2 id="chips-in-trash" style={{ cursor: "pointer" }} color="red" onClick={() => setDeleteModalOpen(true)} />
                        <ToolTip attrToolTip={{ placement: 'top', isOpen: trashTooltip, target: 'chips-in-trash', toggle: () => toggle(setTrashTooltip, trashTooltip) }}>
                            Delete the request
                        </ToolTip>
                    </div>
                </div>
            </td>

            {/* modals */}
            <ChipsInConfirmationModal
                isOpen={statusModalOpen}
                title="Confirm"
                message="Are you sure, you want to change the request status?"
                onCancel={() => setStatusModalOpen(false)}
                onConfirm={() => {
                    dispatch(changeRequestStatus(item.id))
                    setStatusModalOpen(false)
                }}
            />
            <ChipsInConfirmationModal
                isOpen={deleteModalOpen}
                title="Confirm"
                message="Are you sure, you want to delete the request?"
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={() => deleteItemHandler(item.id)}
            />
            <QrReceipt isOpen={showReceipt} toggle={toggleReceipt} item={item} showDetails={false} />
        </tr>
    )
}

export default ChipsInTableColumn