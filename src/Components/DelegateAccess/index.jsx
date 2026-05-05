import { useTranslation } from "react-i18next"
import useWindowWidth from "../../utils/useWindowWidth"
import TopRight from "../topRight"
import styles from "./styles/index.module.css"
import { Search } from "react-feather"
import { useState } from "react"
import DelegateTable from "./Components/Table"
import DelegateModal from "./Components/DelegateModal"
const DelegateAccess = () => {
    const width = useWindowWidth()
    const { t } = useTranslation()
    const [search, setSearch] = useState("")
    const [isRole, setIsRole] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const handleRoleAgentToggle = () => {
        setIsRole(prev => !prev)
    }
    const handleModalOpen = () => {
        setShowModal(true)
    }
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>
                    {t("Delegate Access")}
                </h1>

                {width > 1000 && <TopRight />}
            </div>
            <div className={styles.receiptsCont}>
                <div className={styles.head}>
                    {
                        isRole ? <h5>
                            {t("My Roles")}
                        </h5> : <h5>
                            {t("My Agents")}
                        </h5>
                    }
                    {
                        isRole ? <div className={styles.roleContainer}>
                            <button
                                onClick={handleRoleAgentToggle}
                                style={width < 500 ? {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    width: "40px",
                                    height: "40px"
                                } : {}}
                            >                                <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                    +
                                </span>
                                {width > 500 && t("Manage Role")}
                            </button>
                            <button
                                onClick={handleModalOpen}
                                style={width < 500 ? {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    width: "40px",
                                    height: "40px"
                                } : {}}
                            >
                                <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                    +
                                </span>
                                {width > 500 && t("Add Role")}
                            </button>
                        </div> : <div className={styles.roleContainer}>
                            <button
                                onClick={handleRoleAgentToggle}
                                style={width < 500 ? {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    width: "40px",
                                    height: "40px"
                                } : {}}
                            >                                <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                    +
                                </span>
                                {width > 500 && t("Manage Agent")}
                            </button>
                            <button
                                onClick={handleModalOpen}

                                style={width < 500 ? {
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    width: "40px",
                                    height: "40px"
                                } : {}}
                            >                                <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                    +
                                </span>
                                {width > 500 && t("Add Agent")}
                            </button>
                        </div>
                    }
                </div>
            </div>

            <div className={styles.searchCont}>
                <div className={styles.search}>
                    <Search />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t(`${isRole ? ("Search for Role") : ("Search for Agent")}`)}
                    />
                </div>
            </div>
            <DelegateTable isRole={isRole} />
            {
                showModal && <DelegateModal isRole={isRole} isOpen={showModal} onClose={""} t={t} width={width} />
            }
        </div>
    )
}

export default DelegateAccess
