import React, { useContext, useRef, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input } from 'reactstrap';
import { useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../../Context/UserContext';
import { decryptData } from '../../Helper/EssentilaMethods/Decryption';
import CategoryItem from './CategoryItem';
import EditModal from './EditModal'
import DeleteModal from './DeleteModal'
import AddModal from './AddModal';
import { encryptData } from '../../Helper/EssentilaMethods/Encryption';
import { useTranslation } from "react-i18next";

const CategoryDropdown = ({ category = "", disabled = false, padding = ".7rem .5rem", disabledColor = "#e9ecef", selectedCategory, setSelectedCategory }) => {
    // modals ///////////////////////////////////////////
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    /////////////////////////////////////////////////////
    // temp////////////////////////////
    const [tempItem, setTempItem] = useState({})
    // temp////////////////////////////


    const [isOpen, setIsOpen] = useState(false);
    // const [selectedCategory, setSelectedCategory] = useState([]);
    const categoryInputRef = useRef(null)
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchedCategories, setSearchedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { authHeader, userDetails } = useContext(UserContext)
    const { t } = useTranslation()
    useEffect(() => {
        setSearchedCategories(filteredCategories)
    }, [filteredCategories])

    useEffect(() => {
        if (searchTerm) {
            const filtered = filteredCategories.filter(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()))
            setSearchedCategories(filtered)
        } else {
            setSearchedCategories(filteredCategories)
        }
    }, [searchTerm])

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/get-category/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
    }, [])

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/get-all-user-categories/${userDetails?._id}`, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                setFilteredCategories(decrypted.transactionCategoryList)
                setSearchedCategories(decrypted.transactionCategoryList)
                // console.log("account", decrypted)
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
            })
    }, [])

    useEffect(() => {
        setSelectedCategory(category)
    }, [category])

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleBugSelect = (selected) => {
        setSelectedCategory(prev => [...prev, selected]);
        const updatedFilteredCategories = filteredCategories.filter(cat => {
            if (selectedCategory.length > 0) {
                return !selectedCategory.some(it => it._id === cat._id) && selected._id !== cat._id;
            } else {
                return selected._id !== cat._id
            }
        });

        setFilteredCategories(updatedFilteredCategories);
        setSearchTerm('')
        setIsOpen(false);
    };
    useEffect(() => {
        if (isOpen) {
            categoryInputRef?.current?.focus();
        } else {
            categoryInputRef?.current?.blur()
        }
    }, [isOpen])


    const addHandler = () => {
        setIsSaving(true)
        const data =
        {
            account_id: userDetails?._id,
            name: searchTerm,
            type: "user"
        }

        const encrypted = encryptData(data)

        axios.post(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/add-category`, {
            data: encrypted
        }, {
            headers: authHeader
        })
            .then(res => {
                const decrypted = decryptData(res.data.data)
                // console.log(decrypted)
                setFilteredCategories(prev => [decrypted?.transactionCategory, ...prev])
                setSearchTerm("")
                setIsSaving(false)
                setSelectedCategory(prev => [...prev, decrypted?.transactionCategory])
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsSaving(false)
            })
    }

    return (
        <>
            <Dropdown isOpen={isOpen} toggle={toggleDropdown} style={{ width: "100%" }}>
                <DropdownToggle color='white' style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", border: "1px solid rgba(0,0,0,.05)", borderRadius: "14px", padding: padding, background: disabled ? disabledColor : "#fff", overflow: "hidden" }} disabled={disabled}>
                    {
                        isOpen
                            ?
                            <Input style={{ border: "none", outline: "none", padding: 0, margin: 0 }} placeholder='Search Here' ref={categoryInputRef} onClick={(e) => e.stopPropagation()} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            :
                            <>
                                {selectedCategory ? (
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                        <div style={{ height: "10px", width: "10px", background: "red", borderRadius: "10px" }} />
                                        <span style={{ fontWeight: 700 }}>{selectedCategory.map(it => it.name).join(", ")}</span>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 1rem", width: "100%" }}>
                                        <span style={{ color: "#a8a8a8" }}>-{t("Select From The List")}--</span>
                                        <span style={{ transform: "translateY(8px)", width: "fit-content", minWidth: "none" }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="17" viewBox="0 0 23 17" fill="none">
                                                <g filter="url(#filter0_d_3611_6068)">
                                                    <path d="M12.1766 8.51889C11.622 9.16037 10.5498 9.16037 9.99523 8.5189L4.383 2.0275C3.67119 1.20418 4.31898 -2.49871e-07 5.4737 -1.48923e-07L16.6982 8.32352e-07C17.8529 9.333e-07 18.5007 1.20418 17.7889 2.0275L12.1766 8.51889Z" fill="#5926F0" />
                                                </g>
                                                <defs>
                                                    <filter id="filter0_d_3611_6068" x="0.0859375" y="0" width="22" height="17" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                        <feComposite in2="hardAlpha" operator="out" />
                                                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
                                                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3611_6068" />
                                                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3611_6068" result="shape" />
                                                    </filter>
                                                </defs>
                                            </svg>
                                        </span>
                                    </div>
                                )
                                }
                            </>
                    }
                </DropdownToggle>
                <DropdownMenu style={{ maxHeight: "350px", overflowY: "auto", overflowX: "hidden", width: "100%" }}>
                    {searchedCategories.map((category, index) => (
                        <CategoryItem category={category} index={index} handleBugSelect={handleBugSelect} setShowEditModal={setShowEditModal} showEditModal={showEditModal} showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} setTempItem={setTempItem} />
                    ))}
                    {
                        searchTerm &&
                        <DropdownItem onClick={addHandler} style={{ opacity: 1, color: "black" }} disabled={isSaving}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: ".5rem",
                                cursor: "pointer",
                                borderRadius: "9px",
                                background: "#F8F8F8",
                                margin: ".1rem .6rem"
                            }}>
                                <div style={{ height: "10px", width: "10px", background: "#0000002e", borderRadius: "10px" }} />
                                <span style={{ fontWeight: 700 }}>Add New "{searchTerm}"</span>
                            </div>
                        </DropdownItem>
                    }
                </DropdownMenu>
            </Dropdown>
            <AddModal setShowAddModal={setShowAddModal} showAddModal={showAddModal} setCategories={setFilteredCategories} categories={filteredCategories} />
            <EditModal setShowEditModal={setShowEditModal} showEditModal={showEditModal} item={tempItem} setCategories={setFilteredCategories} categories={filteredCategories} />
            <DeleteModal showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} item={tempItem} setCategories={setFilteredCategories} categories={filteredCategories} />
        </>
    );
};

export default CategoryDropdown;