import { useState } from 'react';
import { CheckSquare, MoreVertical } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { FaBoxArchive, FaBoxOpen } from 'react-icons/fa6';
import styles from "./styles/OrderHistory.module.scss";
function OrderHistory() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const products = [
        {
            id: 1,
            date: "May 12, 2025, 09:00 AM",
            name: "Greg Lau",
            amount: "$150.00",

            status: "Shipped",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 2,
            date: "May 12, 2025, 09:00 AM",
            name: "Greg Lau",
            amount: "$150.00",

            status: "Shipped",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 3,
            date: "May 12, 2025, 09:00 AM",
            name: "Greg Lau",
            amount: "$150.00",

            status: "Delivered",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 4,
            date: "May 12, 2025, 09:00 AM",
            name: "Greg Lau",
            amount: "$150.00",

            status: "Shipped",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 5,
            date: "May 12, 2025, 09:00 AM",
            name: "Greg Lau",
            amount: "$150.00",
            status: "Delivered",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
    ];
    const getStatusClass = (status) => {
        switch (status) {
            case "Shipped":
                return styles.Shipped;
            case "Delivered":
                return styles.Delivered;
          
            default:
                return "";
        }
    };
    const { t } = useTranslation();
    return (
        <div className={styles.OrderContainer} >
            <table className={styles.Table}>
                <thead>
                    <tr>
                        <th>{t("Order Date")}</th>
                        <th>{t("Customer Name")}</th>
                        <th>{t("Amount")}</th>
                        <th>{t("Status")}</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((item) => (
                        <tr key={item.id} className={styles.TableRow}>
                            <td>{item.date?.slice(0, 10)}..</td>

                            <td>
                                <div className={styles.ProductInfo}>
                                    <img src={item.img} alt={item.name} />
                                        <h6>{item.name}</h6>
                                </div>
                            </td>



                            <td>{item.amount}</td>

                            <td>
                                <span className={`${styles.StatusBadge} ${getStatusClass(item.status)}`}>
                              {item.status === "Shipped" ? <FaBoxOpen size={15} /> : <CheckSquare size={15} /> }      {item.status}
                                </span>
                            </td>

                            <td className={styles.ActionCell}>
                                <div className={styles.DropdownWrapper}>
                                    <MoreVertical
                                        // onClick={() => handelDropDown(item.id)}
                                        size={16}
                                        color="#999"
                                        className={styles.MoreIcon}
                                    />

                                    {/* {openDropdownId === item.id && (
                                        <div className={styles.Dropdown}>
                                            <div ><Eye size={20} />  {t("View Details")}</div>
                                            <div><RefreshCw size={20} /> {t("Change Status")} <ChevronRight size={20} /></div>
                                            <div><Edit3 size={20} /> {t("Edit Product")}</div>
                                            <div><Upload size={20} /> {t("Export")}</div>
                                            <div><Trash2 size={20} /> {t("Delete Product")}</div>
                                        </div>
                                    )} */}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default OrderHistory
