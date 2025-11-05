import React from 'react'
import syles from "./styles/TopCard.module.scss"
import { MoreVertical } from 'react-feather'
const TopCard = () => {
    const data = [
        {
            heading: "Total Products",
            amount: "2500",
            percent: "+2.65%",
            color: "#0FB86A",
            para: "Increased by +2.65%  last week"
        },
        {
            heading: "Total Products",
            amount: "2500",
            percent: "+2.65%",
            color: "#0FB86A",
            para: "Increased by +2.65%  last week"
        },
        {
            heading: "Total Products",
            amount: "2500",
            percent: "+2.65%",
            color: "#0FB86A",
            para: "Increased by +2.65%  last week"
        }
    ]
    return (
        <div className={syles.container}>
            {
                data.map((item, index) => (
                    <div key={index} className={syles.card}>
                        <div className={syles.cardHeader}>
                            <h5 style={{ fontWeight: "600" }}>{item.heading}</h5>
                            <MoreVertical size={15} />
                        </div>
                        <h4>{item.amount} <span style={{ color: item.color, fontSize: "14px", }}>{item.percent}</span></h4>
                        <p>
                            {item.para.slice(0, 12)}
                            <span style={{ color: item.color, fontSize: "14px" }}>
                                {item.para.slice(12, 20)}
                            </span>
                            {item.para.slice(20)}
                        </p>
                    </div>
                ))
            }
        </div>
    )
}

export default TopCard
