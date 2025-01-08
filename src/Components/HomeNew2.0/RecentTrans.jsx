import React from 'react';
import { Card, CardHeader, CardBody, CardText } from 'reactstrap';
import { MoreHorizontal, Zap } from 'react-feather';
import styles from "./styles/Recents.module.css"
import { useTranslation } from 'react-i18next';

const RecentTrans = () => {
    const { t } = useTranslation()
    const transactions = [
        {
            id: 1,
            text: 'Star Bucks',
            time: '10:30 AM',
            status: t('Complete'),
            amount: '-$100.00',
        },
        {
            id: 2,
            text: 'Bitcoin Transfer',
            time: '11:45 AM',
            status: t('Pending'),
            amount: '$50.00',
        },
        {
            id: 3,
            text: 'Ethereum Transfer',
            time: '10:30 AM',
            status: t('Complete'),
            amount: '$523.00',
        },
        {
            id: 4,
            text: 'Extra',
            time: '10:30 AM',
            status: t('Complete'),
            amount: '$523.00',
        },
    ];

    return (
        <Card style={{ marginBottom: 0, flex: 1, minWidth: "300px", overflowY: "auto", scrollbarWidth: "none" }}>
            <CardHeader className="d-flex justify-content-between align-items-center c_h_pb">
                <h4 style={{ marginBottom: "0" }}>{t("Recent Transactions")}</h4>
                <MoreHorizontal />
            </CardHeader>
            <CardBody style={{ padding: "1rem", maxHeight: "150px" }}>
                <CardText className="text-muted">Today</CardText>
                {transactions.map((transaction) => (
                    <div key={transaction.id} className={styles.recent_item}>
                        <div className='d-flex gap-2 align-items-center'>
                            <div className={styles.left}>
                                <Zap size={26} className={styles.icon} />
                            </div>
                            <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <h4 className={styles.head} style={{ marginBottom: 0 }}>{transaction.text}</h4>
                                <p className="text-muted" style={{ marginBottom: 0, color: "rgba(128,128,128,.7)", fontSize: ".6rem" }}>
                                    {transaction.time} - <span style={{ color: "black" }}>{transaction.status}</span>
                                </p>
                            </div>
                        </div>
                        <div className={`ml-auto text-${transaction.amount.includes("-") ? "danger" : "success"} ${styles.head}`} style={{ fontWeight: "600" }}>{transaction.amount}</div>
                    </div>
                ))}
            </CardBody>
        </Card>
    );
};

export default RecentTrans;