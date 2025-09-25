import styles from "./styles/steptwo.module.css"
import placeholder_dp from "../files/dp_ph.png"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import CountryDropDown from "../../AddBeneficiary/CountryDropDown"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"

const getBusinessCategories = async () => {
    const res = await axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/account-settings/get-business-categories`)
    return decryptData(res?.data?.data)?.categoryList
}

const Steptwo = ({ data, dataHandler }) => {
    const { t } = useTranslation()
    const { data: categories } = useQuery({
        queryKey: ["businessCategories"],
        queryFn: () => getBusinessCategories(),
        staleTime: Infinity,
        cacheTime: Infinity,
        enabled: !!(data.account_type === "business")
    })

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

    console.log(categories)

    return (
        <div className={styles.container}>
            {data.account_type === "individual" ?
                <>
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
                </> :
                <>
                    <div className={styles.inp}>
                        <label>{t("Company Name")}:</label>
                        <input type="text" value={data.company_name} onChange={e => dataHandler("company_name", e.target.value)} placeholder={t("Enter Your Company Name")} />
                    </div>
                    <div className={styles.inp}>
                        <label>{t("Select Country")}:</label>
                        <CountryDropDown
                            country={data.country?.alpha3}
                            onSelect={(item) => {
                                console.log(item)
                                dataHandler("country", item)
                            }}
                            padding=".7rem 1.25rem"
                            shadow={true}

                        />
                    </div>
                    <div className={styles.inp}>
                        <label>{t("Select Business Category")}:</label>

                        <select  value={data.category_id} onChange={(e) => dataHandler("category_id", e.target.value)}  >
                            <option disabled value={''}>
                                {t("Select Category")}
                            </option>
                            {categories?.map((category) => (
                                <option key={category?._id} value={category?._id}> {category?.name} </option>
                            ))}
                        </select>
                    </div>
                </>
            }
        </div>
    )
}

export default Steptwo