import React from 'react'
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

const ItemDetails = ({ item, type, isOpen, toggle, isSaving, setShowActionModal, declineQuotation, acceptQuotation }) => {
    const user = type === "send" ? item?.reciever : item?.sender;
    const {t} = useTranslation()
    return (
        <Modal isOpen={isOpen} toggle={toggle} style={{ minWidth: "40vw" }}>
            <ModalHeader toggle={toggle}>{t("Details")}</ModalHeader>
            <ModalBody>
                <div>
                    <h5><strong>{t("Title")}:</strong> {item?.title}</h5>
                    <p><strong>{t("Description")}:</strong> {item?.desc}</p>
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
                                                    }}>{t("Revise")}</Button>
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
                                                    }}>{t("Bargain")}</Button>
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
                    }} disabled={isSaving} onClick={declineQuotation}>{t("Decline")}</Button>
                    {
                        type !== "send"
                            && item.status !== "bargain"
                            ?
                            <Button style={{
                                background: "linear-gradient(341deg, #E64067 -4.84%, #5926F0 90.69%, #4828A0 166.81%), #D9D9D9",
                                border: "none",
                                outline: "none"
                            }} disabled={isSaving} onClick={acceptQuotation}>{t("Accept")}</Button>
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
                            }} disabled={isSaving} onClick={acceptQuotation}>{t("Accept")}</Button>
                            : ""
                    }
                </ModalFooter>
            }
        </Modal>
    )
}

export default ItemDetails