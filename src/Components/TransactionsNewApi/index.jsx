import { useTranslation } from "react-i18next";
import styles from "./styles/index.module.scss"
import TopRight from "../topRight";
import TransactionsTable from "./TransactionsTable";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";

import { usePermission } from "../../hooks/GeneralUse/usePermission";

const TransactionsNewApi = () => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext);
    const can = usePermission();
    
    if (!can("transactions.main.view")) return null;

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