import eSimBanner from "./files/eSimBanner.svg"
import styles from "./styles/steptwo.module.scss"
import styles2 from "../AirtimeFlow/styles/steptwo.module.css"
import info from "./files/info.svg"
import PlanCard from "./PlanCard"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import { UserContext } from "../../../Context/UserContext"
import InstaPayLoader from "../../Loader"

const StepTwo = ({ data, dataHandler, dataHandlerE }) => {
    const [plansData, setPlansData] = useState([])
    const { authHeader } = useContext(UserContext)
    const [loading, setLoading] = useState(false)

    const handlePlanSelect = (plan) => {
        dataHandlerE("selectedPlan", plan);
    };

    useEffect(() => {
        const getPlans = async () => {
            setLoading(true)
            try {
                const res = await axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/dt/get-esim-products?code=${data.country?.alpha3 ?? data.eSimData?.region?.value}`, {
                    headers: authHeader
                })
                const dec = decryptData(res.data.data)
                setPlansData(dec.data)
                console.log(dec)
            } catch (error) {
                const dec = decryptData(error.response.data.data)
                console.log(dec)
            }
            finally{
                setLoading(false)
            }
        }

        if (data.country?.alpha3 || data.eSimData?.region?.value) {
            getPlans()
        }
    }, [data.country, data.region])

    return (
        <div>
            <div style={{ width: "100%", overflow: "hidden" }}>
                <img style={{ maxWidth: "100%" }} src={eSimBanner} alt="" />
            </div>

            <div className={styles.cont}>
                <h3>Available Plans</h3>

                <div className={styles.plans}>
                    <div className={styles.inputs}>

                    </div>
                    {!loading ?
                        plansData.map((plan) => (
                            <PlanCard data={data} plan={plan} handlePlanSelect={handlePlanSelect} />
                        )) :
                        <div style={{width: "300px",margin: "auto"}}>
                            <InstaPayLoader />
                        </div>
                    }
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

export default StepTwo
