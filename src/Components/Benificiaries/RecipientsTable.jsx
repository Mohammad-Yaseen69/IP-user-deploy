import { useContext, useState } from "react"
import { Btn } from "../../AbstractElements"
import RecipientCard from "./RecipientCard"
import styles from "./styles/RecipientsTable.module.scss"
import Groups from "./Groups"
import RecipientModal from "./RecipientModal"
import { useTranslation } from "react-i18next"
import { UserContext } from "../../Context/UserContext"
import { Link } from "react-router-dom"

const RecipientsTable = () => {
    const { t } = useTranslation()
    const [showBen, setShowBen] = useState(true)
    // const beneficiaries = useSelector(state => state.beneficiaries)
    const [showBenModal, setShowBenModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const { beneficiaries, setBeneficiaries } = useContext(UserContext)

    const handleSearch = (e) => {
        // const filtered = data.filter(ben => ben.first_name.toLowerCase().split(" ").join("").includes(e.target.value))
        // setData(filtered)
    }

    const toggleBenModal = () => setShowBenModal(!showBenModal)


    return (
        <div className={`${styles.container} card`}>
            <div className={styles.top}>
                <div className={styles.left}>
                    <h3>{showBen ? t("Your Contacts") : t("Manage Groups")}</h3>
                    <form>
                        <input type="text" className="form-control" placeholder={showBen ? t('Search contacts') : t("Search Groups")} style={{ maxWidth: "200px", margin: 0 }} onChange={handleSearch} />
                    </form>
                </div>

                <Btn attrBtn={{
                    style: {
                        fontSize: ".7rem",
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    },
                    onClick: () => setShowBen(!showBen)
                }}>{!showBen ? t("Beneficiaries") : t("Manage Groups")}</Btn>
            </div>
            {
                showBen
                    ?
                    <div className={styles.table}>
                        {
                            beneficiaries.length > 0 ?
                                beneficiaries.map(userData => (
                                    <>
                                        <Link to={`/beneficiaries/edit?user_id=${userData._id}`}>
                                            <div className={styles.recItem} onClick={() => {
                                                setSelectedUser(userData._id)
                                                // toggleBenModal()
                                            }}>
                                                <RecipientCard user={userData} />
                                            </div>
                                        </Link>
                                    </>
                                ))
                                :
                                <span style={{
                                    display: 'flex',
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "1.1rem",
                                    fontWeight: 500
                                }}>{t("No Beneficiaries")}</span>
                        }
                    </div>
                    :
                    <Groups />
            }
            {
                selectedUser
                &&
                <RecipientModal user={beneficiaries.filter(item => item._id === selectedUser)[0]} data={beneficiaries} modalOpen={showBenModal} toggleModal={toggleBenModal} setData={setBeneficiaries} />
            }
        </div>
    )
}

export default RecipientsTable