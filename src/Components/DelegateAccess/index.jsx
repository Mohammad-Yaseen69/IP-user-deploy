import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Search } from "react-feather"
import { useTranslation } from "react-i18next"
import { apiWrapper } from "../../utils/Functions/apiWrapper"
import useWindowWidth from "../../utils/useWindowWidth"
import TopRight from "../topRight"
import RoleModal from "./Components/RoleModal"
import DelegateTable from "./Components/Table"
import styles from "./styles/Index.module.css"
import AgentsModal from "./Components/AgentsModal"
import Paginations from "../../Common/Component/Paginations"
import { usePermission } from "../../hooks/GeneralUse/usePermission"

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
                            >
                                {width > 500 && t("Manage Agents")}
                            </button>
                            {hasPermission("delegate-access.roles.add") && (
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
                            )}
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
                            >
                                {width > 500 && t("Manage Roles")}
                            </button>
                            {hasPermission("delegate-access.agents.add") && (
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
                            )}
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
            <Paginations page={page} totalPages={totalPages} setPage={setPage}
                limit={limit} setLimit={setLimit} />

        </div>
    )
}

export default DelegateAccess
