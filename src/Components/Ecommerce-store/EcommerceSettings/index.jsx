import { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import Header from "../Header";
import Styles from "./Styles/index.module.scss";
import GeneralFrom from "./components/GeneralFrom";
import StoreFrontForm from "./components/StoreFrontForm";
import ProductsForm from "./components/ProductsForm";
import CheckoutForm from "./components/CheckoutForm";
import ShippingForm from "./components/ShippingForm";
import NotificationsForm from "./components/NotificationsForm";
import style from "./Styles/GeneralFrom.module.scss";
import { useTranslation } from "react-i18next";


const tabs = [
    "General",
    "Store front",
    "Products",
    "Checkout",
    "Shipping",
    "Notifications"
];

const EcommerceSettings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { t } = useTranslation()
    return (
        <div className={Styles.containermain}>
            <Header
                heading="Store settings"
                paragraph="Get an at-a-glance view of your sales performance, key metrics, and business insights all in one place"
            />

            <div className={Styles.container}>
                <div className={Styles.containerHeader}>

                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        TabIndicatorProps={{ style: { display: "none" } }}
                    >
                        {tabs.map((item, index) => (
                            <Tab
                                key={index}
                                label={item}
                                classes={{
                                    root: Styles.btnhead,
                                    selected: Styles.active,
                                }}
                            />
                        ))}
                    </Tabs>


                </div>

                <div className={Styles.formContainer}>
                    {activeTab === 0 && <GeneralFrom />}
                    {activeTab === 1 &&
                        <div className={style.formContainer}>
                            <form className={style.formContent}>
                                <div className={style.leftCol}>
                                    <div>
                                        <h4>{t("Store front")}</h4>
                                        <div>   </div>
                                        <h2>{t("Hero Section")}</h2>
                                        <p>{t("Control what customers see first — customize your banner, message, and CTA.")}</p></div>
                                </div>
                                <div className={style.form}>
                                    <StoreFrontForm register={() => { }} activeTab={activeTab}
                                        errors={{}} />
                                </div>
                            </form>
                        </div>}
                    {activeTab === 2 && <ProductsForm />}
                    {activeTab === 3 && <CheckoutForm />}
                    {activeTab === 4 && <ShippingForm />}
                    {activeTab === 5 && <NotificationsForm />}
                </div>
            </div >
        </div >
    );
};

export default EcommerceSettings;
