import Header from '../Header';
import Table from '../Table';
import TopCard from '../TopCard';
import BarChart from './CategoryPerformance';
import SalesAndRevenueChart from './SalesAndRevenueChart';
import styles from './style/index.module.scss';
const Index = () => {
  return (
    <div className={styles.container}>
      <Header heading={"Store Dashboard"} paragraph={"Get an at-a-glance view of your sales performance, key metrics, and business insights all in one place"} />
      <TopCard />
      <div className={styles.chartContainer}>
        <div className={styles.sales_chart}>
          <SalesAndRevenueChart />
        </div>
        <div className={styles.bar_chart}>
          <BarChart />
        </div>
      </div>
      <Table />
    </div>
  )
}

export default Index
