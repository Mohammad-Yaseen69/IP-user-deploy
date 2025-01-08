import React from 'react';
import { Card } from 'reactstrap';
import styles from "./styles/EMB.module.css"
import emb from "./files/emb.png"

const EarnMoneyBanner = () => {
    return (
        <Card className={`${styles.container} card`} style={{ marginBottom: 0 }}>
            <img src={emb} style={{ width: "100%" }} />
        </Card>
    );
};

export default EarnMoneyBanner;