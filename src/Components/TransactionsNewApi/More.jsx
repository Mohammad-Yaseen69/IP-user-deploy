import React, { useState, useEffect } from "react";
import { Edit, MoreVertical, Trash2 } from "react-feather";

const More = ({
  showDeleteModal,
  setShowDeleteModal,
  showEditModal,
  setShowEditModal,
  setTempItem,
  item,
}) => {
  const [showMore, setShowMore] = useState(false);

  // Close the "More" menu when a click occurs outside the component
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMore && !e.target.closest(".more-menu")) {
        setShowMore(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMore]);

  return (
    <>
      <MoreVertical
        size={14}
        onClick={(e) => {
          e.stopPropagation();
          setTempItem(item);
          setShowMore(!showMore);
        }}
      />
      {showMore && (
        <ul
          className="more-menu" // Add a class to the menu for event handling
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            right: "1rem",
            top: "100%",
            zIndex: 999,
          }}
        >
          <li
            style={{
              display: "flex",
              gap: ".75rem",
              padding: ".5rem .7rem",
              border: "1px solid #0000001e",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(!showEditModal);
            }}
          >
            <Edit />
            Edit
          </li>
          <li
            style={{
              display: "flex",
              gap: ".75rem",
              padding: ".35rem .7rem",
              border: "1px solid #0000001e",
              borderTop: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(!showDeleteModal);
            }}
          >
            <Trash2 />
            Delete
          </li>
        </ul>
      )}
    </>
  );
};

export default More;
