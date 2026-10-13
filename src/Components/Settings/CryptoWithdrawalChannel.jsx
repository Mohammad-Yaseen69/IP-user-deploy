import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Trash2, X } from "react-feather";
import {
  Button,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserContext";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { usePermission } from "../../hooks/GeneralUse/usePermission";
import styles from "./styles/CryptoWithdrawalChannel.module.css";
import { ButtonForRequests } from "../ReceiptInvoices/UI/FormElements";

const CRYPTO_SERVICE_ID = 4;
const DEFAULT_NETWORK = "TRC-20 (TRON)";

const NETWORKS = [
  {
    value: "TRC-20 (TRON)",
    aliases: ["TRC-20", "TRC20", "TRON"],
    hint: "Exactly 34 characters and starts with T.",
    validate: (address) => /^T[a-zA-Z0-9]{33}$/.test(address),
  },
  {
    value: "ERC-20 (Ethereum)",
    aliases: ["ERC-20", "ERC20", "Ethereum"],
    hint: "Exactly 42 characters and starts with 0x.",
    validate: (address) => /^0x[a-fA-F0-9]{40}$/.test(address),
  },
  {
    value: "BEP-20 (BNB Smart Chain)",
    aliases: ["BEP-20", "BEP20", "BNB Smart Chain", "BNB Chain"],
    hint: "Exactly 42 characters and starts with 0x.",
    validate: (address) => /^0x[a-fA-F0-9]{40}$/.test(address),
  },
];

const EMPTY_FORM = {
  currency: "USDT",
  network: DEFAULT_NETWORK,
  wallet_address: "",
};

const normalizeNetwork = (network, address = "") => {
  const value = network || "";
  const found = NETWORKS.find(
    (item) =>
      item.value === value ||
      item.aliases.some((alias) => alias.toLowerCase() === value.toLowerCase()),
  );

  if (found) return found.value;
  if (address?.startsWith("T")) return "TRC-20 (TRON)";
  if (address?.startsWith("0x")) return "ERC-20 (Ethereum)";

  return DEFAULT_NETWORK;
};

const getCryptoList = (withdrawal) => {
  if (Array.isArray(withdrawal?.crypto) && withdrawal.crypto.length > 0)
    return withdrawal.crypto;
  if (
    Array.isArray(withdrawal?.crypto_wallet) &&
    withdrawal.crypto_wallet.length > 0
  )
    return withdrawal.crypto_wallet;
  return [];
};

const hasOtherWithdrawalChannels = (withdrawal) => {
  return [
    "bank_details",
    "mobile_wallet",
    "cash_pickup",
    "card",
    "payment_card",
  ].some(
    (key) => Array.isArray(withdrawal?.[key]) && withdrawal[key].length > 0,
  );
};

const getErrorMessage = (error, fallback) => {
  try {
    const decrypted = decryptData(error?.response?.data?.data);
    if (typeof decrypted === "string") return decrypted;
    return decrypted?.message ?? fallback;
  } catch {
    return fallback;
  }
};

const CryptoWithdrawalChannel = () => {
  const { t } = useTranslation();
  const can = usePermission();
  const { authHeader, userDetails, cryptoWithdrawals, getWithdrawals } =
    useContext(UserContext);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const canAdd = can("settings.receiving-accounts.add");
  const canDelete = can("settings.receiving-accounts.delete");

  useEffect(() => {
    if (userDetails?._id) {
      getWithdrawals();
    }
  }, [userDetails?._id]);

  const cryptoAccounts = useMemo(() => {
    if (!Array.isArray(cryptoWithdrawals)) return [];

    return cryptoWithdrawals
      .flatMap((withdrawal) => {
        const cryptoList = getCryptoList(withdrawal);
        const channelType =
          Array.isArray(withdrawal?.crypto) && withdrawal.crypto.length > 0
            ? "crypto"
            : "crypto_wallet";

        return cryptoList.map((crypto, index) => ({
          ...crypto,
          accountId: `${withdrawal?._id || "crypto"}-${crypto?._id || index}`,
          channelId: crypto?._id,
          channelType,
          cryptoIndex: index,
          currency: "USDT",
          network: normalizeNetwork(crypto?.network, crypto?.wallet_address),
          raw: crypto,
          withdrawal,
          withdrawalId: withdrawal?._id,
        }));
      })
      .filter((item) => item?.wallet_address);
  }, [cryptoWithdrawals]);

  const selectedNetwork = useMemo(() => {
    return NETWORKS.find((item) => item.value === form.network) ?? NETWORKS[0];
  }, [form.network]);

  const formError = useMemo(() => {
    const address = form.wallet_address.trim();

    if (!form.network) return t("Please select a network.");
    if (!address) return t("Wallet address is required.");
    if (!selectedNetwork.validate(address)) return t(selectedNetwork.hint);

    const duplicate = cryptoAccounts.some((account) => {
      const sameAccount =
        editingAccount?.accountId &&
        account.accountId === editingAccount.accountId;
      return (
        !sameAccount &&
        account.wallet_address?.trim()?.toLowerCase() === address.toLowerCase()
      );
    });

    if (duplicate) return t("This crypto receiving account already exists.");

    return "";
  }, [cryptoAccounts, editingAccount, form, selectedNetwork, t]);

  const isFormValid = !formError;

  const closeForm = () => {
    if (isSaving) return;
    setShowForm(false);
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setTouched(false);
  };

  const openAddForm = () => {
    if (cryptoAccounts.length >= 3) {
      toast.error(t("You can add up to 3 crypto receiving accounts."));
      return;
    }

    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setTouched(false);
    setShowForm(true);
  };

  const openEditForm = (account) => {
    setEditingAccount(account);
    setForm({
      currency: "USDT",
      network: normalizeNetwork(account?.network, account?.wallet_address),
      wallet_address: account?.wallet_address ?? "",
    });
    setTouched(false);
    setShowForm(true);
  };

  const buildCryptoPayload = (formValues, existingCrypto = {}) => ({
    ...existingCrypto,
    // service_id: existingCrypto?.service_id ?? CRYPTO_SERVICE_ID,
    currency: "USDT",
    network: formValues.network,
    wallet_address: formValues.wallet_address.trim(),
  });

  const buildWithdrawalPayload = (cryptoList, sourceWithdrawal = null) => {
    const existingAccountTypes = Array.isArray(sourceWithdrawal?.account_type)
      ? sourceWithdrawal.account_type
      : [];
    const accountTypes =
      cryptoList.length > 0
        ? [...new Set([...existingAccountTypes, "crypto"])]
        : existingAccountTypes.filter((item) => item !== "crypto");

    return {
      first_name:
        userDetails?.user?.first_name ?? sourceWithdrawal?.first_name ?? "",
      last_name:
        userDetails?.user?.last_name ?? sourceWithdrawal?.last_name ?? "",
      company_name:
        userDetails?.company_name ?? sourceWithdrawal?.company_name ?? "",
      email: userDetails?.email ?? sourceWithdrawal?.email ?? "",
      phone: userDetails?.phone ?? sourceWithdrawal?.phone ?? "",
      address: userDetails?.address ?? sourceWithdrawal?.address ?? "",
      city: userDetails?.city ?? sourceWithdrawal?.city ?? "",
      country:
        sourceWithdrawal?.country ??
        userDetails?.country?._id ??
        userDetails?.country?.id ??
        userDetails?.country_name ??
        "",
      iso_code:
        sourceWithdrawal?.iso_code ??
        userDetails?.country?.country_iso_code ??
        userDetails?.country_iso_code ??
        "",
      account: userDetails?._id,
      withdrawal_type: userDetails?.account_type,
      account_type: accountTypes,
      extras: sourceWithdrawal?.extras ?? {},
      isUsaBank: sourceWithdrawal?.isUsaBank ?? false,
      relation: sourceWithdrawal?.relation ?? "xyz",
      wallet: sourceWithdrawal?.wallet ?? [],
      vendor: sourceWithdrawal?.vendor ?? "crypto",
      isCrypto: true,
      bank_details: sourceWithdrawal?.bank_details ?? [],
      mobile_wallet: sourceWithdrawal?.mobile_wallet ?? [],
      crypto: cryptoList,
      cash_pickup: sourceWithdrawal?.cash_pickup ?? [],
      card: sourceWithdrawal?.card ?? sourceWithdrawal?.payment_card ?? [],
    };
  };

  const saveAccount = async () => {
    setTouched(true);
    if (!isFormValid) return;

    setIsSaving(true);
    try {
      if (editingAccount?.withdrawalId) {
        const cryptoList = getCryptoList(editingAccount.withdrawal).map(
          (crypto, index) => {
            if (index !== editingAccount.cryptoIndex) return crypto;
            return buildCryptoPayload(form, crypto);
          },
        );
        const data = buildWithdrawalPayload(
          cryptoList,
          editingAccount.withdrawal,
        );
        const encrypted = encryptData(data);

        await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/withdrawal/update-withdrawal/${editingAccount.withdrawalId}`,
          {
            data: encrypted,
          },
          { headers: authHeader },
        );

        toast.success(t("Crypto receiving account updated successfully!"));
      } else {
        const data = buildWithdrawalPayload([buildCryptoPayload(form)], null);
        const encrypted = encryptData(data);

        await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/withdrawal/create-withdrawal`,
          {
            data: encrypted,
          },
          { headers: authHeader },
        );

        toast.success(t("Crypto receiving account added successfully!"));
      }

      getWithdrawals();
      closeForm();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t(
            "We cannot process your request at the moment, please try again later.",
          ),
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (account) => {
    setDeleteTarget(account);
    setShowDelete(true);
  };

  const closeDeleteModal = () => {
    if (isSaving) return;
    setShowDelete(false);
    setDeleteTarget(null);
  };

  const deleteAccount = async () => {
    if (!deleteTarget) return;

    setIsSaving(true);
    try {
      const cryptoList = getCryptoList(deleteTarget.withdrawal);
      const shouldDeleteWholeWithdrawal =
        cryptoList.length <= 1 &&
        !hasOtherWithdrawalChannels(deleteTarget.withdrawal);

      if (shouldDeleteWholeWithdrawal) {
        await axios.delete(
          `${import.meta.env.VITE_IP_DEV_API}/api/withdrawal/delete-withdrawal/${deleteTarget.withdrawalId}`,
          {
            headers: authHeader,
          },
        );
      } else if (deleteTarget.channelId) {
        const data = {
          withdrawalId: deleteTarget.withdrawalId,
          channelId: deleteTarget.channelId,
          channelType: deleteTarget.channelType,
          isCrypto: true,
        };
        const encrypted = encryptData(data);

        await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/withdrawal/delete-channel-withdrawal`,
          {
            data: encrypted,
          },
          { headers: authHeader },
        );
      } else {
        const remainingCrypto = cryptoList.filter(
          (_, index) => index !== deleteTarget.cryptoIndex,
        );
        const data = buildWithdrawalPayload(
          remainingCrypto,
          deleteTarget.withdrawal,
        );
        const encrypted = encryptData(data);

        await axios.post(
          `${import.meta.env.VITE_IP_DEV_API}/api/withdrawal/update-withdrawal/${deleteTarget.withdrawalId}`,
          {
            data: encrypted,
          },
          { headers: authHeader },
        );
      }

      toast.success(t("Crypto receiving account deleted successfully!"));
      getWithdrawals();
      closeDeleteModal();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t(
            "Something went wrong while deleting the crypto receiving account.",
          ),
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{t("Crypto Receiving Accounts")}</h1>
          <p>
            {t(
              "Add up to 3 USDT wallet addresses for supported crypto receiving networks.",
            )}
          </p>
        </div>
        <Button
          className={styles.addButton}
          disabled={!canAdd || cryptoAccounts.length >= 3 || isSaving}
          onClick={openAddForm}
        >
          <Plus size={16} />
          <span>{t("Add New")}</span>
        </Button>
      </div>

      <div className={styles.usage}>
        {cryptoAccounts.length}/3 {t("accounts used")}
      </div>

      {cryptoAccounts.length > 0 ? (
        <div className={styles.grid}>
          {cryptoAccounts.map((account) => (
            <div className={styles.walletCard} key={account.accountId}>
              <div className={styles.walletTop}>
                <div>
                  <span>{t("Currency")}</span>
                  <strong>{t("USDT")}</strong>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    title={t("Edit")}
                    aria-label={t("Edit")}
                    disabled={!canAdd || isSaving}
                    onClick={() => openEditForm(account)}
                  >
                    <Edit2 size={17} />
                  </button>
                  <button
                    type="button"
                    title={t("Delete")}
                    aria-label={t("Delete")}
                    disabled={!canDelete || isSaving}
                    onClick={() => openDeleteModal(account)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <div className={styles.details}>
                <div>
                  <span>{t("Network")}</span>
                  <strong>{account.network}</strong>
                </div>
                <div>
                  <span>{t("Wallet Address")}</span>
                  <strong className={styles.address}>
                    {account.wallet_address}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h4>{t("No crypto receiving accounts added")}</h4>
          <p>
            {t(
              "Add your first USDT wallet to receive crypto withdrawals on TRON, Ethereum, or BNB Smart Chain.",
            )}
          </p>
          <Button
            className={styles.addButton}
            disabled={!canAdd || isSaving}
            onClick={openAddForm}
          >
            <Plus size={16} />
            <span>{t("Add New")}</span>
          </Button>
        </div>
      )}

      <Modal isOpen={showForm} toggle={closeForm} centered>
        <ModalHeader toggle={closeForm}>
          {editingAccount
            ? t("Edit Crypto Receiving Account")
            : t("Add Crypto Receiving Account")}
        </ModalHeader>
        <ModalBody>
          <div className={styles.formGrid}>
            <FormGroup>
              <Label>
                {t("Currency")} <span className="req_star">*</span>
              </Label>
              <Input value={form.currency} disabled readOnly />
            </FormGroup>
            <FormGroup>
              <Label>
                {t("Network")} <span className="req_star">*</span>
              </Label>
              <Input
                type="select"
                value={form.network}
                disabled={isSaving}
                onChange={(event) => {
                  setTouched(false);
                  setForm((prev) => ({
                    ...prev,
                    network: event.target.value,
                    wallet_address: "",
                  }));
                }}
              >
                {NETWORKS.map((network) => (
                  <option key={network.value} value={network.value}>
                    {t(network.value)}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>
          <FormGroup className="mb-0">
            <Label>
              {t("Wallet Address")} <span className="req_star">*</span>
            </Label>
            <Input
              value={form.wallet_address}
              invalid={touched && Boolean(formError)}
              disabled={isSaving}
              onBlur={() => setTouched(true)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  wallet_address: event.target.value,
                }))
              }
              placeholder={
                form.network === "TRC-20 (TRON)"
                  ? "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  : "0x0000000000000000000000000000000000000000"
              }
            />
            <FormFeedback>{formError}</FormFeedback>
            <div className={styles.hint}>{t(selectedNetwork.hint)}</div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <button
            disabled={isSaving}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontWeight: 600,
            }}
            onClick={closeForm}
          >
            <span>{t("Cancel")}</span>
          </button>
          <ButtonForRequests
            isLoading={isSaving || !isFormValid}
            style={{
              padding: "8px 30px",
            }}
            onClick={saveAccount}
          >
            {isSaving ? t("Saving") : t("Save")}
          </ButtonForRequests>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showDelete} toggle={closeDeleteModal} centered>
        <ModalHeader toggle={closeDeleteModal}>
          {t("Delete Crypto Receiving Account")}
        </ModalHeader>
        <ModalBody>
          {t("Are you sure you want to delete this crypto receiving account?")}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            outline
            disabled={isSaving}
            onClick={closeDeleteModal}
          >
            {t("Cancel")}
          </Button>
          <Button color="danger" disabled={isSaving} onClick={deleteAccount}>
            {isSaving ? t("Deleting") : t("Yes, Continue")}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CryptoWithdrawalChannel;
