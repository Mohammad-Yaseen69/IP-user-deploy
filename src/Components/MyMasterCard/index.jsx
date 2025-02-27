import { useContext, useEffect, useState } from 'react';
import TopRight from '../topRight'
import OnBoarding from './OnBoarding';
import CardPurchased from './CardPurchased';
import styles from './styles/index.module.scss'
import TransactionsTable from './TransactionTable'
import CustomizerContext from '../../Helper/Customizer';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';




const MyMasterCard = () => {
  const [cardPurchased, setCardPurchased] = useState(true)
  const {setTogglSidebar ,sideBarToogle, togglSidebar} = useContext(CustomizerContext)
  const {userDetails} = useContext(UserContext)

  useEffect(() => {
    if(cardPurchased){
      setTogglSidebar(true)
      sideBarToogle()
    }
  },[userDetails])

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