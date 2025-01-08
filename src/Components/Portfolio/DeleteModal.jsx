import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'

const DeleteModal = ({ isOpen, toggle, item }) => {
    const { authHeader, getUserDocuments } = useContext(UserContext)
    const [deleting, setDeleting] = useState(false)

    const deleteHandler = () => {
        setDeleting(true)
        axios.delete(`${process.env.REACT_APP_IP_DEV_API}/api/account/delete-document/${item?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                getUserDocuments()
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
                Confirm
            </ModalHeader>
            <ModalBody>
                Are you sure you want to delete this portfolio item?
            </ModalBody>
            <ModalFooter>
                <Button onClick={deleteHandler} disabled={deleting}>Delete</Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteModal