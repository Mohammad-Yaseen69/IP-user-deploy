import React, { useState, useEffect } from "react";
import { Edit, Save, Trash2, XCircle } from "react-feather";
import { Input } from "reactstrap";
import PaymentsConfirmationModal from "./PaymentsConfirmationModal";
import { ToolTip } from "../../AbstractElements";
import { formatCurrency } from "../../Helper/AmountFormat";

const TBRItem = (props) => {
  const {
    item,
    index,
    editRowIndex,
    editedData,
    handleInputChange,
    setTempAmount,
    setTempCurrency,
    handleEdit,
    handleSave,
    handleDelete,
    cancelEdit,
  } = props;

  const [tooltip, setToolTip] = useState(false);
  const [showDelModal, setShowDelModal] = useState(false);
  const toggleDel = () => setShowDelModal(!showDelModal);

  useEffect(() => {
    if (tooltip) {
      setTimeout(() => {
        setToolTip(false);
      }, 1000);
    }
  }, [tooltip]);

  const toggle = () => setToolTip(!tooltip);
  return (
    <tr>
      <td>
        {editRowIndex === index ? (
          <Input
            type="text"
            value={editedData[index].ID}
            onChange={(e) => {
              handleInputChange(e, index, "ID");
            }}
          />
        ) : (
          item.ID
        )}
      </td>
      <td>
        {editRowIndex === index ? (
          <Input
            type="text"
            value={editedData[index].Amount}
            onChange={(e) => {
              handleInputChange(e, index, "Amount");
              setTempAmount(e.target.value);
            }}
          />
        ) : (
          formatCurrency(item.Amount) || "N/A"
        )}
      </td>
      <td>
        {editRowIndex === index ? (
          <Input
            type="text"
            value={editedData[index]?.Currency || ""}
            onChange={(e) => {
              handleInputChange(e, index, "Currency");
              setTempCurrency(e.target.value);
            }}
          />
        ) : (
          item.Currency || "N/A"
        )}
      </td>
      <td>
        {editRowIndex === index ? (
          <Input
            type="text"
            value={editedData[index]?.RecipientCurrency || ""}
            onChange={(e) => handleInputChange(e, index, "RecipientCurrency")}
          />
        ) : (
          item.RecipientCurrency || "N/A"
        )}
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {editRowIndex !== index ? (
            <>
              <Edit
                size={16}
                onClick={() => handleEdit(index)}
                cursor={"pointer"}
                id={`pr-edit${item.u_id}`}
              />

              <ToolTip
                attrToolTip={{
                  placement: "top",
                  isOpen: tooltip,
                  target: `pr-edit${item.u_id}`,
                  toggle: toggle,
                }}
              >
                Edit Recipient Details
              </ToolTip>
            </>
          ) : (
            <>
              <Save size={16} onClick={() => handleSave()} cursor={"pointer"} />
              <XCircle
                size={16}
                onClick={() => cancelEdit && cancelEdit()}
                cursor={"pointer"}
                style={{ color: "#7d7d7d" }}
                title="Cancel edit"
              />
              <Trash2
                size={16}
                onClick={() => toggleDel()}
                cursor={"pointer"}
              />
              <PaymentsConfirmationModal
                isOpen={showDelModal}
                message={"Are you sure, you want to delete the current row?"}
                title={"Confirm"}
                onCancel={toggleDel}
                onConfirm={() => handleDelete(index)}
                btnOneText="Cancel"
                btnTwoText="Confirm"
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TBRItem;
