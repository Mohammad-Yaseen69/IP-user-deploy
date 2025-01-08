import { Btn } from "../../AbstractElements";
import "./PaymentButton.css"

const PaymentsButton = ({ value, size, attr, rounded = true }) => {
    return (
        <Btn attrBtn={{
            gradient: true,
            size: size.toLowerCase(),
            className: "payment__btn",
            style: {
                borderRadius: rounded ? "50px" : "10px",
                border: "none",
                marginRight: 0,
                marginBottom: 0
            },
            ...attr
        }}>
            <span>{value}</span>
        </Btn>
    );
};

export default PaymentsButton;