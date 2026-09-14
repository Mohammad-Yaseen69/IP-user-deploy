import styles from './compliance.module.css';

const UnderProgress = ({ requests }) => {
  const inProgressList = requests.filter(req => req.status === 'in_progress');
  if (inProgressList.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionHeading}>In progress</h3>
      <div className={styles.cardsGrid}>
        {inProgressList.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{item.title}</h4>
              <span className={styles.badgeInProgress}>In progress</span>
            </div>
            <p className={styles.cardDesc}>{item.description}</p>
            <p className={styles.deadline}>
              Due <span className={styles.dateValYellow}>{item.deadline.replace('Due ', '')}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default UnderProgress