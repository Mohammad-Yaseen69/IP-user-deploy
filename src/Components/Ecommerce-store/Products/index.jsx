import { Button, IconButton, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { ChevronDown, Plus, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Iconarrow from "./../assets/icons/arrow-square-out.svg";
import Generalnfo from './Generalnfo';
import OrderHistory from './OrderHistory';
import style from "./styles/index.module.scss";
const ProductDetails = ({ ExpandDrower, setExpandDrower, product }) => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className={style.DrawerContainer}>
                <div className={style.Header}>
                    <div>
                        <p>{t("Product Details")}</p> <span>#PRD-98716253-9</span>
                    </div>
                    <IconButton onClick={() => setExpandDrower(false)}>
                        <X />
                    </IconButton>
                </div>

                <div className={style.Content}>
                    <div className={style.introBox}>
                        <div className={style.introLeft}>
                            <img src={product?.img} alt="" width={20} />
                            <div><strong>{product?.title || "iPhone 15 Pro Max"}</strong>
                                <p className={style.Price}>{t("Created at January 28, 2025")}</p></div>
                        </div>
                        <div className={style.introRiht}>
                            <button>
                                {t("Active")}
                            </button>
                            <span>
                                <img src={Iconarrow} alt="" />
                            </span>
                        </div>
                    </div>
                    <div className={style.priceContainer}>
                        <div className={style.priceBox}> <div >
                            <h3>$2,450</h3>
                            <p>{t("Price")}</p>
                        </div>
                            <div style={{
                                borderRight: "1px solid #F0F0F0",
                                borderLeft: "1px solid #F0F0F0",
                            }} >
                                <h3>45</h3>
                                <p>{t("Stocks")}</p>
                            </div>
                            <div >
                                <h3>128</h3>
                                <p>{t("Sold")}</p>
                            </div></div>
                        <Button variant="contained" className={style.addStockBtn}>
                            <Plus size={20} /> {t("Add Stocks")}
                        </Button>
                    </div>



                    <Tabs
                        value={activeTab}
                        onChange={(e, newVal) => setActiveTab(newVal)}
                        className={style.tabBar}
                        TabIndicatorProps={{ style: { display: 'none', fontWeight: 600 } }}

                    >
                        <Tab
                            label={t("General Information")}
                            className={`${style.customTab} ${activeTab === 0 ? style.active : ""}`}
                        />
                        <Tab
                            label={t("Order History")}
                            className={`${style.customTab} ${activeTab === 1 ? style.active : ""}`}

                        />
                    </Tabs>


                    {activeTab === 0 && (
                        <Generalnfo />
                    )}

                    {activeTab === 1 && (
                        <OrderHistory product={product} />
                    )}

                    <div className={style.footerButtons}>
                        <Button
                            variant="none"

                        >
                            {t("Delete Product")}
                        </Button>

                        <div className={style.footerRight}>
                            <Button variant="none">{t("Action")} <ChevronDown /></Button>
                            <Button
                                variant="none"
                                className={style.editBtn}
                            >
                                {t("Edit Product")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default ProductDetails
