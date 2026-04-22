import React, { useContext, useState } from 'react'
import { Button, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/AddNominee.module.css"
import { Camera } from 'react-feather'
import PhoneInput from 'react-phone-input-2'
import OTPConfirmation from '../User/UserSettings/OTPConfirmation'
import SuccessModal from '../User/UserSettings/SuccessModal'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'

const NomineeDetails = ({ nominee, setNominee }) => {

    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const [image, setImage] = useState(null)
    const [userImage, setUserImage] = useState(nominee?.picture?.url)
    const [file, setFile] = useState(null)
    const [fullName, setFullName] = useState(nominee?.full_name)
    const [dob, setDob] = useState(formatDate(nominee?.dob));
    const [gender, setGender] = useState(nominee?.gender)
    const [address, setAddress] = useState(nominee?.address)
    const [relationship, setRelationship] = useState(nominee?.relationship)
    const [contact, setContact] = useState(nominee?.contact)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [showDelOtp, setShowDelOtp] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const { t } = useTranslation()

    // context
    const { authHeader, userDetails } = useContext(UserContext)

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        setFile(file)
        setImage(file)
        const reader = new FileReader();
        reader.onload = () => {
            setUserImage(reader.result);
        };
        reader.readAsDataURL(file)
    }

    const updateNomineeHandler = (setter) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('full_name', fullName);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('address', address);
        formData.append('relationship', relationship);
        formData.append('contact', contact);

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/nominee/update-nominee/${userDetails?._id}`,
            formData,
            {
                headers: authHeader
            })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setter(true)
                setNominee(decrypted?.nominee)
                setIsEditMode(false)
                // console.log(decrypted)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
    }

    const deleteNomineeHandler = () => {
        axios.get(`${import.meta.env.VITE_IP_DEV_API}/api/nominee/delete-nominee/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setNominee(null)
                // console.log(decrypted)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
    }

    return (
        <div>
            <div className={styles.top}>
                <div className={styles.img_container}>
                    {
                        userImage /*&& !isEditMode*/
                            ?
                            <img src={userImage} alt="nominee photo" />
                            :
                            <label htmlFor='file' className={styles.upload}>
                                <Camera size={30} />
                                <span>{t("Upload Photo")}</span>
                                <input type="file" name="file" id="file" value={image} disabled={!isEditMode} readOnly={!isEditMode} onChange={handleImageSelect} hidden />
                            </label>
                    }
                </div>
                <div className={styles.top_right}>
                    <div className={styles.inp_con}>
                        <Label>{t("Full Name")}</Label>
                        <Input placeholder={t(`Nominee's Full Name`)} value={fullName} disabled={!isEditMode} readOnly={!isEditMode} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className={styles.mul_inp}>
                        <div className={styles.inp_con}>
                            <Label>{t("Date Of Birth")}</Label>
                            <Input type='date' placeholder={`Nominee's Date Of Birth`} value={dob} disabled={!isEditMode} readOnly={!isEditMode} onChange={e => setDob(e.target.value)} />
                        </div>
                        <div className={styles.inp_con}>
                            <Label>{t("Gender")}</Label>
                            <Input type='select' value={gender} disabled={!isEditMode} readOnly={!isEditMode} onChange={e => setGender(e.target.value)}>
                                <option value="" disabled>--{t("Select Gender")}--</option>
                                <option value="male">{t("Male")}</option>
                                <option value="female">{t("Female")}</option>
                            </Input>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.mul_inp}>
                <div className={styles.inp_con}>
                    <Label>{t("Relation with Nominee")}</Label>
                    <Input type='select' value={relationship} disabled={!isEditMode} readOnly={!isEditMode} onChange={e => setRelationship(e.target.value)}>
                        <option value="" disabled>--{t("Select Relation")}--</option>
                        <option value="brother">{t("Brother")}</option>
                        <option value="sister">{t("Sister")}</option>
                        <option value="son">{t("Son")}</option>
                        <option value="daughter">{t("Daughter")}</option>
                    </Input>
                </div>
                <div className={styles.inp_con}>
                    <Label>{t("Nominee Contact Number")}</Label>
                    <PhoneInput
                        placeholder={t("Enter Phone number")}
                        value={contact}
                        disabled={!isEditMode} readOnly={!isEditMode} onChange={(e) => setContact(e)}
                        country={"us"}
                        inputProps={{
                            id: "mobile_number",
                            name: "mobile_number",
                        }}
                        inputStyle={{
                            width: "100%",
                            flex: 1,
                            minWidth: "250px",
                            padding: "22px 15px 22px 48px",
                            lineHeight: "1.5",
                            border: "1px solid #ced4da",
                        }}
                    />
                </div>
            </div>
            <div className={styles.inp_con}>
                <Label>{t("Nominee Address")}</Label>
                <Input type='textarea' placeholder={t("Nominee Permanent Address")} value={address} disabled={!isEditMode} readOnly={!isEditMode} onChange={e => setAddress(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", gap: "1rem" }}>
                {
                    isEditMode
                        ?
                        <>
                            <Button
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }}
                                onClick={() => {
                                    setIsEditMode(false)
                                }}
                            >
                                {t("Cancel")}
                            </Button>
                            <Button
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }}
                                onClick={() => setShowOtp(true)}
                                disabled={!fullName || !userImage || !dob || !address || !relationship || !gender || !contact || contact.length < 9}
                            >
                                {t("Save")}
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }}
                                onClick={() => setShowDelOtp(true)}
                            >
                                {t("Delete Nominee")}
                            </Button>
                            <Button
                                style={{
                                    background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px"
                                }}
                                onClick={() => {
                                    setIsEditMode(true)
                                }}
                            >
                                {t("Update Nominee")}
                            </Button>
                        </>
                }
            </div>
            <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>{t("Confirm")}</ModalHeader>
                <ModalBody>
                    <OTPConfirmation callback={(setter) => updateNomineeHandler(setter)} setter={setShowSuccess} setterValue={true} hideOtp={() => setShowOtp(false)} />
                </ModalBody>
            </Modal>
            <Modal isOpen={showDelOtp} toggle={() => setShowDelOtp(!showDelOtp)}>
                <ModalHeader toggle={() => setShowDelOtp(!showDelOtp)}>{t("Confirm")}</ModalHeader>
                <ModalBody>
                    <OTPConfirmation callback={(setter) => deleteNomineeHandler(setter)} setter={setShowSuccess} setterValue={true} hideOtp={() => setShowDelOtp(false)} />
                </ModalBody>
            </Modal>
            <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} />
        </div>
    )
}

export default NomineeDetails