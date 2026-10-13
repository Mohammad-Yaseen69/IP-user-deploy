import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Spinner, Button } from "reactstrap";
import {
  CheckCircle,
  XCircle,
  X,
  ChevronRight,
  Plus,
  User,
  Settings,
  CheckSquare,
  HelpCircle,
  ChevronsLeft,
} from "react-feather";
import permissionsData from "../../../utils/Data/permissionsData.json";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import styles from "../styles/DelegateModal.module.css";
import PermissionTree from "./PermissionTree";
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption";
import { FaUserCircle } from "react-icons/fa";
import { BsVinyl } from "react-icons/bs";
import { preventEdgeSpaces } from "../../../hooks/useTrimInput";
const STEPS = [
  { id: 1, label: "Role Details", icon: <BsVinyl size={14} /> },
  { id: 2, label: "Permissions", icon: <Settings size={14} /> },
  { id: 3, label: "Review", icon: <CheckSquare size={14} /> },
];

const RoleModal = ({ isRole, isOpen, onClose, t, width, isEdit, editData }) => {
  const [permSearch, setPermSearch] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(
    isEdit && editData ? editData.permissions || [] : [],
  );
  const [deniedPermissions, setDeniedPermissions] = useState(
    isEdit && editData ? editData.deniedPermissions || [] : [],
  );
  const [status, setStatus] = useState({ type: null, message: "" });
  const [step, setStep] = useState(1);

  const isWildcardParent = (pk) => pk && selectedPermissions.includes(`${pk}.*`);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: isEdit && editData ? editData.title || "" : "",
    description: isEdit && editData ? editData.description || "" : "",
  });

  const isSelected = (key, type = "action") => {
    if (type === "module") return selectedPermissions.includes(`${key}.*`);
    if (type === "feature") {
      if (key === "general") return false;
      const mod = key.split(".")[0];
      return (
        selectedPermissions.includes(`${key}.*`) ||
        (selectedPermissions.includes(`${mod}.*`) && !deniedPermissions.includes(`${key}.*`))
      );
    }

    const parts = key.split(".");
    const mod = parts[0];
    const feat = parts.length === 3 ? parts[1] : null;

    const underModWildcard = selectedPermissions.includes(`${mod}.*`);
    const underFeatWildcard = feat && selectedPermissions.includes(`${mod}.${feat}.*`);

    if (underModWildcard) {
      if (feat && deniedPermissions.includes(`${mod}.${feat}.*`)) return false;
      return !deniedPermissions.includes(key);
    }
    if (underFeatWildcard) return !deniedPermissions.includes(key);

    return selectedPermissions.includes(key);
  };

  const groupPermissions = (data) => {
    const hierarchy = {};
    data.forEach((item) => {
      if (!hierarchy[item.module]) {
        hierarchy[item.module] = { module: item.module, features: {} };
      }
      const featureKey = item.feature || "general";
      if (!hierarchy[item.module].features[featureKey]) {
        hierarchy[item.module].features[featureKey] = {
          feature: item.feature,
          actions: [],
        };
      }
      hierarchy[item.module].features[featureKey].actions.push(item);
    });
    return Object.values(hierarchy).map((m) => ({
      ...m,
      features: Object.values(m.features),
    }));
  };

  const isIndeterminate = (key, type = "module") => {
    if (type === "module" || type === "feature") {
      if (selectedPermissions.includes(`${key}.*`)) return false;
      return (
        selectedPermissions.some((p) => p.startsWith(`${key}.`)) ||
        deniedPermissions.some((p) => p.startsWith(`${key}.`))
      );
    }
    return false;
  };

  const togglePermission = (key, parentKey = null, type = "action") => {
    let newPerms = [...selectedPermissions];
    let newDenied = [...deniedPermissions];

    if (type === "module") {
      const wildcardKey = `${key}.*`;
      if (newPerms.includes(wildcardKey)) {
        newPerms = newPerms.filter((p) => !p.startsWith(`${key}.`));
        newDenied = newDenied.filter((p) => !p.startsWith(`${key}.`));
        if (isEdit) {
          newDenied.push(wildcardKey);
        }
      } else {
        newPerms = newPerms.filter((p) => !p.startsWith(`${key}.`));
        newDenied = newDenied.filter((p) => !p.startsWith(`${key}.`));
        newPerms.push(wildcardKey);
      }
    } else if (type === "feature") {
      const featureWildcard = key === "general" ? null : `${key}.*`;
      const moduleKey = parentKey;
      const isUnderWildcard = isWildcardParent(moduleKey);

      if (featureWildcard) {
        if (newPerms.includes(featureWildcard)) {
          newPerms = newPerms.filter((p) => p !== featureWildcard && !p.startsWith(`${key}.`));
          newDenied = newDenied.filter((p) => !p.startsWith(`${key}.`));
        } else if (isUnderWildcard) {
          if (newDenied.includes(featureWildcard)) {
            newDenied = newDenied.filter((p) => !p.startsWith(`${key}.`));
          } else {
            newDenied.push(featureWildcard);
            newPerms = newPerms.filter((p) => !p.startsWith(`${key}.`));
          }
        } else {
          newPerms.push(featureWildcard);
        }
      } else {
        const generalActions =
          processedPermissions
            .find((m) => m.module === moduleKey)
            ?.features.find((f) => !f.feature)
            ?.actions.map((a) => a.key) || [];
        const allSelected = generalActions.every((ak) => isSelected(ak, "action"));

        if (allSelected) {
          newPerms = newPerms.filter((p) => !generalActions.includes(p));
          if (isUnderWildcard) {
            generalActions.forEach((ak) => {
              if (!newDenied.includes(ak)) newDenied.push(ak);
            });
          }
        } else {
          generalActions.forEach((ak) => {
            if (!newPerms.includes(ak)) newPerms.push(ak);
            newDenied = newDenied.filter((dk) => dk !== ak);
          });
        }
      }
    } else {
      if (newPerms.includes(key)) {
        newPerms = newPerms.filter((p) => p !== key);
      } else if (newDenied.includes(key)) {
        newDenied = newDenied.filter((p) => p !== key);
      } else {
        const parts = key.split(".");
        const mod = parts[0];
        const feat = parts.length === 3 ? parts[1] : null;

        if (isWildcardParent(mod) || (feat && newPerms.includes(`${mod}.${feat}.*`))) {
          newDenied.push(key);
        } else {
          newPerms.push(key);
        }
      }
    }

    setSelectedPermissions(newPerms);
    setDeniedPermissions(newDenied);
  };

  const processedPermissions = groupPermissions(permissionsData);

  const { mutate: createRole, isPending: isCreating } = useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: "/api/business-agents/roles",
        method: "POST",
        payload,
        isEncrypted: true,
        isDecrypted: true,
      }),
    onMutate: () => setStatus({ type: "loading", message: t("Creating role...") }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setStatus({
        type: "success",
        message: res?.message || t("Role created successfully"),
      });
    },
    onError: (err) => {
      let errorMsg = t("Failed to create agent");
      if (err?.response?.data?.data) {
        try {
          const decrypted = decryptData(err.response.data.data);
          errorMsg = decrypted?.message || errorMsg;
        } catch (e) {
          console.error("Decryption failed", e);
        }
      } else {
        errorMsg =
          err?.response?.data?.message || err?.response?.data?.error || err?.message || errorMsg;
      }
      setStatus({ type: "error", message: errorMsg });
    },
  });

  const { mutate: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: (payload) =>
      apiWrapper({
        endpoint: `/api/business-agents/roles/${editData?._id}`,
        method: "PUT",
        payload,
        isEncrypted: true,
        isDecrypted: true,
      }),
    onMutate: () => setStatus({ type: "loading", message: t("Updating role...") }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setStatus({
        type: "success",
        message: res?.message || t("Role updated successfully"),
      });
    },
    onError: (err) => {
      let errorMsg = t("Failed to create agent");
      if (err?.response?.data?.data) {
        try {
          const decrypted = decryptData(err.response.data.data);
          errorMsg = decrypted?.message || errorMsg;
        } catch (e) {
          console.error("Decryption failed", e);
        }
      } else {
        errorMsg =
          err?.response?.data?.message || err?.response?.data?.error || err?.message || errorMsg;
      }
      setStatus({ type: "error", message: errorMsg });
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    if (e) e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      permissions: selectedPermissions,
      deniedPermissions,
    };

    if (isEdit) {
      updateRole(payload);
    } else {
      createRole(payload);
    }
  };

  const renderStatusContent = () => {
    if (status.type === "loading") {
      return (
        <div className="text-center p-5">
          <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="mt-3">{status.message}</h5>
        </div>
      );
    }
    if (status.type === "success") {
      return (
        <div className="text-center p-5">
          <CheckCircle size={60} color="#27ae60" />
          <h5 className="mt-3 text-success">{t("Success!")}</h5>
          <p className="text-muted">{status.message}</p>
          <Button color="success" className="mt-3 px-5" onClick={onClose}>
            {t("Done")}
          </Button>
        </div>
      );
    }
    if (status.type === "error") {
      return (
        <div className="text-center p-5">
          <XCircle size={60} color="#e74c3c" />
          <h5 className="mt-3 text-danger">{t("Error!")}</h5>
          <p className="text-muted">{status.message}</p>
          <Button
            color="danger"
            className="mt-3 px-5"
            onClick={() => setStatus({ type: null, message: "" })}
          >
            {t("Try Again")}
          </Button>
        </div>
      );
    }
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.title || !form.description) return;
    }
    if (step < 3) setStep((s) => s + 1);
    else onSubmit();
  };
  if (!isOpen) return null;
  const isStepOneInvalid = !form.title || !form.description;

  const isStepTwoInvalid = selectedPermissions.length === 0;

  const isNextDisabled =
    (step === 1 && isStepOneInvalid) ||
    (step === 2 && isStepTwoInvalid) ||
    isCreating ||
    isUpdating;
  return isEdit ? (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      style={{ maxWidth: width > 800 ? "700px" : "95%" }}
      centered
    >
      <ModalHeader toggle={onClose} className="border-0 pb-0">
        {!status.type && "Edit Role"}
      </ModalHeader>

      <ModalBody>
        {status.type ? (
          renderStatusContent()
        ) : (
          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label>{t("Title")}</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder={t("Enter Title")}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t("Description")}</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={t("Enter Description")}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <PermissionTree
                processedPermissions={processedPermissions}
                permSearch={permSearch}
                setPermSearch={setPermSearch}
                isSelected={isSelected}
                isIndeterminate={isIndeterminate}
                togglePermission={togglePermission}
                isSuperAdmin={false}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="light" onClick={onClose} type="button">
                {t("Cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-4"
              >
                {t("Update Role")}
              </Button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  ) : (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {status.type === "loading" && (
          <div className={styles.statusScreen}>
            <Spinner style={{ width: "3rem", height: "3rem", color: "#5626e6" }} />
            <p className={styles.statusMsg}>{status.message}</p>
          </div>
        )}

        {status.type === "success" && (
          <div className={styles.statusScreen}>
            <CheckCircle size={64} color="#22c55e" />
            <h3 className={styles.statusTitle}>{t("Success!")}</h3>
            <p className={styles.statusMsg}>{status.message}</p>
            <button className={styles.btnDone} onClick={onClose}>
              {t("Done")}
            </button>
          </div>
        )}

        {status.type === "error" && (
          <div className={styles.statusScreen}>
            <XCircle size={64} color="#ef4444" />
            <h3 className={styles.statusTitle}>{t("Error!")}</h3>
            <p className={styles.statusMsg}>{status.message}</p>
            <button
              className={styles.btnNext}
              onClick={() => setStatus({ type: null, message: "" })}
            >
              {t("Try Again")}
            </button>
          </div>
        )}

        {!status.type && (
          <>
            <div className={styles.modalBody}>
              <div className={styles.sidebar}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>
                    <div>
                      <FaUserCircle color="#fff" />
                    </div>{" "}
                    {t("Add Role")}
                  </h2>
                </div>
                <div className={styles.stepsWrapper}>
                  {STEPS.map((st, idx) => {
                    const isDone = step > st.id;
                    const isActive = step === st.id;
                    return (
                      <div key={st.id} className={styles.stepItem} style={{ position: "relative" }}>
                        {idx < STEPS.length - 1 && (
                          <div
                            style={{
                              position: "absolute",
                              left: 22,
                              top: "100%",
                              width: 2,
                              height: 12,
                              background: isDone ? "#5626e6" : "#e0e0e0",
                              zIndex: 0,
                            }}
                          />
                        )}
                        <div
                          className={`${styles.stepIcon} ${isActive ? styles.active : ""} ${isDone ? styles.done : ""}`}
                        >
                          {isDone ? <CheckCircle size={14} /> : st.icon}
                        </div>
                        <span
                          className={`${styles.stepLabel} ${isActive ? styles.active : ""} ${isDone ? styles.done : ""}`}
                        >
                          <p>
                            {t("STEP")}
                            {st.id}
                          </p>
                          {t(st.label)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.stepContainer}>
                <div className={styles.stepContent}>
                  {step === 1 && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{t("Title")}</label>
                        <input
                          className={styles.formInput}
                          onKeyDown={preventEdgeSpaces}
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder={t("Enter Title")}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{t("Description")}</label>
                        <textarea
                          style={{
                            height: "120px",
                            padding: "12px",
                          }}
                          className={styles.formInput}
                          name="description"
                          value={form.description}
                          onKeyDown={preventEdgeSpaces}
                          onChange={handleChange}
                          placeholder={t("Enter Description")}
                          required
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className={styles.formGroup}>
                        <div className={styles.permTreeWrapper}>
                          <PermissionTree
                            processedPermissions={processedPermissions}
                            permSearch={permSearch}
                            setPermSearch={setPermSearch}
                            isSelected={isSelected}
                            isIndeterminate={isIndeterminate}
                            togglePermission={togglePermission}
                            isSuperAdmin={false}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className={styles.reviewCard} style={{ marginBottom: 12 }}>
                        <div className={styles.reviewRow}>
                          <span className={styles.reviewRowKey}>{t("Title")}</span>
                          <span className={styles.reviewRowVal}>{form.title} </span>
                        </div>

                        <div className={styles.reviewRow}>
                          <span className={styles.reviewRowKey}>{t("Description")}</span>
                          <span className={styles.reviewRowVal}>{form.description}</span>
                        </div>
                      </div>
                      <div className={styles.permTreeWrapper}>
                        <PermissionTree
                          processedPermissions={processedPermissions}
                          permSearch={permSearch}
                          setPermSearch={setPermSearch}
                          isSelected={isSelected}
                          isIndeterminate={isIndeterminate}
                          togglePermission={togglePermission}
                          isSuperAdmin={false}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div
                className={styles.footerLeft}
                onClick={() => {
                  window.open("https://www.insta-pay.ch/contact-us", "_blank");
                }}
              >
                <span>
                  <HelpCircle />
                </span>
                <div>
                  <p>{t("Having Troubles?")}</p>
                  <h2>{t("Contact Us")}</h2>
                </div>
              </div>
              <div className={styles.footerRight}>
                <button className={styles.btnCancel} onClick={onClose} type="button">
                  {t("Cancel")}
                </button>
                <div>
                  {step > 1 && (
                    <button
                      className={styles.btnBack}
                      onClick={() => setStep((p) => p - 1)}
                      type="button"
                    >
                      {" "}
                      {t("Back")}
                    </button>
                  )}
                  <button
                    className={styles.btnNext}
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    type="button"
                  >
                    {step === 3 ? (
                      isCreating || isUpdating ? (
                        <>
                          <Spinner size="sm" /> {t("Saving...")}
                        </>
                      ) : isEdit ? (
                        t("Update")
                      ) : (
                        t("Create role")
                      )
                    ) : (
                      t("Next")
                    )}{" "}
                    {step < 3 ? <ChevronRight /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleModal;
