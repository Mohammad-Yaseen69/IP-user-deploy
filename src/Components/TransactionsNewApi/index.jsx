import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import TransactionsTable from "./TransactionsTable";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

const TransactionsNewApi = () => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext);
    return (
        <>
            {
                userDetails
                &&
                <>
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <h4>{t("Transactions")}</h4>
                            <TopRight />
                        </div>
                        <TransactionsTable />
                    </div>
                    <div className={styles.mobile}>
                        <div className={styles.top}>
                            <h4>{t("Transactions")}</h4>
                        </div>
                        <TransactionsTable />
                    </div>
                </>
            }
        </>
    )
}

export default TransactionsNewApi;