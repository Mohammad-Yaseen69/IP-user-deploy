import { useTranslation } from 'react-i18next'
import { FaCheck } from 'react-icons/fa6'
import style from "./styles/OrderOverView.module.scss"
const OrderOverView = () => {
    const { t } = useTranslation()
    return (
        <div className={style.overviewContainer}>
            <div className={style.orderItems}>
                <p>{t("Order Item")}</p>
                <div>
                    <div>
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2V8ZW58MHx8MHx8&w=1000&q=80" alt="img" />
                        <div className={style.rightInfo}>
                            <h5>Product Name</h5>
                            <p><span>white</span><span>128 GB</span><span>$3748</span></p>
                        </div>
                    </div>
                    <div className={style.priceQty}>
                        <h5>$1,499.00</h5>
                        <p>X1</p>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2V8ZW58MHx8MHx8&w=1000&q=80" alt="img" />
                        <div className={style.rightInfo}>
                            <h5>Product Name</h5>
                            <p><span>white</span><span>128 GB</span><span>$3748</span></p>
                        </div>
                    </div>
                    <div className={style.priceQty}>
                        <h5>$1,499.00</h5>
                        <p>X1</p>
                    </div>
                </div>
            </div>
            <div className={style.orderItems}>
                <p>{t("Payment Information")}</p>
                <div>
                    <div>
                        <img src="https://play-lh.googleusercontent.com/xOKbvDt362x1uzW-nnggP-PgO9HM4L1vwBl5HgHFHy_n1X3mqeBtOSoIyNJzTS3rrj70" alt="img" />
                        <div className={style.rightInfo}>
                            <h5>{t("Paypal")}</h5>
                            <p>jasonsimmons@gmail.com</p>
                        </div>
                    </div>
                    <div className={style.priceQty}>
                        <button><FaCheck className={style.icon}  /> {t("Paid")}</button>
                    </div>
                </div>
            </div>
            <div className={style.orderItems}>
                <p>{t("Order Summary")}</p>
                <div className={style.summaryBox}>
                    <div className={style.summaryRow}>
                        <span>{t("Subtotal")}</span>
                        <span>$5,791.39</span>
                    </div>
                    <div className={style.summaryRow}>
                        <span>{t("Tax")}</span>
                        <span>$5,791.39</span>
                    </div>
                    <div className={style.summaryRow}>
                        <span>{t("Shipping")}</span>
                        <span>$5,791.39</span>
                    </div>
                    <div className={style.summaryRow}>
                        <span>{t("Insurance")}</span>
                        <span>$5,791.39</span>
                    </div>
                    <div className={style.totalPrice}>
                        <span>{t("Total Payment")}</span>
                        <span>$5,791.39</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderOverView
