import React, { useContext } from 'react'
import { UserContext } from '../../Context/UserContext'
import styles from "./styles/index.module.scss"
import cover from "../UserProfilePublic/files/cover_1.png"

const Cover = () => {
    const { userDetails, croppedImages } = useContext(UserContext)
    return (
        <img src={croppedImages?.profileBanner || userDetails?.coverImage?.url || cover} alt="cover" className={styles.cover} />
    )
}

export default Cover