import { useState } from "react";
import { Btn } from "../../AbstractElements";
import GradientButton from "../User/UserSettings/GradientButton";
import Amount from "./Amount";
import styles from "./styles/Instant.module.scss";

const Instant = () => {
    const [senderAmount, setSenderAmount] = useState()
    const [receiverAmount, setReceiverAmount] = useState()
    const [senderCurrency, setSenderCurrency] = useState("USD")

    return (
        <div className={styles.container}>
            <div>
                <span>
                    &larr;
                </span>
                <div className={styles.amounts}>
                    <Amount amount={senderAmount} title="You Pay" currency={senderCurrency} setAmount={setSenderAmount} setCurrency={setSenderCurrency} />
                    <Amount amount={receiverAmount} title="Benificiary Receives" currency="EUR" setAmount={setReceiverAmount} />
                </div>
                <div className={styles.status}>
                    <div>
                        <span>Fee</span>
                        <p>2.00 USD</p>
                    </div>
                    <div>
                        <span>Fee</span>
                        <p>1.00 USD = 0.90 GBP</p>
                    </div>
                    <div>
                        <span>Should arrive</span>
                        <span>In a few minutes</span>
                    </div>
                </div>
                <div className={styles.button}>
                    {/* <Btn attrBtn={{
                        color: "primary",
                        type: "button",
                        outline: true,
                        className: "btn-outline-primary",
                        style: {
                            fontSize: ".7rem",
                        },
                    }}>Continue</Btn> */}
                    <GradientButton value={"Continue"} size="m" />
                </div>
            </div>
        </div>
    )
}

export default Instant