import React from 'react'
import styles from './styles/index.module.scss'



const Toggle = ({ checked, onChange, isCheckbox = false }) => (
    <label className={isCheckbox ? styles.checkbox : styles.toggle}>
      <input
        type={isCheckbox ? "checkbox" : "checkbox"}
        checked={checked}
        onChange={onChange}
      />
      <span className={isCheckbox ? styles.checkmark : styles.slider}></span>
    </label>
  );

const CardPurchased = () => {
    return (
        <div className={styles.cardContainer}>
            <div className={styles.left}>
                <div className={styles.topInfo}>
                    <div>
                        <p>My Cards</p>
                        <span>3</span>
                    </div>

                    <button>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                            <path d="M8.67521 4.24182V13.5752M4.00854 8.90849H13.3419" stroke="white" stroke-width="1.56777" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Add Card
                    </button>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Manage My MasterCard</h4>


                    <div style={{ display: "flex", flexWrap: "wrap", width: "100%", gap: "8px" }}>
                        <div className={styles.iconBox} style={{ flex: 2 }}>
                            <span>Card Label</span>
                        </div>
                        <div className={styles.iconBox}>
                            <span>Card Label</span>

                            <Toggle checked={true} isCheckbox={false} />
                        </div>
                        <div className={styles.iconBox}>
                            <span>Card Label</span>
                        </div>
                        <div className={styles.iconBox}>
                            <span>Card Label</span>
                        </div>
                    </div>

                </div>

                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Card Settings</h4>

                </div>
                <div className={styles.detailsContainer}>
                    <h4 className={styles.title}>Mobile Payments</h4>

                </div>



            </div>
        </div>
    )
}

export default CardPurchased