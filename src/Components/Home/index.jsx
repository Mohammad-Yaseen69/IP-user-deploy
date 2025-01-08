// import AccountCards from "./AccountCards";
// import QuickLinks from "./QuickLinks";
// import RecentTransactions from "./RecentTransactions";
// import TotalBalance from "./TotalBalance";

import { Container } from "reactstrap";
import TotalProfitCard from "../Dashboard/Ecommerce/ProfitCard/TotalProfitCard";
import QuickLinks from "./QuickLinks";
import styles from "./styles/index.module.scss"
import AccountsCard from "./AccountCards";
import CurrencyConversion from "./CurrencyConversion";
import HistoryDetails from "./HistoryDetails";
import MoneyStatistics from "./MoneyStatistics";
import TransactionsTable from "./TransactionsTable";
import { useEffect, useState } from "react";

const Home = () => {
    const [mobileView, setMobileView] = useState(false)

    const checkMobileView = (e) => {
        e.target.innerWidth < 690 ? setMobileView(true) : setMobileView(false)
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.innerWidth < 690 ? setMobileView(true) : setMobileView(false)
        }

        window.addEventListener("resize", checkMobileView)

        return () => {
            window.removeEventListener("resize", checkMobileView)
        }
    }, [])

    return (
        // <section className={styles.container}>
        // <div className={styles.left}>
        //         <TotalBalance />
        //         <AccountCards />
        //         <CurrencyConversion />
        //     </div>
        //     <div className={styles.right}>
        //         <QuickLinks />
        //         <HistoryDetails />
        //         <MoneyStatistics />
        //         <RecentTransactions />
        //     </div>
        // </section>
        <>
            {
                mobileView
                    ?
                    <Container fluid={true} className={`${styles.mobile_container} dashboard-2`}>
                        <TotalProfitCard />
                        <AccountsCard />
                        <QuickLinks />
                        <HistoryDetails />
                        <MoneyStatistics />
                        <TransactionsTable />
                        <CurrencyConversion />
                    </Container>
                    :
                    <Container fluid={true} className={`${styles.container} dashboard-2`}>
                        <div className={styles.left}>
                            <TotalProfitCard />
                            <AccountsCard />
                            <CurrencyConversion />
                        </div>
                        <div className={styles.right}>
                            <QuickLinks />
                            <HistoryDetails />
                            <MoneyStatistics />
                            <TransactionsTable />
                        </div>
                    </Container>
            }
        </>
    )
}

export default Home;