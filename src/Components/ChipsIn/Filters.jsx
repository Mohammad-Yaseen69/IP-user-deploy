import React, { useState, useEffect } from 'react'
import { Nav, NavLink, NavItem } from 'reactstrap';
import Deposit from "./svgs/wallet.svg"
import Deposit_B from "./svgs/wallet-b.svg"
import { Btn } from '../../AbstractElements';


const Filters = ({ callbackActive, stb }) => {
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
                    setActiveTab('1'); callbackActive('1');
                }}>
                    {/* <i className="fa fa-support"></i> */}
                    <img src={activeTab === "1" ? Deposit : Deposit_B} alt="" />
                    <span style={{
                        display: shouldHideNavLink(0) ? "none" : "block"
                    }}>My Requests</span>
                </NavLink>
                <div className="material-border"></div>
            </NavItem>
            <Btn
                attrBtn={{
                    outline: activeTab === "1" && true,
                    className: `${activeTab === "1" ? "btn-outline-primary" : ""}`,
                    color: "primary",
                    type: "button",
                    style: {
                        borderRadius: "10px",
                        marginLeft: "10px",
                        background: activeTab === "1" ? "transparent" : "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        outline: activeTab !== "1" && "none",
                        border: activeTab !== "1" && "none",
                    },
                    onClick: () => {
                        setActiveTab('2');
                        callbackActive('2');
                        stb()
                    },
                }}
            >
                Create Request
            </Btn>
        </Nav>
    )
}

export default Filters