import React, { useContext, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import axios from 'axios'

const DeleteModal = ({ showDeleteModal, setShowDeleteModal, item, categories, setCategories }) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const { userDetails, authHeader } = useContext(UserContext)

    const deleteHandler = () => {
        setIsDeleting(true)
        const data =
        {
            account_id: userDetails?._id,
            type: "user",
            categoryId: item?._id
        }

        // console.log(data)
        const encrypted = encryptData(data)
        // console.log(encrypted)
        axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/delete-category`, {
            data: { data: encrypted }
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsDeleting(false)
                setShowDeleteModal(false)
                const filteredList = categories.filter(it => it._id !== item._id)
                setCategories([...filteredList])
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsDeleting(false)
            })
    }
    return (
        <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(!showDeleteModal)}>
            <ModalHeader toggle={() => setShowDeleteModal(!showDeleteModal)}>
                Edit Category
            </ModalHeader>
            <ModalBody>
                <p>
                    Are you sure, You want to remove this category?
                </p>
            </ModalBody>
            <ModalFooter>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                    onClick={() => setShowDeleteModal(!showDeleteModal)}
                >Cancel</Button>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                    onClick={deleteHandler}
                    disabled={isDeleting}
                >{isDeleting ? "Deleting" : "Delete"}</Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteModal