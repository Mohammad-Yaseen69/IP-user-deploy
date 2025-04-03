import { Check } from "react-feather";
import styles from "../styles/CardToCard.module.scss";

const UserInfo = ({ name, pfp, country, card, currency, onClick, data }) => {
    return (
        <div className={styles.user} onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className={styles.info}>
               {data?.recipient?.card?.last4 === card && <Check /> }
                <img src={pfp || "https://via.placeholder.com/48"} alt={name} />
                <div>
                    <h4>{name || "No Name"}</h4>
                    <span>{country || "Unknown Location"}</span>
                </div>
            </div>

            <div style={{textAlign: "right"}}>
                <h4>{card?.slice(-8) || "****"}</h4>
                <span>{currency || "N/A"}</span>
            </div>
        </div>
    )
}

export default UserInfo;