import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Plus, Search, User, Users } from "react-feather"
import { useTranslation } from "react-i18next"
import useWindowWidth from "../../utils/useWindowWidth"
import TopRight from "../topRight"
import RoleModal from "./Components/RoleModal"
import DelegateTable from "./Components/Table"
import styles from "./styles/Index.module.css"
import AgentsModal from "./Components/AgentsModal"
import Paginations from "../../Common/Component/Paginations"
import { usePermission } from "../../hooks/GeneralUse/usePermission"
import userFour from "./images/UsersFour.svg"
import { FaHistory, FaRegUserCircle } from "react-icons/fa"
import { useNavigate } from "react-router"
import { apiWrapper } from "../../utils/Functions/apiWrapper"
const DelegateAccess = () => {
    const width = useWindowWidth()
    const { t } = useTranslation()
    const hasPermission = usePermission()
    const [search, setSearch] = useState("")
    const [isRole, setIsRole] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editData, setEditData] = useState(null)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const naviagte = useNavigate()
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
                endpoint: `/api/business-agents/roles/${page}/${limit}/${search || ""}`,
                method: "GET",
                isEncrypted: false,
                isDecrypted: true
            }),
        // enabled: isRole,
        keepPreviousData: true
    })
    const { data: agentsData, isLoading: agentsLoading, isError: agentsError } = useQuery({
        queryKey: ["agents", page, limit, search],

        queryFn: () =>
            apiWrapper({
                endpoint: `/api/business-agents/agents?limit=${limit}&page=${page}&search=${search}`,
                method: "GET",
                isEncrypted: false,
                isDecrypted: true
            }),
        enabled: true,
        keepPreviousData: true
    })
    useEffect(() => {
        const delay = setTimeout(() => {
            setPage(1)
        }, 500)

        return () => clearTimeout(delay)
    }, [search])
    const roles = rolesData?.data?.roles || []
    const agents = agentsData?.data?.agents || []
    const totalPages = isRole
        ? (rolesData?.data?.totalPages > 0 ? rolesData?.data?.totalPages : 1)
        : (agentsData?.data?.totalPages > 0 ? agentsData?.data?.totalPages : 1)
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>
                        {t("Delegate Access")}
                    </h1>
                    <p>{t("Handle your Agents and Roles with ease")}</p>
                </div>

                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>
            <div className={styles.main}>
                <div className={styles.receiptsCont}>
                    <div className={styles.tabSwitcher}>

                        <button
                            className={`${styles.tabBtn} ${!isRole ? styles.activeTab : ""}`}
                            onClick={handleRoleAgentToggle}
                        >
                            <img src={userFour} alt="userFour" width={20} height={20} loading="lazy" />
                            {t("Manage Agents")}
                        </button>
                        <button
                            className={`${styles.tabBtn} ${isRole ? styles.activeTab : ""}`}
                            onClick={handleRoleAgentToggle}
                        >
                            <FaRegUserCircle size={20} />
                            {t("Manage Roles")}
                        </button>

                    </div>

                    {width > 700 && (isRole ? (
                        hasPermission("delegate-access.roles.add") && (
                            <button className={styles.addBtn} onClick={handleModalOpen}>
                                {t("Add Role")}<Plus size={20} />
                            </button>
                        )
                    ) : (
                        hasPermission("delegate-access.agents.add") && (
                            <button className={styles.addBtn} onClick={handleModalOpen}>
                                {t("Add Agent")}  <Plus size={20} />
                            </button>
                        )
                    ))}
                </div>
                <div className={styles.searchCont}>
                    <div className={styles.searchBox}>
                        <Search color="#898F8F" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t(`${isRole ? ("Search for Role") : ("Search for Agent")}`)}
                        />
                    </div>

                </div>
                <DelegateTable
                    filteredInvoices={isRole ? roles : agents}
                    isRole={isRole}
                    roleLoading={roleLoading || agentsLoading}
                    setEditData={setEditData}
                    setShowModal={setShowModal}

                />            {showModal && (
                    isRole ? (
                        <RoleModal
                            agents={roles}
                            isEdit={!!editData}
                            editData={editData}
                            isRole={isRole}
                            isOpen={showModal}
                            onClose={() => {
                                setShowModal(false)
                                setEditData(null)
                            }}
                            t={t}
                            width={width}
                        />
                    ) : (
                        <AgentsModal
                            roles={roles}
                            agents={agents}
                            isEdit={!!editData}
                            editData={editData}
                            isRole={isRole}
                            isOpen={showModal}
                            onClose={() => {
                                setShowModal(false)
                                setEditData(null)
                            }}
                            t={t}
                            width={width}
                        />
                    )
                )}

                <div className={styles.mobileAddBtn}>
                    {
                        width < 700 && <button className={styles.addBtn2} onClick={() => naviagte("/activity")}>
                            <FaHistory size={20} /> {t("Activity Feed")}
                        </button>
                    }
                    {width < 700 && (isRole ? (
                        hasPermission("delegate-access.roles.add") && (
                            <button className={styles.addBtn} onClick={handleModalOpen}>
                                {t("Add Role")}<Plus size={20} />
                            </button>
                        )
                    ) : (
                        hasPermission("delegate-access.agents.add") && (
                            <button className={styles.addBtn} onClick={handleModalOpen}>
                                {t("Add Agent")}  <Plus size={20} />
                            </button>
                        )
                    ))}
                </div>
                <Paginations page={page} totalPages={totalPages} setPage={setPage}
                    limit={limit} setLimit={setLimit} />

            </div>
        </div>
    )
}

export default DelegateAccess
