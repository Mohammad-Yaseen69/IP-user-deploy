import eSimBanner from "./files/eSimBanner.svg"
import styles from "./styles/steptwo.module.scss"
import styles2 from "../AirtimeFlow/styles/steptwo.module.css"
import PlanCard from "./PlanCard"
import info from "./files/info.svg"

const StepFour = ({ data, dataHandler, dataHandlerE }) => {

  return (
    <div>
      <div style={{ width: "100%", overflow: "hidden" }}>
        <img style={{ maxWidth: "100%" }} src={eSimBanner} alt="" />
      </div>


      <div className={styles.cont}>
        <h3>Enter the consumer’s mobile phone number and email address to send eSIM activation and usage information.</h3>

        <div style={{ maxHeight: "fit-content" }} className={styles.plans}>
          <div className={styles.inputs}>
            <div className={styles.input}>
              <label htmlFor="">Mobile number</label>
              <input
                value={data.eSimData.phone}
                type="text"
                onChange={(e) => {
                  dataHandlerE("phone", e.target.value)
                }}
              />
            </div>

            <div className={styles.input}>
              <label htmlFor="">Email address</label>
              <input value={data.eSimData.email} onChange={(e) => {
                dataHandlerE("email", e.target.value)
              }} type="text" />
            </div>
          </div>
          <PlanCard data={data} plan={data?.eSimData?.selectedPlan} handlePlanSelect={() => { }} />
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div className={styles2.info}>
            <img src={info} alt="" />
            <span>Trouble buying an E-SIM?</span>
          </div>

          <div className={styles2.btns}>
            <span
              onClick={() => {
                dataHandler("step", data.step - 1)
                dataHandlerE("region", "")
              }}
              className={styles2.back}
            >
              Back
            </span>
            <button onClick={() => dataHandler("step", data.step + 1)} disabled={!data?.eSimData?.selectedPlan?.productId} className={styles2.nxt}>
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
                <path d="M1.7876 1.5625L7.47528 6.97362C7.88959 7.36778 7.88959 8.02847 7.47528 8.42262L1.7876 13.8337" stroke="white" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepFour
