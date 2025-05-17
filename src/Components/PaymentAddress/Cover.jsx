import axios from "axios";
import styles from "./styles/PAC.module.scss"
import { useContext, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import coverPlaceHolder from "../UserProfilePublic/files/cover_1.png"
import { Camera, Delete, Trash } from "react-feather";
import { Button } from "reactstrap";
import { toast } from "react-toastify"
import { IoCrop, IoCropOutline } from "react-icons/io5";
import { FaCropAlt } from "react-icons/fa";
import { BsCrop } from "react-icons/bs";
import AdjustModal from "../Settings/AdjustModal";

const Cover = ({ cover, setCover, dets }) => {
    const { authHeader, userDetails, verifyToken, croppedImages } = useContext(UserContext)

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
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/add-payment-address-cover/${userDetails?.username}`,
            formData, {
            headers: authHeader,
        })
            .then((res) => {
                const decrypted = decryptData(res.data.data);
                // console.log(decrypted);
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

        axios.delete(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/delete-cover-picture/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                verifyToken()
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
            <img src={croppedImages.paBanner || cover || coverPlaceHolder} alt="cover" className={styles.cover} />
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
                            {isSaving ? "Saving" : "Save"}
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
                                Deleting
                            </Button>}
                    </div>
                    :
                    <div style={{ position: "absolute", top: "20px", right: "40px", height: "40px", width: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <label htmlFor='cover' style={{ background: "#1111116e", marginBottom: "0", backdropFilter: "blur(10px)", cursor: "pointer" }}>
                            <Camera color='white' style={{ marginTop: "4px" }} />
                        </label>
                        {cover &&
                            <div style={{ background: "#1111116e", backdropFilter: "blur(10px)", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                                <Trash onClick={deleteCover} style={{ marginLeft: "12px" }} color="white" />
                                <BsCrop onClick={() => setShowModal(true)} size={20} color="white" />
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