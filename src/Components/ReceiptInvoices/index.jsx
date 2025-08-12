import React, { useMemo, useState } from 'react'
import styles from "./styles/index.module.scss"
import { useTranslation } from 'react-i18next'
import TopRight from '../topRight'
import bg from "./files/creation-bg.png"
import InvoiceModal from './InvoiceModal'
import { Search, MoreHorizontal } from 'react-feather'
import date from "./files/date.png"
import { Toggle as CardToggle } from "../MyMasterCard/CardPurchased"

const Toggle = ({ checked, onChange }) => (
    <CardToggle checked={checked} onChange={onChange} />
)

const ReceiptInvoice = () => {
    const { t } = useTranslation()
    // Dummy invoices data
    const [invoices, setInvoices] = useState([
        {
            id: 'INV-001',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
            title: 'Website Design Invoice',
            description: 'Design and development services for corporate website with responsive layout.',
            amount: 1200.5,
            currency: 'USD',
            status: 'Accepted',
            recipient: 'john.doe@example.com',
            recurring: false,
        },
        {
            id: 'INV-002',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            title: 'SEO Monthly Retainer',
            description: 'Monthly SEO services including on-page optimization and reporting.',
            amount: 450.0,
            currency: 'USD',
            status: 'Requested',
            recipient: 'marketing@acme.io',
            recurring: true,
        },
        {
            id: 'INV-003',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            title: 'Mobile App Prototype',
            description: 'Clickable prototype for the mobile app with core flows.',
            amount: 800.0,
            currency: 'EUR',
            status: 'Declined',
            recipient: 'pm@startup.ltd',
            recurring: false,
        },
        {
            id: 'INV-004',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            title: 'Content Writing Package',
            description: '10 blog posts with keyword research and formatting.',
            amount: 300.0,
            currency: 'USD',
            status: 'Accepted',
            recipient: 'editor@bloghouse.com',
            recurring: true,
        },
    ])
    const [showModal, setShowModal] = useState(false)
    const [search, setSearch] = useState("")
    const [expanded, setExpanded] = useState({}) // id -> boolean
    const [menuOpenFor, setMenuOpenFor] = useState(null) // id | null

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const filteredInvoices = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return invoices
        return invoices.filter(inv =>
            inv.title.toLowerCase().includes(term) ||
            inv.id.toLowerCase().includes(term) ||
            inv.recipient.toLowerCase().includes(term) ||
            inv.status.toLowerCase().includes(term)
        )
    }, [invoices, search])

    const formatDateTime = (iso) => {
        try {
            return new Date(iso).toLocaleString()
        } catch (_) {
            return iso
        }
    }


    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>
                    {t("My Receipts")}
                </h1>

                <TopRight />
            </div>


            {invoices?.length < 1 &&
                <div className={styles.noReceiptCont}>
                    <div className={styles.left}>
                        <div>
                            <h3>
                                {t("You haven’t created any invoices yet.")}
                            </h3>
                            <p>
                                {t("Start by generating your first invoice in just a few steps.")}
                            </p>
                        </div>


                        <button onClick={() => setShowModal(true)}>
                            {t("Generate Your Invoice")}
                        </button>
                    </div>

                    <div className={styles.right}>
                        <img src={bg} alt="" />
                    </div>
                </div>
            }

            {invoices?.length >= 1 &&
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

                    <div className={styles.tableWrapper}>
                        <div className={styles.table}>
                            <div className={`${styles.tr} ${styles.thead}`}>
                                <div style={{ textAlign: "justify" }} className={`${styles.th} ${styles.serial}`}>{t('S.No')}</div>
                                <div className={styles.th}>{t('Date and Time')}</div>
                                <div className={styles.th}>{t('Title')}</div>
                                <div className={`${styles.th} ${styles.amount}`}>{t('Amount')}</div>
                                <div className={styles.th}>{t('Status')}</div>
                                <div className={styles.th}>{t('Recurring')}</div>
                                <div className={`${styles.th} ${styles.actions}`}>{t('Actions')}</div>
                            </div>

                            {filteredInvoices.map((inv, idx) => {
                                const sn = idx + 1
                                const badgeClass = inv.status === 'Accepted'
                                    ? styles.badgeAccepted
                                    : inv.status === 'Declined'
                                        ? styles.badgeDeclined
                                        : styles.badgeRequested

                                return (
                                    <React.Fragment key={inv.id}>
                                        <div
                                            className={`${styles.tr} ${styles.dataRow}`}
                                            onClick={() => {
                                                setMenuOpenFor(null)
                                                toggleExpand(inv.id)
                                            }}
                                        >
                                            <div style={{ textAlign: "justify" }} className={`${styles.td} ${styles.serial}`}>{sn}</div>
                                            <div className={styles.td}>{formatDateTime(inv.createdAt)}</div>
                                            <div className={styles.td}>{inv.title}</div>
                                            <div className={`${styles.td}`}>{inv.currency} {Number(inv.amount).toFixed(2)}</div>
                                            <div className={styles.td}>
                                                <span className={`${styles.badge} ${badgeClass}`}>{t(inv.status)}</span>
                                            </div>
                                            <div className={styles.td} onClick={(e) => e.stopPropagation()}>
                                                <Toggle
                                                    checked={!!inv.recurring}
                                                    onChange={() => {
                                                        setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, recurring: !i.recurring } : i))
                                                    }}
                                                />
                                            </div>
                                            <div className={`${styles.td} ${styles.actions}`} onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className={styles.threeDotsBtn}
                                                    onClick={() => setMenuOpenFor(menuOpenFor === inv.id ? null : inv.id)}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {menuOpenFor === inv.id && (
                                                    <div className={styles.actionsMenu}>
                                                        <div className={styles.menuItem} onClick={() => { setMenuOpenFor(null); toggleExpand(inv.id); }}>{t('View')}</div>
                                                        <div className={styles.menuItem} onClick={() => { navigator.clipboard?.writeText(inv.id); setMenuOpenFor(null); }}>{t('Copy ID')}</div>
                                                        <div className={styles.menuItem} onClick={() => { setMenuOpenFor(null); }}>{t('Download')}</div>
                                                        <div className={`${styles.menuItem} ${styles.danger}`} onClick={() => { setMenuOpenFor(null); setInvoices(prev => prev.filter(i => i.id !== inv.id)); }}>{t('Delete')}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {expanded[inv.id] && (
                                            <div className={`${styles.tr} ${styles.expandRow}`}>
                                                <div className={styles.expandContent}>
                                                    <div className={styles.expandItem}>
                                                        <span className={styles.label}> {t("Title")}: </span>
                                                        <h5>
                                                            {inv.title}
                                                        </h5>
                                                    </div>
                                                    <div className={styles.expandItem}>
                                                        <span className={styles.label}> {t("Description")}: </span>
                                                        <h5>
                                                            {inv.description}
                                                        </h5>
                                                    </div>                                                </div>
                                                <div className={styles.expandContent}>
                                                    <div className={styles.expandItem}>
                                                        <span className={styles.label}> {t("Recipient")}: </span>
                                                        <div className={styles.recipient}>
                                                            <img src="https://thispersondoesnotexist.com" alt="" />
                                                            <div>
                                                                <h4>
                                                                    {inv.recipient}
                                                                </h4>
                                                                <span className={styles.label}>
                                                                    {t("IBAN")} : {"13123131"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`${styles.expandItem} ${styles.amount} `}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", alignSelf: "stretch" }}>
                                                            <span className={styles.label}> {t("Amount")}: </span>

                                                            <span className={styles.badge}>
                                                                {("Processing")}
                                                            </span>
                                                        </div>
                                                        <h2>
                                                            {inv.currency} {Number(inv.amount).toFixed(2)}
                                                        </h2>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </div>
                </div>
            }


            <InvoiceModal isOpen={showModal} toggle={() => setShowModal(false)} />
        </div>
    )
}

export default ReceiptInvoice