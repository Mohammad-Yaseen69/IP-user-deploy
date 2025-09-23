import React, { useContext, useEffect, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, Input } from 'reactstrap'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { useTranslation } from 'react-i18next'
import styles from "./index.module.css"
import { X } from "react-feather"
import { service_name_formatter } from "../TransactionsNewApi/TransactionItem"

const AddBeneficiaryRequiredFields = ({ isOpen, toggle, beneficiary, close, requiredFields, dataHandler }) => {
    const { t } = useTranslation()
    const [loading, setIsLoading] = useState(false)
    const { authHeader } = useContext(UserContext)
    const [fields, setFields] = useState([])
    const [extraFields, setExtraFields] = useState([])


    const onChangeHandler = (e, index, isExtra = false) => {
        const { value } = e.target;
        if (isExtra) {
            setExtraFields(prev => {
                const newFields = [...prev];
                newFields[index].value = value;
                return newFields;
            });
        } else {
            setFields(prev => {
                const newFields = [...prev];
                newFields[index].value = value;
                return newFields;
            });
        }
    }

    useEffect(() => {
        if (requiredFields) {
            setFields(requiredFields?.beneficiary?.basic?.map(field => ({ name: field, value: "" })) || []);
            setExtraFields(requiredFields?.beneficiary?.extras?.map(field => ({ name: field, value: "" })) || []);
        }
    }, [requiredFields])

    const updateBeneficiaryHandler = async () => {
        setIsLoading(true)
        try {
            const updatedFields = fields.reduce((acc, field) => {
                acc[field.name] = field.value;
                return acc;
            }, {});

            const updatedExtraFields = extraFields.reduce((acc, field) => {
                acc[field.name] = field.value;
                return acc;
            }, {});



            const data = {
                ...beneficiary,
                ...updatedFields,
                extras: {
                    ...beneficiary?.extras,
                    ...updatedExtraFields
                }
            }
            console.log(data)
            const encrypted = encryptData(data)
            const res = await axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/beneficiary/update-beneficiary/${beneficiary?._id}`, {
                data: encrypted
            }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            console.log(dec);
            toast.success(`Fields updated for "${beneficiary?.first_name} ${beneficiary?.last_name}"`)
            dataHandler("beneficiary", dec?.beneficiaryData)
            close()
            toggle()
        }
        catch (err) {
            const dec = decryptData(err.response?.data)
            console.log(dec);
            toast.error(`Something went wrong while updating fields for "${beneficiary?.first_name} ${beneficiary?.last_name}"`)
        }
        finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} style={{ maxWidth: "920px", width: "100vw" }}>
            <ModalHeader style={{ width: "100%" }}>
                <div style={{ display: "flex", minWidth: "100%", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <p style={{marginBottom: "0"}}>
                        Add Required Fields For Beneficiary
                    </p>
                    <X onClick={close} />
                </div>
            </ModalHeader>
            <ModalBody>
                <div className={styles.benef}>
                    <div className={styles.benef_top}>
                        <div className={styles.dp}>{beneficiary?.first_name?.[0]}</div>
                        <div className={styles.bt_dets}>
                            <h4>{beneficiary?.first_name} {beneficiary?.last_name}</h4>
                            <div>
                                <span>Country: </span>
                                <strong>{beneficiary?.country_name}</strong>
                            </div>
                            <div>
                                <span>Phone: </span>
                                <strong>{beneficiary?.phone}</strong>
                            </div>
                            <div>
                                <span>Email: </span>
                                <strong>{beneficiary?.email}</strong>
                            </div>
                        </div>
                    </div>
                    {fields.map((field, index) => (
                        <FormGroup key={index} className={service_name_formatter(field.name)}>
                            <Label>Please Enter {service_name_formatter(field.name)} to Procced</Label>
                            <Input
                                type="text"
                                value={field.value}
                                onChange={(e) => onChangeHandler(e, index)}
                                placeholder={` Enter ${service_name_formatter(field.name)} here`}
                            />
                        </FormGroup>
                    ))}
                    {extraFields?.map((field, index) => (
                        <FormGroup key={index} className={styles.field}>
                            <Label>Please Enter Your {service_name_formatter(field.name)}</Label>
                            <Input
                                type="text"
                                value={field.value}
                                onChange={(e) => onChangeHandler(e, index, true)}
                                placeholder={`Enter ${service_name_formatter(field.name)}`}
                            />
                        </FormGroup>
                    ))}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color='primary' onClick={updateBeneficiaryHandler} disabled={loading || fields.some(field => !field.value) || extraFields.some(field => !field.value)}>
                    {t("Update")}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default AddBeneficiaryRequiredFields