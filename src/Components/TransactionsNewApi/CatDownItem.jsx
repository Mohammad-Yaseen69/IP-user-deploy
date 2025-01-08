import React, { useEffect, useState } from 'react';
import More from './More';

const CatDownItem = ({ category, index, handleItemSelect, showDeleteModal, setShowDeleteModal, showEditModal, setShowEditModal, setTempItem, selected, removeSelected }) => {
    const [checked, setChecked] = useState(selected);

    // console.log(selected, category?.name)
    const handleCheckboxChange = () => {
        setChecked(!checked);
        if (!checked) {
            handleItemSelect(category);
        } else {
            removeSelected(category);
        }
    };

    useEffect(() => {
        setChecked(selected)
    }, [selected])

    return (
        <div
            style={{
                height: "fit-content",
                padding: "0 .75rem",
                width: "100%",
                background: "#fff",
                borderRadius: "14px",
                border: "none",
                boxShadow: "none",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: ".75rem",
                    cursor: "pointer",
                    borderRadius: "9px",
                    background: "#F8F8F8",
                    margin: ".1rem .6rem",
                    position: "relative",
                    width: "100%",
                    zIndex: 999 - index,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                    onClick={handleCheckboxChange}
                >
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={handleCheckboxChange}
                    />
                    <span style={{ fontWeight: 700 }}>{category?.name}</span>
                </div>
                {
                    category?.type?.toLowerCase() !== "admin"
                    &&
                    <More
                        setShowEditModal={setShowEditModal}
                        showEditModal={showEditModal}
                        showDeleteModal={showDeleteModal}
                        setShowDeleteModal={setShowDeleteModal}
                        setTempItem={setTempItem}
                        item={category}
                    />
                }
            </div>
        </div>
    );
};

export default CatDownItem;