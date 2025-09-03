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



const ReceiptInvoice = () => {
    const { t } = useTranslation()
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState("")
    const { userDetails } = useContext(UserContext)

    const { isLoading, data } = useQuery({
        queryKey: ["GetInvoicesList"],
        queryFn: () => getInvoiceList(userDetails?._id, 1, 20),
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

                <TopRight />
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

                            <button onClick={() => setShowModal(true)}>
                                <span style={{ fontSize: '14px' }}>
                                    +
                                </span>
                                {t("Create New Invoice")}
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
                            <img src={date} style={{ cursor: "pointer", marginTop: "4px" }} alt="" />
                        </div>

                        <InvoiceTable
                            filteredInvoices={filteredInvoices}
                        />

                    </div>
                }
            </>}

            <InvoiceModal isOpen={showModal} toggle={() => setShowModal(false)} />
        </div>
    )
}

export default ReceiptInvoice