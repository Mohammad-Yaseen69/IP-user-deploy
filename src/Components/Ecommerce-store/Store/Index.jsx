import Header from '../Header';
import Table from '../Table';
import TopCard from '../TopCard';
import BarChart from './CategoryPerformance';
import SalesAndRevenueChart from './SalesAndRevenueChart';
import styles from './style/index.module.scss';
const Index = () => {
  return (
    <div className={styles.container}>
      <Header />
      <TopCard />
      <div className={styles.chartContainer}>
        <div className={styles.sales_chart}>
          <SalesAndRevenueChart />
        </div>
        <BarChart />
      </div>
      <Table />
    </div>
  )
}

export default Index
