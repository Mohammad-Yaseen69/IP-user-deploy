import { useContext, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Modal, ModalBody, Button } from 'reactstrap'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { UserContext } from '../../Context/UserContext'
import { useTranslation } from 'react-i18next'




const AdjustModal = ({ isOpen, toggle, imageUrl, accountId, authHeader, type, name, pId }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [modalPixels, setModalPixels] = useState()
    const {t} = useTranslation()
    const { updateCoordinates } = useContext(UserContext)



    const onCropComplete = async (croppedArea, croppedAreaPixels) => {
        console.log(croppedArea)
        setModalPixels(croppedAreaPixels)
    }

    const handleSave = async () => {
        try {
            const data = {
                "coordinates": modalPixels,
                imageType: name === "cover" ? "cover" : "profile",
            }

            if (accountId) {
                data.accountId = accountId
            }

            if (pId) {
                data.paymentAddressId = pId
            }
            updateCoordinates(type, name, modalPixels)

            const res = await axios.put(`${import.meta.env.VITE_IP_DEV_API}/api/user/update-image-coordinates`, { data: encryptData(data) }, {
                headers: authHeader
            })
            const dec = decryptData(res.data.data)
            console.log(dec)
            toggle()
        } catch (error) {
            const decrypted = decryptData(error?.response?.data?.data)
            console.log(decrypted)
        }
    }

    const isCover = name === "cover";
    const aspect = isCover ? 4 : 4 / 3;
    const containerHeight = isCover ? 320 : 250;
    const containerWidth = isCover ? "100%" : 250;
    const cropSize = isCover ? undefined : { width: 242, height: 242 };

    return (
        <Modal style={{ minWidth: isCover ? "90%" : undefined }} isOpen={isOpen} toggle={toggle} >
            <ModalBody>
                <div style={{ position: 'relative', height: containerHeight, width: containerWidth, margin: "auto", background: "#222" }}>
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        objectFit='cover'
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape="rect"
                        {...(cropSize ? { cropSize } : {})}
                    />
                </div>
                <div className="d-flex justify-content-end mt-3">
                    <Button color="secondary" className="me-2" onClick={toggle}>{t("Cancel")}</Button>
                    <Button color="primary" onClick={handleSave}>{t("Save")}</Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default AdjustModal
