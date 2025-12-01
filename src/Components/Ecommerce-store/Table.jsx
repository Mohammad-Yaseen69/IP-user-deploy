import { SwipeableDrawer } from "@mui/material";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Edit3, Eye, Filter, MoreVertical, Plus, RefreshCw, Trash2, Upload } from "react-feather";
import { useTranslation } from "react-i18next";
import ProductDetails from "./Products";
import AddProducts from "./Products/AddProducts";
import ModalComponent from "./Products/Modal";
import Arrowsvg, { SortSvg, TickSvg } from "./assets/icons/svg/svg";
import styles from "./styles/Table.module.scss";
const Table = () => {
    const { t } = useTranslation()
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [ExpandDrower, setExpandDrower] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [Addproducts, setAddProducts] = useState([]);
    const [drawerType, setDrawerType] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const products = [
        {
            id: 1,
            name: "iPhone 13 Pro Max 128GB",
            category: "Electronics",
            sku: "IPH13PM-128",
            price: "$2,450",
            stock: 45,
            sold: 128,
            status: "Active",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 2,
            name: "Samsung Galaxy S24 Ultra",
            category: "Electronics",
            sku: "SGS24U-256",
            price: "$3,456",
            stock: 32,
            sold: 89,
            status: "Active",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 3,
            name: "MacBook Air M2 13-inch",
            category: "Electronics",
            sku: "MBA-M2-13",
            price: "$4,567",
            stock: 18,
            sold: 67,
            status: "Low Stock",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 4,
            name: "AirPods  Pro 2nd Gen",
            category: "Electronics",
            sku: "APP-2GEN",
            price: "$5,678",
            stock: 85,
            sold: 245,
            status: "Inactive",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
        {
            id: 5,
            name: "Nike Air Max 270",
            category: "Fashion",
            sku: "NAM-270-42",
            price: "$6,789",
            stock: 0,
            sold: 156,
            status: "Out of Stock",
            img: "https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
        },
    ];
    const getStatusClass = (status) => {
        switch (status) {
            case "Active":
                return styles.Active;
            case "Low Stock":
                return styles.LowStock;
            case "Inactive":
                return styles.Inactive;
            case "Out of Stock":
                return styles.OutOfStock;
            default:
                return "";
        }
    };

    const handelDropDown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };
    return (
        <div className={styles.TableContainer}>
            <header className={styles.TableHeader}>
                <h4>{t("Product Inventory")}</h4>
                <div className={styles.HeaderActions}>
                    <div className={styles.SearchBox}>
                        <input type="text" placeholder="Search..." />
                    </div>
                    <button className={styles.FilterBtn}>
                        <Filter size={16} /> {t("Filter")}
                    </button>
                    <button className={styles.SortBtn}>
                        <SortSvg height={20} width={20} /> {t("Sort By")}
                    </button>
                    <button
                        className={styles.AddBtn}
                        onClick={() => {
                            setSelectedProduct(null);
                            setDrawerType("add");
                            setExpandDrower(true);
                        }}
                    >      <Plus size={16} /> {t("Add New Product")}
                    </button>
                    <button className={styles.ExpandBtn}>
                        <Arrowsvg height={20} width={20} />
                    </button>
                </div>
            </header>

            <table className={styles.Table}>
                <thead>
                    <tr>
                        <th>{t("Product")}</th>
                        <th>{t("SKU")}</th>
                        <th>{t("Price")}</th>
                        <th>{t("Stock")}</th>
                        <th>{t("Sold")}</th>
                        <th>{t("Status")}</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((item) => (
                        <tr key={item.id} className={styles.TableRow}>
                            <td>
                                <div className={styles.ProductInfo}>
                                    <img src={item.img} alt={item.name} />
                                    <div>
                                        <h6>{item.name}</h6>
                                        <span>{item.category}</span>
                                    </div>
                                </div>
                            </td>

                            <td>{item.sku}</td>
                            <td>{item.price}</td>

                            <td className={item.stock === 0 || item.stock < 20 ? styles.Red : ""}>
                                {item.stock}
                            </td>

                            <td>{item.sold}</td>

                            <td>
                                <span className={`${styles.StatusBadge} ${getStatusClass(item.status)}`}>
                                    {item.status}
                                </span>
                            </td>

                            <td className={styles.ActionCell}>
                                <div className={styles.DropdownWrapper}>
                                    <MoreVertical
                                        onClick={() => handelDropDown(item.id)}
                                        size={16}
                                        color="#999"
                                        className={styles.MoreIcon}
                                    />

                                    {openDropdownId === item.id && (
                                        <div className={styles.Dropdown}>
                                            <div onClick={() => {
                                                setSelectedProduct(item);
                                                setDrawerType("view");
                                                setExpandDrower(true);
                                            }}><Eye size={20} />  {t("View Details")}</div>
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
            </table>

            <div className={styles.TableFooter}>
                <p>
                    <span>1-10</span> {t("of")}   <span>1,676</span> {t("Entries")}
                </p>
                <div className={styles.Pagination}>
                    <select>
                        <option style={{
                            color: "#000",
                            fontWeight: 700
                        }} >1-4</option>
                        <option>5-8</option>
                    </select>
                    <button><ArrowLeft size={18} /> {t("Previous")}</button>
                    <button>{t("Next")} <ArrowRight size={18} /></button>
                </div>
            </div>
            {ExpandDrower && (
                <SwipeableDrawer
                    anchor="right"
                    open={ExpandDrower}
                    onClose={() => setExpandDrower(false)}
                    onOpen={() => setExpandDrower(true)}
                    PaperProps={{
                        sx: {
                            backdropFilter: "blur(5px)",
                            width: { xs: "100%", sm: "35%" },
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
                    {drawerType === "add" ? (
                        <AddProducts
                            setExpandDrower={setExpandDrower}
                            onCreate={() => setShowCreateModal(true)}
                        />
                    ) : (
                        <ProductDetails ExpandDrower={ExpandDrower} setExpandDrower={setExpandDrower} product={selectedProduct} />
                    )}
                </SwipeableDrawer>
            )}

            <ModalComponent
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                icon={<TickSvg />}
                title={t("Product has successfully added to your product list!")}
                description={t("Your product is ready. Head to the product list to make changes or view details.")}
                secondaryLabel={t("Done")}
                primaryLabel={t("View Product")}
            />

        </div >
    );
};

export default Table;
