import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from "./styles/Header.module.scss"
import countries from "../PaymentsNewer/CountriesData.json"
import { UserContext } from '../../Context/UserContext'
import { Button, Card, CardBody } from 'reactstrap'
import { useTranslation } from 'react-i18next'
import { Camera, MoreHorizontal, Trash2 } from 'react-feather'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import DeleteImageModal from './DeleteImageModal'
import AvatarEditor from 'react-avatar-editor'

const Header = () => {
    const { userDetails, authHeader, setUserRefresh } = useContext(UserContext)
    const country = countries.filter(item => item.name.toLowerCase().includes(userDetails?.country_name?.toLowerCase()))[0]
    const [profilePercentage, setProfilePercentage] = useState(0)
    const [dp, setDp] = useState()
    const { t } = useTranslation()
    const [showDelModal, setShowDelModal] = useState(false)

    useEffect(() => {
        const arr = [];
        if (userDetails?.user?.first_name) arr.push(1);
        if (userDetails?.user?.last_name) arr.push(1);
        if (userDetails?.company?.company_name) arr.push(1);
        if (userDetails?.email) arr.push(1);
        if (userDetails?.phone) arr.push(1);
        if (userDetails?.postal_code) arr.push(1);
        if (userDetails?.city) arr.push(1);
        if (userDetails?.country_name) arr.push(1);
        if (userDetails?.address) arr.push(1);
        if (userDetails?.about_me) arr.push(1);
        if (userDetails?.user?.answer1) arr.push(1);
        if (userDetails?.user?.answer2) arr.push(1);
        if (userDetails?.user?.answer3) arr.push(1);
        const percentage = 100 / 12 * arr.length
        setProfilePercentage(percentage)
    }, [userDetails])

    useEffect(() => {
        if (userDetails) {
            setDp(userDetails?.profileImage?.url ?? "")
        }
    }, [userDetails])

    // dp states and methods
    const [isAdjusting, setIsAdjusting] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [editor, setEditor] = useState(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [isSaving, setIsSaving] = useState(false)
    const mainContainerRef = useRef(null)

    useEffect(() => {
        if (userDetails) {
            setDp(userDetails?.profileImage?.url)
        }
    }, [userDetails])


    const handleFileSelect = (e) => {
        const file = e.target.files[0];
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

        const canvas = editor.getImageScaledToCanvas();
        const file = canvas.toBlob((blob) => {
            // console.log(blob)
            const formData = new FormData();
            formData.append("file", blob, `profile_image_${Date.now()}.png`);
            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/upload-profile-image/${userDetails._id}`,
                formData, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    // console.log(decrypted)
                    setUserRefresh(prev => prev + 1)
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    // console.log(decrypted)
                    setUserRefresh(prev => prev + 1)
                })
                .finally(() => {
                    setIsSaving(false);
                    setIsEditing(false)
                    setScale(1)
                    setPosition({ x: 0.5, y: 0.5 })
                });
        }, "image/png");
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
        <div className={styles.top}>
            <div className={styles.left}>
                <div className={styles.dp_container} ref={mainContainerRef}>
                    {
                        isEditing
                            ?
                            <div className={styles.editor_container}>
                                <AvatarEditor
                                    ref={(editor) => setEditor(editor)}
                                    image={dp || ''}
                                    width={mainContainerRef?.current?.offsetWidth}
                                    height={mainContainerRef?.current?.offsetHeight}
                                    border={0}
                                    color={[255, 255, 255, 0.6]}
                                    scale={scale}
                                />
                            </div>
                            :
                            <>
                                {
                                    userDetails?.profileImage?.url
                                        ?
                                        <img src={dp} alt={userDetails?.account_type === "individual" ? userDetails?.user?.first_name : userDetails?.company?.company_name} style={{ background: "white", boxShadow: "0px 0px 3px #1111113e" }} className={styles.img} />
                                        :
                                        <div className={styles.dp}>{
                                            userDetails?.account_type?.toLowerCase() === "individual"
                                                ?
                                                userDetails?.user?.first_name?.[0]?.toUpperCase()
                                                :
                                                userDetails?.company?.company_name?.[0]?.toUpperCase()
                                        }</div>
                                }
                            </>
                    }

                    {
                        isEditing
                            ?
                            <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: ".4rem" }}>
                                <div style={{
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
                                </div>
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
                            <div style={{ position: "absolute", top: "15px", right: "20px", filter: "drop-shadow(0 0 2px black)" }} ref={menuRef}>
                                <MoreHorizontal onClick={toggleMenu} color='white' size={30} style={{ cursor: "pointer" }} />
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
                                    <label htmlFor="dp" onClick={toggleMenu} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }}>
                                        <Camera size={18} />
                                        <span style={{ whiteSpace: "nowrap" }}>Upload</span>
                                    </label>
                                    {
                                        userDetails?.profileImage?.url
                                        &&
                                        <>
                                            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }} onClick={() => {
                                                toggleMenu()
                                                setIsEditing(true)
                                                setIsAdjusting(true)
                                            }}>
                                                <Camera size={18} />
                                                <span style={{ whiteSpace: "nowrap" }}>Adjust</span>
                                            </label>
                                            <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "0", cursor: "pointer" }} onClick={() => {
                                                setShowDelModal(true)
                                                toggleMenu()
                                            }} >
                                                <Trash2 size={18} />
                                                <span style={{ whiteSpace: "nowrap" }}>Remove</span>
                                            </label>
                                        </>
                                    }
                                </div>
                            </div>
                    }
                    <input type="file" name="dp" id="dp" hidden onChange={handleFileSelect} />
                    <DeleteImageModal imageType={"Profile"} isOpen={showDelModal} toggle={() => setShowDelModal(!showDelModal)} />
                </div>
                <div className={styles.basic_dets}>
                    <div className={styles.badge}>{userDetails?.account_type === "individual" ? t("Personal Account") : t("Business Account")}</div>
                    <h4>
                        {
                            userDetails?.account_type?.toLowerCase() === "individual"
                                ?
                                `${userDetails?.user?.first_name} ${userDetails?.user?.last_name}`
                                :
                                userDetails?.company?.company_name
                        }
                    </h4>
                    <div className={styles.country}>
                        <img src={country?.file_url} alt={country?.alpha3} style={{ boxShadow: "0 0 5px #afafaf" }} />
                        <span>{country?.name}</span>
                    </div>
                </div>
            </div>
            <div className={styles.top_right}>
                <Card style={{ marginBottom: 0 }} className={styles.completion_status_con}>
                    <CardBody className={styles.completion_status_body}>
                        <span>{t("Profile Completion")}</span>
                        <button>
                            {
                                profilePercentage === 100
                                    ?
                                    <span>{t("Profile Completed")}</span>
                                    :
                                    <>
                                        <span>{t("Complete Now")}</span>
                                        <span>&rarr;</span>
                                    </>
                            }
                        </button>
                    </CardBody>
                </Card>
                <div className={styles.completion_con}>
                    {/* completion div */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${profilePercentage}%`,
                        height: "100%",
                        background: "linear-gradient(270deg, #5926F0 -8.7%, #4828A0 100%), #FFF",
                        boxShadow: "0px 4px 30px 0px rgba(0, 0, 0, 0.09)",
                        zIndex: 1
                    }}></div>
                    {/* completion div */}
                    <div className={styles.completion_det}>
                        <h4 style={{ marginBottom: 0 }}>
                            {profilePercentage.toFixed(0)}
                        </h4>
                        <span>%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header