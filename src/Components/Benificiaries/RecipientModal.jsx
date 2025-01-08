import { Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { Edit, Trash2, Save } from 'react-feather';
import { useDispatch } from 'react-redux';
import { deleteBeneficiary, updateBeneficiary } from '../../store/slices/Beneficiaries';
import { useState } from 'react';
import BenConfirmationModal from './ConfirmationModal';

const RecipientModal = ({ modalOpen, toggleModal, user, setData, data }) => {
    const dispatch = useDispatch()
    const [showDelModal, setShowDelModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const toggleDel = () => setShowDelModal(!showDelModal)

    const [formData, setFormData] = useState({
        first_name: user.first_name,
        last_name: user.last_name,
        company_name: user.company_name,
        country: user.country,
        city: user.city,
        address: user.address,
        email: user.email,
        phone: user.phone,
        relation: user.relation,
        account_type: user.account_type?.join(", "),
        wallet: user.wallet?.join(", "),
        account_holder_name: user.account_holder_name,
        bank_name: user.bank_name,
        bank_branch_name: user.bank_branch_name,
        bank_account_number: user.bank_account_number,
        bank_branch_street: user.bank_branch_street,
        bank_city: user.bank_city,
        bank_province: user.bank_province,
        bank_postal_code: user.bank_postal_code,
        mobile_wallet_provider: user.mobile_wallet_provider,
        mobile_wallet_number: user.mobile_wallet_number,
        mobile_wallet_name: user.mobile_wallet_name,
        mobile_wallet_account_number: user.mobile_wallet_account_number,
        crypto_currency: user.crypto_currency,
        crypto_address: user.crypto_wallet_address,
        card_holder_one: user.card[0]?.card_name,
        card_number_one: user.card[0]?.card_number,
        card_expiry_one: user.card[0]?.card_expiry,
        card_holder_two: user.card[1]?.card_name,
        card_number_two: user.card[1]?.card_number,
        card_expiry_two: user.card[1]?.card_expiry,
        card_holder_three: user.card[2]?.card_name,
        card_number_three: user.card[2]?.card_number,
        card_expiry_three: user.card[2]?.card_expiry,
    })

    const inputChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const updateHandler = () => {

        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            company_name: formData.company_name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            relation: formData.relation,
            account: user?._id,
            beneficiary_type: user?.beneficiary_type,
            account_type: [...formData.account_type?.split(",")],
            isUsaBank: false,
            wallet: [...formData.wallet?.split(",")],
            // banK_swift_code: accNumType === "Swift" ? ibanSwift : "",
            // bank_iban: accNumType === "IBAN" ? ibanSwift : "",
            bank_account_number: formData.bank_account_number,
            bank_name: formData.bank_name,
            bank_branch_name: formData.bank_branch_name,
            bank_branch_street: formData.bank_branch_street,
            bank_city: formData.bank_city,
            bank_province: formData.bank_province,
            bank_postal_code: formData.bank_postal_code,
            bank_account_holder_name: formData.account_holder_name,
            mobile_money_provider: formData.mobile_wallet_provider,
            mobile_wallet_name: formData.mobile_wallet_name,
            mobile_wallet_account_number: formData.mobile_wallet_account_number,
            crypto_currency: formData.crypto_currency,
            crypto_wallet_address: formData.crypto_address,
            card: [
                {
                    card_name: formData.card_holder_one,
                    card_number: formData.card_number_one,
                    card_expiry: formData.card_expiry_one
                },
                {
                    card_name: formData.card_holder_two,
                    card_number: formData.card_number_two,
                    card_expiry: formData.card_expiry_two
                },
                {
                    card_name: formData.card_holder_three,
                    card_number: formData.card_number_three,
                    card_expiry: formData.card_expiry_three
                },
            ]
        }

        const filtered = data.filter(item => item.id !== user?.id)
        setData([payload, ...filtered])

        dispatch(updateBeneficiary(payload))
        setEditMode(false)
    }

    return (
        <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>{user?.first_name} {user?.last_name}'s Details</ModalHeader>
            <ModalBody>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: ".5rem", gap: "1rem" }}>
                    {
                        !editMode
                            ?
                            <Edit size={20} className="mr-2" cursor={"pointer"} onClick={() => setEditMode(true)} />
                            :
                            <Save size={20} className="mr-2" cursor={"pointer"} onClick={updateHandler} />
                    }
                    <Trash2 size={20} cursor={"pointer"} color="red" onClick={toggleDel} />
                    <BenConfirmationModal
                        heading={"Confirm"}
                        message={"Are you sure, you want to delete the beneficiary?"}
                        isOpen={showDelModal}
                        toggle={toggleDel}
                        onCancel={toggleDel}
                        onConfirm={() => {
                            setData(prev => prev.filter(item => item.id !== user?.id))
                            dispatch(deleteBeneficiary(user?.id))
                            toggleDel()
                            toggleModal()
                        }}
                    />
                </div>
                <div className='text-center mb-4'>
                    <div style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "25px",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(-24deg, rgb(210, 60, 122) 0%, rgb(164, 52, 167) 43.66%, rgb(88, 38, 239) 100%)",
                        color: "white",
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        margin: "1rem auto"
                    }}>{user?.beneficiary_type === "individual" ? user.first_name[0] : user.company_name[0]}</div>
                    {
                        user.beneficiary_type === "indiviual"
                        &&
                        <>
                            {
                                editMode
                                    ?
                                    <Input type='text' name='first_name' value={formData.first_name} onChange={inputChangeHandler} />
                                    :
                                    <h4>{user?.first_name}</h4>
                            }
                            {
                                editMode
                                    ?
                                    <Input type='text' name='last_name' value={formData.last_name} onChange={inputChangeHandler} />
                                    :
                                    <h4>{user?.last_name}</h4>
                            }
                        </>
                    }
                    {
                        user.beneficiary_type === "business"
                        &&
                        <>
                            {
                                editMode
                                    ?
                                    <Input type='text' name='company_name' value={formData.company_name} onChange={inputChangeHandler} />
                                    :
                                    <h4>{user?.company_name}</h4>
                            }
                        </>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Country: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='country' value={formData.country} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.country}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Address: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='address' value={formData.address} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.address}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>City: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='city' value={formData.city} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.city}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Email Address: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='email' value={formData.email} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.email}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Mobile Number: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='phone' value={formData.phone} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.phone}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Account Type: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='account_type' value={formData.account_type} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.account_type}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Bank Name: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='bank_name' value={formData.bank_name} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.bank_name}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Branch Name: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='bank_branch_name' value={formData.bank_branch_name} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.bank_branch_name}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Account Number: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='bank_account_number' value={formData.bank_account_number} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.bank_account_number}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>InstaPay Wallets: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='mobile_wallet_number' value={formData.wallet} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.wallet}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Wallet Name: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='mobile_wallet_name' value={formData.mobile_wallet_name} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.mobile_wallet_name}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Wallet Account Number: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='mobile_wallet_account_number' value={formData.mobile_wallet_account_number} onChange={inputChangeHandler} />
                            :
                            <h5>{user?.mobile_wallet_account_number}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card One Holder: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_holder_one' value={formData.card_holder_one} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_holder_one}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card One Account Number: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_number_one' value={formData.card_number_one} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_number_one}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card One Expiry: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_expiry_one' value={formData.card_expiry_one} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_expiry_one}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card Two Holder: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_holder_two' value={formData.card_holder_two} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_holder_two}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card Two Account Number: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_number_two' value={formData.card_number_two} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_number_two}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card Two Expiry: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_expiry_two' value={formData.card_expiry_two} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_expiry_two}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card Three Holder: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_holder_three' value={formData.card_holder_three} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_holder_three}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card Three Account Number: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_number_three' value={formData.card_number_three} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_number_three}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Card Three Expiry: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='card_expiry_three' value={formData.card_expiry_three} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.card_expiry_three}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Crypto Currency: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='crypto_currency' value={formData.crypto_currency} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.crypto_currency}</h5>
                    }
                </div>
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem", alignItems: "center" }}>
                    <Label>Crypto Account Address: </Label>
                    {
                        editMode
                            ?
                            <Input type='text' name='crypto_address' value={formData.crypto_address} onChange={inputChangeHandler} />
                            :
                            <h5>{formData.crypto_address}</h5>
                    }
                </div>
            </ModalBody>
        </Modal>
    )
}

export default RecipientModal