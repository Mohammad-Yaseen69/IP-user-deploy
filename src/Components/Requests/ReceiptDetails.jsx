import { Button, Col, Row } from "reactstrap";

const ReceiptDetails = ({ item, sci, sis, amount }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const url = "https://payments.securetrading.net/process/payments/choice";
        const params = new URLSearchParams(formData)
        sci("email-form")
        sis(`${url}?${params.toString()}`)
    }
    return (
        <>
            <div div className="key-value" >
                <Row>
                    <Col xs="12">
                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>Wallet number:</strong> <span>{item?.wallet}</span>
                        </p>
                    </Col>
                    <Col xs="12">
                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>Title:</strong> <span>{item?.name}</span>
                        </p>
                    </Col>
                    <Col xs="12">
                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>Currency:</strong> <span>{item?.currency}</span>
                        </p>
                    </Col>
                    <Col xs="12">
                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>Charges:</strong> <span>$12</span>
                        </p>
                    </Col>
                    <Col xs="12">
                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>Amount:</strong> <span>${amount}</span>
                        </p>
                    </Col>
                </Row>
            </div >
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(128,128,128,.3)", display: "flex", gap: "1rem", justifyContent: "center" }}>
                <Button color="primary" size="m" style={{ borderRadius: "10px", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }}>Pay via InstaPay</Button>
                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="sitereference" value="test_kemitkingdom79109" />
                    <input type="hidden" name="stprofile" value="default" />
                    <input type="hidden" name="currencyiso3a" value={item.currency} />
                    <input type="hidden" name="mainamount" value={amount} />
                    <input type="hidden" name="version" value="2" />
                    <Button color="primary" size="m" style={{ borderRadius: "10px", background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)", border: "none" }}>Pay via Other Method</Button>
                </form>
            </div>
        </>
    )
}

export default ReceiptDetails;