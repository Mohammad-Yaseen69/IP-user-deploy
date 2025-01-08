import React, { useContext, useEffect, useState } from 'react'
import PortfolioItem from './PortfolioItem'
import AddPortfolioItem from '../Portfolio/AddPortfolioItem'
import styles from "./styles/index.module.scss"
import { UserContext } from '../../Context/UserContext'
import { useTranslation } from 'react-i18next'

const Portfolio = () => {
    const { userPortfolio, getUserDocuments } = useContext(UserContext)
    const [showAddPortfolio, setShowAddPortfolio] = useState(false)
    const toggleAddPortfolio = () => setShowAddPortfolio(!showAddPortfolio)
    const { t } = useTranslation()

    useEffect(() => {
        getUserDocuments()
    }, [])
    return (
        <div className={styles.feed}>
            <AddPortfolioItem isOpen={showAddPortfolio} toggle={toggleAddPortfolio} />
            <h5>{t("My Portfolio")}:</h5>
            <div className={styles.posts}>
                <div className={styles.add_item}>
                    <button onClick={toggleAddPortfolio}>{t("Add Now")}</button>
                </div>
                {
                    userPortfolio && userPortfolio.length > 0
                        ?
                        userPortfolio?.filter(item => item?.file_type?.includes("video") ? item?.jw_media?.status === "ready" : item)?.map((item, ind) => (
                            <>
                                {
                                    item
                                    &&
                                    <PortfolioItem item={item} key={ind} />
                                }
                            </>
                        ))
                        :
                        <div className="text-center my-4">No Portfolio Items</div>
                }
            </div>
            <div className={styles.see_more}>
                See More {">"}
            </div>
        </div>
    )
}

export default Portfolio