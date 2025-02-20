import { useSelector } from "react-redux"
import styles from "./styles/index.module.scss"
import { Check } from "react-feather"
import { countries } from "country-list-json"
import { paymentTypeData } from "../PaymentsNewer/PaymentType"
import { payoutChannelData } from "../PaymentsNewer/PayoutChannel"
import { useTranslation } from "react-i18next"


const TransactionItem = ({ color, item, activeItem, setActiveItem, index }) => {
    const { t } = useTranslation()


    const beneficiaries = useSelector(state => state.beneficiaries)
    const beneficiary = beneficiaries.filter(ben => ben.id === item.beneficiary)[0];
    const countryCode = countries.filter(coun => coun.name.toLowerCase() === beneficiary.country.toLowerCase())[0]?.code
    const currentType = paymentTypeData.filter(pt => pt.value === item.paymentType.toLowerCase())[0]
    const currentPayout = payoutChannelData.filter(pt => item.payoutChannel.toLowerCase().includes(pt.value))[0]

    return (
        <div>
            <div className={styles.body_item} onClick={() => {
                if (!activeItem || activeItem !== index + 1) {
                    setActiveItem(index + 1)
                } else {
                    setActiveItem(0)
                }
            }}>
                <div>{item.date} {item.transactionTime}</div>
                <div>{item.transactionId}</div>
                <div>{item.paymentType}</div>
                <div>{beneficiary.name}</div>
                <div>{item.type}</div>
                <div>{item.amount}</div>
                <div>
                    <div style={{
                        background: color,
                        fontSize: "12px",
                        color: "white",
                        width: "100px",
                        margin: "0 auto",
                        padding: "5px",
                        borderRadius: "30px"
                    }}>{item.status}</div>
                </div>
            </div>
            {
                activeItem === index + 1
                &&
                <div className={styles.item_description}>
                    {/* <div className={styles.details}>
                        <div className={styles.colored_card}>
                            <span>Amount</span>
                            <h4>{item.amount}</h4>
                            <button>{item.status === "Pending" ? "Processing" : "Completed"}</button>
                            </div>
                            <div className={styles.trans_dets}>
                            <div>
                                <span>Date & Time</span>
                                <p>{item.date} {item.transactionTime}</p>
                                </div>
                                <div>
                                <span>Transaction ID</span>
                                <p>{item.transactionId}</p>
                                </div>
                                <div>
                                <span>Payment Type</span>
                                <p>{item.paymentType}</p>
                                </div>
                                <div>
                                <span>Name</span>
                                <p>{item.beneficiary}</p>
                                </div>
                                <div>
                                <span>Type</span>
                                <p>{item.type}</p>
                                </div>
                                </div>
                            </div> */}
                    <div className={styles.details}>
                        <div className={styles.colored_card}>
                            <button>{item.status === "Pending" ? "Processing" : "Completed"}</button>
                            <span>{t("Amount")}</span>
                            <h4>{item.amount}</h4>
                            <div className="mb-3 mt-3">
                                <span>{t("Exchange Rate")}:</span>
                                <h5>$ 1.99</h5>
                            </div>
                            <div>
                                <span>{t("comission")}:</span>
                                <h5>$ 2.50</h5>
                            </div>
                        </div>
                        <div className={styles.trans_dets}>
                            <div className={styles.t_item}>
                                <span>{t("Recipient")}:</span>
                                <div>
                                    <div>
                                        <img src={beneficiary.avatar} alt={beneficiary.name[0]} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                                        <div>
                                            <h5>{beneficiary.name}</h5>
                                            <p>{beneficiary.bank_account_number}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div></div>
                                        {beneficiary.isVerified ? t("Verified") : ""}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.t_item}>
                                <span>{t("Country")}:</span>
                                <div>
                                    <div>
                                        <img src={`https://flagsapi.com/${countryCode}/shiny/64.png`} alt={beneficiary.name[0]} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                                        <div>
                                            <h5 style={{ marginBottom: 0 }}>{beneficiary.country}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.t_item}>
                                <span>{t("Via")}:</span>
                                <div>
                                    <div>
                                        <div style={{
                                            height: "35px",
                                            width: "35px",
                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: "12px",
                                            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                                        }}>
                                            <img src={currentPayout?.icon} alt={beneficiary.name[0]} style={{
                                                width: "19px",
                                                objectFit: "contain",
                                                aspectRatio: 1
                                            }} />
                                        </div>
                                        <div>
                                            <h5 style={{ marginBottom: 0 }}>{currentPayout?.name}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.t_item}>
                                <span>{t("As")}:</span>
                                <div>
                                    <div>
                                        <div style={{
                                            minHeight: "35px",
                                            minWidth: "35px",
                                            background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: "12px",
                                            boxShadow: "0px 4px 7px rgba(172, 53, 159, 0.31)"
                                        }}>
                                            <img src={currentType?.icon} alt={beneficiary.name[0]} style={{
                                                width: currentType?.width,
                                                objectFit: "contain",
                                                aspectRatio: 1
                                            }} />
                                        </div>
                                        <div>
                                            <h5 style={{ marginBottom: 0 }}>{currentType?.name}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.timeline}>
                        <span>{t("Status")}</span>
                        <div>
                            <div className={styles.timeline_item}>
                                <div className={styles.circle}>
                                    <Check color="white" size={15} />
                                </div>
                                <div>
                                    <h5>Item One</h5>
                                    <p>12/13/2021 12:23 PM</p>
                                </div>
                            </div>
                            <div className={styles.timeline_item}>
                                <div className={styles.circle}>
                                    <Check color="white" size={15} />
                                </div>
                                <div>
                                    <h5>Item One</h5>
                                    <p>12/13/2021 12:23 PM</p>
                                </div>
                            </div>
                            <div className={styles.timeline_item}>
                                <div className={styles.circle}>
                                    <Check color="white" size={15} />
                                </div>
                                <div>
                                    <h5>Item One</h5>
                                    <p>12/13/2021 12:23 PM</p>
                                </div>
                            </div>
                            <div className={styles.timeline_item}>
                                <div className={styles.circle}>
                                    <Check color="white" size={15} />
                                </div>
                                <div>
                                    <h5>Item One</h5>
                                    <p>12/13/2021 12:23 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default TransactionItem