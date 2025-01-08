import React, { useRef, useState } from 'react';
import { Card, CardBody, Col, Row, Input, Button, FormGroup, Label, DropdownMenu, DropdownItem, Dropdown } from 'reactstrap';
import QRCode from 'qrcode.react';
import { useSelector } from 'react-redux';
import { Btn, LI, UL } from '../../AbstractElements';
import { useDispatch } from 'react-redux';
import { changeRequestStatus } from '../../store/slices/ChipsInRequests';
import { ChevronDown, Edit2 } from 'react-feather';
import "./chipsinspan.css"
import ChipsInConfirmationModal from './ChipsInConfirmationModal';
import ShareBtn from '../ShareBtn';
import { useTranslation } from 'react-i18next';

const TopContainer = ({ sti, ssit }) => {
    const { t } = useTranslation()
    const [currency, setCurrency] = useState('USD');
    const item = useSelector(state => state.chipsInRequests).filter(item => item.type === "General")[0];
    const [title, setTitle] = useState(item.name)
    const [titleEdit, setTitleEdit] = useState(false)
    const [description, setDescription] = useState(item.description)
    const [descriptionEdit, setDescriptionEdit] = useState(false)
    const [copied, setCopied] = useState("")
    const inputRef = useRef();
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false)

    const handleCurrencyChange = (event) => {
        setCurrency(event.target.value);
    };

    const copyToClipboard = () => {
        inputRef.current?.select();
        document.execCommand("copy");
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 3000);
    }

    return (
        <Col>
            <Card>
                <CardBody>
                    <Row style={{ rowGap: "1rem" }}>
                        <Col style={{ width: "25%", maxWidth: "310px", minWidth: "280px" }}>
                            <div style={{ width: "100%", border: "5px solid white" }}>
                                <QRCode value={item.qr_link} style={{ width: "100%", aspectRatio: 1, height: "none" }} />
                            </div>
                            <Button color="primary mt-2" style={{ width: "100%", borderRadius: "10px", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }}>{t("Download QR Code")}</Button>
                            <Button color="primary mt-2" style={{ width: "100%", borderRadius: "10px", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }} onClick={() => {
                                sti(item)
                                ssit(true)
                            }}>{t("View Transactions")}</Button>
                        </Col>
                        <Col style={{ minWidth: "300px" }}>
                            <div style={{ width: "100%" }}>
                                <Label for="currencySelect">{t("Select Wallet")}:</Label>
                                <div className='mb-3' style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
                                    <Input type="select" id="currencySelect" value={currency} onChange={handleCurrencyChange}>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </Input>
                                    <Col style={{ minWidth: "90px" }}>
                                        <Card className='basic-dropdown' style={{ boxShadow: "none", marginBottom: "5px" }}>
                                            <UL attrUL={{ className: 'd-flex flex-row flex-wrap' }}>
                                                <LI attrLI={{ className: 'onhover-dropdown' }}>
                                                    <span className={`${item.status === "Active" ? "active" : "inactive"}`}>{item.status}</span>
                                                    <span>
                                                        <ChevronDown className='ms-2 middle' />
                                                    </span>
                                                    <UL attrUL={{ className: 'onhover-show-div left-dropdown' }}>
                                                        <LI attrLI={{ style: { width: "fit-content" }, onClick: () => setModalOpen(true) }} >
                                                            <span>{item.status === "Active" ? "Inactive" : "Active"}</span>
                                                        </LI>
                                                    </UL>
                                                </LI>
                                            </UL>
                                            <ChipsInConfirmationModal
                                                isOpen={modalOpen}
                                                title="Confirm"
                                                message="Are you sure, you want to change the request status?"
                                                onCancel={() => setModalOpen(false)}
                                                onConfirm={() => {
                                                    dispatch(changeRequestStatus(item.id))
                                                    setModalOpen(false)
                                                }}
                                            />
                                        </Card>
                                    </Col>
                                </div>
                            </div>
                            <FormGroup>
                                <Label for="titleField">{t("Title")}</Label>
                                <div style={{ position: "relative" }}>
                                    <Input type="text" id="titleField" style={{ paddingRight: "40px" }} value={title} onChange={e => setTitle(e.target.value)} readOnly={!titleEdit} />
                                    {
                                        titleEdit
                                            ?
                                            <Btn
                                                attrBtn={{
                                                    color: "primary",
                                                    type: "button",
                                                    style: {
                                                        fontSize: ".7rem",
                                                        margin: 0,
                                                        borderRadius: "10px",
                                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none",
                                                        position: "absolute",
                                                        top: "50%",
                                                        right: "10px",
                                                        transform: "translateY(-50%)"
                                                    },
                                                    onClick: () => {
                                                        setTitleEdit(false)
                                                    }
                                                }}
                                            >
                                                {t("Save")}
                                            </Btn>
                                            :
                                            <Edit2 size={20} style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} cursor="pointer" onClick={() => setTitleEdit(true)} />
                                    }
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label for="descriptionField">{t("Description")}</Label>
                                <div style={{ position: "relative" }}>
                                    <Input type="text" id="descriptionField" style={{ paddingRight: "40px" }} value={description} onChange={e => setDescription(e.target.value)} readOnly={!descriptionEdit} />
                                    {
                                        descriptionEdit
                                            ?
                                            <Btn
                                                attrBtn={{
                                                    color: "primary",
                                                    type: "button",
                                                    style: {
                                                        fontSize: ".7rem",
                                                        margin: 0,
                                                        borderRadius: "10px",
                                                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none",
                                                        position: "absolute",
                                                        top: "50%",
                                                        right: "10px",
                                                        transform: "translateY(-50%)"
                                                    },
                                                    onClick: () => {
                                                        setDescriptionEdit(false)
                                                    }
                                                }}
                                            >
                                                {t("Save")}
                                            </Btn>
                                            :
                                            <Edit2 size={20} style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)" }} cursor="pointer" onClick={() => setDescriptionEdit(true)} />
                                    }
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label for="readonlyInput">{t("Share your unique link!")}</Label>
                                <div style={{
                                    display: "flex",
                                    gap: ".2rem",
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
                                                background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none",
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
                            <p>{t("Share your QR Code or pay link to instantly get paid in your insta wallet.")}</p>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Col>
    );
};

export default TopContainer;