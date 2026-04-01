import { useTranslation } from "react-i18next"
import styles from "./styles/index.module.css"
import TopRight from "../topRight"
import plus from "./files/plus.svg"
import PortfolioCard from "./PortfolioCard"
import { useContext, useEffect, useRef, useState } from "react"
import AddPortfolioItem from "./AddPortfolioItem"
import { UserContext } from "../../Context/UserContext"
import InstructionsModal from "./InstructionModal"
import { Info } from "react-feather"


const Portfolio = () => {
    const { t } = useTranslation();
    const [showAddModal, setShowAddModal] = useState(false);
    const { userPortfolio, setUserPortfolio, getUserDocuments, userDetails } = useContext(UserContext);
    const dragRef = useRef(null)
    const dragOverRef = useRef(null)

    useEffect(() => {
        if (userDetails) {
            getUserDocuments()
        }
    }, [userDetails])
    useEffect(() => {
        if (userDetails && userPortfolio?.length > 0) {
            const savedOrder = localStorage.getItem('portfolioOrder');
            if (savedOrder) {
                const orderMap = JSON.parse(savedOrder);
                const orderedPortfolio = [...userPortfolio].sort((a, b) => {
                    return orderMap[a._id] - orderMap[b._id];
                });
                setUserPortfolio(orderedPortfolio);
            }
        }
    }, [userDetails, userPortfolio?.length]);

    const handleSort = () => {
        let _userPortfolio = [...userPortfolio];
        const draggedContent = _userPortfolio.splice(dragRef?.current, 1)[0];
        _userPortfolio.splice(dragOverRef?.current, 0, draggedContent);

        // Create order map and save to localStorage
        const orderMap = {};
        _userPortfolio.forEach((item, index) => {
            orderMap[item._id] = index;
        });
        localStorage.setItem('portfolioOrder', JSON.stringify(orderMap));

        // Update state
        setUserPortfolio(_userPortfolio);
        dragRef.current = null;
        dragOverRef.current = null;
    }

    const [isOpen, setIsOpen] = useState(!sessionStorage.getItem("show_port_modal"));

    useEffect(() => {
        sessionStorage.setItem("show_port_modal", true)
    }, [])

    return (
        <>
            <div className={styles.container}>
                <InstructionsModal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)} />
                {
                    showAddModal
                    &&
                    <AddPortfolioItem isOpen={showAddModal} toggle={() => setShowAddModal(!showAddModal)} />
                }
                <div className={styles.top}>
                    <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>{t("My Portfolio")} <Info color='#5926f0' style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)} size={16} /></h4>
                    <TopRight />
                </div>
                <p className={styles.desc}>{t("Showcase Your Work, Amplify Your Reach. 'My Portfolio' is your digital canvas on \nInstaPay. Upload and display a diverse range of content – from captivating images \nand videos to informative PDFs. Whether you're an artist, freelancer, or \nentrepreneur, this feature lets you present your work or projects in a visually \nengaging way.")}</p>
                <div className={styles.card} >
                    <div className={styles.card_header}>
                        <h4>{t("Add/Manage Portfolio")}</h4>
                        <div className={styles.ch_right}>
                            <button className={`${styles.chr_btn} ${styles.chr_btn_grad}`} onClick={() => setShowAddModal(!showAddModal)} style={{
                                minWidth: "112px",
                                maxHeight: "40px"
                            }}>
                                <img src={plus} alt="add" loading="lazy" />
                                <span>{t("Add New")}</span>
                            </button>
                        </div>
                    </div>
                    <div className={styles.card_body}>
                        {userPortfolio && userPortfolio.length > 0 ? (
                            userPortfolio.map((item, index) => (
                                <PortfolioCard
                                    item={item}
                                    key={item?._id}
                                    dragRef={dragRef}
                                    dragOverRef={dragOverRef}
                                    index={index}
                                    handleSort={handleSort}
                                />
                            ))
                        ) : (
                            <div className="text-center my-4">{t("No Portfolio Items")}</div>
                        )}
                    </div>
                </div>
            </div >

            <div className={styles.mobile}>
                <div className={styles.top}>
                    <h4 style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {t("My Portfolio")}
                        <Info color='#5926f0' style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)} size={12} />
                    </h4>
                    <p>
                        {t("Add/Manage Portfolio")}
                    </p>
                </div>
                <div className={styles.bottom}>
                    <div className={styles.card_body}>
                        {userPortfolio && userPortfolio.length > 0 ? (
                            userPortfolio.map((item, index) => (
                                <PortfolioCard
                                    item={item}
                                    key={item?._id}
                                    dragRef={dragRef}
                                    dragOverRef={dragOverRef}
                                    index={index}
                                    handleSort={handleSort}
                                />
                            ))
                        ) : (
                            <div className="text-center my-4">{t("No Portfolio Items")}</div>
                        )}
                    </div>
                    <button className={`${styles.chr_btn} ${styles.chr_btn_grad}`} onClick={() => setShowAddModal(!showAddModal)} style={{
                        minWidth: "112px",
                        maxHeight: "40px"
                    }}>
                        <img src={plus} alt="add" loading="lazy" />
                        <span>{t("Add New")}</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Portfolio