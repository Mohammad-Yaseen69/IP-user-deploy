import { useTranslation } from "react-i18next"
import styles from "./styles/index.module.scss"
import TopRight from "../topRight"
import LeftContainer from "./LeftContainer"
import CenterContainer from "./CenterContainer"
import RightContainer from "./RightContainer"
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from "../../Context/UserContext"
import { DateRangePicker } from 'react-date-range';
import { PlusCircle, X } from "react-feather"
import AddCurrencyModal from "./AddCurrencyModal"
import { Button } from "reactstrap"


const Wallets = () => {
    const { t } = useTranslation()
    const { userWallets, authHeader, userDetails, verifyToken, getUserWallets, getUserBeneficiaries } = useContext(UserContext)


    useEffect(() => {
        getUserBeneficiaries()
    }, [])


    const [currentType, setCurrentType] = useState("credit")
    const [currentWallet, setCurrentWallet] = useState(null)
    const [current, setCurrent] = useState(0)
    const rightContainerRef = useRef(null)
    const [datePickerLeft, setDatePickerLeft] = useState(0)
    const [filtered, setFiltered] = useState([])
    const [categories, setCategories] = useState([
        {
            _id: "uncategorized",
            name: "Uncategorized",
            value: 0,
            color: "#5926f0"
        }
    ])


    // useEffect(() => {
    //     if (userDetails) {
    //         setFiltered([])
    //         getUserWallets()
    //     }
    // }, [userDetails])

    useEffect(() => {
        if (filtered.length > 0 && categories.length > 0) {
            const updatedCategories = categories.map(category => {
                const filteredTransactions = filtered.filter(trx => {
                    return trx?.categories?.some(trxCat => trxCat === category._id) && trx?.transaction_type === currentType;
                });

                const totalAmount = filteredTransactions.reduce((acc, trx) => acc + trx.amount, 0);

                return {
                    ...category,
                    value: totalAmount
                };
            });

            // Check for uncategorized transactions
            const uncategorizedTransactions = filtered.filter(trx => (!trx.categories || trx.categories.length === 0) && trx?.transaction_type === currentType);
            const totalUncategorizedAmount = uncategorizedTransactions.reduce((acc, trx) => acc + trx.amount, 0);

            // Check if the "uncategorized" category already exists
            const uncategorizedIndex = updatedCategories.findIndex(category => category._id === "uncategorized");

            if (uncategorizedIndex !== -1) {
                // Update the existing "uncategorized" category
                updatedCategories[uncategorizedIndex].value = totalUncategorizedAmount;
            } else {
                // Create a new category for uncategorized transactions
                const uncategorizedCategory = {
                    _id: "uncategorized",
                    name: "Uncategorized",
                    value: totalUncategorizedAmount,
                    color: "#5926f0"
                };

                // Add the uncategorized category to the updatedCategories array
                updatedCategories.push(uncategorizedCategory);
            }

            setCategories(updatedCategories);
        }
    }, [filtered, currentType, currentWallet]);


    useEffect(() => {
        if (userWallets) {
            const filtered = userWallets[current]
            setCurrentWallet(filtered)
        }
    }, [userWallets, current])


    // 
    useEffect(() => {
        // Function to update the datePickerLeft based on the rightContainer's width
        const updateDatePickerLeft = () => {
            if (rightContainerRef.current) {
                setDatePickerLeft(rightContainerRef.current.offsetWidth);
            }
        };

        // Call the function once initially
        updateDatePickerLeft();

        // Add a resize event listener to update the width when it changes
        window.addEventListener('resize', updateDatePickerLeft);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', updateDatePickerLeft);
        };
    }, []);

    // date picker
    const [dateRange, setDateRange] = useState([]);
    const handleChange = (ranges) => {
        if (ranges.selection) {
            setDateRange(ranges.selection);
        }
        verifyToken()
    };
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const handleClickOutside = useCallback((event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    }, []);

    const handleDatePickerClick = useCallback(() => {
        setShowDatePicker(true);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    const [currencyAddModal, setCurrencyAddModal] = useState(false)
    const toggleCurrencyModal = () => setCurrencyAddModal(!currencyAddModal)

    return (
        <>
            {
                window.innerWidth > 1000
                    ?
                    <div className={styles.container}>
                        <div className={styles.top}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "1rem"
                            }}>
                                <h4 style={{ marginBottom: 0 }}>{t("My Wallets")}</h4>
                                <Button
                                    color="primary"
                                    style={{
                                        background: "#5926f0",
                                        backgroundColor: "#5926f0",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "10px",
                                        padding: "6px 12px",
                                        fontSize: ".7rem"
                                    }}
                                    onClick={toggleCurrencyModal}
                                >
                                    {t("Add Currency")}
                                </Button>
                                {/* <div style={{ cursor: "pointer" }} ><PlusCircle color="#5926f0" /></div> */}
                                <AddCurrencyModal isOpen={currencyAddModal} toggle={toggleCurrencyModal} />
                            </div>
                            <TopRight />
                        </div>
                        <div className={styles.bottom} style={{ position: "relative" }}>
                            {showDatePicker && (
                                <div ref={datePickerRef} style={{ position: "absolute", top: "80px", right: `${datePickerLeft + 40}px`, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10px", zIndex: 10000000 }}>
                                    <DateRangePicker maxDate={new Date()}
                                        ranges={[dateRange]}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                            <LeftContainer wallet={currentWallet} setCurrent={setCurrent} authHeader={authHeader} userWallets={userWallets} userDetails={userDetails} verifyToken={verifyToken} current={current} />
                            <CenterContainer handleDatePickerClick={handleDatePickerClick} verifyToken={verifyToken} categories={categories} setCategories={setCategories} currentType={currentType} setCurrentType={setCurrentType} currentWallet={currentWallet} />
                            {
                                currentWallet
                                &&
                                <RightContainer rightContainerRef={rightContainerRef} verifyToken={verifyToken} currentWallet={currentWallet} filtered={filtered} setFiltered={setFiltered} />
                            }
                        </div>
                    </div>
                    :

                    // {/* mobile */}
                    <div className={styles.mobile}>
                        <div className={styles.top}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h4 style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: 0 }}>
                                    {t("My Wallets")}
                                </h4>
                                <Button
                                    color="primary"
                                    style={{
                                        background: "#5926f0",
                                        backgroundColor: "#5926f0",
                                        border: "none",
                                        outline: "none",
                                        borderRadius: "10px"
                                    }}
                                    onClick={toggleCurrencyModal}
                                >
                                    {t("Add Currency")}
                                </Button>
                            </div>
                            {/* <div style={{ cursor: "pointer" }} onClick={toggleCurrencyModal}><PlusCircle color="#5926f0" size={12} /></div> */}
                            <AddCurrencyModal isOpen={currencyAddModal} toggle={toggleCurrencyModal} />
                            <p>{t("Manage Wallets and See transaction breakdowns.")}</p>
                        </div>
                        <div className={styles.bottom}>
                            {showDatePicker && (
                                <div ref={datePickerRef} style={{ position: "absolute", top: "80px", right: `${datePickerLeft + 40}px`, boxShadow: "0px 0px 3px rgba(0,0,0,0.1)", borderRadius: "10px", zIndex: 10000000 }}>
                                    <DateRangePicker maxDate={new Date()}
                                        ranges={[dateRange]}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                            <LeftContainer wallet={currentWallet} setCurrent={setCurrent} authHeader={authHeader} userWallets={userWallets} userDetails={userDetails} verifyToken={verifyToken} current={current} />
                            <CenterContainer handleDatePickerClick={handleDatePickerClick} verifyToken={verifyToken} categories={categories} setCategories={setCategories} currentType={currentType} setCurrentType={setCurrentType} currentWallet={currentWallet} />
                            {
                                currentWallet
                                &&
                                <RightContainer rightContainerRef={rightContainerRef} verifyToken={verifyToken} currentWallet={currentWallet} filtered={filtered} setFiltered={setFiltered} />
                            }
                        </div>
                    </div>
            }
        </>
    )
}

export default Wallets