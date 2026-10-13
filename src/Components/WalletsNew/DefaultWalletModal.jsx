import React, { useContext, useMemo, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { UserContext } from "../../Context/UserContext";
import axios from "axios";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const DefaultWalletModal = ({
  showConfirmationModal,
  setShowConfirmationModal,
  wallet,
}) => {
  const { userWallets, authHeader, getUserWallets } = useContext(UserContext);
  const defaultWal = useMemo(
    () => userWallets?.find((item) => item?.default),
    [userWallets],
  );
  const [isSaving, setIsSaving] = useState(false);

  const setActiveQrHandler = () => {
    setIsSaving(true);
    axios
      .get(
        `${import.meta.env.VITE_IP_DEV_API}/api/wallet/set-to-default-wallet/${wallet?.wallet_id}`,
        {
          headers: authHeader,
        },
      )
      .then((res) => {
        getUserWallets(true);
        setShowConfirmationModal(false);
      })
      .catch((err) => {
        const decrypted = decryptData(err.response.data.data);
        console.log(decrypted);
        toast.error(
          decrypted?.message ??
            "We cannot process your request at the moment, please try again later.",
        );
      })
      .finally(() => setIsSaving(false));
  };
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={showConfirmationModal}
      toggle={() => setShowConfirmationModal(!showConfirmationModal)}
    >
      <ModalHeader
        toggle={() => setShowConfirmationModal(!showConfirmationModal)}
      >
        {t("Confirmation")}
      </ModalHeader>
      <ModalBody>
        {t("You are setting")} {wallet?.currency?.code} {t("as default.")}{" "}
        {t("Previously")} {defaultWal?.currency?.code}{" "}
        {t("was default wallet.")}
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={isSaving}
          onClick={() => setShowConfirmationModal(!showConfirmationModal)}
          style={{
            background:
              "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
            border: "none",
            outline: "none",
          }}
        >
          {t("Cancel")}
        </Button>
        <Button
          disabled={isSaving}
          onClick={setActiveQrHandler}
          color="primary"
          style={{
            background:
              "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
            border: "none",
            outline: "none",
          }}
        >
          {t("Continue")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DefaultWalletModal;
