import React from 'react'
import { useTranslation } from 'react-i18next';
import style from "./styles/Header.module.scss"
import TopRight from '../topRight';

const Header = () => {
    const { t } = useTranslation();
    return (
        <div className={style.header}>
            <div>
                <h2>{t("Store Dashboard")}</h2>
                <p>{t("Get an at-a-glance view of your sales performance, key metrics, and business insights all in one place")}</p>
            </div>
                <TopRight />
        </div>
    )
}

export default Header
