import axios from "axios";
import styles from "./styles/PAC.module.scss"
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { Camera } from "react-feather";
import AvatarEditor from "react-avatar-editor";
import { Button } from "reactstrap";
import { toast } from "react-toastify"

const Profile = ({ dp, setDp }) => {
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
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                verifyToken()
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
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
        <div className={styles.dp_container} ref={mainContainerRef} style={{ overflow: "visible" }}>
            {
                // isEditing
                //     ?
                //     <div className={styles.editor_container}>
                //         <AvatarEditor
                //             ref={(editor) => setEditor(editor)}
                //             image={dp || ''}
                //             width={mainContainerRef?.current?.offsetWidth}
                //             height={mainContainerRef?.current?.offsetHeight}
                //             border={0}
                //             color={[255, 255, 255, 0.6]}
                //             scale={scale}
                //         />
                //     </div>
                //     :
                //     <>
                //         {
                dp || isEditing
                    ?
                    <img src={dp} alt={userDetails?.account_type === "individual" ? userDetails?.user?.first_name : userDetails?.company?.company_name} style={{ background: "white", boxShadow: "0px 0px 3px #1111113e", borderRadius: "16px" }} className={styles.img} />
                    :
                    <div className={styles.dp} style={{ borderRadius: "16px !important", overflow: "hidden" }}>{
                        userDetails?.account_type?.toLowerCase() === "individual"
                            ?
                            userDetails?.user?.first_name?.[0]?.toUpperCase()
                            :
                            userDetails?.company?.company_name?.[0]?.toUpperCase()
                    }</div>
            }
            {/* </>
            } */}

            {
                isEditing
                    ?
                    <div style={{ position: "absolute", bottom: window?.innerWidth > 1000 ? "20px" : "-30px", left: window?.innerWidth > 1000 ? "50%" : "0px", transform: window?.innerWidth > 1000 ? "translateX(-50%)" : "translateX(0)", display: "flex", gap: ".4rem" }}>
                        {/* <div style={{
                            background: "white",
                            borderRadius: "5px",
                            overflow: "hidden",
                            display: "flex",
                            width: "110px"
                        }}>
                            <button onClick={() => setScale(prev => prev > 1 ? prev - .25 : prev)} style={{
                                border: "none",
                                outline: "none",
                                width: "30px",
                                height: "30x",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: ".75rem",
                                fontWeight: "700"
                            }}>-</button>
                            <span style={{ flex: 1, textAlign: "center", fontSize: ".8rem", fontWeight: 600, alignSelf: "center" }}>{scale}x</span>
                            <button onClick={() => setScale(prev => prev < 4 ? prev + .25 : prev)} style={{
                                border: "none",
                                outline: "none",
                                width: "30px",
                                height: "30x",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: ".75rem",
                                fontWeight: "700"
                            }}>+</button>
                        </div> */}
                        <Button color='primary'
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
                        >{isSaving ? "Saving" : "Save"}</Button>
                    </div>
                    :
                    <label htmlFor='dp' style={{ position: "absolute", top: "10px", right: "10px", height: "40px", width: "40px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "10px", background: "#1111116e", backdropFilter: "blur(10px)", cursor: "pointer" }}>
                        <Camera color='white' />
                    </label>
            }
            <input type="file" name="dp" id="dp" hidden onChange={handleFileSelect} accept="image/*" />
        </div>
    )
}

export default Profile