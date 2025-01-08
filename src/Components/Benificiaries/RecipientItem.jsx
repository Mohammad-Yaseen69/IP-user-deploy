import styles from "./styles/RecipientItem.module.scss"

const RecipientItem = ({ user, selectedRow, setSelectedRow }) => {

    const addRemoveItem = () => {
        if (selectedRow.includes(user.id)) {
            const newRow = selectedRow.filter(id => user.id !== id)
            setSelectedRow(newRow)
        } else {
            setSelectedRow(prev => [...prev, user.id])
        }
    }

    return (
        <div className={styles.container} onClick={addRemoveItem}>
            <input type="checkbox" checked={selectedRow.includes(user.id)} onChange={addRemoveItem} />
            <div className={styles.userDetails}>
                <img src={user.avatar} alt="Img" />
                <p>{user.name}</p>
            </div>
            <div className={styles.right}>
                <span>Option</span>
                <span>Option</span>
                <span>Option</span>
            </div>
        </div>
    )
}

export default RecipientItem