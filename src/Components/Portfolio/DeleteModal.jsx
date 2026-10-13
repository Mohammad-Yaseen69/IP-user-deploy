import axios from "axios";
import { useContext, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const DeleteModal = ({ isOpen, toggle, item, pAddress }) => {
  const { authHeader, getUserDocuments, setUserVideos } = useContext(UserContext);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const deleteHandler = () => {
    setDeleting(true);
    axios
      .delete(`${import.meta.env.VITE_IP_DEV_API}/api/account/delete-document/${item?._id}`, {
        headers: authHeader,
      })
      .then(() => {
        if (pAddress) {
          navigate("/payment-address");
          setUserVideos((prev) => prev.filter((video) => video?._id !== item?._id));
        } else {
          getUserDocuments();
        }
        toggle();
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        toast.error(decrypted?.message ?? "Something went wrong while deleting the file.");
      })
      .finally(() => setDeleting(false));
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{t("Confirm")}</ModalHeader>
      <ModalBody>{t("Are you sure you want to delete this portfolio item?")}</ModalBody>
      <ModalFooter>
        <Button onClick={deleteHandler} disabled={deleting}>
          {t("Delete")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
