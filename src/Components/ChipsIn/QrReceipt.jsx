import React, { useRef, useState } from 'react';
import { Download } from 'react-feather';
import QRCode from 'qrcode.react';
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Label, Button } from 'reactstrap';
import { Btn } from '../../AbstractElements';
import ShareBtn from '../ShareBtn';
import { useTranslation } from 'react-i18next';

const QrReceipt = ({ isOpen, toggle, item, showDetails }) => {
    const { t } = useTranslation()
    const [copied, setCopied] = useState("")
    const inputRef = useRef();

    const copyToClipboard = () => {
        inputRef.current?.select();
        document.execCommand("copy");
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 3000);
    }
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{item.name}</ModalHeader>
            <ModalBody>
                {
                    showDetails
                    &&
                    <>
                        <div className="text-center">
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                        </div>
                        <div className="key-value" style={{ margin: "1rem 0" }}>
                            <Row>
                                <Col xs="12">
                                    <p style={{ display: "flex", justifyContent: "space-between" }}>
                                        <strong>{t("Wallet number")}:</strong> <span>{item?.wallet}</span>
                                    </p>
                                </Col>
                                <Col xs="12">
                                    <p style={{ display: "flex", justifyContent: "space-between" }}>
                                        <strong>{t("Charges")}:</strong> <span>$12</span>
                                    </p>
                                </Col>
                                <Col xs="12">
                                    <p style={{ display: "flex", justifyContent: "space-between" }}>
                                        <strong>{t("Amount")}:</strong> <span>{item?.amount}</span>
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </>
                }
                <Col style={{ maxWidth: "310px", minWidth: "280px", margin: "0 auto 1rem" }}>
                    <div style={{ width: "100%", border: "5px solid white" }}>
                        <QRCode value={item.qr_link} style={{ width: "100%", aspectRatio: 1, height: "none" }} />
                    </div>
                    <Button color="primary mt-2" style={{ width: "100%", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }}>{t("Download QR Code")} <Download size={16} /></Button>
                </Col>
                <FormGroup>
                    <Label for="readonlyInput">{t("Share your unique link!")}</Label>
                    <div style={{
                        display: "flex",
                        gap: ".2rem"
                    }}>
                        <input
                            ref={inputRef}
                            className="form-control"
                            style={{ flex: 1, minWidth: "250px" }}
                            value={item.qr_link}
                            readOnly
                        />
                        <Btn
                            attrBtn={{
                                color: "primary",
                                type: "button",
                                onClick: copyToClipboard,
                                style: {
                                    fontSize: ".7rem",
                                    margin: 0,
                                    borderRadius: "10px",
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none"
                                }
                            }}
                        >
                            {copied ? "Copied" : "Copy"}
                        </Btn>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <ShareBtn link={item.qr_link} />
                        </div>
                    </div>
                </FormGroup>
            </ModalBody>
        </Modal>
    );
};

export default QrReceipt;
