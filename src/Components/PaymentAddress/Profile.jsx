import axios from "axios";
import styles from "./styles/PAC.module.scss"
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { Camera } from "react-feather";
import AvatarEditor from "react-avatar-editor";
import { Button } from "reactstrap";
import { toast } from "react-toastify"
import { BsCrop, BsPencil, BsPencilFill } from "react-icons/bs";
import AdjustModal from "../Settings/AdjustModal";
import { FaAdjust } from "react-icons/fa";
import { IoCrop } from "react-icons/io5";

const Profile = ({ dp, setDp, dets }) => {
    const { authHeader, userDetails, verifyToken, croppedImages } = useContext(UserContext)
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false)
    const mainContainerRef = useRef(null)
    const [file, setFile] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [deleting, setDeleting] = useState(false)


    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file?.type?.toLowerCase()?.includes("image")) {
            toast.error("Only images are allowed!")
            return
        }
        setFile(file)
        const reader = new FileReader();
        reader.onload = () => {
            setDp(reader.result);
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
        // console.log(blob)
        const formData = new FormData();
        // formData.append("file", blob, `profile_image_${Date.now()}.png`);
        formData.append("file", file);
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/add-payment-address-profile/${userDetails?.username}`,
            formData, {
            headers: authHeader
        })
            .then(res => {
                verifyToken()
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
            .finally(() => {
                setIsSaving(false);
                setIsEditing(false)
            });
        // }, "image/png");
    };

    const deletePfp = () => {
        setIsSaving(true);
        setDeleting(true)

        axios.delete(`${process.env.REACT_APP_IP_DEV_API}/api/payment-address/delete-profile-picture/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                verifyToken()
                setDp("")
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


    console.log(dets)

    return (
        <div className={styles.dp_container} ref={mainContainerRef} style={{ overflow: "visible", position: "relative" }}>
            {

                dp || isEditing
                    ?
                    <img src={croppedImages.paDP || dp} alt={userDetails?.account_type === "individual" ? userDetails?.user?.first_name : userDetails?.company?.company_name} style={{ background: "white", boxShadow: "0px 0px 3px #1111113e", borderRadius: "16px" }} className={styles.img} />
                    :
                    <div className={styles.dp} style={{ borderRadius: "16px", overflow: "hidden" }}>
                        {
                            userDetails?.account_type?.toLowerCase() === "individual"
                                ?
                                userDetails?.user?.first_name?.[0]?.toUpperCase()
                                :
                                userDetails?.company?.company_name?.[0]?.toUpperCase()
                        }
                    </div>
            }

            {dp &&
                <span onClick={() => setShowModal(true)} style={{ background: "#5926f0", width: "24px", borderRadius: "100%", height: "24px", display: "flex", justifyContent: "center", alignItems: "center", position: 'absolute', bottom: "-12px", left: "10px" }}>
                    <IoCrop color="white" size={13} />
                </span>
            }

            {
                (isEditing || deleting)
                    ?
                    <div style={{ position: "absolute", bottom: window?.innerWidth > 1000 ? "20px" : "-30px", left: window?.innerWidth > 1000 ? "50%" : "0px", transform: window?.innerWidth > 1000 ? "translateX(-50%)" : "translateX(0)", display: "flex", gap: ".4rem" }}>
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
                    <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', width: "100%", gap: "9px", marginTop: '7px' }}>
                        <label htmlFor="dp" style={{ fontSize: "12px", color: "#5926F0", fontWeight: 600, marginBottom: "0px", cursor: "pointer" }}>Change</label>
                        {dp &&
                            <>
                                <span style={{ fontSize: "14px", color: "#5926F0", fontWeight: 600 }}>|</span>
                                <span onClick={deletePfp} style={{ fontSize: "12px", color: "#5926F0", fontWeight: 600, cursor: "pointer" }}>Delete</span>
                            </>}

                    </div>
            }
            <AdjustModal
                isOpen={showModal}
                toggle={() => setShowModal(false)}
                type={"address"}
                name={"dp"}
                authHeader={authHeader}
                imageUrl={dp}
                pId={dets._id}
            />
            <input type="file" name="dp" id="dp" hidden onChange={handleFileSelect} accept="image/*" />
        </div>
    )
}

export default Profile