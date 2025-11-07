import { useTranslation } from "react-i18next";
import Header from "../Header";
import styles from "./Styles.module.scss";
import KPICard from "./KPICard";
import OrderBreakdown from "./OrderBreakdown";
import ShippingDistance from "./ShippingDistance";
import RecentOrdersTable from "./RecentOrdersTable";
import ShippingBoxIcon from "./icons/ShippingBoxIcon";
import DeliveryIcon from "./icons/DeliveryIcon";
import GrowthIcon from "./icons/GrowthIcon";

const Index = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.parent}>
                <div className={styles.div1}>
                    <KPICard
                        title="Total Orders"
                        value="0"
                        percentage="0.0%"
                        description="compared to the last period."
                        icon={ShippingBoxIcon}
                        trend="increased"
                    />
                </div>

                <div className={styles.div2}>
                    <KPICard
                        title="Average Delivery Time"
                        value="0"
                        percentage="days 0.0%"
                        description="compared to the last period."
                        icon={DeliveryIcon}
                        trend="increased"
                    />
                </div>

                <div className={styles.div3}>
                    <KPICard
                        title="Order Volume Growth"
                        value="0%"
                        description="this week."
                        icon={GrowthIcon}
                        trend="increased"
                    />
                </div>

                <div className={styles.div5}>
                    <OrderBreakdown />
                </div>

                <div className={styles.div6}>
                    <ShippingDistance />
                </div>

                <div className={styles.div7}>
                    <RecentOrdersTable />
                </div>
            </div>
        </div>
    );
};

export default Index;
