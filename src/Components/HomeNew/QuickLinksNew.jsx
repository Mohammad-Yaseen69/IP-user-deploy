import React from 'react';
import { CardBody, Card } from 'reactstrap';
import funds from "./files/af.png"
import rm from "./files/rm.png"
import rq from "./files/rq.png"
import sm from "./files/sm.png"
import sq from "./files/sq.png"
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "./styles/responsiveness.css"

const QuickLinksNew = () => {
    const { t } = useTranslation()
    const items = [
        { icon: funds, text: t('Add Funds'), width: "26px", link: "/add-funds" },
        { icon: sm, text: t('Send Money'), width: "27px", link: "/payments" },
        { icon: rm, text: t('Request Money'), width: "26px", link: "/payments" },
        { icon: sq, text: t('Send A Quote'), width: "20px", link: "/payments" },
        { icon: rq, text: t('Request A Quote'), width: "23px", link: "/payments" },
    ];

    return (
        <Card style={{ marginBottom: 0 }}>
            <CardBody style={{ overflowX: "auto", display: "flex", scrollbarWidth: "none" }} className="p_g_link">
                {items.map((item, index) => (
                    <Link to={item.link} key={index} style={{
                        background: "linear-gradient(275.09deg, #5926F0, #4828A0), #FFFFFF",
                        padding: '7px',
                        margin: '10px 0',
                        minWidth: "fit-content",
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        gap: ".5rem",
                        borderRadius: "10px",
                        color: "white",
                        flex: 1,
                        cursor: "pointer",
                        fontSize: ".8rem"
                    }}>
                        <img src={item.icon} style={{ objectFit: "contain", width: item.width }} />
                        <p style={{ color: "white", padding: "0", margin: "0", fontSize: ".7rem", whiteSpace: "nowrap" }}>{item.text}</p>
                    </Link>
                ))}
            </CardBody>
        </Card>
    );
};

export default QuickLinksNew;