import styles from "./styles/steptwo.module.css"
import placeholder_dp from "../files/dp_ph.png"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"

const Steptwo = ({ data, dataHandler }) => {
    const { t } = useTranslation()

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file?.type?.toLowerCase()?.includes("image")) {
            toast.error("Only images are allowed!")
            return
        }
        dataHandler("dp", file)
        const reader = new FileReader();
        reader.onload = () => {
            dataHandler("dp_preview", reader.result);
        };
        reader.readAsDataURL(file);
    }
    return (
        <div className={styles.container}>
            <div className={styles.inp}>
                <label>{t("Profile Picture")}</label>
                <div className={styles.dp}>
                    <img src={data.dp_preview || placeholder_dp} alt="" />
                    <label htmlFor="dp">{t("Add Photo Or Logo")}</label>
                    <input type="file" id="dp" name="dp" hidden onChange={handleFileChange} accept="image/*" />
                </div>
            </div>
            <div className={styles.inp}>
                <label>{t("First Name")}</label>
                <input type="text" value={data.first_name} onChange={e => dataHandler("first_name", e.target.value)} placeholder={t("Enter Your First Name")} />
            </div>
            <div className={styles.inp}>
                <label>{t("Last Name")}</label>
                <input type="text" value={data.last_name} onChange={e => dataHandler("last_name", e.target.value)} placeholder={t("Enter Your Last Name")} />
            </div>
        </div>
    )
}

export default Steptwo