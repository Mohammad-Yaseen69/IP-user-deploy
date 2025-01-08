import More from './More'
import { DropdownItem } from 'reactstrap'

const CategoryItem = ({ category, index, handleBugSelect, showDeleteModal, setShowDeleteModal, showEditModal, setShowEditModal, setTempItem }) => {
    return (
        <DropdownItem key={category?._id} onClick={() => handleBugSelect(category)} style={{ opacity: 1, color: "black" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: ".5rem",
                cursor: "pointer",
                borderRadius: "9px",
                background: "#F8F8F8",
                margin: ".1rem .6rem",
                position: "relative",
                zIndex: 999 - index
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                }}>
                    <div style={{ height: "10px", width: "10px", background: "red", borderRadius: "10px" }} />
                    <span style={{ fontWeight: 700 }}>{category?.name}</span>
                </div>
                <More setShowEditModal={setShowEditModal} showEditModal={showEditModal} showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} setTempItem={setTempItem} item={category} />
            </div>
        </DropdownItem>
    )
}

export default CategoryItem