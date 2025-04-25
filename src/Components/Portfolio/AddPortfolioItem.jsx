import React, { useContext, useState } from 'react'
import { Input, Label, Modal, ModalBody, ModalHeader, Progress } from 'reactstrap'
import modal from "./files/modal.png"
import Dropzone from './CustomDropZone'
import axios from 'axios'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import bg from '../PaymentAddress/files/bg.png'

const AddPortfolioItem = ({ isOpen, toggle, pAddress }) => {
    const { t } = useTranslation()
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const { authHeader, userDetails, getUserDocuments, getUserVideos } = useContext(UserContext)

    const addPortfolioItemAws = () => {
        if (file && title && fileType) {
            setIsSaving(true)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('file_type', fileType);
            formData.append('type', pAddress ? "address" : "portfolio")

            axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/upload-portfolio/${userDetails?._id}`,
                formData, {
                headers: {
                    ...authHeader,
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                    toast.success(decrypted?.message)
                    if (pAddress) {
                        getUserVideos()
                    } else {

                        getUserDocuments()
                    }
                    toggle()
                    setFile(null)
                    setFileType(null)
                    setTitle("")
                    setDescription("")
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    toast.error(decrypted?.message)
                })
                .finally(() => setIsSaving(false))
        }
    }

    const getMediaStatus = async (media_id) => {
        try {
            const data = {
                "account_id": userDetails?._id,
                "media_id": media_id,
                "file_type": file?.type,
                "type": pAddress ? "address" : "portfolio"
            }
            const enc = encryptData(data)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/get-jw-media-status`,
                {
                    data: enc
                },
                {
                    headers: authHeader
                })
            const dec = decryptData(res.data.data)
            console.log(dec)
            const message = dec?.data?.status === "ready" ? "Uploaded successfully, and ready to play." : "Uploaded successfully, it might take a few minutes to load."
            toast.success(message)
            if (pAddress) {
                getUserVideos()
            } else {
                getUserDocuments()
            }
            toggle()
            setFile(null)
            setFileType(null)
            setTitle("")
            setDescription("")
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            toast.error(dec?.message)
        }
        finally {
            setIsSaving(false)
        }
    }

    const uploadVideo = async (url, media_id) => {
        try {
            const options = {
                method: 'PUT',
                timeout: 900000,
                headers: {
                    'Content-Type': file?.type ?? "video/mp4",
                    "Access-Control-Allow-Origin": "*",
                },
                body: file,
            }

            const res = await fetch(url, options)
            console.log(res)
            if (!res.ok) {
                toast.error(`Upload failed with status ${res.status}: ${res.statusText}`)
                throw new Error(`Upload failed with status ${res.status}: ${res.statusText}`);
            }
            getMediaStatus(media_id)
            // const data = await res.json()
            // console.log(data)
        }
        catch (error) {
            toast.error(error?.message)
            setIsSaving(false)
        }
    }

    const addPortfolioItem = async () => {
        setIsSaving(true)
        try {
            const data = {
                title,
                description,
                username: userDetails?.username,
                file_type: file?.type,
                language: userDetails?.language ?? "en",
                type: pAddress ? "address" : "portfolio"
            }
            const enc = encryptData(data)
            const res = await axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/account/add-portfolio-item`,
                {
                    data: enc
                },
                {
                    headers: authHeader
                })
            const dec = decryptData(res.data.data)
            if (dec?.data?.upload_link) {
                uploadVideo(dec?.data?.upload_link, dec?.data?.id)
            } else {
                toast.error("Something went wrong while uploading the video.")
                setIsSaving(false)
            }
        } catch (error) {
            const dec = decryptData(error.response.data.data)
            toast.error(dec?.message)
            setIsSaving(false)
        }
    }

    return (
        <Modal style={{ minWidth: window.innerWidth > 1000 ? "817px" : "90%" }} isOpen={isOpen}>
            <ModalHeader toggle={() => {
                if (isSaving) {
                    const con = window.confirm("Warning: If you close this window, your file upload will fail. Are you sure, you want to cancel the file upload?")
                    if (con) {
                        toggle()
                    }
                } else {
                    toggle()
                }
            }}>
                {t("Add New Portfolio Item")}
            </ModalHeader>
            <ModalBody style={{
                display: "flex",
                gap: "50px"
            }}>
                {
                    window.innerWidth > 1000
                    &&
                    <img src={pAddress ? bg : modal} alt="add item" style={{
                        width: !pAddress ? "50%" : "40%",
                        borderRadius: "30px",
                        backgroundSize: "cover"
                    }} />
                }
                <div style={{
                    flex: 1,
                    display: pAddress && "flex",
                    justifyContent: pAddress && "space-between",
                    flexDirection: pAddress && "column",
                }}>
                    <Dropzone pAddress={pAddress} file={file} setFile={setFile} setFileType={setFileType} />
                    {!pAddress
                        &&
                        <>
                            <div>
                                <Label style={{
                                    color: '#000',
                                    leadingTrim: 'both',
                                    textEdge: 'cap',
                                    fontFamily: 'Manrope',
                                    fontSize: 18.512,
                                    fontStyle: 'normal',
                                    fontWeight: 700,
                                    lineHeight: 'normal',
                                    marginTop: "24px"
                                }}>
                                    Title
                                </Label>
                                <Input type='text' style={{
                                    borderRadius: "12px",
                                    background: "rgba(65, 1, 255, 0.06)"
                                }} value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <Label style={{
                                    color: '#000',
                                    leadingTrim: 'both',
                                    textEdge: 'cap',
                                    fontFamily: 'Manrope',
                                    fontSize: 18.512,
                                    fontStyle: 'normal',
                                    fontWeight: 700,
                                    lineHeight: 'normal',
                                    marginTop: "24px"
                                }}>
                                    Description
                                </Label>
                                <Input type='textarea' style={{
                                    borderRadius: "12px",
                                    background: "rgba(65, 1, 255, 0.06)",
                                    resize: "none",
                                    height: "100px"
                                }} value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </>
                    }
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        marginTop: "23px",
                        alignItems: "center"
                    }}>
                        {/* <Progress color='primary' value={upload} style={{ width: "100px", opacity: upload > 0 ? 1 : 0 }} /> */}
                        {
                            isSaving
                                ?
                                <div class="d-flex justify-content-center">
                                    <div class="spinner-border" color='primary' role="status">
                                        <span class="sr-only">Loading...</span>
                                    </div>
                                </div>
                                :
                                <div></div>
                        }
                        {
                            isSaving
                                ?
                                <div style={{ fontSize: ".9rem", fontWeight: 700, textAlign: "right", }}>
                                    Uploading file, please do not close the window.
                                </div>
                                :
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                    <button
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "transparent",
                                            color: "#636363",
                                            fontSize: "14px",
                                            fontWeight: "600"
                                        }}
                                        onClick={toggle}
                                    >{t("Discard")}</button>
                                    <button
                                        style={{
                                            borderRadius: "9px",
                                            backgroundColor: "#6D29DC",
                                            color: "white",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            border: "none",
                                            outline: "none",
                                            padding: "9px 16px",
                                            opacity: ((!title) && !pAddress) || !file || isSaving ? .7 : 1,
                                            cursor: ((!title) && !pAddress) || !file  || isSaving ? "not-allowed" : "pointer"
                                        }}
                                        disabled={((!title) && !pAddress) || !file || isSaving}
                                        onClick={String(file?.type)?.toLowerCase()?.includes("video") || String(file?.type)?.toLowerCase()?.includes("audio") ? addPortfolioItem : addPortfolioItemAws}
                                    >{t("Save And Post")}</button>
                                </div>
                        }
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default AddPortfolioItem


// const addPortfolioItem = async () => {
//     setIsSaving(true)
//     try {
//         const options = {
//             method: 'POST',
//             headers: {
//                 'Content-Type': "application/json",
//                 "Authorization": `Bearer ${process.env.REACT_APP_JW_PLAYER_API_KEY}`,
//             },
//             body: JSON.stringify({
//                 "upload": {
//                     'mime_type': file?.type ?? "video/mp4",
//                     "method": "direct"
//                 },
//                 "metadata": {
//                     "title": title,
//                     "description": description,
//                     "author": userDetails?.username ?? "InstaPay",
//                     "category": "Movies",
//                     "tags": ["InstaPay"],
//                     "language": userDetails?.language ?? "en"
//                 }
//             })
//         };

//         const url = `https://api.jwplayer.com/v2/sites/${process.env.REACT_APP_JW_PLAYER_SITE_ID}/media`
//         const res = await fetch(url, options)
//         const data = await res.json()
//         uploadVideo(data?.upload_link)
//         console.log(data)
//     }
//     catch (error) {
//         console.log(error)
//         setIsSaving(false)
//     }
// }

// const getMediaStatus = async (media_id) => {
//     try {
//         const headers = {
//             Authorization: `Bearer ${process.env.REACT_APP_JW_PLAYER_API_KEY}`,
//         }

//         const url = `https://api.jwplayer.com/v2/sites/${process.env.REACT_APP_JW_PLAYER_SITE_ID}/media/${media_id}`

//         const res = await fetch(url, { headers })
//         if (!res.ok) {
//             throw new Error(`Upload failed with status ${res.status}: ${res.statusText}`);
//         }
//         console.log(res)
//         const data = await res.json()
//         console.log(data)
//     }
//     catch (error) {
//         console.log(error)
//     }
//     finally {
//         setIsSaving(false)
//     }
// }