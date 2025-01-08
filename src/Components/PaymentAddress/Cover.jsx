import axios from "axios";
import styles from "./styles/PAC.module.scss"
import { useContext, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import coverPlaceHolder from "../UserProfilePublic/files/cover_1.png"
import { Camera } from "react-feather";
import AvatarEditor from "react-avatar-editor";
import { Button } from "reactstrap";
import { toast } from "react-toastify"

const Cover = ({ cover, setCover }) => {
    const { authHeader, userDetails, verifyToken } = useContext(UserContext)

    const [isEditing, setIsEditing] = useState(false);
    const [editor, setEditor] = useState(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [isSaving, setIsSaving] = useState(false)
    const mainContainerRef = useRef(null)
    const [file, setFile] = useState(null)


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
                setScale(1)
                setPosition({ x: 0.5, y: 0.5 })
            });
        // }, "image/png");
    };

    return (
        <div className={styles.cover_container} ref={mainContainerRef}>
            {/* {
                isEditing
                    ?
                    <div className={styles.editor_container}>
                        <AvatarEditor
                            ref={(editor) => setEditor(editor)}
                            image={cover || ''}
                            width={mainContainerRef?.current?.offsetWidth}
                            height={mainContainerRef?.current?.offsetHeight}
                            border={0}
                            color={[255, 255, 255, 0.6]}
                            scale={scale}
                        />
                    </div>
                    : */}
            <img src={cover || coverPlaceHolder} alt="cover" className={styles.cover} />
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
                    <label htmlFor='cover' style={{ position: "absolute", top: "20px", right: "20px", height: "40px", width: "40px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "10px", background: "#1111116e", backdropFilter: "blur(10px)", cursor: "pointer" }}>
                        <Camera color='white' />
                    </label>
            }
            <input type="file" name="cover" id="cover" hidden onChange={handleFileSelect} accept="image/*" />
        </div>
    )
}

export default Cover