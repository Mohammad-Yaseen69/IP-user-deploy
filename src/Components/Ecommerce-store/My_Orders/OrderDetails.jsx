import { Button, IconButton, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { Star, X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { FaMessage } from 'react-icons/fa6'
import OrderOverView from './OrderOverView'
import ShippingDetails from './ShippingDetails'
import style from "./styles/Drawer.module.scss"
const OrderDetials = ({ ExpandDrower, setExpandDrower, product }) => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className={style.DrawerContainer}>
                <div className={style.Header}>
                    <div>
                        <p>{t("Order Details")}</p>
                    </div>
                    <IconButton onClick={() => setExpandDrower(false)}>
                        <X />
                    </IconButton>
                </div>

                <div className={style.Content}>
                    <div className={style.introBox}>
                        <div className={style.introLeft}>
                            <img src={product?.img} alt="" width={20} />
                            <div><strong>{product?.title || "jhone"} <button className={style.rating}><Star /> 4.9/5</button></strong>
                                <p className={style.Price}>jasonsimmons@gmail.com <span>+1 234-567-8901</span></p></div>
                        </div>
                        <div className={style.introRiht}>
                            <button>
                                <FaMessage size={35} />
                            </button>
                            <span>
                                {/* <img src={Iconarrow} alt="" /> */}
                            </span>
                        </div>
                    </div>
                    <div className={style.priceContainer}>
                        <div className={style.priceBox}> <div >
                            <h3>$5,791.39</h3>
                            <p>{t("Total Amount")}</p>
                        </div>
                            <div style={{
                                borderRight: "1px solid #F0F0F0",
                                borderLeft: "1px solid #F0F0F0",
                            }} >
                                <h3>-</h3>
                                <p>{t("Estemated Delivery")}</p>
                            </div>
                            <div >
                                <h3>Paid</h3>
                                <p>{t("Payment Status")}</p>
                            </div></div>

                    </div>



                    <Tabs
                        value={activeTab}
                        onChange={(e, newVal) => setActiveTab(newVal)}
                        className={style.tabBar}
                        TabIndicatorProps={{ style: { display: 'none', fontWeight: 600 } }}

                    >
                        <Tab
                            label={t("Overview")}
                            className={`${style.customTab} ${activeTab === 0 ? style.active : ""}`}
                        />
                        <Tab
                            label={t("Shipping Details")}
                            className={`${style.customTab} ${activeTab === 1 ? style.active : ""}`}

                        />
                    </Tabs>


                    {activeTab === 0 && (
                        <OrderOverView />
                    )}

                    {activeTab === 1 && (
                        <ShippingDetails product={product} />
                    )}

                    <div className={style.footerButtons}>
                        <Button
                            variant="none"

                        >
                            {t("Chat Customer")}
                        </Button>

                        <div className={style.footerRight}>
                            <Button variant="none">{t("Cancel Order")} </Button>
                            <Button
                                variant="none"
                                className={style.editBtn}
                            >
                                {t("Accept Order")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetials
