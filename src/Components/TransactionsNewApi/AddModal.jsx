import axios from 'axios'
import React, { useContext, useState } from 'react'
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { UserContext } from '../../Context/UserContext'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'

const AddModal = ({ showAddModal, setShowAddModal, setCategories }) => {
    const [isSaving, setIsSaving] = useState(false)
    const [categoryName, setCategoryName] = useState("")
    const [error, setError] = useState(false)
    const { userDetails, authHeader } = useContext(UserContext)

    const addHandler = () => {
        setIsSaving(true)
        const data =
        {
            account_id: userDetails?._id,
            name: categoryName,
            type: "user"
        }

        const encrypted = encryptData(data)

        axios.post(`${import.meta.env.VITE_IP_DEV_API}/api/transaction/add-category`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setIsSaving(false)
                setShowAddModal(false)
                setCategories(prev => [decrypted?.transactionCategory, ...prev])
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setError("We cannot process your request at the moment, please try again later.")
                setIsSaving(false)
            })
    }

    return (
        <Modal isOpen={showAddModal} toggle={() => setShowAddModal(!showAddModal)}>
            <ModalHeader toggle={() => setShowAddModal(!showAddModal)}>
                Add New Category
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label>New Category Name: </Label>
                    <Input placeholder='Category Name' className='mb-2' value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                    {error && <span style={{ color: "red", paddingTop: ".5rem" }}>{error}</span>}
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button
                    style={{
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        border: "none",
                        outline: "none"
                    }}
                    disabled={isSaving || !categoryName}
                    onClick={addHandler}
                >{isSaving ? "Saving" : "Save"}</Button>
            </ModalFooter>
        </Modal>
    )
}

export default AddModal