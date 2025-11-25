import { useState } from "react";
import { ChevronRight, Edit3, Eye, Filter, MoreVertical, RefreshCw, Search, Trash2, Upload } from "react-feather";
import { useTranslation } from "react-i18next";
import Arrowsvg, { SortSvg } from "../assets/icons/svg/svg";
import styles from "./styles/RecentOrdersTable.module.scss";

const RecentOrdersTable = ({setExpandDrower,setSelectedProduct,setDrawerType}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const orders = [
        {
            id: "1",
            date: "May 12, 2025, 09:00 AM",
            customerName: "Greg Lau",
            customerImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            Product: "iPhone 15 Pro Max 128GB",
            quantity: "1",
            ProductImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            status: "Shipped",
            total: "$100.00",
        },
        {
            id: "2",
            date: "May 12, 2025, 09:00 AM",
            customerName: "Greg Lau",
            customerImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            Product: "iPhone 15 Pro Max 128GB",
            quantity: "1",
            ProductImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            status: "Delivered",
            total: "$100.00",
        },
        {
            id: "3",
            date: "May 12, 2025, 09:00 AM",
            customerName: "Greg Lau",
            customerImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            Product: "iPhone 15 Pro Max 128GB",
            quantity: "10",
            ProductImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            status: "Shipped",
            total: "$100.00",
        },
        {
            id: "4",
            date: "May 12, 2025, 09:00 AM",
            customerName: "Greg Lau",
            customerImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            Product: "iPhone 15 Pro Max 128GB",
            quantity: "10",
            ProductImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            status: "Delivered",
            total: "$100.00",
        },
        {
            id: "5",
            date: "May 12, 2025, 09:00 AM",
            customerName: "Greg Lau",
            customerImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            Product: "iPhone 15 Pro Max 128GB",
            quantity: "1",
            ProductImg: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
            status: "Shipped",
            total: "$100.00",
        },
    ];
    const handelDropDown = (id) => {
        setOpenDropdownId(prev => prev === id ? null : id);
        console.log(id)
    };


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h4>{t("Recent Orders")}</h4>
                <div className={styles.actions}>
                    <div className={styles.searchBox}>
                        <Search size={16} color="#999" />
                        <input
                            type="text"
                            placeholder={t("Search...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn}>
                        <Filter size={16} /> {t("Filter")}
                    </button>
                    <button className={styles.sortBtn}>
                        <SortSvg height={20} width={20} /> {t("Sort By")}
                    </button>
                    <button className={styles.expandBtn}>
                        <Arrowsvg height={20} width={20} />
                    </button>
                </div>
            </header>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20.25 12V19.5C20.25 19.8978 20.092 20.2794 19.8107 20.5607C19.5294 20.842 19.1478 21 18.75 21H4.5C4.10218 21 3.72064 20.842 3.43934 20.5607C3.15804 20.2794 3 19.8978 3 19.5V5.25C3 4.85218 3.15804 4.47064 3.43934 4.18934C3.72064 3.90804 4.10218 3.75 4.5 3.75H12C12.1989 3.75 12.3897 3.82902 12.5303 3.96967C12.671 4.11032 12.75 4.30109 12.75 4.5C12.75 4.69891 12.671 4.88968 12.5303 5.03033C12.3897 5.17098 12.1989 5.25 12 5.25H4.5V19.5H18.75V12C18.75 11.8011 18.829 11.6103 18.9697 11.4697C19.1103 11.329 19.3011 11.25 19.5 11.25C19.6989 11.25 19.8897 11.329 20.0303 11.4697C20.171 11.6103 20.25 11.8011 20.25 12ZM21.75 5.625C21.75 6.29251 21.5521 6.94503 21.1812 7.50005C20.8104 8.05507 20.2833 8.48765 19.6666 8.74309C19.0499 8.99854 18.3713 9.06538 17.7166 8.93515C17.0619 8.80493 16.4605 8.48349 15.9885 8.01149C15.5165 7.53948 15.1951 6.93812 15.0648 6.28343C14.9346 5.62874 15.0015 4.95014 15.2569 4.33344C15.5124 3.71674 15.9449 3.18964 16.5 2.81879C17.055 2.44794 17.7075 2.25 18.375 2.25C19.2701 2.25 20.1285 2.60558 20.7615 3.23851C21.3944 3.87145 21.75 4.72989 21.75 5.625ZM20.25 5.625C20.25 5.25416 20.14 4.89165 19.934 4.58331C19.728 4.27496 19.4351 4.03464 19.0925 3.89273C18.7499 3.75081 18.3729 3.71368 18.0092 3.78603C17.6455 3.85837 17.3114 4.03695 17.0492 4.29917C16.787 4.5614 16.6084 4.89549 16.536 5.25921C16.4637 5.62292 16.5008 5.99992 16.6427 6.34253C16.7846 6.68514 17.025 6.97798 17.3333 7.18401C17.6416 7.39003 18.0042 7.5 18.375 7.5C18.8723 7.5 19.3492 7.30246 19.7008 6.95083C20.0525 6.59919 20.25 6.12228 20.25 5.625Z" fill="#141414" />
                        </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>{t("No recent order yet.")}</h3>
                    <p className={styles.emptyDescription}>
                        {t("Once customers place an order, it'll show up right here.")}
                    </p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{t("Order ID")}</th>
                            <th>{t("Order Date")}</th>
                            <th>{t("Customer")}</th>
                            <th>{t("Product")}</th>
                            <th>{t("Amount")}</th>
                            <th>{t("Status")}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.date}</td>

                                <td className={styles.cutomerInfo}>
                                    <img src={order.customerImg} alt={order.customerName} />
                                    {order.customerName}
                                </td>
                                <td className={styles.productInfo}>
                                    <div className={styles.productWrapper}>
                                        <img src={order.ProductImg} alt={order.Product} className={styles.productImg} />
                                        <div>
                                            <p>{order.Product.slice(0, 8)}</p>
                                            <span>{order.quantity} PCS</span>
                                        </div>
                                    </div>
                                </td>



                                <td>{order.total}</td>
                                <td>
                                    <span
                                        className={`${styles.status} ${order.status === "Delivered"
                                            ? styles.delivered
                                            : order.status === "Shipped"
                                                ? styles.shipment
                                                : ""
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.DropdownWrapper}>
                                        <MoreVertical
                                            onClick={() => handelDropDown(order.id)}
                                            size={20}
                                            color="#999"
                                            className={styles.MoreIcon}
                                        />
                                        {openDropdownId === order.id && (
                                            <div className={styles.Dropdown}>
                                                <div onClick={() => {
                                                    setSelectedProduct(order);
                                                    setDrawerType("view");
                                                    setExpandDrower(true);
                                                }}>
                                                    <Eye size={20} /> {t("View Details")}
                                                </div>
                                                <div><RefreshCw size={20} /> {t("Change Status")} <ChevronRight size={20} /></div>
                                                <div><Edit3 size={20} /> {t("Edit Product")}</div>
                                                <div><Upload size={20} /> {t("Export")}</div>
                                                <div><Trash2 size={20} /> {t("Delete Product")}</div>
                                            </div>
                                        )}
                                    </div>
                                </td>


                            </tr>
                        ))}
                    </tbody>

                </table >
            )}

            <div className={styles.footer}>
                <p className={styles.paginationInfo}>
                    <span>1-1</span> {t("of")} <span>0</span> {t("Entries")}
                </p>
                <div className={styles.pagination}>
                    <select className={styles.pageSelect}>
                        <option>1-4</option>
                        <option>5-8</option>
                    </select>
                    <button className={styles.pageButton}>{t("Previous")}</button>
                    <button className={styles.pageButton}>{t("Next")}</button>
                </div>
            </div>
        </div >
    );
};

export default RecentOrdersTable;

