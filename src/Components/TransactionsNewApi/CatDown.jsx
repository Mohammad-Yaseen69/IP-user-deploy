import React, { useContext, useEffect, useRef, useState } from 'react'
import { X } from 'react-feather'
import { Input } from 'reactstrap'
import CatDownItem from './CatDownItem'
import axios from 'axios'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { UserContext } from '../../Context/UserContext'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'
import EditModal from './EditModal'
import DeleteModal from './DeleteModal'
import { useTranslation } from "react-i18next";

const CatDown = ({ selectedCategories, setSelectedCategories, isEditMode, item }) => {
    // dropdown
    const dropdownRef = useRef(null)
    const {t} = useTranslation()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    // modals
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // temp
    const [tempItem, setTempItem] = useState(null)

    // const current categories
    const [categories, setCategories] = useState([])
    const [searchedCategories, setSearchedCategories] = useState([{ _id: 1, name: "Hello World" }])

    // others
    const [isSaving, setIsSaving] = useState(false)

    // search field
    const [searchTerm, setSearchTerm] = useState("")

    // api data 
    const { authHeader, userDetails } = useContext(UserContext)

    useEffect(() => {
        setSearchedCategories(categories)
    }, [categories])

    useEffect(() => {
        if (searchTerm) {
            const filtered = categories.filter(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()))
            setSearchedCategories(filtered)
        } else {
            setSearchedCategories(categories)
        }
    }, [searchTerm])

    useEffect(() => {
        const getCat = () => {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/get-category/${userDetails?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data)
                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    console.log(decrypted)
                })
        }

        getCat()
    }, [])

    useEffect(() => {
        const getAllCats = () => {
            axios.get(`${process.env.REACT_APP_IP_DEV_API}/api/transaction/get-all-user-categories/${userDetails?._id}`, {
                headers: authHeader
            })
                .then(res => {
                    const decrypted = decryptData(res.data.data);
                    const selected = decrypted.transactionCategoryList?.filter(it => item?.categories.some(ite => ite === it._id));
                    setSelectedCategories(selected);
                    setCategories(decrypted?.transactionCategoryList);
                    setSearchedCategories(decrypted?.transactionCategoryList);

                })
                .catch(err => {
                    const decrypted = decryptData(err.response.data.data)
                    console.log(decrypted)
                })
        }

        getAllCats()
    }, [])


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
                setSearchTerm("")
                setIsSaving(false)
                setSelectedCategories(prev => [...prev, decrypted?.transactionCategory])
                setSearchedCategories(prev => [...prev, decrypted?.transactionCategory])
            })
            .catch(err => {
                const decrypted = decryptData(err.response.data.data)
                // console.log(decrypted)
                setIsSaving(false)
            })
    }

    const removeSelected = (item) => {
        setSelectedCategories((prev) => prev.filter((category) => category._id !== item._id));
    };

    const handleItemSelect = (selected) => {
        setSelectedCategories((prev) => {
            if (prev?.some(it => it?._id === selected?._id)) return prev;
            return [...prev, selected]
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            // Add the event listener when the dropdown is open
            document.addEventListener('click', handleClickOutside);
        }

        // Remove the event listener when the component unmounts or when the dropdown closes
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    console.log(selectedCategories)
    return (
        <>
            <div ref={dropdownRef} style={{ flex: 1, position: "relative", width: "100%" }}>
                <div style={{ width: "100%" }} onClick={() => {
                    if (isEditMode) {
                        toggleDropdown()
                    }
                }}>
                    {
                        isDropdownOpen
                            ?
                            <Input style={{ border: "none", outline: "none", padding: ".75rem 1rem", borderRadius: "14px", }} placeholder='Search Here' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onClick={e => e.stopPropagation()} />
                            :
                            <>
                                {
                                    selectedCategories.length > 0
                                        ?
                                        <div style={{ display: "flex", alignItems: "cetner", gap: "0rem", background: isEditMode ? "white" : "#e9ecef", borderRadius: "14px", padding: ".5rem", maxWidth: window.innerWidth < 650 ? "71vw" : "inherit" }}>
                                            <div style={{ display: "flex", gap: ".75rem", overflowX: "auto", maxWidth: "500px", flex: 1 }}>
                                                {
                                                    selectedCategories.map(item => (
                                                        <div key={item?._id} style={{
                                                            padding: ".5rem .75rem",
                                                            display: 'flex',
                                                            gap: ".75rem",
                                                            background: "#5936f0",
                                                            borderRadius: "10px",
                                                            pointerEvents: isEditMode ? "auto" : "none"
                                                        }}>
                                                            <span style={{ color: "white", whiteSpace: "nowrap" }}>{t(item?.name)}</span>
                                                            <div style={{
                                                                height: "15px",
                                                                width: "15px",
                                                                borderRadius: "10px",
                                                                background: "#afafaf2e",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center"
                                                            }} onClick={e => {
                                                                e.stopPropagation()
                                                                removeSelected(item)
                                                            }}>
                                                                <X size={15} color={"white"} />
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            <svg style={{ transform: "translateY(16px)" }} xmlns="http://www.w3.org/2000/svg" width="23" height="17" viewBox="0 0 23 17" fill="none">
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
                                        </div>
                                        :
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".75rem 1rem", width: window.innerWidth > 700 ? "100%" : "100%", background: isEditMode ? "white" : "#fafafa", borderRadius: "14px", pointerEvents: isEditMode ? "auto" : "none" }}>
                                            <span style={{ color: "#fd0d1b" }}>-{t("No Categories Added, Click here to add")}-</span>
                                            {/* <span style={{ transform: "translateY(8px)", minWidth: "none", maxWidth: "20px", background: "red" }}> */}
                                            {/* <svg style={{ transform: "translateY(8px)" }} xmlns="http://www.w3.org/2000/svg" width="23" height="17" viewBox="0 0 23 17" fill="none">
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
                                            </svg> */}
                                        </div>
                                }
                            </>
                    }
                </div>
                {
                    isDropdownOpen
                    &&
                    <div style={{ position: "absolute", minHeight: "100px", maxHeight: "14vh", overflowY: "scroll", top: "100%", left: 0, width: "100%", borderRadius: "14px", padding: 0, border: "none", boxShadow: "none", display: "flex", flexDirection: "column", gap: ".5rem", background: "white" }}>
                        {searchedCategories.map((category, index) => (
                            <CatDownItem
                                key={category._id}
                                category={category}
                                index={index}
                                setShowEditModal={setShowEditModal}
                                showEditModal={showEditModal}
                                showDeleteModal={showDeleteModal}
                                setShowDeleteModal={setShowDeleteModal}
                                setTempItem={setTempItem}
                                handleItemSelect={handleItemSelect}
                                removeSelected={removeSelected}
                                selected={selectedCategories.filter(item => item._id === category._id).length > 0}
                            />
                        ))}
                        {
                            searchTerm &&
                            <div onClick={addHandler} style={{
                                opacity: 1, color: "black", height: "fit-content",
                                // padding: ".75rem",
                                padding: "0 .75rem",
                                width: "100%",
                                background: "#fff",
                                borderRadius: "14px",
                                border: "none",
                                boxShadow: "none",
                            }} disabled={isSaving}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: ".5rem",
                                    cursor: "pointer",
                                    borderRadius: "9px",
                                    background: "#F8F8F8",
                                    margin: ".1rem .6rem",
                                    width: "100%"
                                }}>
                                    <div style={{ height: "10px", width: "10px", background: "#0000002e", borderRadius: "10px" }} />
                                    <span style={{ fontWeight: 700 }}>Add New "{searchTerm}"</span>
                                </div>
                            </div>
                        }
                    </div>
                }
                <EditModal setShowEditModal={setShowEditModal} showEditModal={showEditModal} item={tempItem} setCategories={setCategories} categories={categories} />
                <DeleteModal showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal} item={tempItem} setCategories={setCategories} categories={categories} />
            </div>
        </>
    )
}

export default CatDown