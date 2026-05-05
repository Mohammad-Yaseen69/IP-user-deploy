import React, { useEffect, useState } from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "../styles/DelegateModal.module.css"
import { useForm } from 'react-hook-form'
import PhoneInput from '../../PhoneInput'
import useCountryLocation from '../../../hooks/GeneralUse/useCountryLocation'

const DelegateModal = ({ isRole, isOpen, onClose, t, width }) => {
    const { country } = useCountryLocation()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm()

    const onSubmit = (data) => {
        console.log(data)
        reset()
        onClose()
    }
    useEffect(() => {
        if (!isOpen) reset()
    }, [isOpen])
    useEffect(() => {
        register("phone", { required: true })
    }, [register])
    useEffect(() => {
        register("phone", { required: true })
    }, [register])
    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            style={{ maxWidth: width > 800 ? "700px" : "95%" }}
            centered
        >
            <ModalHeader toggle={onClose} className={styles.header}>
                <div className={styles.title}>
                    <span>
                        {t("Add New")} {isRole ? t("Role") : t("Agent")}
                    </span>
                </div>
            </ModalHeader>

            <ModalBody className={styles.body}>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className={styles.formGroup}>
                        <label>{t("Full Name")}</label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            {...register("fullName", { required: true })}
                        />
                        {errors.fullName && <span className={styles.error}>Required</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("Email")}</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            {...register("email", { required: true })}
                        />
                        {errors.email && <span className={styles.error}>Required</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("Phone Number")}</label>
                        <PhoneInput
                            phone=""
                            setPhone={(val) => setValue("phone", val, { shouldValidate: true })}
                            country={country}
                            customStyles={{
                                width: "100%",
                                height: "48px",
                                border: "1px solid var(--bs-border-color)",
                                borderRadius: "0.375rem",
                                backgroundColor: "var(--bs-body-bg)",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 0.75rem",
                                boxShadow: "none" // ❗ important
                            }}
                        />
                        {errors.phone && <span className={styles.error}>Required</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            {isRole ? t("Select Role") : t("Select Agent")}
                        </label>

                        <select {...register("type", { required: true })}>
                            <option value="">Select</option>

                            {isRole ? (
                                <>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="viewer">Viewer</option>
                                </>
                            ) : (
                                <>
                                    <option value="agent1">Agent 1</option>
                                    <option value="agent2">Agent 2</option>
                                    <option value="agent3">Agent 3</option>
                                </>
                            )}
                        </select>

                        {errors.type && <span className={styles.error}>Required</span>}
                    </div>

                    {/* Button */}
                    <div className={styles.footer}>
                        <button type="submit" className={styles.submitBtn}>
                            {isRole ? t("Add Role") : t("Add Agent")}
                        </button>
                    </div>

                </form>

            </ModalBody>
        </Modal>
    )
}



export default DelegateModal