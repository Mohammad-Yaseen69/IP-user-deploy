import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from 'react'
import { CheckCircle, CheckSquare, ChevronRight, ChevronsLeft, Eye, HelpCircle, Layers, Plus, Settings, User, XCircle } from "react-feather"
import { decryptData } from "../../../Helper/EssentilaMethods/Decryption"
import useCountryLocation from '../../../hooks/GeneralUse/useCountryLocation'
import permissionsData from "../../../utils/Data/permissionsData.json"
import { apiWrapper } from '../../../utils/Functions/apiWrapper'
import PhoneInput from '../../PhoneInput'
import userFour from "../images/UsersFour.svg"
import s from "../styles/AgentsModal.module.css"
import PermissionTree from './PermissionTree'
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'

const STEPS = [
    { id: 1, label: "Profile", icon: <User size={14} /> },
    { id: 2, label: "Permissions", icon: <Settings size={14} /> },
    { id: 3, label: "Review", icon: <CheckSquare size={14} /> },
]

const AgentsModal = ({ isRole, isOpen, onClose, t, width, roles, isEdit, editData }) => {
    const { country } = useCountryLocation()
    const [step, setStep] = useState(1)
    const [permSearch, setPermSearch] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState(isEdit && editData ? editData.permissions || [] : [])
    const [phone, setPhone] = useState(isEdit && editData ? editData.phone || "" : "")
    const [phoneError, setPhoneError] = useState("")
    const [deniedPermissions, setDeniedPermissions] = useState(isEdit && editData ? editData.deniedPermissions || [] : [])
    const [status, setStatus] = useState({ type: null, message: "" })
    const isWildcardParent = (pk) => pk && selectedPermissions.includes(`${pk}.*`)
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        first_name: isEdit && editData ? editData?.first_name || "" : "",
        last_name: isEdit && editData ? editData?.last_name || "" : "",
        email: isEdit && editData ? editData?.email || "" : "",
        role: isEdit && editData ? editData?.role?._id || "" : "",
    })

    const isSuperAdmin = selectedPermissions.includes("*")

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (name === "role" && value) {
            const selectedRole = roles?.find(r => r._id === value)
            if (selectedRole) {
                setSelectedPermissions(selectedRole.permissions || [])
                setDeniedPermissions(selectedRole.deniedPermissions || [])
            }
        }
        if (name === "role" && !value) {
            setSelectedPermissions([])
            setDeniedPermissions([])
        }
    }

    const isSelected = (key, type = "action") => {
        if (isSuperAdmin) return true
        if (type === "module") return selectedPermissions.includes(`${key}.*`)
        if (type === "feature") {
            if (key === "general") return false
            const mod = key.split(".")[0]
            return (
                selectedPermissions.includes(`${key}.*`) ||
                (selectedPermissions.includes(`${mod}.*`) && !deniedPermissions.includes(`${key}.*`))
            )
        }
        const parts = key.split(".")
        const mod = parts[0]
        const feat = parts.length === 3 ? parts[1] : null
        const underModWildcard = selectedPermissions.includes(`${mod}.*`)
        const underFeatWildcard = feat && selectedPermissions.includes(`${mod}.${feat}.*`)
        if (underModWildcard) {
            if (feat && deniedPermissions.includes(`${mod}.${feat}.*`)) return false
            return !deniedPermissions.includes(key)
        }
        if (underFeatWildcard) return !deniedPermissions.includes(key)
        return selectedPermissions.includes(key)
    }

    const groupPermissions = (data) => {
        const hierarchy = {}
        data.forEach(item => {
            if (!hierarchy[item.module]) hierarchy[item.module] = { module: item.module, features: {} }
            const featureKey = item.feature || "general"
            if (!hierarchy[item.module].features[featureKey])
                hierarchy[item.module].features[featureKey] = { feature: item.feature, actions: [] }
            hierarchy[item.module].features[featureKey].actions.push(item)
        })
        return Object.values(hierarchy).map(m => ({ ...m, features: Object.values(m.features) }))
    }

    const isIndeterminate = (key, type = "module") => {
        if (isSuperAdmin) return false
        if (type === "module" || type === "feature") {
            if (selectedPermissions.includes(`${key}.*`)) return false
            return selectedPermissions.some(p => p.startsWith(`${key}.`)) || deniedPermissions.some(p => p.startsWith(`${key}.`))
        }
        return false
    }

    const togglePermission = (key, parentKey = null, type = "action") => {

        if (isSuperAdmin) return
        let newPerms = [...selectedPermissions]
        let newDenied = [...deniedPermissions]
        if (type === "module") {
            const wildcardKey = `${key}.*`
            if (newPerms.includes(wildcardKey)) {
                newPerms = newPerms.filter(p => !p.startsWith(`${key}.`))
                newDenied = newDenied.filter(p => !p.startsWith(`${key}.`))
            } else {
                newPerms = newPerms.filter(p => !p.startsWith(`${key}.`))
                newDenied = newDenied.filter(p => !p.startsWith(`${key}.`))
                newPerms.push(wildcardKey)
            }
        } else if (type === "feature") {
            const featureWildcard = key === "general" ? null : `${key}.*`
            const moduleKey = parentKey
            const isUnderWildcard = isWildcardParent(moduleKey)
            if (featureWildcard) {
                if (newPerms.includes(featureWildcard)) {
                    newPerms = newPerms.filter(p => p !== featureWildcard && !p.startsWith(`${key}.`))
                    newDenied = newDenied.filter(p => !p.startsWith(`${key}.`))
                } else if (isUnderWildcard) {
                    if (newDenied.includes(featureWildcard)) {
                        newDenied = newDenied.filter(p => !p.startsWith(`${key}.`))
                    } else {
                        newDenied.push(featureWildcard)
                        newPerms = newPerms.filter(p => !p.startsWith(`${key}.`))
                    }
                } else {
                    newPerms.push(featureWildcard)
                }
            } else {
                const generalActions = processedPermissions.find(m => m.module === moduleKey)?.features.find(f => !f.feature)?.actions.map(a => a.key) || []
                const allSelected = generalActions.every(ak => isSelected(ak, "action"))
                if (allSelected) {
                    newPerms = newPerms.filter(p => !generalActions.includes(p))
                    if (isUnderWildcard) generalActions.forEach(ak => { if (!newDenied.includes(ak)) newDenied.push(ak) })
                } else {
                    generalActions.forEach(ak => {
                        if (!newPerms.includes(ak)) newPerms.push(ak)
                        newDenied = newDenied.filter(dk => dk !== ak)
                    })
                }
            }
        } else {
            if (newPerms.includes(key)) {
                newPerms = newPerms.filter(p => p !== key)
            } else if (deniedPermissions.includes(key)) {
                newDenied = newDenied.filter(p => p !== key)
                newPerms = newPerms.filter(p => p !== key);
            } else if (newDenied.includes(key)) {
                newDenied = newDenied.filter(p => p !== key);
            } else {
                const parts = key.split(".")
                const mod = parts[0]
                const feat = parts.length === 3 ? parts[1] : null
                if (isWildcardParent(mod) || (feat && newPerms.includes(`${mod}.${feat}.*`))) {
                    newDenied.push(key)
                } else {
                    newPerms.push(key)
                }
            }
        }
        setSelectedPermissions(newPerms)
        setDeniedPermissions(newDenied)
    }

    const processedPermissions = groupPermissions(permissionsData)

    const { mutate: createAgent, isPending: isCreating } = useMutation({
        mutationFn: (payload) => apiWrapper({ endpoint: "/api/business-agents/agents", method: "POST", payload, isEncrypted: true, isDecrypted: true }),
        onMutate: () => setStatus({ type: 'loading', message: t("Creating agent...") }),
        onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ["agents"] }); setStatus({ type: 'success', message: res?.message || t("Agent created successfully") }) },
        onError: (err) => {
            let errorMsg = t("Failed to create agent")
            if (err?.response?.data?.data) { try { const d = decryptData(err.response.data.data); errorMsg = d?.message || errorMsg } catch (e) { console.error("Decryption failed", e) } }
            else errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || errorMsg
            setStatus({ type: 'error', message: errorMsg })
        }
    })

    const { mutate: updateAgent, isPending: isUpdating } = useMutation({
        mutationFn: (payload) => apiWrapper({ endpoint: `/api/business-agents/agents/${editData?._id}`, method: "PUT", payload, isEncrypted: true, isDecrypted: true }),
        onMutate: () => setStatus({ type: 'loading', message: t("Updating agent...") }),
        onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ["agents"] }); setStatus({ type: 'success', message: res?.message || t("Agent updated successfully") }) },
        onError: (err) => {
            let errorMsg = t("Failed to update agent")
            if (err?.response?.data?.data) { try { const d = decryptData(err.response.data.data); errorMsg = d?.message || errorMsg } catch (e) { console.error("Decryption failed", e) } }
            else errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || errorMsg
            setStatus({ type: 'error', message: errorMsg })
        }
    })

    const onSubmit = (e) => {
        e?.preventDefault()
        if (!isEdit && !phone) {
            setPhoneError("Phone is required")
            return
        }

        const payload = isEdit
            ? {
                first_name: form.first_name,
                last_name: form.last_name,
                permissions: selectedPermissions,
                deniedPermissions,
                ...(form.role ? { role: form.role } : {}),
            }
            : {
                phone,
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name,
                permissions: selectedPermissions,
                deniedPermissions,
                ...(form.role ? { role: form.role } : {}),
            };

        if (isEdit) {
            updateAgent(payload)
        } else {
            createAgent(payload)
        }
    }

    const handleNext = () => {
        if (step === 1) {
            if (!form.first_name || !form.last_name) return
            if (!isEdit && !phone) { setPhoneError("Phone is required"); return }
        }
        if (step < 3) setStep(s => s + 1)
        else onSubmit()
    }

    const selectedRoleObj = roles?.find(r => r._id === form.role)

    if (!isOpen) return null
    const isStepOneInvalid =
        !form.first_name ||
        !form.last_name ||
        (!isEdit && (!phone || phoneError)) ||
        !form.email

    const isStepTwoInvalid =
        selectedPermissions.length === 0

    const isNextDisabled =
        (step === 1 && isStepOneInvalid) ||
        (step === 2 && isStepTwoInvalid) ||
        isCreating ||
        isUpdating
    const renderStatusContent = () => {
        if (status.type === 'loading') {
            return (
                <div className="text-center p-5">
                    <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                    <h5 className="mt-3">{status.message}</h5>
                </div>
            );
        }
        if (status.type === 'success') {
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
        if (status.type === 'error') {
            return (
                <div className="text-center p-5">
                    <XCircle size={60} color="#e74c3c" />
                    <h5 className="mt-3 text-danger">{t("Error!")}</h5>
                    <p className="text-muted">{status.message}</p>
                    <Button color="danger" className="mt-3 px-5" onClick={() => setStatus({ type: null, message: "" })}>
                        {t("Try Again")}
                    </Button>
                </div>
            );
        }
        return null;
    };

    return (
        isEdit ?
            <Modal isOpen={isOpen} toggle={onClose} style={{ maxWidth: width > 800 ? "700px" : "95%" }
            } centered >
                <ModalHeader toggle={onClose} className="border-0 pb-0">
                    {!status.type && t("Edit Agent")}
                </ModalHeader>

                <ModalBody>
                    {status.type ? renderStatusContent() : (
                        <form onSubmit={onSubmit}>
                            <div className={s.formGroup}>
                                <label>{t("First Name")}</label>
                                <input
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    placeholder={t("First Name")}
                                    required
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label>{t("Last Name")}</label>
                                <input
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    placeholder={t("Last Name")}
                                    required
                                />
                            </div>

                            <div className={s.formGroup}>
                                <label>{t("Role")}</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="">{t("Select Role")}</option>
                                    {roles?.map((item) => (
                                        <option key={item?._id} value={item?._id}>
                                            {item?.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={s.formGroup}>
                                <PermissionTree
                                    processedPermissions={processedPermissions}
                                    permSearch={permSearch}
                                    setPermSearch={setPermSearch}
                                    isSelected={isSelected}
                                    isIndeterminate={isIndeterminate}
                                    togglePermission={togglePermission}
                                    isSuperAdmin={isSuperAdmin}
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button color="light" onClick={onClose} type="button">
                                    {t("Cancel")}
                                </Button>
                                <Button color="primary" type="submit" disabled={isCreating || isUpdating} className="px-4">
                                    {isEdit ? t("Update Agent") : t("Add Agent")}
                                </Button>
                            </div>
                        </form>
                    )}
                </ModalBody>
            </Modal > : <div className={s.overlay} onClick={onClose}>
                <div className={s.modal} onClick={e => e.stopPropagation()}>



                    {status.type === 'loading' && (
                        <div className={s.statusScreen}>
                            <Spinner style={{ width: '3rem', height: '3rem', color: '#5626e6' }} />
                            <p className={s.statusMsg}>{status.message}</p>
                        </div>
                    )}

                    {status.type === 'success' && (
                        <div className={s.statusScreen}>
                            <CheckCircle size={64} color="#22c55e" />
                            <h3 className={s.statusTitle}>{t("Success!")}</h3>
                            <p className={s.statusMsg}>{status.message}</p>
                            <button className={s.btnDone} onClick={onClose}>{t("Done")}</button>
                        </div>
                    )}

                    {status.type === 'error' && (
                        <div className={s.statusScreen}>
                            <XCircle size={64} color="#ef4444" />
                            <h3 className={s.statusTitle}>{t("Error!")}</h3>
                            <p className={s.statusMsg}>{status.message}</p>
                            <button className={s.btnNext} onClick={() => setStatus({ type: null, message: "" })}>{t("Try Again")}</button>
                        </div>
                    )}

                    {!status.type && (
                        <>
                            <div className={s.modalBody}>

                                <div className={s.sidebar}>
                                    <div className={s.modalHeader}>
                                        <h2 className={s.modalTitle}><div><img src={userFour} width={20} height={20} loading="lazy" alt="" /></div> {isEdit ? t("Edit Agent") : t("Add Agent")}</h2>
                                    </div>
                                    <div className={s.stepsWrapper}>
                                        {STEPS.map((st, idx) => {
                                            const isDone = step > st.id
                                            const isActive = step === st.id
                                            return (
                                                <div key={st.id} className={s.stepItem} style={{ position: 'relative' }}>
                                                    {idx < STEPS.length - 1 && (
                                                        <div style={{ position: 'absolute', left: 22, top: '100%', width: 2, height: 12, background: isDone ? '#5626e6' : '#e0e0e0', zIndex: 0 }} />
                                                    )}
                                                    <div
                                                        className={`${s.stepIcon} ${isActive ? s.active : ''} ${isDone ? s.done : ''}`}
                                                    >
                                                        {isDone ? <CheckCircle size={14} /> : st.icon}
                                                    </div>
                                                    <span className={`${s.stepLabel} ${isActive ? s.active : ''} ${isDone ? s.done : ''}`}>
                                                        <p>{t("STEP")}{st.id}</p>
                                                        {t(st.label)}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className={s.stepContainer}>
                                    <div className={s.stepContent}>

                                        {step === 1 && (
                                            <>
                                                <div className={s.nameInput}>
                                                    <div className={s.formGroup}>
                                                        <label className={s.formLabel}>{t("First Name")}</label>
                                                        <input className={s.formInput} name="first_name" value={form.first_name} onChange={handleChange} placeholder={t("Enter first name")} required />
                                                    </div>
                                                    <div className={s.formGroup}>
                                                        <label className={s.formLabel}>{t("Last Name")}</label>
                                                        <input className={s.formInput} name="last_name" value={form.last_name} onChange={handleChange} placeholder={t("Enter last name")} required />
                                                    </div>
                                                </div>
                                                <div className={s.formGroup}>
                                                    <label className={s.formLabel}>{t("Phone Number")}</label>
                                                    <PhoneInput
                                                        country={isEdit && editData?.country ? editData.country : country}
                                                        phone={phone}
                                                        setPhone={setPhone}
                                                        error={phoneError}
                                                        setError={setPhoneError}
                                                        disabled={isEdit}
                                                        customStyles={{
                                                            width: '100%',
                                                            padding: '13px 14px',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            borderRadius: "6px",
                                                            color: '#1a1a1a',
                                                            outline: 'none',
                                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                                            appearance: 'none',
                                                            border: '1px solid var(--Greyscale-25, #E4E3E5)',
                                                            background: 'var(--Greyscale-0, #FFF)',
                                                            boxShadow: '0 1px 1.5px 0 rgba(44, 54, 53, 0.03)',
                                                        }}
                                                    />
                                                </div>
                                                <div className={s.formGroup}>
                                                    <label className={s.formLabel}>{t("Email")}</label>
                                                    <input className={s.formInput} name="email" type="email" value={form.email} onChange={handleChange} placeholder={t("Enter email address")} required={!isEdit} disabled={isEdit} />
                                                </div>
                                            </>
                                        )}

                                        {step === 2 && (
                                            <>
                                                <div className={s.formGroup}>
                                                    <label className={s.formLabel}>{t("Role")}</label>
                                                    <select className={s.formSelect} name="role" value={form.role} onChange={handleChange}>
                                                        <option value="">{t("Select Role")}</option>
                                                        {roles?.map((item) => (
                                                            <option key={item?._id} value={item?._id}>{item?.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className={s.formGroup}>
                                                    <div className={s.permTreeWrapper}>
                                                        <PermissionTree
                                                            processedPermissions={processedPermissions}
                                                            permSearch={permSearch}
                                                            setPermSearch={setPermSearch}
                                                            isSelected={isSelected}
                                                            isIndeterminate={isIndeterminate}
                                                            togglePermission={togglePermission}
                                                            isSuperAdmin={isSuperAdmin}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}



                                        {step === 3 && (
                                            <>
                                                <div className={s.reviewCard} style={{ marginBottom: 12 }}>
                                                    <div className={s.reviewRow}>
                                                        <span className={s.reviewRowKey}>{t("Agent")}</span>
                                                        <span className={s.reviewRowVal}>{form.first_name} {form.last_name}</span>
                                                    </div>
                                                    <div className={s.reviewRow}>
                                                        <span className={s.reviewRowKey}>{t("Role")}</span>
                                                        <span className={s.reviewRowVal}>{selectedRoleObj?.title || t("Custom")}</span>
                                                    </div>
                                                    <div className={s.reviewRow}>
                                                        <span className={s.reviewRowKey}>{t("Permissions")}</span>
                                                        <span className={s.reviewRowVal}>{selectedPermissions.length} {t("granted")}</span>
                                                    </div>
                                                </div>
                                                <div className={s.permTreeWrapper}>
                                                    <PermissionTree
                                                        processedPermissions={processedPermissions}
                                                        permSearch={permSearch}
                                                        setPermSearch={setPermSearch}
                                                        isSelected={isSelected}
                                                        isIndeterminate={isIndeterminate}
                                                        togglePermission={togglePermission}
                                                        isSuperAdmin={isSuperAdmin}
                                                        isDisabled={true}

                                                    />
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </div>
                            </div>

                            <div className={s.modalFooter}>
                                <div className={s.footerLeft}
                                    onClick={() => {
                                        window.open("https://www.insta-pay.ch/contact-us", "_blank");
                                    }}>
                                    <span><HelpCircle /></span>
                                    <div>
                                        <p>{t("Having Troubles?")}</p>
                                        <h2>{t("Contact Us")}</h2>
                                    </div>
                                </div>
                                <div className={s.footerRight}>
                                    <button className={s.btnCancel} onClick={onClose} type="button">{t("Cancel")}</button>
                                    <div>
                                        {step > 1 && (
                                            <button className={s.btnBack} onClick={() => setStep(p => p - 1)} type="button"> {t("Back")}</button>
                                        )}
                                        <button
                                            className={s.btnNext}
                                            onClick={handleNext}
                                            disabled={isNextDisabled}
                                            type="button"
                                        >
                                            {step === 3
                                                ? (isCreating || isUpdating ?
                                                    <><Spinner size="sm" /> {t("Saving...")}</>
                                                    : (isEdit ? t("Update") : t("Create & Send Invite")))
                                                : t("Next")} {step < 3 ? <ChevronRight /> : <Plus size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
    )
}

export default AgentsModal
