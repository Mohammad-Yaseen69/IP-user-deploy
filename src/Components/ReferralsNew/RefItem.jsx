import styles from "./styles/item.module.css"
import { useNavigate } from "react-router"


const RefItem = ({ item }) => {
    const navigate = useNavigate()
    return (
        <>
            <div className={styles.country}>
                <img src={item?.country?.file_url} />
                <span>{item?.country?.name}</span>
            </div>
            <div className={styles.name}>
                {item?.name}
            </div>
            <div className={styles.name}>
                {item?.username ?? "No Username"}
            </div>
            <div className={styles.name}>
                {item?.joined}
            </div>
            {
                item?.username
                    ?
                    <div className={styles.visit}>
                        <button className={styles.visit_btn} onClick={() => {
                            navigate(`/profile/${item?.username}`)
                        }}>
                            Visit Profile
                        </button>
                    </div>
                    :
                    <div className={styles.name}>
                        No Profile Link
                    </div>
            }
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className={styles.badge}>
                    ${item?.amount}
                </div>
            </div>
        </>
    )
}

export default RefItem