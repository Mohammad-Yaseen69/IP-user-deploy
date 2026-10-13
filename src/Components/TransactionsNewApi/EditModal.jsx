import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";

const EditModal = ({
  showEditModal,
  setShowEditModal,
  item,
  categories,
  setCategories,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState(false);
  const { userDetails, authHeader } = useContext(UserContext);

  useEffect(() => {
    setCategoryName(item?.name ?? "");
  }, [item]);

  const updateHandler = () => {
    setIsUpdating(true);
    const data = {
      account_id: userDetails?._id,
      newName: categoryName,
      categoryId: item?._id,
    };

    const encrypted = encryptData(data);

    axios
      .put(
        `${import.meta.env.VITE_IP_DEV_API}/api/transaction/edit-category`,
        {
          data: encrypted,
        },
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        const decrypted = decryptData(res.data.data);
        // console.log(decrypted)
        setIsUpdating(false);
        setShowEditModal(false);
        const filteredList = categories.filter((it) => it._id !== item._id);
        setCategories([...filteredList, decrypted?.transactionCategory]);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        // console.log(decrypted)
        setError(
          "We cannot process your request at the moment, please try again later.",
        );
        setIsUpdating(false);
      });
  };

  return (
    <Modal
      isOpen={showEditModal}
      toggle={() => setShowEditModal(!showEditModal)}
    >
      <ModalHeader toggle={() => setShowEditModal(!showEditModal)}>
        Edit Category
      </ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label>New Category Name: </Label>
          <Input
            placeholder="New Name"
            className="mb-2"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          {error && (
            <span style={{ color: "red", paddingTop: ".5rem" }}>{error}</span>
          )}
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          style={{
            background:
              "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
            border: "none",
            outline: "none",
          }}
          disabled={isUpdating || !categoryName}
          onClick={updateHandler}
        >
          {isUpdating ? "Updating" : "Update"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
