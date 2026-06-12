import { useQuery } from '@tanstack/react-query'
import { useContext, useMemo, useState } from 'react'
import { Search } from 'react-feather'
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
    const [showDirectCardModal, setShowDirectCardModal] = useState(false)
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
    const visibleInvoices = useMemo(() => {
        const isDirectCardInvoice = (inv) => {
            const invoiceType = inv?.invoiceType?.toLowerCase()
            const paymentMethod = inv?.guestDetails?.paymentMethod?.toLowerCase()
            return invoiceType === "direct-card" || invoiceType === "direct_card" || paymentMethod === "card"
        }

        if (activeTab === "direct_card") {
            return invoices.filter(isDirectCardInvoice)
        }

        if (activeTab === "invoice") {
            return invoices.filter(inv => !isDirectCardInvoice(inv))
        }

        return invoices
    }, [activeTab, invoices])
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
                <div
                    onClick={() => setActiveTab("direct_card")}
                    style={{
                        cursor: 'pointer',
                        padding: '10px 20px',
                        background: activeTab === 'direct_card' ? '#5926F0' : 'rgb(221 218 218)',
                        fontWeight: 600,
                        color: activeTab === 'direct_card' ? 'white' : 'black',
                        borderRadius: "6px"
                    }}
                >
                    {t("Direct Card Invoice")}
                </div>
            </div>

            {activeTab === 'invoice' || activeTab === 'direct_card' ? (<div className={styles.receiptsCont}>
                <div className={styles.head}>
                    <h5>
                        {activeTab === 'direct_card' ? t("My recent Direct Card Invoices:") : t("My recent Invoices:")}
                    </h5>
                    {/* Permission: invoices.create */}
                    {can("invoices.create") && (
                        <button style={width < 500 ? { justifyContent: "center", alignItems: "center", display: "flex", width: "40px", height: "40px" } : {}} onClick={() => activeTab === 'direct_card' ? setShowDirectCardModal(true) : setShowModal(true)}>
                            <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                +
                            </span>
                            {width > 500 && t(activeTab === 'direct_card' ? "Create Direct Card Invoice" : "Create New Invoice")}
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
                            placeholder={t(activeTab === 'direct_card' ? 'Search for Direct Card Invoice' : 'Search for Invoice')}
                        />
                    </div>
                </div>


                {isLoading && !isRefetching ? (
                    <InstaPayLoader />
                ) : visibleInvoices.length < 1 ? (
                    <NoInvoiceScreen setShowModal={activeTab === 'direct_card' ? setShowDirectCardModal : setShowModal} />
                ) : (
                    <>
                        <InvoiceTable
                            setEditModal={setEditModal}
                            filteredInvoices={visibleInvoices}
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
            {can("invoices.create") && <InvoiceModal isOpen={showDirectCardModal} toggle={() => setShowDirectCardModal(false)} directCard={true} />}
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
