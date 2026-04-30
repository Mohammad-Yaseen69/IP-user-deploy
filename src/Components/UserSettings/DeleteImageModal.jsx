import axios from 'axios'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
const DeleteImageModal = ({ isOpen, toggle, imageType }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const { userDetails, authHeader, setUserRefresh } = useContext(UserContext)
    const navigate = useNavigate()
    const { t } = useTranslation()
    const deleteHandler = () => {
        setIsDeleting(true)
        axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/account/delete-${imageType.toLowerCase()}-picture/${userDetails._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsDeleting(false)
                setUserRefresh(prev => prev + 1)
                toggle()
                navigate("/settings")

            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsDeleting(false)
                setUserRefresh(prev => prev + 1)
            })
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {t("Delete")} {imageType} {t("Picture")}
            </ModalHeader>
            <ModalBody>
                {t("Are you sure, you want to delete your {{imageType}} picture?", {
                    imageType: imageType
                })
                }            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={toggle}
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }}
                >
                    {t("Cancel")}
                </Button>
                <Button
                    onClick={deleteHandler}
                    disabled={isDeleting}
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none",
                        borderRadius: "10px"
                    }}
                >
                    {isDeleting ? t("Deleting") : t("Delete")}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteImageModal