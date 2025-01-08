import { Gift } from "react-feather";
import { Card, Input, Label } from "reactstrap";
import styles from "./styles/index.module.scss"
import { Btn } from "../../AbstractElements";
import ReferGuidance from "./ReferGuidance";
import ReferralUserCards from "./ReferralUserCards";
import { useRef, useState } from "react";
import ShareBtn from "../ShareBtn";
import PaymentsButton from "../Payments/PaymentsButton";
import { useTranslation } from "react-i18next";

const Referrals = () => {
    const { t } = useTranslation()
    const referralLink = "https://www.instapay.com/hdsuidsay627";
    const inputRef = useRef(null);
    const [copied, setCopied] = useState("")

    const copyToClipboard = () => {
        inputRef.current.select();
        document.execCommand("copy");
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 3000);
    }
    return (
        <>
            <Card className="profile-header bg-image" style={{ background: `url(https://media.istockphoto.com/id/1226577467/photo/good-friends-together-enjoying-the-sunset-view.jpg?s=612x612&w=0&k=20&c=53OBf6p9b4MyrEC0EmoaSXS5Z1eQwAo5-QwzRycqSyg=)`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }}>
                <div className={styles.header}>
                    <div style={{ marginBottom: ".5rem", color: "white" }}>
                        <Gift size={30} />
                    </div>
                    <h2 style={{ color: "white" }}>{t("$25 USD for you and $15 USD for friends!")}</h2>
                    <h4 style={{ color: "white", fontSize: "1.1rem", marginTop: ".5rem", paddingBottom: "3rem" }}>{t("Once they do a transaction of 100$, You'll receive 25$.")}</h4>

                    <div className={styles.bottom}>
                        <p style={{ color: "white" }}>{t("Voucher amounts may vary depending on the numbers of referrals")}</p>
                        <div className={`${styles.referrals__info} card`}>
                            <div className={`${styles.sub_item} ${styles.left}`}>
                                <Label className="col-form-label">{t("You Referral Code")}</Label>
                                <h3 className="referral__code">AJHAKSIWNSUAME</h3>
                            </div>
                            <div className={`${styles.sub_item} ${styles.right}`}>
                                <Label className="col-form-label">{t("Share your unique link!")}</Label>
                                <div>
                                    <input
                                        ref={inputRef}
                                        className="form-control"
                                        style={{ flex: 1, minWidth: "200px" }}
                                        value={referralLink}
                                        readOnly
                                    />
                                    <PaymentsButton value={copied ? "Copied" : "Copy"} rounded={false} size={"sm"} attr={{ onClick: copyToClipboard }} />
                                    {/* <Btn
                                        attrBtn={{
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
                                    </Btn> */}
                                    <ShareBtn link={referralLink} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <ReferGuidance />
            {/* <div style={{
                display: "flex",
                justifyContent: "center",
                margin: "1rem 0"
            }}>
                <Btn
                    attrBtn={{
                        color: "primary",
                        type: "button",
                        outline: true,
                        className: "btn-outline-primary",
                        style: {
                            fontSize: ".7rem",
                            margin: 0
                        }
                    }}
                >
                    Find Out More
                </Btn>
            </div> */}
            <ReferralUserCards />
        </>
    )
}

export default Referrals;