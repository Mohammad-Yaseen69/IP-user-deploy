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
import { useForm } from "react-hook-form";


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
    const { register, setValue, formState: { errors } } = useForm();

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

                                <div className={style.form}>
                                    <StoreFrontForm register={register}
                                        activeTab={activeTab}
                                        errors={errors}
                                        setValue={setValue}
                                    />
                                </div>
                            </form>
                        </div>}
                    {activeTab === 2 &&
                        <div className={style.formContainer}>
                            <form className={style.formContent}>

                                <div className={style.form}>
                                    <ProductsForm register={register}
                                        activeTab={activeTab}
                                        errors={errors}
                                        setValue={setValue}
                                    />
                                </div>
                            </form>
                        </div>
                    }
                    {activeTab === 3 &&
                        <div className={style.formContainer}>
                            <form className={style.formContent}>

                                <div className={style.form}> <CheckoutForm
                                    register={register}
                                    activeTab={activeTab}
                                    errors={errors}
                                    setValue={setValue}
                                />     </div>
                            </form>
                        </div>}
                    {activeTab === 4 &&
                        <div className={style.formContainer}>
                            <form className={style.formContent}>
                                <div className={style.form}>
                                    <ShippingForm
                                        register={register}
                                        activeTab={activeTab}
                                        errors={errors}
                                        setValue={setValue}
                                    />
                                </div>
                            </form>
                        </div>
                    }
                    {activeTab === 5 &&
                        <div className={style.formContainer}>
                            <form className={style.formContent}>
                                <div className={style.form}>
                                    <NotificationsForm
                                        register={register}
                                        activeTab={activeTab}
                                        errors={errors}
                                        setValue={setValue}

                                    />
                                </div>
                            </form>
                        </div>
                    }
                </div>
            </div >
        </div >
    );
};

export default EcommerceSettings;
