import React, { useContext, useMemo, useState } from 'react'
import styles from "./styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import TopRight from '../topRight'
import InvoiceModal from './InvoiceModal'
import { Search } from 'react-feather'
import date from "./files/date.png"
import NoInvoiceScreen from './UI/NoInvoiceScreen'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceList } from './queries'
import { UserContext } from '../../Context/UserContext'
import InstaPayLoader from '../Loader'
import InvoiceTable from './InvoiceTable'
import useWindowWidth from '../../utils/useWindowWidth'

const ReceiptInvoice = () => {
    const { t } = useTranslation()
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState("")
    const width = useWindowWidth()
    const [editModal, setEditModal] = useState({
        open: false,
        invoice: null
    })
    const { userDetails } = useContext(UserContext)

    const { isLoading, data } = useQuery({
        queryKey: ["GetInvoicesList"],
        queryFn: () => getInvoiceList(userDetails?._id, 1, 100),
    })
    const filteredInvoices = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return data
        return data.filter(inv =>
            inv.title.toLowerCase().includes(term) ||
            inv.invoiceId.toLowerCase().includes(term) ||
            inv.status.toLowerCase().includes(term)
        )
    }, [data, search])
    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>
                    {t("My Receipts")}
                </h1>

                {width > 1000 && <TopRight />}
            </div>

            {isLoading ? <div style={{ width: "70%", margin: "auto" }}><InstaPayLoader /></div> : <>
                {data?.length < 1 &&
                    <NoInvoiceScreen setShowModal={setShowModal} />
                }

                {data?.length >= 1 &&
                    <div className={styles.receiptsCont}>
                        <div className={styles.head}>
                            <h5>
                                {t("My recent Invoices:")}
                            </h5>
                            <button style={width < 500 ? { justifyContent: "center", alignItems: "center", display: "flex", width: "40px", height: "40px" } : {}} onClick={() => setShowModal(true)}>
                                <span style={{ fontSize: width < 500 ? "24px" : '14px', marginLeft: width < 500 && "5px" }}>
                                    +
                                </span>
                                {width > 500 && t("Create New Invoice")}
                            </button>
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
                        <InvoiceTable
                            setEditModal={setEditModal}
                            filteredInvoices={filteredInvoices}
                        />
                    </div>
                }
            </>}

            <InvoiceModal isOpen={showModal} toggle={() => setShowModal(false)} />
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
        </div >
    )
}

export default ReceiptInvoice