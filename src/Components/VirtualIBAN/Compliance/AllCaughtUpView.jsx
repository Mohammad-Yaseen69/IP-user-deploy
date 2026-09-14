import styles from './compliance.module.css';

const AllCaughtUpView = ({ lastReviewed }) => {
    return (
        <div className={styles.caughtUpContainer}>
            <div className={styles.successIconBox}>
                <span className={styles.checkIcon}>✓</span>
            </div>
            <h2 className={styles.caughtUpTitle}>You're all caught up</h2>
            <p className={styles.caughtUpSubtitle}>
                No open compliance requests right now. We'll reach out here if we need anything else from you.
            </p>
            {lastReviewed && (
                <div className={styles.lastReviewedBadge}>
                    Last reviewed {lastReviewed}
                </div>
            )}
        </div>
    );
}

export default AllCaughtUpView