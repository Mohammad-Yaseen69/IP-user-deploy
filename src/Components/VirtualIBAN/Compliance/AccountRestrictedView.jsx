import styles from './compliance.module.css';

const AccountRestrictedView = ({ restrictedData }) => {
    if (!restrictedData) return null;
    return (
        <div className={styles.restrictedContainer}>
            <div className={styles.warningIconBox}>
                <span className={styles.alertIcon}>⚠️</span>
            </div>
            <h2 className={styles.restrictedTitle}>{restrictedData.title}</h2>
            <p className={styles.restrictedSubtitle}>{restrictedData.subtitle}</p>
            <div className={styles.restrictedCardBox}>
                {restrictedData.items.map((item, index) => (
                    <div key={item.id || index} className={styles.restrictedItemRow}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.badgeOverdue}>{item.status}</span>
                    </div>
                ))}
            </div>
            <button className={styles.resolveBtn}>Resolve now</button>
        </div>
    );
}

export default AccountRestrictedView