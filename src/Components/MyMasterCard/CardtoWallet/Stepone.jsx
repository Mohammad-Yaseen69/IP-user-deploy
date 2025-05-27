import React from 'react'
import styles from "../styles/cardToWallet.module.scss"
import { User, Users } from 'react-feather'
import { FaUser, FaUserAlt, FaUsers } from 'react-icons/fa'

const Stepone = ({ setOption, option }) => {
    return (
        <div>
            <div className={styles.head}>
                <h3>
                    Choose an Option
                </h3>
                <p>Who would you like to send money to?</p>
            </div>

            <div className={styles.options}>
                <div style={{ background: option === "my" && "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)", }} onClick={() => setOption("my")} className={styles.option}>
                    <FaUser color={option === "my" && "white"} size={22} />
                    <h4 style={{ color: option === "my" && "white" }}>My Wallet</h4>
                </div>
                <div style={{ background: option === "other" && "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)", }} onClick={() => setOption("other")} className={styles.option}>
                    <FaUsers color={option === "other" && "white"} size={22} />
                    <h4 style={{ color: option === "other" && "white" }}>Other Wallet</h4>
                </div>
            </div>

        </div>
    )
}

export default Stepone
