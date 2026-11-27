import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { useInvalidateBeneficiaryPages } from "../../hooks/BeneficiaryHooks/useBeneficiariesPage";

const DeleteBeneficiary = ({ isOpen, toggle, benef, onDeleted }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const { userDetails, authHeader } = useContext(UserContext);
  const invalidateBeneficiaryPages = useInvalidateBeneficiaryPages();

  const deleteBeneficiary = async () => {
    if (!benef?._id) return;
    setIsDeleting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/delete-beneficiary/${benef._id}/${userDetails?._id}`,
        {
          headers: authHeader,
        },
      );
      // console.log(decryptData(res.data.data))
      onDeleted?.(benef._id);
      toggle();
    } catch (error) {
      // console.log(decryptData(error?.response?.data?.data))
      toast.error(t("Something went wrong while deleting the beneficiary!"));
    } finally {
      invalidateBeneficiaryPages();
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{t("Delete Beneficiary")}</ModalHeader>
      <ModalBody>{t("Are you sure you want to delete this beneficiary?")}</ModalBody>
      <ModalFooter>
        <Button
          onClick={toggle}
          disabled={isDeleting}
          style={{
            background:
              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
            borderRadius: "10px",
            border: "none",
            outline: "none",
          }}
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={deleteBeneficiary}
          disabled={isDeleting}
          style={{
            background:
              "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
            borderRadius: "10px",
            border: "none",
            outline: "none",
          }}
        >
          {t("Delete")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteBeneficiary;
