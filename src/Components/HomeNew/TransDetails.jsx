import React from 'react';
import { Card, CardBody } from 'reactstrap';
import styles from "./styles/td.module.css"
import up from "./files/up.svg"
import right from "./files/right.svg"
import { useTranslation } from 'react-i18next';

const TransDetails = () => {
    const { t } = useTranslation()
    return (
        <Card style={{ marginBottom: 0, flex: 2, overflowX: "auto", minWidth: "250px" }}>
            <CardBody className="b_card d-flex align-items-center">
                {/* First column */}
                <div className="flex-grow-1 d-flex align-items-center flex-column" style={{ minWidth: "80px", width: "fit-content" }}>
                    <p className={styles.sub} style={{ textAlign: "center", marginBottom: 0 }}>{t("No. of Trans.")}</p>
                    <h4 className={styles.main} style={{ margin: ".5rem 0" }}>10</h4>
                    <div className='d-flex align-items-center gap-1'>
                        <img src={up} alt="up" />
                        <span className={`text-success ml-1 ${styles.bot}`}>2.03%</span>
                    </div>
                </div>

                {/* Second column */}
                <div className="flex-grow-1 d-flex align-items-center flex-column" style={{ minWidth: "80px", width: "fit-content" }}>
                    <p className={styles.sub} style={{ textAlign: "center", marginBottom: 0 }}>{t("Total Sent")}</p>
                    <h4 className={styles.main} style={{ margin: ".5rem 0" }}>$63,000</h4>
                    <div className='d-flex align-items-center gap-1'>
                        <img src={up} alt="up" />
                        <span className={`text-success ml-1 ${styles.bot}`}>2.03%</span>
                    </div>
                </div>

                {/* Third column */}
                <div className="flex-grow-1 d-flex align-items-center flex-column" style={{ minWidth: "80px", width: "fit-content" }}>
                    <p className={styles.sub} style={{ textAlign: "center", marginBottom: 0 }}>{t("Total Rec.")}</p>
                    <h4 className={styles.main} style={{ margin: ".5rem 0" }}>$300</h4>
                    <div className='d-flex align-items-center gap-1'>
                        <img src={up} alt="up" />
                        <span className={`text-success ml-1 ${styles.bot}`}>2.03%</span>
                    </div>
                </div>

                {/* Fourth column */}
                <div className="flex-grow-1 d-flex align-items-center flex-column" style={{ minWidth: "80px", width: "fit-content" }}>
                    <p className={styles.sub} style={{ textAlign: "center", marginBottom: 0 }}>{t("Refunds")}</p>
                    <h4 className={styles.main} style={{ margin: ".5rem 0" }}>4</h4>
                    <div className='d-flex align-items-center gap-1'>
                        <img src={up} alt="up" />
                        <span className={`text-success ml-1 ${styles.bot}`}>2.03%</span>
                    </div>
                </div>

                {/* Fifth column */}
                <div className="d-flex align-items-center justify-content-center" style={{ minWidth: "50px" }}>
                    <span style={{
                        background: "linear-gradient(336.73deg, #E64067 -69.44%, #5926F0 60.39%, #4828A0 163.84%), #D9D9D9",
                        cursor: "pointer",
                        height: "40px",
                        width: "40px",
                        boxShadow: "0px 11.9007px 8.65504px -5.4094px rgba(89, 38, 240, 0.17)",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <img src={right} alt="right" />
                    </span>
                </div>
            </CardBody>
        </Card>
    );
};

export default TransDetails;
