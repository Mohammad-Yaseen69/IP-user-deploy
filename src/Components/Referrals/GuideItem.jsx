import styles from "./styles/GuideItem.module.scss"

const GuideItem = ({ count, description }) => {
    return (
        <div className={styles.item}>
            <h2 className={styles.count}>{count}</h2>
            <p className={styles.description}>{description}</p>
        </div>
    )
}

export default GuideItem;