import { Card, CardBody, Col } from "reactstrap";
import TransactionCardHeader from "./TransactionCardHeader";
import styles from "./TranTable.module.scss"
import TransactionCardsBody from "./TransactionCardBody";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const TransactionCards = () => {
    const { t } = useTranslation()
    const allTransactions = useSelector(state => state.transactions)

    const [transactions, setTransactions] = useState(allTransactions)
    return (
        <Col xl="12">
            <Card /*className="user-status"*/>
                <TransactionCardHeader setTransactions={setTransactions} allTransactions={allTransactions} />
                <CardBody>
                    <div className={styles.table_wrapper}>
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("Name")}</th>
                                    <th className={styles.hidden}>{t("Date")}</th>
                                    <th className={styles.hidden}>{t("Type")}</th>
                                    <th className={styles.hidden}>{t("Transaction Time")}</th>
                                    <th className={styles.hidden}>{t("Payment Type")}</th>
                                    <th className={styles.hidden}>{t("Transaction ID")}</th>
                                    <th>{t("Amount")}</th>
                                    <th>{t("Status")}</th>
                                </tr>
                            </thead>
                            <TransactionCardsBody transactions={transactions} />
                        </table>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default TransactionCards;