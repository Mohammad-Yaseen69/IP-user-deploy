import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { Modal, ModalBody, Button } from 'reactstrap'

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.crossOrigin = url
        image.addEventListener('error', (error) => reject(error))
        image.src = url
    })

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, 'image/jpeg')
    })
}

const AdjustModal = ({ isOpen, toggle, imageUrl, setFile }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels)
            setFile(croppedImage)
            toggle()
        } catch (error) {
            console.error('Error cropping image:', error)
        }
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle} >
            <ModalBody>
                <div style={{ position: 'relative', height: '250px', margin: "auto" }}>
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={4 / 3}
                        onCropChange={setCrop}
                        objectFit='cover'
                        onCropComplete={onCropComplete}

                        onZoomChange={setZoom}
                        cropSize={{ width: 242, height: 242 }}
                    />
                </div>
                <div className="d-flex justify-content-end mt-3">
                    <Button color="secondary" className="me-2" onClick={toggle}>Cancel</Button>
                    <Button color="primary" onClick={handleSave}>Save</Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default AdjustModal
