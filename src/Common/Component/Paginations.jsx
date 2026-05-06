import { ChevronLeft, ChevronRight } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styles from "./styles.module.css"
const Paginations = ({ page, totalPages, setPage, limit, setLimit }) => {
    const { t } = useTranslation()
    return (
        <div className={styles.paginationWrapper}>

            <div className={styles.pagination}>
                <button
                    className={styles.navBtn}
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                >
                    <ChevronLeft />
                </button>

                <span className={styles.pageText}>
                    {t("Page")} {page} {t("of")} {totalPages}
                </span>

                <button
                    className={styles.navBtn}
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                >
                    <ChevronRight />
                </button>
            </div>

            <div className={styles.limitBox}>
                <select
                    className={styles.select}
                    value={limit}
                    onChange={(e) => {
                        setLimit(Number(e.target.value))
                        setPage(1)
                    }}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>

        </div>
    )
}

export default Paginations
