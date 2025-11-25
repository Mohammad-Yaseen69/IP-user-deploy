import React from 'react'
import { useTranslation } from 'react-i18next';
import style from "./styles/Header.module.scss"
import TopRight from '../topRight';

const Header = ({ heading, paragraph }) => {
    const { t } = useTranslation();
    return (
        <div className={style.header}>
            <div>
                <h2>{t(heading)}</h2>
                <p>{t(paragraph)}
                </p>
            </div>
            <TopRight />
        </div>
    )
}

export default Header
