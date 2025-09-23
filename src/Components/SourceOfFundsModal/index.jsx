import React, { useState } from 'react'
import { useContext } from 'react'
import { UserContext } from '../../Context/UserContext'
import axios from 'axios'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import { toast } from 'react-toastify'
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter } from 'reactstrap'
import { sourceOfFunds } from '../Settings/Verification'
import { t } from 'i18next'

const SourceOfFunds = ({ isOpen, toggle }) => {
    const { userDetails, authHeader } = useContext(UserContext)
    const [source, setSource] = useState("")
    const [loading, setLoading] = useState(false)


    const addSourceOfFunds = async () => {
        setLoading(true)
        try {
            const enc = encryptData({
                account_id: userDetails?._id,
                source_of_funds: source
            })
            const res = await axios.put(
                `${import.meta.env.VITE_IP_DEV_API}/api/user/add-source-of-funds`,
                {
                    data: enc
                },
                {
                    headers: authHeader
                }
            )
            toast.success("Source of funds has been added successfully!")
            toggle()
        }
        catch (error) {
            toast.error("Something went wrong while adding source of funds.")
        }
        finally {
            setLoading(false)
        }
    }


    return (
        <Modal isOpen={isOpen}>
            <ModalBody>
                <FormGroup>
                    <Label>{t("Select your source of funds")}</Label>
                    <Input type="select" className="form-control" value={source} onChange={e => setSource(e.target.value)}>
                        <option value="" disabled="">Select</option>
                        {
                            sourceOfFunds.map(item => (
                                <option value={item.toUpperCase()}>{t(item)}</option>
                            ))
                        }
                    </Input>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color='primary' onClick={addSourceOfFunds} disabled={!source || loading}>
                    {t("Continue")}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default SourceOfFunds