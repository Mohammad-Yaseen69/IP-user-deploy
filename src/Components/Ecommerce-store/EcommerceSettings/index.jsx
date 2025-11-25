import Header from '../Header';
import Styles from './Styles/index.module.scss';
const EcommerceSettings = () => {
    const btn = [
        { name: "General" },
        { name: "Store front" },
        { name: "Products" },
        { name: "Checkout" },
        { name: "Shipping" },
        { name: "Notifications" },
    ]
    return (
        <div className={Styles.containermain}>
            <Header heading={"Store settings"} paragraph={"Get an at-a-glance view of your sales performance, key metrics, and business insights all in one place"} />
            <div className={Styles.container}>
                <div className={Styles.containerHeader}>
                    {
                        btn.map((item, index) => (
                            <button key={index} className={Styles.btnhead}>{item.name}</button>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default EcommerceSettings
