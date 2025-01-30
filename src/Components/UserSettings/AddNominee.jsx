import React, { useContext, useState } from 'react'
import { Button, Form, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap'
import styles from "./styles/AddNominee.module.css"
import { Camera } from 'react-feather'
import PhoneInput from 'react-phone-input-2'
import OTPConfirmation from '../User/UserSettings/OTPConfirmation'
import SuccessModal from '../User/UserSettings/SuccessModal'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'

const AddNominee = ({ setNominee, setAddNominee }) => {
    const [image, setImage] = useState(null)
    const [file, setFile] = useState(null)
    const [fullName, setFullName] = useState("")
    const [dob, setDob] = useState("")
    const [gender, setGender] = useState("")
    const [address, setAddress] = useState("")
    const [relationship, setRelationship] = useState("")
    const [contact, setContact] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const { t } = useTranslation()
    // context
    const { authHeader, userDetails } = useContext(UserContext)


    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        setFile(file)
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file)
    }

    const addNomineeHandler = (setter) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('full_name', fullName);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('address', address);
        formData.append('relationship', relationship);
        formData.append('contact', contact);

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/nominee/add-nominee/${userDetails?._id}`,
            formData,
            {
                headers: authHeader
            })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setter(true)
                setNominee(decrypted?.nominee)
                setAddNominee(false)
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
                        image
                            ?
                            <img src={image} alt="nominee photo" />
                            :
                            <label htmlFor='file' className={styles.upload}>
                                <Camera size={30} />
                                <span>{t("Upload Photo")}</span>
                                <input type="file" name="file" id="file" value={image} onChange={handleImageSelect} hidden />
                            </label>
                    }
                </div>
                <div className={styles.top_right}>
                    <div className={styles.inp_con}>
                        <Label>Full Name</Label>
                        <Input placeholder={t(`Nominee's Full Name`)} value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className={styles.mul_inp}>
                        <div className={styles.inp_con}>
                            <Label>Date Of Birth</Label>
                            <Input type='date' placeholder={`Nominee's Date Of Birth`} value={dob} onChange={e => setDob(e.target.value)} />
                        </div>
                        <div className={styles.inp_con}>
                            <Label>Gender</Label>
                            <Input type='select' value={gender} onChange={e => setGender(e.target.value)}>
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
                    <Label>Relation with Nominee</Label>
                    <Input type='select' value={relationship} onChange={e => setRelationship(e.target.value)}>
                        <option value="" disabled>--{t("Select Relation")}--</option>
                        <option value="brother">{t("Brother")}</option>
                        <option value="sister">{t("Sister")}</option>
                        <option value="son">{t("Son")}</option>
                        <option value="daughter">{t("Daughter")}</option>
                    </Input>
                </div>
                <div className={styles.inp_con}>
                    <Label>Nominee Contact Number</Label>
                    <PhoneInput
                        placeholder="Enter Phone number"
                        value={contact}
                        onChange={(e) => setContact(e)}
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
                <Label>Nominee Address</Label>
                <Input type='textarea' placeholder='Nominee Permanent Address' value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }}
                    onClick={() => setShowOtp(true)}
                    disabled={!fullName || !image || !dob || !address || !relationship || !gender || !contact || contact.length < 9}
                >
                    Save
                </Button>
            </div>
            <Modal isOpen={showOtp} toggle={() => setShowOtp(!showOtp)}>
                <ModalHeader toggle={() => setShowOtp(!showOtp)}>Confirm</ModalHeader>
                <ModalBody>
                    <OTPConfirmation callback={(setter) => addNomineeHandler(setter)} setter={setShowSuccess} setterValue={true} hideOtp={() => setShowOtp(false)} />
                </ModalBody>
            </Modal>
            <SuccessModal isOpen={showSuccess} toggle={() => setShowSuccess(!showSuccess)} />
        </div>
    )
}

export default AddNominee