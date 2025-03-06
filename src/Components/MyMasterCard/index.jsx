import { useContext, useEffect, useState } from 'react';
import TopRight from '../topRight'
import OnBoarding from './OnBoarding';
import CardPurchased from './CardPurchased';
import styles from './styles/index.module.scss'
import TransactionsTable from './TransactionTable'
import CustomizerContext from '../../Helper/Customizer';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import InstaPayLoader from '../Loader';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';




const MyMasterCard = () => {
  const [cardPurchased, setCardPurchased] = useState(false)
  const { setTogglSidebar, sideBarToogle, togglSidebar } = useContext(CustomizerContext)
  const [currentCardDetails, setCurrentCardDetails] = useState({})
  const { userDetails, authHeader } = useContext(UserContext)
  const [cards, setCards] = useState([])
  const [reRender, setReRender] = useState(false)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (cardPurchased) {
      setTogglSidebar(true)
    }
  }, [userDetails, cardPurchased])

  useEffect(() => {
    const getCard = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/virtual-card/get-user-vvc`, {
          headers: authHeader
        })

        const dec = decryptData(res.data.data)
        console.log(dec)
        setCards(dec?.data ?? [])
        if (dec?.data.length) {
          setCardPurchased(true)
        } else {
          setCardPurchased(false)
        }

        console.log(dec)
      } catch (error) {
        const dec = decryptData(error.response.data.data)
        setCardPurchased(false)
        console.log(dec)
      }



      setLoading(false)
    }


    getCard()
  }, [userDetails, reRender])

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/virtual-card/get-card-transcations`, { data: encryptData({ cardId: cards[current].card_id }) }, {
          headers: authHeader
        })

        const dec = decryptData(res.data.data)
        setTransactions(dec.data)

      } catch (error) {
        const dec = decryptData(error.response.data.data)
        console.log(dec)
      }
    }

    getTransactions()
  }, [current])

  return (
    <div style={{ minHeight: "100vh" }} className={styles.container}>
      <div className={styles.top}>
        <h4>My Mastercard</h4>
        <TopRight />
      </div>


      <>
        {!loading ?
          <>
            {cardPurchased ?
              <>
                <CardPurchased
                  currentCardDetails={currentCardDetails}
                  setCurrentCardDetails={setCurrentCardDetails}
                  setLoading={setLoading} current={current}
                  setCurrent={setCurrent}
                  cards={cards}
                  setCardPurchased={setCardPurchased}
                />
                <TransactionsTable  cardNo={currentCardDetails?.card_number} transactions={transactions} isLoading={loading} />
              </>
              : <OnBoarding alreadyHaveCard={cards.length !== 0} setReRender={setReRender} setCardPurchased={setCardPurchased} />

            }
          </>

          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}> <InstaPayLoader /> </div>
        }
      </>



    </div>
  )
}

export default MyMasterCard