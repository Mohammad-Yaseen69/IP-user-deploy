import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import useCountryLocation from '../../../hooks/GeneralUse/useCountryLocation'
import permissionsData from "../../../utils/Data/permissionsData.json"
import { apiWrapper } from '../../../utils/Functions/apiWrapper'
import PhoneInput from '../../PhoneInput'
import styles from "../styles/DelegateModal.module.css"
import PermissionTree from './PermissionTree'

const DelegateModal = ({ isRole, isOpen, onClose, t, width, agents, isEdit }) => {

    const { country } = useCountryLocation()
    const [permSearch, setPermSearch] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState(isEdit ? agents?.permissions || [] : [])

    const [deniedPermissions, setDeniedPermissions] = useState([])
    const isWildcardParent = (pk) => pk && selectedPermissions.includes(`${pk}.*`);
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        title: "",
        description: "",
        phone: ""
    })
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

    useEffect(() => {
        if (!isOpen) reset()
    }, [isOpen])

    const groupPermissions = (data) => {
        const hierarchy = {};
        data.forEach(item => {
            if (!hierarchy[item.module]) {
                hierarchy[item.module] = { module: item.module, features: {} };
            }
            const featureKey = item.feature || "general";
            if (!hierarchy[item.module].features[featureKey]) {
                hierarchy[item.module].features[featureKey] = { feature: item.feature, actions: [] };
            }
            hierarchy[item.module].features[featureKey].actions.push(item);
        });
        return Object.values(hierarchy).map(m => ({
            ...m,
            features: Object.values(m.features)
        }));
    };
    const isIndeterminate = (key, type = "module") => {
        if (type === "module" || type === "feature") {
            if (selectedPermissions.includes(`${key}.*`)) return false;
            return selectedPermissions.some(p => p.startsWith(`${key}.`)) || deniedPermissions.some(p => p.startsWith(`${key}.`));
        }
        return false;
    };

    const togglePermission = (key, parentKey = null, type = "action") => {
        let newPerms = [...selectedPermissions];
        let newDenied = [...deniedPermissions];

        if (type === "module") {
            const wildcardKey = `${key}.*`;
            if (newPerms.includes(wildcardKey)) {
                newPerms = newPerms.filter(p => !p.startsWith(`${key}.`));
                newDenied = newDenied.filter(p => !p.startsWith(`${key}.`));
            } else {
                newPerms = newPerms.filter(p => !p.startsWith(`${key}.`));
                newDenied = newDenied.filter(p => !p.startsWith(`${key}.`));
                newPerms.push(wildcardKey);
            }
        } else if (type === "feature") {
            const featureWildcard = key === "general" ? null : `${key}.*`;
            const moduleKey = parentKey;
            const isUnderWildcard = isWildcardParent(moduleKey);

            if (featureWildcard) {
                if (newPerms.includes(featureWildcard)) {
                    newPerms = newPerms.filter(p => p !== featureWildcard && !p.startsWith(`${key}.`));
                    newDenied = newDenied.filter(p => !p.startsWith(`${key}.`));
                } else if (isUnderWildcard) {
                    if (newDenied.includes(featureWildcard)) {
                        newDenied = newDenied.filter(p => !p.startsWith(`${key}.`));
                    } else {
                        newDenied.push(featureWildcard);
                        newPerms = newPerms.filter(p => !p.startsWith(`${key}.`));
                    }
                } else {
                    newPerms.push(featureWildcard);
                }
            } else {
                const generalActions = processedPermissions.find(m => m.module === moduleKey)?.features.find(f => !f.feature)?.actions.map(a => a.key) || [];
                const allSelected = generalActions.every(ak => isSelected(ak, "action"));

                if (allSelected) {
                    newPerms = newPerms.filter(p => !generalActions.includes(p));
                    if (isUnderWildcard) {
                        generalActions.forEach(ak => {
                            if (!newDenied.includes(ak)) newDenied.push(ak);
                        });
                    }
                } else {
                    generalActions.forEach(ak => {
                        if (!newPerms.includes(ak)) newPerms.push(ak);
                        newDenied = newDenied.filter(dk => dk !== ak);
                    });
                }
            }
        } else {
            if (newPerms.includes(key)) {
                newPerms = newPerms.filter(p => p !== key);
            } else if (deniedPermissions.includes(key)) {
                newDenied = newDenied.filter(p => p !== key);
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
    const { mutate: createRole, isPending } = useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/business-agents/roles",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true
            }),

        onSuccess: (res) => {
            console.log(res)
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            onClose()
        },

        onError: (err) => {
            console.error("Error:", err)
        }
    })
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const onSubmit = (e) => {
        e.preventDefault()
        console.log(e)
        const payload = {
            title: form.title,
            description: form.description,
            permissions: selectedPermissions,
            deniedPermissions
        }

        createRole(payload)
    }



    return (
        <Modal isOpen={isOpen} toggle={onClose} style={{ maxWidth: width > 800 ? "700px" : "95%" }} centered>

            <ModalHeader toggle={onClose}>
                {t("Add New")} {isRole ? t("Role") : t("Agent")}
            </ModalHeader>

            <ModalBody>

                <form onSubmit={onSubmit}>

                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter Title"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <input
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter Description"
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

                    <button type="submit" className={styles.submitBtn}>
                        {isPending ? "Creating..." : "Add Role"}
                    </button>

                </form>

            </ModalBody>
        </Modal>
    )
}



export default DelegateModal