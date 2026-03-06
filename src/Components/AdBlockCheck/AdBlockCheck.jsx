import { useEffect, useState } from "react";
import style from "./AdBlockCheck.module.css";
import { useDetectAdBlock } from "adblock-detect-react";

const AdBlockCheck = () => {

  const adBlockDetected = useDetectAdBlock();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (adBlockDetected) {
      setShow(true);
    }
  }, [adBlockDetected])

  return (
    <>
      {show && (
        <div className={style.modal}>
          <div className={style.modalContent}>
            <button className={style.closeBtn} onClick={() => setShow(false)}>
              &times;
            </button>
            <h2>Ad Blocker Detected</h2>
            <p>Please disable your Ad Blocker to support our website.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdBlockCheck;