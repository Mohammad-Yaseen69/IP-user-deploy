import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

const DeleteModal = ({ isOpen, toggle, item, pAddress }) => {
    const { authHeader, getUserDocuments, getUserVideos } = useContext(UserContext)
    const [deleting, setDeleting] = useState(false)
    const navigate = useNavigate()
    const {t} = useTranslation()

    const deleteHandler = () => {
        setDeleting(true)
        axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/account/delete-document/${item?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                if(pAddress){
                    getUserVideos()
                    navigate("/payment-address")
                }else{
                    getUserDocuments()
                }
                // console.log(decrypted)
                toggle()
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                toast.error(decrypted?.message ?? "Something went wrong while deleting the file.")
            })
            .finally(() => setDeleting(false))
    }
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                {t("Confirm")}
            </ModalHeader>
            <ModalBody>
                {t("Are you sure you want to delete this portfolio item?")}
            </ModalBody>
            <ModalFooter>
                <Button onClick={deleteHandler} disabled={deleting}>{t("Delete")}</Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteModal