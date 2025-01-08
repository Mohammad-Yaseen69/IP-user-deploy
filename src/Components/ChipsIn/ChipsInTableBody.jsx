import { Badges } from "../../AbstractElements";
import styles from "./styles/ChipsInTable.module.scss"
import { useSelector } from "react-redux";
import { AiOutlineCaretRight } from "react-icons/ai"
import { useDispatch } from "react-redux";
import { changeRequestStatus, deleteRequest } from "../../store/slices/ChipsInRequests";
import { Trash2 } from "react-feather";
import { Link } from "react-router-dom";


const ChipsInTableBody = () => {
    const transactions = useSelector(state => state.chipsInRequests)
    const dispatch = useDispatch()

    return (
        <tbody>
            {transactions.map((item) => {
                let statusColor;

                if (item.status.toLowerCase() === "active") {
                    statusColor = "success"
                } else if (item.status.toLowerCase() === "inactive") {
                    statusColor = "danger"
                }

                return (
                    <tr>
                        <td className="wider">
                            <Link to={item.type === "General" ? "#" : item.qr_link} style={{ color: "inherit" }}>
                                <div>{item.name}</div>
                                <div className={styles.show} style={{ fontSize: ".7rem", fontWeight: "400" }}>{item.date}</div>
                            </Link>
                        </td>
                        <td className={styles.hidden}>{item.date}</td>
                        <td className={styles.hidden}>{item.type}</td>
                        <td className={styles.hidden}>${item.amount}</td>
                        <td style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Badges attrBadge={{ color: statusColor, variant: "rounded", style: { fontSize: ".7rem", display: "flex", alignItems: "center", width: "fit-content", gap: ".2rem" } }}>
                                {item.status}
                                <AiOutlineCaretRight cursor="pointer" onClick={() => dispatch(changeRequestStatus(item.id))} />
                            </Badges>
                            <Trash2 size={20} color="red" cursor="pointer" onClick={() => dispatch(deleteRequest(item.id))} />
                        </td>
                    </tr>
                )
            })}
        </tbody>
    );
};

export default ChipsInTableBody
