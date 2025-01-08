import React, { useState, useEffect } from 'react';
import { Nav, NavLink, NavItem } from 'reactstrap';
import Deposit from "./svgs/wallet.svg";
import Send from "./svgs/card-send.svg";
import Receive from "./svgs/card-receive.svg";
import Request from "./svgs/shop-add.svg";
import Quote from "./svgs/receipt.svg";
import Deposit_B from "./svgs/wallet-b.svg";
import Send_B from "./svgs/card-send-b.svg";
import Receive_B from "./svgs/card-receive-b.svg";
import Request_B from "./svgs/shop-add-b.svg";
import Quote_B from "./svgs/receipt-b.svg";
import { useTranslation } from 'react-i18next';

const Filters = ({ callbackActive, setTransactions, allTransactions }) => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('1');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const shouldHideNavLink = (index) => {
        return windowWidth < 965 && index !== parseInt(activeTab) - 1;
    };

    const handleTabClick = (tabIndex, transactionType) => {
        setActiveTab(tabIndex);
        callbackActive(tabIndex);

        if (transactionType === 'all') {
            setTransactions(allTransactions);
        } else {
            const filteredTransactions = allTransactions.filter(
                (transaction) => transaction.type === transactionType
            );
            setTransactions(filteredTransactions);
        }
    };

    return (
        <Nav tabs className="search-list" id="top-tab" role="tablist" style={{ justifyContent: "flex-start", marginRight: 0, marginLeft: 0 }}>
            <NavItem>
                <NavLink
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: ".5rem" }}
                    className={activeTab === '1' ? 'active' : ''}
                    onClick={() => handleTabClick('1', 'all')}
                >
                    <img src={activeTab === "1" ? Deposit : Deposit_B} alt="" />
                    <span style={{ display: shouldHideNavLink(0) ? "none" : "block" }}>{t("All")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <NavItem>
                <NavLink
                    style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}
                    className={activeTab === '2' ? 'active' : ''}
                    onClick={() => handleTabClick('2', 'Send')}
                >
                    <img src={activeTab === "2" ? Send : Send_B} alt="" />
                    <span style={{ display: shouldHideNavLink(1) ? "none" : "block" }}>{t("Sent")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <NavItem>
                <NavLink
                    style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}
                    className={activeTab === '3' ? 'active' : ''}
                    onClick={() => handleTabClick('3', 'Receive')}
                >
                    <img src={activeTab === "3" ? Receive : Receive_B} alt="" />
                    <span style={{ display: shouldHideNavLink(2) ? "none" : "block" }}>{t("Received")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <NavItem>
                <NavLink
                    style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}
                    className={activeTab === '4' ? 'active' : ''}
                    onClick={() => handleTabClick('4', 'Request')}
                >
                    <img src={activeTab === "4" ? Request : Request_B} alt="" />
                    <span style={{ display: shouldHideNavLink(3) ? "none" : "block" }}>{t("Requested")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <NavItem>
                <NavLink
                    style={{ display: "flex", alignItems: "center", gap: ".5rem", cursor: "pointer" }}
                    className={activeTab === '5' ? 'active' : ''}
                    onClick={() => handleTabClick('5', 'Quote')}
                >
                    <img src={activeTab === "5" ? Quote : Quote_B} alt="" />
                    <span style={{ display: shouldHideNavLink(4) ? "none" : "block" }}>{t("Quoted")}</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
        </Nav>
    );
};

export default Filters;