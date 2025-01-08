import Chart from 'react-apexcharts';
import { statsChartData } from "./StatsChartData"
import styles from "./styles/MoneyStatistics.module.scss"
import { useState } from 'react';
import { Input } from 'reactstrap';

const MoneyStatistics = () => {
    const [showMoneyIn, setShowMoneyIn] = useState(true);
    const [showMoneyOut, setShowMoneyOut] = useState(true);

    const filteredMoneyInSeries = showMoneyIn ? statsChartData.series.filter(s => s.name === 'Incoming') : [];
    const filteredMoneyOutSeries = showMoneyOut ? statsChartData.series.filter(s => s.name === 'Outgoing') : [];
    const filteredRefuncSeries = showMoneyOut ? statsChartData.series.filter(s => s.name === 'Refund') : [];
    const filteredSeries = [...filteredMoneyInSeries, ...filteredMoneyOutSeries, ...filteredRefuncSeries];

    return (
        <div className={`${styles.container} card`} style={{
            marginBottom: 0
        }}>
            <div className={styles.top}>
                <h2>Payment Insights</h2>
                <div className={styles.options}>
                    <div onClick={() => setShowMoneyIn(!showMoneyIn)} style={{ cursor: "pointer" }}>
                        <span style={{
                            height: "15px",
                            width: "15px",
                            // background: "#EE4B2B",
                            background: "#61ae41",
                            borderRadius: "8px"
                        }}></span>
                        <label htmlFor="money-in">Refund</label>
                    </div>
                    <div onClick={() => setShowMoneyIn(!showMoneyIn)} style={{ cursor: "pointer" }}>
                        <span style={{
                            height: "15px",
                            width: "7px",
                            background: "#5926f0",
                            borderRadius: "4px"
                        }}></span>
                        <label htmlFor="money-in">Incoming</label>
                    </div>
                    <div onClick={() => setShowMoneyOut(!showMoneyOut)} style={{ cursor: "pointer" }}>
                        <span style={{
                            height: "15px",
                            width: "15px",
                            // background: "#e64067",
                            background: "#EE4B2B",
                            borderRadius: "8px"
                        }}></span>
                        <label htmlFor="money-out">Outgoing</label>
                    </div>
                    <Input type='select' name="status" placeholder="Select Status" className="form-control form-select" style={{
                        width: "fit-content",
                        padding: ".5rem 2rem .5rem .5rem"
                    }} >
                        <option>Last 07 Days</option>
                        <option>This Month</option>
                        <option>This Year</option>
                        <option>Life Time</option>
                    </Input>
                </div>
            </div>
            <div id='mixedchart'>
                <Chart options={statsChartData.options} series={filteredSeries} type="line" height={250} />
            </div>
        </div>
    )
}

export default MoneyStatistics;