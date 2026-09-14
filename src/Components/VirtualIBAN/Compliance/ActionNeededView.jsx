import styles from './ActionView.module.css';
import UnderProgress from './UnderProgress';

const ActionNeededView = ({ bannerMessage, requests }) => {
    const actionNeededList = requests.filter(req => req.status === 'action_needed');

    return (
        <div className={styles.complianceContainer}>
            {bannerMessage && (
                <div className={styles.warningBanner}>
                    <span className={styles.redDot}></span>
                    <p className={styles.bannerText}>
                        We keep compliance clear and reassuring.{' '}
                        <span className={styles.bannerHighlight}>
                            Responding promptly keeps payments flowing
                        </span>{' '}
                        - failure to respond may restrict account activity.
                    </p>
                </div>
            )}
            {actionNeededList.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionHeading}>
                        Action needed - {actionNeededList.length} requests
                    </h3>
                    <div className={styles.cardsGrid}>
                        {actionNeededList.map((item) => (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.cardTitle}>{item.title}</h4>
                                    <span className={styles.badgeActionNeeded}>Action needed</span>
                                </div>
                                <p className={styles.cardDesc}>{item.description}</p>
                                <p className={styles.deadline}>
                                    Deadline <span className={styles.dateVal}>{item.deadline}</span>
                                </p>
                                <div className={styles.buttonGroup}>
                                    <button className={styles.primaryBtn}>Upload documents</button>
                                    <button className={styles.secondaryBtn}>Message compliance</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <UnderProgress requests={requests} />
        </div>
    );
}

export default ActionNeededView