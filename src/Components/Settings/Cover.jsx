import styles from "./styles/Cover.module.scss"
import cover from "../UserProfilePublic/files/cover_1.png"
import { useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "../../Context/UserContext"
import axios from "axios"
import { decryptData } from "../../Helper/EssentilaMethods/Decryption"
import AvatarEditor from "react-avatar-editor"
import { Button } from "reactstrap"
import { Camera, MoreHorizontal, Trash2 } from "react-feather"
import DeleteImageModal from "./DeleteImageModal"
import { toast } from "react-toastify"
import change_dp from "./change_img.svg"

const Cover = () => {
    const [coverPhoto, setCoverPhoto] = useState(cover)
    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const [showDelModal, setShowDelModal] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [editor, setEditor] = useState(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [isSaving, setIsSaving] = useState(false)
    const mainContainerRef = useRef(null)
    const [file, setFile] = useState(null)

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
        setFile(file)
        const reader = new FileReader();
        reader.onload = () => {
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
        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/upload-cover-image/${userDetails._id}`,
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
            })
            .finally(() => {
                setIsSaving(false);
                setIsEditing(false)
                setScale(1)
                setPosition({ x: 0.5, y: 0.5 })
            });
        // }, "image/png");
    };


    // more menu
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
                {/* {
                    isEditing
                        ?
                        <div className={styles.editor_container}>
                            <AvatarEditor
                                ref={(editor) => setEditor(editor)}
                                image={coverPhoto || ''}
                                width={mainContainerRef?.current?.offsetWidth}
                                height={mainContainerRef?.current?.offsetHeight}
                                border={0}
                                color={[255, 255, 255, 0.6]}
                                scale={scale}
                            />
                        </div> */}
                {/* : */}
                <img src={coverPhoto} alt="cover" className={styles.cover} />
                {/* } */}
                {
                    isEditing
                        ?
                        <div style={{ position: "absolute", top: window?.innerWidth > 1000 ? "30px" : "5px", right: window?.innerWidth > 1000 ? "30px" : "5px", display: "flex", gap: "1rem" }}>
                            {/* <div style={{
                                background: "white",
                                borderRadius: "10px",
                                overflow: "hidden",
                                display: "flex",
                                width: "150px"
                            }}>
                                <button onClick={() => setScale(prev => prev > 1 ? prev - .25 : prev)} style={{
                                    border: "none",
                                    outline: "none",
                                    width: "50px",
                                    height: "50x",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "1rem",
                                    fontWeight: "700"
                                }}>-</button>
                                <span style={{ flex: 1, textAlign: "center", fontSize: ".8rem", fontWeight: 600, alignSelf: "center" }}>{scale}x</span>
                                <button onClick={() => setScale(prev => prev < 4 ? prev + .25 : prev)} style={{
                                    border: "none",
                                    outline: "none",
                                    width: "50px",
                                    height: "50x",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "1rem",
                                    fontWeight: "700"
                                }}>+</button>
                            </div> */}
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
                            {/* <MoreHorizontal onClick={toggleMenu} color='white' size={30} style={{ cursor: "pointer" }} /> */}
                            <img src={change_dp} onClick={toggleMenu} style={{ height: window.innerWidth > 1000 ? "70px" : "40px", width: window.innerWidth > 1000 ? "70px" : "40px", objectFit: "contain", cursor: "pointer" }} />
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
                                    <span style={{ whiteSpace: "nowrap" }}>Edit Cover Photo</span>
                                </label>
                                {
                                    userDetails?.coverImage?.url
                                    &&
                                    <>
                                        {/* <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }} onClick={() => {
                                            toggleMenu()
                                            setIsEditing(true)
                                        }}>
                                            <Camera size={18} />
                                            <span style={{ whiteSpace: "nowrap" }}>Adjust Cover Photo</span>
                                        </label> */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }} onClick={() => {
                                            setShowDelModal(true)
                                            toggleMenu()
                                        }} >
                                            <Trash2 size={18} />
                                            <span style={{ whiteSpace: "nowrap" }}>Remove Cover Photo</span>
                                        </label>
                                    </>
                                }
                            </div>
                        </div>
                }
                <DeleteImageModal imageType={"Cover"} isOpen={showDelModal} toggle={() => setShowDelModal(!showDelModal)} />
                <input type="file" name="cover_photo" id="cover_photo" hidden onChange={handleFileSelect} accept="image/*" />
            </div>
        </div>
    )
}

export default Cover