import { MoreHorizontal, Copy } from 'react-feather'
import styles from '../styles/IBANDetails.module.css'

const IBANDetails = () => {
    return (
        <div className={styles.ibanWrapper}>
            <div className={styles.box1}>
                <div className={styles.boxheader}>
                    <span>Depositing from</span>
                    <button className={styles.moreBtn}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>
                
                <div className={styles.BoxItems}>
                    <div className={`${styles.boxItem} ${styles.active}`}>
                        <div className={styles.radioOuter}>
                            <div className={styles.radioInner}></div>
                        </div>
                        <span className={styles.itemText}>Countries in European Union</span>
                    </div>

                    <div className={styles.boxItem}>
                        <div className={styles.radioOuter}></div>
                        <span className={styles.itemText}>Countries out of EU</span>
                    </div>
                </div>
            </div>

            <div className={styles.box2}>
                <div className={styles.detailsContainer}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Account holder name</span>
                        <span className={styles.value}>KEMIT KINGDOM—K2...</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                        <span className={styles.label}>IBAN</span>
                        <span className={styles.value}>MT24SYPL3040077093...</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                        <span className={styles.label}>BIC / Bank Code</span>
                        <span className={styles.value}>SYPLMTM2</span>
                    </div>
                </div>

                <button className={styles.copyButton}>
                    <Copy size={16} />
                    <span>Copy all details</span>
                </button>
            </div>
        </div>
    )
}

export default IBANDetails;