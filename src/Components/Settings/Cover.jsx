import styles from "./styles/Cover.module.scss"
import cover from "../UserProfilePublic/files/cover_1.png"
import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
// import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import { Button } from "reactstrap"
import { Camera, MoreHorizontal, Trash2 } from "react-feather"
import DeleteImageModal from "./DeleteImageModal"
import { toast } from "react-toastify"
import change_dp from "./change_img.svg"
import AdjustModal from "./AdjustModal"
import { t } from "i18next"
import { usePermission } from "../../hooks/GeneralUse/usePermission"

const Cover = () => {
    const [coverPhoto, setCoverPhoto] = useState(cover)
    const { userDetails, authHeader, verifyToken, croppedImages, setCroppedImages } = useContext(UserContext)
    const [showDelModal, setShowDelModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false)
    const mainContainerRef = useRef(null)
    const [file, setFile] = useState(null)
    const [showAdjustModal, setShowAdjustModal] = useState(false)
    const can = usePermission()
    useEffect(() => {
        if (userDetails) {
            setCoverPhoto(userDetails?.coverImage?.url || cover)
        }
    }, [userDetails])

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file?.type?.toLowerCase()?.includes("image")) {
            toast.error("Only images are allowed!")
            return
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error("File too big! Must be less than 5MB.");
            e.target.value = "";
            return;
        }


        setFile(file)
        const reader = new FileReader();
        reader.onload = () => {
            setCroppedImages(prev => ({
                ...prev,
                profileBanner: reader.result
            }))
            setCoverPhoto(reader.result);
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
        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/account/upload-cover-image/${userDetails._id}`,
            formData, {
            headers: authHeader,
        })
            .then((res) => {
                verifyToken()
            })
            .catch((err) => {
            })
            .finally(() => {
                setIsSaving(false);
                setIsEditing(false)
            });
        // }, "image/png");
    };


    const [showMenu, setShowMenu] = useState(false)
    const toggleMenu = () => setShowMenu(!showMenu);

    const menuRef = useRef(null)

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setShowMenu(false);
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);
    return (
        <div className={styles.container}>
            <div className={styles.cover_container} ref={mainContainerRef}>
                <img src={croppedImages?.profileBanner || coverPhoto} alt="cover" loading="lazy" className={styles.cover} />
                {
                    isEditing
                        ?
                        <div style={{ position: "absolute", top: window?.innerWidth > 1000 ? "30px" : "5px", right: window?.innerWidth > 1000 ? "30px" : "5px", display: "flex", gap: "1rem" }}>
                            <Button color='primary'
                                style={{
                                    background: "white",
                                    border: "none",
                                    outline: "none",
                                    borderRadius: "10px",
                                }}
                                onClick={handleSave}
                                disabled={isSaving}
                            >{isSaving ? "Saving" : "Save"}</Button>
                        </div>
                        :
                        <div style={{ position: "absolute", top: "25px", right: "25px", filter: "drop-shadow(0 0 2px black)", zIndex: "101" }} ref={menuRef}>
                            {can("user-profile.update") && (
                                <img alt="" src={change_dp} onClick={toggleMenu} style={{ height: window.innerWidth > 1000 ? "70px" : "40px", width: window.innerWidth > 1000 ? "70px" : "40px", objectFit: "contain", cursor: "pointer" }} />
                            )}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "10px",
                                overflow: "hidden",
                                position: "absolute",
                                top: showMenu ? "20px" : "-100px",
                                opacity: showMenu ? "1" : "-0",
                                pointerEvents: showMenu ? "all" : "none",
                                right: 0,
                                background: "white"
                            }}>
                                <label htmlFor="cover_photo" onClick={toggleMenu} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }}>
                                    <Camera size={18} />
                                    <span style={{ whiteSpace: "nowrap" }}>{t("Edit Cover Photo")}</span>
                                </label>
                                {
                                    userDetails?.coverImage?.url
                                    &&
                                    <>
                                        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }} onClick={() => {
                                            toggleMenu()
                                            setShowAdjustModal(true)
                                        }}>
                                            <Camera size={18} />
                                            <span style={{ whiteSpace: "nowrap" }}>{t("Adjust Cover Photo")}</span>
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }} onClick={() => {
                                            setShowDelModal(true)
                                            toggleMenu()
                                        }} >
                                            <Trash2 size={18} />
                                            <span style={{ whiteSpace: "nowrap" }}>{t("Remove Cover Photo")}</span>
                                        </label>
                                    </>
                                }
                            </div>
                        </div>
                }
                <AdjustModal
                    accountId={userDetails?._id}
                    isOpen={showAdjustModal}
                    toggle={() => setShowAdjustModal(!showAdjustModal)}
                    authHeader={authHeader}
                    imageUrl={coverPhoto}
                    type={"profile"}
                    name={"cover"}

                />
                <DeleteImageModal imageType={"Cover"} isOpen={showDelModal} toggle={() => setShowDelModal(!showDelModal)} />
                <input type="file" name="cover_photo" id="cover_photo" hidden onChange={handleFileSelect} accept="image/*" />
            </div>
        </div>
    )
}

export default Cover