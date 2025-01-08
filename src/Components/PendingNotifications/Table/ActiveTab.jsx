import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Nav, NavItem, NavLink } from "reactstrap";

const ActiveTab = ({ callbackActive, setAllData, pendings }) => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('1');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    const shouldHideNavLink = (index) => {
        return windowWidth < 965 && index !== parseInt(activeTab) - 1;
    }

    const handleClickFilter = (type) => {
        if (type === "All") {
            setAllData(pendings)
        } else {
            const filtered = pendings.filter(item => item.type === type)
            setAllData(filtered)
        }
    }

    return (
        <Nav tabs className="search-list" id="top-tab" role="tablist" style={{
            justifyContent: "flex-start",
            marginRight: 0,
            marginLeft: 0
        }}>
            <NavItem>
                <NavLink style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: ".5rem"
                }} className={activeTab === '1' ? 'active' : ''} onClick={() => {
                    handleClickFilter("All")
                    setActiveTab('1');
                    callbackActive('1');
                }}>
                    <span>{t("All")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <NavItem>
                <NavLink style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: ".5rem"
                }} className={activeTab === '2' ? 'active' : ''} onClick={() => {
                    handleClickFilter("Request")
                    setActiveTab('2');
                    callbackActive('2');
                }}>
                    <span>{t("Requests")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <NavItem>
                <NavLink style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    cursor: "pointer"
                }} className={activeTab === '3' ? 'active' : ''} onClick={() => {
                    handleClickFilter("Quotation")
                    setActiveTab('3');
                    callbackActive('3');
                }}>
                    <span>{t("Quotations")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
        </Nav>
    )
}

export default ActiveTab;