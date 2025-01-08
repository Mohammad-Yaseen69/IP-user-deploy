import { Progressbar } from "../../AbstractElements";
import styles from "./styles/AccountCard.module.scss"
import { GrTransaction } from "react-icons/gr"
import { MdOutlinePayments, MdBlockFlipped } from "react-icons/md"
import { FiMoreHorizontal } from "react-icons/fi"
import "./styles/Progress.scss"
import { Check, Copy } from "react-feather";
import { useState } from "react";
import logo_white from "../../assets/images/logo/logo_white.png"
import { Progress } from "reactstrap";
import transparent from "./tran_logo.svg"

const AccountCard = ({ data }) => {
    const remaining = data.getRemaining()
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.wallet_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <>
            <div className={styles.card}>
                {/* <div className={styles.circle}></div> */}
                <img src={transparent} className={styles.circle} />
                <div className={styles.top}>
                    <div className={styles.left}>
                        <span>Balance</span>
                        <h3>${data.balance.toLocaleString()}</h3>
                    </div>
                    <div className={styles.right}>
                        <img src={logo_white} alt="" />
                    </div>
                </div>
                <p style={{ marginBottom: 0, color: "white", margin: ".2rem 0", display: "flex", flexDirection: "column" }}>
                    <span style={{
                        fontSize: "50%",
                        color: "rgb(221, 221, 221)"
                    }}>Wallet ID: </span>
                    <span style={{ background: "rgba(217,217,217,.08)", padding: ".2rem", borderRadius: "6px", width: "fit-content", fontSize: "75%" }}>
                        {data.wallet_number}
                        {
                            copied
                                ?
                                <Check style={{ marginLeft: ".5rem" }} size={12} />
                                :
                                <Copy style={{ marginLeft: ".5rem" }} size={12} onClick={copyToClipboard} />
                        }
                    </span>
                </p>
                <div className={styles.bottom}>
                    <p>Monthly limit</p>
                    <h3>${data.completed.toLocaleString()}</h3>
                    {/* <Progressbar attrProgress={{ color: "white", value: `${(data.completed / data.monthly_limit) * 100}` }} /> */}
                    <Progress
                        value={`${(data.completed / data.monthly_limit) * 100}`}
                        barStyle={{
                            background: "linear-gradient(to right, rgba(256,256,256,.6), rgba(256,256,256,.9))",
                            borderRadius: "50px",
                            margin: "2px"
                        }}
                        style={{
                            height: "10px",
                            background: "rgba(256,256,256,.3)",
                        }}
                    />
                    {/* <span style={{ right: `${(remaining / data.monthly_limit) * 100}%` }}>${remaining.toLocaleString()}</span> */}
                    <span style={{ right: "5px" }}>${remaining.toLocaleString()}</span>
                </div>
            </div>
            <div className={styles.cardMethods}>
                <div className={styles.method}>
                    <button className={styles.icon}>
                        <GrTransaction pointerEvents={"none"} size={25} />
                    </button>
                    <p>Transactions</p>
                </div>
                <div className={styles.method}>
                    <button className={styles.icon}>
                        <MdOutlinePayments pointerEvents={"none"} size={25} />
                    </button>
                    <p>Payments</p>
                </div>
                <div className={styles.method}>
                    <button className={styles.icon}>
                        <MdBlockFlipped pointerEvents={"none"} size={25} />
                    </button>
                    <p>Block</p>
                </div>
                <div className={styles.method}>
                    <button className={styles.icon}>
                        <FiMoreHorizontal pointerEvents={"none"} size={25} />
                    </button>
                    <p>More</p>
                </div>
            </div>
        </>
    )
}

export default AccountCard;