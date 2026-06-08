import { useQuery } from '@tanstack/react-query'
import { useContext, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UserContext } from '../../Context/UserContext'
import useWindowWidth from '../../utils/useWindowWidth'
import InstaPayLoader from '../Loader'
import TopRight from '../topRight'
import InvoiceModal from './InvoiceModal'
import InvoiceTable from './InvoiceTable'
import { getInvoiceList } from './queries'
import styles from "./styles/index.module.scss"
import NoInvoiceScreen from './UI/NoInvoiceScreen'
import { useDebounce } from '../../hooks/useDebounce/useDebounce'
import Paginations from '../../Common/Component/Paginations'
import { usePermission } from '../../hooks/GeneralUse/usePermission'
import PricingsAndPlan from '../PaymentAddress/PricingsAndPlan'

const ReceiptInvoice = () => {
    const { t } = useTranslation()
    const can = usePermission();

    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [activeTab, setActiveTab] = useState("invoice")
    const width = useWindowWidth()
    const debouncedSearch = useDebounce(search, 500)

    const [editModal, setEditModal] = useState({
        open: false,
        invoice: null
    })
    const { userDetails } = useContext(UserContext)

    const { isLoading, data, isRefetching } = useQuery({
        queryKey: ["GetInvoicesList", debouncedSearch.trim().toLowerCase(), page, limit],
        queryFn: () => getInvoiceList(userDetails?._id, page, limit, debouncedSearch ? debouncedSearch.trim().toLowerCase() : ""
        ),
        enabled: !!userDetails?._id,
        keepPreviousData: false
    })
    const invoices = data?.data || []
    const total = data?.pagination?.totalRecords || 0
    const totalPages = data?.pagination?.totalPages || 1

    console.log("data", data)
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>
                    {t("My Invoices & Plans")}
                </h1>

                {width > 1000 && <TopRight />}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div
                    onClick={() => setActiveTab("invoice")}
                    style={{
                        cursor: 'pointer',
                        padding: '10px 20px',
                        background: activeTab === 'invoice' ? '#5926F0' : 'rgb(221 218 218)',
                        fontWeight: 600,
                        color: activeTab === 'invoice' ? 'white' : 'black',
                        borderRadius: "6px"
                    }}
                >
                    {t("Invoices")}
                </div>
                <div
                    onClick={() => setActiveTab("plans")}
                    style={{
                        cursor: 'pointer',
                        padding: '10px 20px',
                        background: activeTab === 'plans' ? '#5926F0' : 'rgb(221 218 218)',
                        fontWeight: 600,
                        color: activeTab === 'plans' ? 'white' : 'black',
                        borderRadius: "6px"
                    }}
                >
                    {t("Plans")}
                </div>
            </div>

            {activeTab === 'invoice' ? (<div className={styles.receiptsCont}>
                <div className={styles.head}>
                    <h5>
                        {t("My recent Invoices:")}
                    </h5>
                    {/* Permission: invoices.create */}
                    {can("invoices.create") && (
                        <button style={width < 500 ? { justifyContent: "center", alignItems: "center", display: "flex", width: "40px", height: "40px" } : {}} onClick={() => setShowModal(true)}>
                            <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                +
                            </span>
                            {width > 500 && t("Create New Invoice")}
                        </button>
                    )}
                </div>

                <div className={styles.searchCont}>
                    <div className={styles.search}>
                        <Search />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('Search for Invoice')}
                        />
                    </div>
                </div>


                {isLoading && !isRefetching ? (
                    <InstaPayLoader />
                ) : invoices.length < 1 ? (
                    <NoInvoiceScreen setShowModal={setShowModal} />
                ) : (
                    <>
                        <InvoiceTable
                            setEditModal={setEditModal}
                            filteredInvoices={invoices}
                        />

                        <Paginations page={page} totalPages={totalPages} setPage={setPage} limit={limit} setLimit={setLimit} /></>)}

            </div>
            ) : (
                <div>
                    <PricingsAndPlan isInvoicePage={true} />
                </div>
            )}


            {/* Permission: invoices.create */}
            {can("invoices.create") && <InvoiceModal isOpen={showModal} toggle={() => setShowModal(false)} />}
            {/* Permission: invoices.edit */}
            {can("invoices.edit") && (
                <InvoiceModal
                    isOpen={editModal.open}
                    toggle={() => {
                        setEditModal({
                            open: false,
                            invoice: null
                        })
                    }}
                    inv={editModal.invoice}
                    isEdit={true}
                />
            )}
        </div >
    )
}

export default ReceiptInvoice