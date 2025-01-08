import { useRef, useState } from "react";
import styles from "./styles/ChipsInConfirmation.module.scss"
import QRCode from "qrcode.react"
import { Button, Form, Label } from "reactstrap";
import { Btn } from "../../AbstractElements";
import { Check } from "react-feather";
import { useSelector } from "react-redux";

const ChipsInConfirmation = ({ handlePay, title, amount, description, itemId }) => {
    const inputRef = useRef(null);
    const [copied, setCopied] = useState("")
    const link = useSelector(state => state.chipsInRequests).filter(item => item.id == itemId)[0].qr_link

    const copyToClipboard = () => {
        inputRef.current.select();
        document.execCommand("copy");
        setCopied(true)
    }

    return (
        <div className={`card ${styles.container}`}>
            <div style={{ maxWidth: "450px", margin: "2rem auto", width: "100%", }}>
                <div className="mb-3" style={{ display: "flex", justifyContent: "center" }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 100, height: 100, marginBottom: "2rem", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)" }}>
                        <Check size={80} color="white" />
                    </div>
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem"
                }}>
                    <strong className="mr-2">Title:</strong>
                    <span>{title}</span>
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem"
                }}>
                    <strong className="mr-2">Description:</strong>
                    <span>{description}</span>
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid rgba(128,128,128,.2)"
                }}>
                    <strong className="mr-2">Amount:</strong>
                    <span>${amount}</span>
                </div>
                <Form onSubmit={handlePay} style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                    <input type="hidden" name="sitereference" value="test_kemitkingdom79109" />
                    <input type="hidden" name="stprofile" value="default" />
                    <input type="hidden" name="currencyiso3a" value="USD" />
                    <input type="hidden" name="mainamount" value={amount} />
                    <input type="hidden" name="version" value="2" />
                    <Button color="primary" type='submit'>
                        Pay
                    </Button>
                </Form>
            </div>
            <div className={styles.top}>
                <div className={styles.left}>
                    <h5 style={{
                        marginBottom: "1rem"
                    }}>Scan your QR-Code!</h5>
                    <QRCode value={link} style={{
                        height: "200px",
                        width: "200px"

                    }} />
                </div>
                <div className={styles.right}>
                    <Label className="col-form-label">Share your unique link!</Label>
                    <div>
                        <input
                            ref={inputRef}
                            className="form-control"
                            style={{ flex: 1, minWidth: "250px" }}
                            value={link}
                            readOnly
                        />
                        <Btn attrBtn={{
                            color: "primary",
                            type: "button",
                            onClick: copyToClipboard,
                            style: {
                                fontSize: ".7rem",
                                margin: 0,
                                borderRadius: "10px"
                            }
                        }}
                        >
                            {copied ? "Copied" : "Copy"}
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChipsInConfirmation;