import { useTranslation } from "react-i18next";
import Header from "../Header";
import styles from "./Styles.module.scss";
import KPICard from "./KPICard";
import OrderBreakdown from "./OrderBreakdown";
import RecentOrdersTable from "./RecentOrdersTable";
import bgimg from "./../assets/icons/XMLID_16316_.svg";
import { useState } from "react";
import { SwipeableDrawer } from "@material-ui/core";
import OrderDetials from "./OrderDetails";


const Index = () => {
    const { t } = useTranslation();
    const [ExpandDrower, setExpandDrower] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [drawerType, setDrawerType] = useState("");


    return (
        <div className={styles.container}>
            <Header heading={"My Order"}  paragraph={"Track and manage your orders, from placement to delivery, all in one place."}/>
            <div className={styles.parent}>
                <div className={styles.div1}>
                    <KPICard
                        title="Total Orders"
                        value="573,541"
                        percentage="-1.2%"
                        height="95%"

                        description="Increased by -1,273 compared to the last period."
                        bgimg={bgimg}
                        trend="increased"
                    />
                </div>

                <div className={styles.div2}>
                    <KPICard
                        title="Average Shipping Distance"
                        value="350"
                        height="40vh"
                        percentage="miles +9.3%"
                        description="Increased by -10.0% compared to the last period."
                        bgimg={bgimg}
                        trend="increased"
                    />
                </div>

                <div className={styles.div3}>
                    <KPICard
                        title="Average Delivery Time"
                        value="+9.3%"
                        percentage="days +9.3%"

                        description="Increased by 0.0% compared to the last period."
                        // icon={GrowthIcon}
                        bgimg={bgimg}
                        trend="increased"
                    />
                </div>

                <div className={styles.div5}>
                    <OrderBreakdown />
                </div>

                <div className={styles.div6}>
                    <KPICard
                        title="Order Volume Growth"
                        value="+8%"
                        height="94%"
                        description="Increased by +2% in this week"
                        // icon={GrowthIcon}
                        bgimg={bgimg}
                        trend="increased"
                    />
                </div>

                <div className={styles.div7}>
                    <RecentOrdersTable setSelectedProduct={setSelectedProduct} selectedProduct={selectedProduct} setExpandDrower={setExpandDrower}
                        ExpandDrower={ExpandDrower} setDrawerType={setDrawerType} />

                </div>
            </div>
            {ExpandDrower && (
                <SwipeableDrawer
                    anchor="right"
                    open={ExpandDrower}
                    onClose={() => setExpandDrower(false)}
                    onOpen={() => setExpandDrower(true)}
                    PaperProps={{
                        className: "myDrawerPaper",

                        sx: {
                            backdropFilter: "blur(5px)",
                            width: "30%",
                            borderRadius: "16px",
                            backgroundColor: "#fff",
                            boxShadow: "0 0 20px rgba(0,0,0,0.1)",
                            margin: "7px 7px 8px 11px",
                            height: "97%",
                            padding: "16px",
                            overflowY: "scroll",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        },
                    }}
                >
                    <OrderDetials ExpandDrower={ExpandDrower} setExpandDrower={setExpandDrower} product={selectedProduct} />
                </SwipeableDrawer>
            )}
        </div>
    );
};

export default Index;
