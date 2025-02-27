import { useState } from 'react';
import TopRight from '../topRight'
import OnBoarding from './OnBoarding';
import CardPurchased from './CardPurchased';
import styles from './styles/index.module.scss'
import TransactionsTable from './TransactionTable'




const MyMasterCard = () => {
  const [cardPurchased, setCardPurchased] = useState(false)

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h4>My Mastercard</h4>
        <TopRight />
      </div>

      {cardPurchased &&
        <>
          <CardPurchased />
          <TransactionsTable />
        </>
      }

      {!cardPurchased && (
        <OnBoarding />
      )}


    </div>
  )
}

export default MyMasterCard