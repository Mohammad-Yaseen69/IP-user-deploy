import React, { useContext, useEffect, useState } from 'react';
import { Check, ChevronRight, X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardBody, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import axios from 'axios';
import { UserContext } from '../../../Context/UserContext';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import { Swiper, SwiperSlide } from 'swiper/react';
import green from "../files/gy_card.png"
import purple from "../files/pb_card.png"
import red from "../files/rb_card.png"
import { toast } from 'react-toastify';
import logo_w from "../../../assets/images/logo/logo_white.png"
import CreditCardInput from '../../CreditInput';
import styles from "../../PaymentsNewer/InternationalFlow/styles/creditcard.module.css"

const imgs = [green, purple, red]
const isBig = window.innerWidth > 1000

const CardDetails = ({ setSubStep, cardNumber, setCardNumber, expiry, setExpiry, cvc, setCVC, cardHolderName, setCardHolderName, saveCard, setSaveCard, showButton = true, isValid, setIsValid, cardError, setCardError, currentCard, setCurrentCard }) => {
  const { t } = useTranslation()

  useEffect(() => {
    const isValidCardNumber = cardNumber.split(" ").join("").length >= 16;
    const [contentMonth, contentYear] = expiry.split("/").map(Number);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const currentYear = currentDate.getFullYear() % 100; // Get last two digits of the year

    const isValidExpiry = contentYear > currentYear ||
      (contentYear === currentYear && contentMonth > currentMonth);
    const isValidCVC = cvc.length >= 3;

    setIsValid(isValidCardNumber && isValidExpiry && isValidCVC);

  }, [cardNumber, expiry, cvc])

  const { userDetails, authHeader } = useContext(UserContext)
  const [savedCards, setSavedCards] = useState([])

  useEffect(() => {
    const getSavedCards = async () => {
      try {

        const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/get-user-pan-list/${userDetails?._id}`, {
          headers: authHeader
        })
        const dec = decryptData(res.data.data)
        // console.log(dec?.panList)
        setSavedCards(dec?.panList?.map((item) => {
          const img = imgs[Math.floor(Math.random() * imgs.length)]
          return { ...item, img }
        }))

      } catch (error) {
        const dec = decryptData(error.response.data.data)
        if (dec?.message === "Unauthorize to access this route") {
          const coun = localStorage.getItem("ip_country")
          localStorage.clear()
          localStorage.setItem("ip_country", coun)
          window.location.pathname = "/auth/login";
        }
        // console.log(dec)
      }
    }

    if (userDetails) {
      getSavedCards()
    }
  }, [userDetails])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const toggleDeleteModal = () => setShowDeleteModal(!showDeleteModal)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteCard = async () => {
    setIsDeleting(true)
    try {
      const res = await axios.delete(`${process.env.REACT_APP_IP_DEV_API}/api/trust-payment/delete-user-pan/${currentCard?._id}`)
      const dec = await decryptData(res.data.data)
      toast.success("Deleted card successfully!")
      toggleDeleteModal()
    } catch (error) {
      const dec = decryptData(error.response.data.data)
      // console.log(dec)
    }
    finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (cvc || cardHolderName || expiry || cardNumber) {
      setCurrentCard(null)
    }
  }, [cvc, cardHolderName, expiry, cardNumber])
  return (
    <Card style={{
      marginBottom: 0,
      boxShadow: "none",
      height: "100%"
    }}>

      {/* delete modal */}
      <Modal isOpen={showDeleteModal} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>
          Delete Card Info
        </ModalHeader>
        <ModalBody>
          Are you sure, you want to remove this card details ending with these "{currentCard?.last4}" 4 digits?
        </ModalBody>
        <ModalFooter>
          <Button color='danger' onClick={deleteCard} disabled={isDeleting} style={{ borderRadius: "8px", padding: ".7rem 1.5rem" }}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* <CardBody style={{
        paddingBottom: "0",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        borderRadius: "12px",
        padding: isBig ? "1.5rem" : "5px",
        // background: "rgba(0,0,0,.03)",
        paddingBottom: 0,
        boxShadow: isBig ? "0px 0px 15.348464965820312px rgba(89, 38, 240, 0.16)" : "none",
        borderRadius: "18px"
      }}> */}
      <div className={styles.container}>
        {
          savedCards.length > 0
            ?
            <>
              <h5>{t("Select Payment Card")}</h5>
              <div className={styles.cards}>
                {
                  savedCards.map(item => (
                    <div key={item?._id} className={styles.card} onClick={() => {
                      setCVC("")
                      setCardHolderName("")
                      setExpiry("")
                      setCardNumber("")
                      setCardError("")
                      setCurrentCard(prev => prev?._id === item?._id ? null : item)
                    }}>
                      <div className={styles.c_top}>
                        <img src={logo_w} alt="" />
                      </div>
                      <div className={styles.c_bot}>
                        <span>XXXX XXXX XXXX {item?.last4}</span>
                        {
                          currentCard?._id === item?._id
                          &&
                          <Check style={{ color: "white" }} size={20} />
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
            : ""
        }
        <div className={styles.card_details}>
          <h5>{t("Add Payment Card")}</h5>
          {/* <h5 style={{ fontWeight: "900", marginBottom: "0" }}>{t("Add Payment Card")}</h5> */}
          {/* {
            currentCard &&
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255,255,255,.5)",
                zIndex: 10
              }}
            />
          } */}
          <CreditCardInput
            cardCvc={cvc}
            setCardCvc={setCVC}
            cardHolderName={cardHolderName}
            setCardHolderName={setCardHolderName}
            cardExpiry={expiry}
            setCardExpiry={setExpiry}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            cardNumberError={cardError}
            setCardNumberError={setCardError}
          />
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer", marginTop: ".7rem" }}>
            <Input id='save_info' style={{ cursor: "pointer" }} type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
            <label style={{ marginBottom: 0, color: "#8b8b8b", cursor: "pointer" }} htmlFor='save_info'>Save details to use next time.</label>
          </div>
        </div>
      </div>
      {/* </CardBody> */}
      {
        showButton
        &&
        <div style={{
          display: "flex",
          justifyContent: window.innerWidth > 1000 ? "flex-end" : "space-between",
          alignItems: "center",
          gap: "1.5rem",
          flexWrap: "wrap-reverse",
          paddingLeft: isBig ? "1rem" : 0,
          marginTop: "1rem"
        }}>
          <button style={{ border: "none", outline: "none", backgroundColor: "transparent", padding: 0, cursor: "pointer", fontSize: ".9rem", color: "#afafaf" }} onClick={() => setSubStep(prev => prev - 1)}>
            {t("Back")}
          </button>
          <Button size="sm" style={{
            border: "none",
            outline: "none",
            background: " linear-gradient(to right, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), linear-gradient(to left, #E64067 0%, #5926F0 55.65%, #4828A0",
            backgroundBlendMode: "overlay, normal",
            boxShadow: "0px 11.90068244934082px 8.655041694641113px -5.409400939941406px rgba(89, 38, 240, 0.17)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: isBig ? "40%" : "inherit",
            minWidth: "fit-content",
            padding: ".75rem 2rem",
            borderRadius: "12px"
          }}
            // className="i_t_button"
            onClick={() => {
              setSubStep(prev => prev + 1)
            }}
            disabled={currentCard ? false : (!isValid || !cardHolderName || cardError)}
          >
            {t("Next")} <ChevronRight size={20} />
          </Button>
        </div>
      }
    </Card>
  )
}

export default CardDetails