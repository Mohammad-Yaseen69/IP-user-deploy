import { Container, Row } from "reactstrap";
import BalanceComponent from "./BalanceCard";
import EarnMoneyBanner from "./EarnMoneyBanner";
import TransDetails from "./TransDetails";
import QuickLinksNew from "./QuickLinksNew";
import Stats from "./Stats";
import RecentTrans from "./RecentTrans";
import RightContainer from "./RightContainer";
import styles from "./styles/index.module.scss"
import "./styles/responsiveness.css"

const HomeNew2 = () => {
    return (
        <Container fluid={true} className={`${styles.container} dashboard-2`}>
            <div className={styles.left}>
                <EarnMoneyBanner />
                <div style={{ display: "flex", flexWrap: "wrap" }} className={styles.gap}>
                    <BalanceComponent />
                    <TransDetails />
                </div>
                <QuickLinksNew />
                <div style={{ display: "flex", flexWrap: "wrap" }} className={styles.gap}>
                    <Stats />
                    <RecentTrans />
                </div>
            </div>
            <div className={styles.right}>
                <RightContainer />
            </div>
        </Container>
    )
}

export default HomeNew2;