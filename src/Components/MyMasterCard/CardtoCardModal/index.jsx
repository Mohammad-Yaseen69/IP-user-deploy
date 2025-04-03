import React, { useReducer, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import styles from "../styles/CardToCard.module.scss"
import useWindowWidth from '../../../utils/useWindowWidth'
import "../styles/modal.reset.css"
import RecipientSelect from './RecipientSelect'


const initialState = {
  step: 1,
  sideText: "Choose The Recipient",
  recipient: {}
}

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value
      };
    default:
      return state;
  }
}

const numberOfFields = 4;

const CardtoCard = ({ setOpen, isOpen, card }) => {
  const width = useWindowWidth()
  const [data, dispatch] = useReducer(reducer, initialState)


  const updateHandler = (field, value) => {
    dispatch({ type: "UPDATE_FIELD", field, value })
  }


  const handleClose = () => {
    setOpen(prev => ({ ...prev, ctc: false }));
  }



  const renderData = () => (
    <div style={{ width: "100%", display: "flex", flexDirection: width < 1000 ? "column" : "", minHeight: "650px" }}>
      <div style={{ display: width < 1000 && "none" }} className={styles.left}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
          <h3 className={styles.label}>Send Money</h3>
          <h2 className={styles.head}>{data.sideText}</h2>
        </div>
      </div>

      <div className={styles.right}>

        <div className={styles.cont}>
          {data.step === 1 && <RecipientSelect dataHandler={updateHandler} data={data} />}

          <div className={styles.btns}>
            <button>
              Back
            </button>
            <button>
              Continue
            </button>
          </div>

        </div>

      </div>



    </div>
  )
  return (
    <>
      <Modal className='ctc-modal' isOpen={isOpen} toggle={handleClose} centered style={{ minWidth: "950px", borderRadius: "16px", height: "100%" }} >
        <ModalBody style={{ borderRadius: "16px", minHeight: '650px', padding: "0px", height: "100%" }}>
          {renderData()}
        </ModalBody>
      </Modal>
    </>
  )
}

export default CardtoCard