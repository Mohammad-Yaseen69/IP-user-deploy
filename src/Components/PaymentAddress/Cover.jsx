import axios from "axios";
import styles from "./styles/PAC.module.scss"
import { useContext, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import coverPlaceHolder from "../UserProfilePublic/files/cover_1.png"
import { Camera, Trash } from "react-feather";
import { Button } from "reactstrap";
import { toast } from "react-toastify"
import { BsCrop } from "react-icons/bs";
import AdjustModal from "../Settings/AdjustModal";
import crop from "./files/icons/crop.svg"
import upload from "./files/icons/upload.svg"
import del from "./files/icons/delete.svg"
import { t } from "i18next";


const Cover = ({ cover, setCover, dets }) => {
    const { authHeader, userDetails, verifyToken, croppedImages, setCroppedImages } = useContext(UserContext)

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false)
    const mainContainerRef = useRef(null)
    const [file, setFile] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [showModal, setShowModal] = useState(false)


    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file?.type?.toLowerCase()?.includes("image")) {
            toast.error("Only images are allowed!")
            return
        }
        setFile(file)
        const reader = new FileReader();
        reader.onload = () => {
            setCroppedImages({ ...croppedImages, paBanner: "" })
            setCover(reader.result);
        };
        reader.readAsDataURL(file);
        if (file) {
            setIsEditing(true)
        }

    };

    const handleSave = () => {
        setIsSaving(true);

        // const canvas = editor.getImageScaledToCanvas();
        // const file = canvas.toBlob((blob) => {
        const formData = new FormData();
        // formData.append("file", blob, `cover_image_${Date.now()}.png`);
        formData.append("file", file);
        // formData.forEach(item => "a") // console.log(item))
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/add-payment-address-cover/${userDetails?.username}`,
            formData, {
            headers: authHeader,
        })
            .then((res) => {
                const decrypted = decryptData(res.data.data);
                verifyToken()
            })
            .catch((err) => {
                const decrypted = decryptData(err.response.data.data);
                // console.log(decrypted);
            })
            .finally(() => {
                setIsSaving(false);
                setIsEditing(false)
            });
        // }, "image/png");
    };


    const deleteCover = () => {
        setIsSaving(true);
        setDeleting(true)

        axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/payment-address/delete-cover-picture/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                verifyToken()
                setCroppedImages(prev => ({ ...prev, paBanner: "" }))
                setCover("")
            })
            .catch(err => {
                console.log(decryptData(err.response.data.data))
            })
            .finally(() => {
                setDeleting(false)
                setIsSaving(false);
                setIsEditing(false)
            });
    }

    console.log(croppedImages)

    return (
        <div className={styles.cover_container} ref={mainContainerRef}>
            <img src={(croppedImages.paBanner || cover) || coverPlaceHolder} alt="cover" className={styles.cover} />
            {
                (isEditing || deleting)
                    ?
                    <div style={{ position: "absolute", top: window?.innerWidth > 1000 ? "30px" : "5px", right: window?.innerWidth > 1000 ? "30px" : "5px", display: "flex", gap: "1rem" }}>
                        {isEditing ? <Button color='primary'
                            style={{
                                background: "white",
                                border: "none",
                                outline: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                fontSize: ".65rem"
                            }}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? t("Saving"): t("Save")}
                        </Button> :
                            <Button color='primary'
                                style={{
                                    background: "white",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "5px",
                                    padding: "5px 10px",
                                    fontSize: ".65rem"
                                }}
                                disabled={true}
                            >
                                {t("Deleting")}
                            </Button>}
                    </div>
                    :
                    <div style={{ position: "absolute", top: "20px", right: "90px", height: "40px", width: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <label htmlFor='cover' style={{ marginBottom: "0", cursor: "pointer" }}>
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 8C0 3.58172 3.58172 0 8 0H36C40.4183 0 44 3.58172 44 8V36C44 40.4183 40.4183 44 36 44H8C3.58172 44 0 40.4183 0 36V8Z" fill="black" fill-opacity="0.31" />
                                <path d="M26 22L22 18M22 18L18 22M22 18V27.2C22 28.5907 22 29.2861 22.5505 30.0646C22.9163 30.5819 23.9694 31.2203 24.5972 31.3054C25.5421 31.4334 25.9009 31.2462 26.6186 30.8719C29.8167 29.2036 32 25.8568 32 22C32 16.4772 27.5228 12 22 12C16.4772 12 12 16.4772 12 22C12 25.7014 14.011 28.9331 17 30.6622" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </label>
                        {cover &&
                            <div style={{ backdropFilter: "blur(10px)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                                <svg onClick={deleteCover} style={{ marginLeft: "12px" }} width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 8C0 3.58172 3.58172 0 8 0H36C40.4183 0 44 3.58172 44 8V36C44 40.4183 40.4183 44 36 44H8C3.58172 44 0 40.4183 0 36V8Z" fill="black" fill-opacity="0.31" />
                                    <path d="M19 13H25M13 16H31M29 16L28.2987 26.5193C28.1935 28.0975 28.1409 28.8867 27.8 29.485C27.4999 30.0118 27.0472 30.4353 26.5017 30.6997C25.882 31 25.0911 31 23.5093 31H20.4907C18.9089 31 18.118 31 17.4983 30.6997C16.9528 30.4353 16.5001 30.0118 16.2 29.485C15.8591 28.8867 15.8065 28.0975 15.7013 26.5193L15 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                                <svg onClick={() => setShowModal(true)} width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="44" height="44" rx="8" fill="black" fill-opacity="0.31" />
                                    <path d="M12 16H24.8C25.9201 16 26.4802 16 26.908 16.218C27.2843 16.4097 27.5903 16.7157 27.782 17.092C28 17.5198 28 18.0799 28 19.2V32M32 28L19.2 28C18.0799 28 17.5198 28 17.092 27.782C16.7157 27.5903 16.4097 27.2843 16.218 26.908C16 26.4802 16 25.9201 16 24.8V12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                            </div>
                        }
                    </div>
            }
            <AdjustModal
                isOpen={showModal}
                toggle={() => setShowModal(false)}
                type={"address"}
                name={"cover"}
                authHeader={authHeader}
                imageUrl={cover}
                pId={dets._id}
            />
            <input type="file" name="cover" id="cover" hidden onChange={handleFileSelect} accept="image/*" />
        </div>
    )
}

export default Cover