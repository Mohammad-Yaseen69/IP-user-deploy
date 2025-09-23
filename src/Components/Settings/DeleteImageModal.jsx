import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { useNavigate } from 'react-router'

const DeleteImageModal = ({ isOpen, toggle, imageType }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const { userDetails, authHeader, verifyToken } = useContext(UserContext)
    const navigate = useNavigate()

    const deleteHandler = () => {
        setIsDeleting(true)
        axios.delete(`${import.meta.env.VITE_IP_DEV_API}/api/account/delete-${imageType.toLowerCase()}-picture/${userDetails._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsDeleting(false)
                verifyToken()
                toggle()
                navigate("/settings")

            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsDeleting(false)
            })
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Delete {imageType} Picture
            </ModalHeader>
            <ModalBody>
                Are you sure, you want to delete you {imageType} Picture?
            </ModalBody>
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
                    Cancel
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
                    {isDeleting ? "Deleting" : "Delete"}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default DeleteImageModal