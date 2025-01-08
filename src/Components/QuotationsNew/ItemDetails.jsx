import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

const ItemDetails = ({ item, type, isOpen, toggle, isSaving, setShowActionModal, declineQuotation, acceptQuotation }) => {
    const user = type === "send" ? item?.reciever : item?.sender;
    return (
        <Modal isOpen={isOpen} toggle={toggle} style={{ minWidth: "40vw" }}>
            <ModalHeader toggle={toggle}>Details</ModalHeader>
            <ModalBody>
                <div>
                    <h5><strong>Title:</strong> {item?.title}</h5>
                    <p><strong>Description:</strong> {item?.desc}</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    {
                        item?.images?.map(img => (
                            <img src={img?.url} alt="item" style={{ height: "100px", width: "100px", objectFit: "contain" }} />
                        ))
                    }
                </div>
            </ModalBody>
            {
                item.status !== "accepted" && item.status !== "declined"
                &&
                <ModalFooter>
                    {
                        item?.bargain === true
                        &&
                        <>
                            {
                                <>
                                    {
                                        type === "send"
                                            ?
                                            <>
                                                {
                                                    item.status === "bargain"
                                                    &&
                                                    <Button style={{
                                                        background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                                                        border: "none",
                                                        outline: "none"
                                                    }} disabled={isSaving} onClick={() => {
                                                        toggle()
                                                        setShowActionModal(true)
                                                    }}>Revise</Button>
                                                }
                                            </>
                                            :
                                            <>
                                                {
                                                    item.status === "sent"
                                                    &&
                                                    <Button style={{
                                                        background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                                                        border: "none",
                                                        outline: "none"
                                                    }} disabled={isSaving} onClick={() => {
                                                        toggle()
                                                        setShowActionModal(true)
                                                    }}>Bargain</Button>
                                                }
                                            </>
                                    }
                                </>
                            }
                        </>
                    }
                    <Button style={{
                        background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                        border: "none",
                        outline: "none"
                    }} disabled={isSaving} onClick={declineQuotation}>Decline</Button>
                    {
                        type !== "send"
                            && item.status !== "bargain"
                            ?
                            <Button style={{
                                background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                                border: "none",
                                outline: "none"
                            }} disabled={isSaving} onClick={acceptQuotation}>Accept</Button>
                            : ""
                    }
                    {
                        type === "send"
                            && item.status === "bargain"
                            ?
                            <Button style={{
                                background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                                border: "none",
                                outline: "none"
                            }} disabled={isSaving} onClick={acceptQuotation}>Accept</Button>
                            : ""
                    }
                </ModalFooter>
            }
        </Modal>
    )
}

export default ItemDetails