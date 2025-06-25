import React, { useContext, useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import styles from "./styles/balance.module.css"
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';

const BalanceComponent = () => {
    const { t } = useTranslation()
    const { available } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)
    const [totalBalance, setTotalBalance] = useState(0)



    useEffect(() => {
        if (available) {
            const calculateTotal = async () => {
                const total = available?.reduce((acc, balance) => acc + balance, 0);
                setTotalBalance(total ?? 0);
                setIsLoading(false)
            };


            calculateTotal();
        }
    }, [available])

    return (
        <Card style={{ marginBottom: 0, minWidth: "220px", flex: 2, background: "#fafafa", boxShadow: "0px 0px 146px 0px rgba(109, 41, 220, 0.05) inset" }}>
            <CardBody className='b_card'>
                <div className="d-flex flex-column">
                    <p style={{ marginBottom: 0 }}>{t("Total Balance")}</p>
                    <div className="d-flex justify-content-between align-items-center gap-2">
                        {
                            isLoading
                                ?
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" color='primary' role="status">
                                        <span class="sr-only">Loading...</span>
                                    </div>
                                </div>
                                :
                                <h4 className={`${styles.head}`} style={{ letterSpacing: "-2px" }}>${Number(totalBalance)?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</h4>
                        }
                        {/* <div className="d-flex align-items-center">
                            <div className=" text-white d-flex align-items-center rounded" style={{ fontSize: ".6rem", background: "linear-gradient(0deg, #1EA744 0%, #1EA744 100%), radial-gradient(4203.6% 250.48% at -13% 100%, #E64067 0%, #5926F0 55.65%, #4828A0 100%)", padding: ".1rem .3rem" }}>
                                <img src={chev_up} alt="c" style={{
                                    width: ".4vw",
                                    height: ".4vw",
                                    objectFit: "contain",
                                    marginRight: ".25rem"
                                }} />
                                <span className="ml-1" style={{ whiteSpace: "nowrap" }}>2.03 %</span>
                            </div>
                        </div> */}
                    </div>
                </div>
                {/* <p style={{ fontSize: ".6rem", marginBottom: 0 }}>{t("You spent less compared to last month.")}</p> */}
            </CardBody>
        </Card>
    );
};

export default BalanceComponent;
