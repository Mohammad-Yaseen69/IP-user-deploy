import React from 'react'
import styles from "./styles/TopCard.module.scss"
import { MoreVertical } from 'react-feather'

const TopCard = () => {
    const data = [
        {
            heading: "Total Products",
            amount: "284",
            percent: "+5.3%",
            changeValue: "+31",
            changeText: "Increased by",
            isPositive: true,
            para: "Increased by +31 this week"
        },
        {
            heading: "Active Products",
            amount: "198",
            percent: "+8.7%",
            changeValue: "+17",
            changeText: "Increased by",
            isPositive: true,
            para: "Increased by +17 this week"
        },
        {
            heading: "Low Stock Alerts",
            amount: "24",
            percent: "-0.1%",
            changeValue: "-1",
            changeText: "Decreased by",
            isPositive: false,
            para: "Decreased by -1 this week"
        }
    ]

    return (
        <div className={styles.container}>
            {data.map((item, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h5 className={styles.cardTitle}>{item.heading}</h5>
                        <MoreVertical size={16} className={styles.moreIcon} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.amountRow}>
                            <span className={styles.amount}>{item.amount}</span>
                            <span className={`${styles.percent} ${item.isPositive ? styles.positive : styles.negative}`}>
                                {item.percent}
                            </span>
                        </div>
                        <p className={styles.description}>
                            {item.changeText}{' '}
                            <span className={`${styles.changeValue} ${item.isPositive ? styles.positive : styles.negative}`}>
                                {item.changeValue}
                            </span>
                            {' '}this week
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TopCard
