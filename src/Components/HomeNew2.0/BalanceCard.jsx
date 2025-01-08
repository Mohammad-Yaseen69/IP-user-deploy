import React from 'react';
import { ArrowUp } from 'react-feather';
import { Card, CardBody } from 'reactstrap';
import styles from "./styles/balance.module.css"
import { useTranslation } from 'react-i18next';

const BalanceComponent = () => {
    const { t } = useTranslation()
    return (
        <Card style={{ marginBottom: 0, minWidth: "280px", flex: 1 }}>
            <CardBody className='b_card'>
                <div className="d-flex flex-column">
                    <p style={{ marginBottom: 0 }}>{t("Balance Amount")}</p>
                    <div className="d-flex justify-content-between align-items-center gap-2">
                        <h4 className={`${styles.head}`}>$2,200.00</h4>
                        <div className="d-flex align-items-center">
                            <div className="bg-success text-white d-flex align-items-center p-1 rounded" style={{ fontSize: ".6rem" }}>
                                <ArrowUp size={12} />
                                <span className="ml-1">2.03 %</span>
                            </div>
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: ".6rem", marginBottom: 0 }}>{t("You spent less compared to last month.")}</p>
            </CardBody>
        </Card>
    );
};

export default BalanceComponent;
