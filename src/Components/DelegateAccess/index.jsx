import { useTranslation } from "react-i18next"
import useWindowWidth from "../../utils/useWindowWidth"
import TopRight from "../topRight"
import styles from "./styles/index.module.css"
import { Search } from "react-feather"
import { useState } from "react"
import DelegateTable from "./Components/Table"
import DelegateModal from "./Components/DelegateModal"
import { useQuery } from "@tanstack/react-query"
import { apiWrapper } from "../../utils/Functions/apiWrapper"
const DelegateAccess = () => {
    const width = useWindowWidth()
    const { t } = useTranslation()
    const [search, setSearch] = useState("")
    const [isRole, setIsRole] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editData, setEditData] = useState(null)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const handleRoleAgentToggle = () => {
        setIsRole(prev => !prev)
    }
    const handleModalOpen = () => {
        setShowModal(true)
    }
    const { data: rolesData, isLoading: roleLoading, isError } = useQuery({
        queryKey: ["roles", page, limit, search],

        queryFn: () =>
            apiWrapper({
                endpoint: `/api/business-agents/roles/${page}/${limit}/${search}`,
                method: "GET",
                isEncrypted: false,
                isDecrypted: true
            }),

        keepPreviousData: true
    })
    const roles = rolesData?.data?.roles || []
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
            <DelegateTable filteredInvoices={roles} isRole={isRole} roleLoading={roleLoading} />
            {
                showModal && <DelegateModal agents={roles} isEdit={false} isRole={isRole} isOpen={showModal} onClose={() => setShowModal(false)} t={t} width={width} />
            }
        </div>
    )
}

export default DelegateAccess
