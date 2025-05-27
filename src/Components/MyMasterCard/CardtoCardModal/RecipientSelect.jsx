import React, { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from "../styles/CardToCard.module.scss";
import { ChevronDown } from 'react-feather';
import UserInfo from './UserInfo';
import axios from 'axios';
import { encryptData } from '../../../Helper/EssentilaMethods/Encryption';
import { UserContext } from '../../../Context/UserContext';
import { decryptData } from '../../../Helper/EssentilaMethods/Decryption';
import InstaPayLoader from '../../Loader';

const numberOfFields = 4;

const RecipientSelect = ({ dataHandler, data }) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [inputValues, setInputValues] = useState(["", "", "", ""]);
    const [userName, setUserName] = useState("");
    const { authHeader } = useContext(UserContext);
    const { t } = useTranslation();

    const [searchState, setSearchState] = useState({
        last4: {
            data: [],
            loading: false,
            error: null
        },
        username: {
            data: null,
            loading: false,
            error: null
        }
    });

    const inputRefs = useRef(Array(numberOfFields).fill(null));

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    const handleInputChange = (index, value) => {
        let numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue < 0 || String(numericValue)?.includes("+") || String(numericValue)?.includes("-") || String(numericValue)?.includes("e")) {
            return;
        }
        if (numericValue.length > 1) {
            numericValue = numericValue.slice(-1);
        }
        let newOTPValues = [...inputValues];
        newOTPValues[index] = numericValue;
        setInputValues(newOTPValues);

        if (numericValue && index < numberOfFields - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleInputKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            if (inputValues[index] === '' && index > 0) {
                inputRefs.current[index - 1].focus();
            } else if (index > 0) {
                const newOTPValues = [...inputValues];
                newOTPValues[index] = '';
                setInputValues(newOTPValues);
            }
        }
    };

    const searchUser = async (searchType, query) => {
        try {
            setSearchState(prev => ({
                ...prev,
                [searchType]: {
                    ...prev[searchType],
                    loading: true,
                    error: null
                }
            }));

            const data = {
                searchType: searchType,
                query: query
            };

            const res = await axios.post(
                `${process.env.REACT_APP_IP_DEV_API}/api/mastercard/lookup`,
                { data: encryptData(data) },
                { headers: authHeader }
            );

            const dec = decryptData(res.data.data);

            setSearchState(prev => ({
                ...prev,
                [searchType]: {
                    loading: false,
                    error: null,
                    data: dec.data
                }
            }));

        } catch (error) {
            const errorMessage = error.response?.status === 404
                ? t("No results found")
                : t("An error occurred while searching");

            setSearchState(prev => ({
                ...prev,
                [searchType]: {
                    ...prev[searchType],
                    loading: false,
                    error: errorMessage,
                    data: searchType === 'last4' ? [] : null
                }
            }));
        }
    };

    return (
        <div className={styles.rSelect}>
            <div className={styles.customDropdown}>
                <div
                    className={`${styles.dropdownHeader} ${activeDropdown === 0 ? styles.active : ''}`}
                    onClick={() => toggleDropdown(0)}
                >
                    <div>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M9 9H9.00375M12.75 9H12.7538M5.25 9H5.25375M3.9 5.25H14.1C14.9401 5.25 15.3601 5.25 15.681 5.41349C15.9632 5.5573 16.1927 5.78677 16.3365 6.06901C16.5 6.38988 16.5 6.80992 16.5 7.65V10.35C16.5 11.1901 16.5 11.6101 16.3365 11.931C16.1927 12.2132 15.9632 12.4427 15.681 12.5865C15.3601 12.75 14.9401 12.75 14.1 12.75H3.9C3.05992 12.75 2.63988 12.75 2.31901 12.5865C2.03677 12.4427 1.8073 12.2132 1.66349 11.931C1.5 11.6101 1.5 11.1901 1.5 10.35V7.65C1.5 6.80992 1.5 6.38988 1.66349 6.06901C1.8073 5.78677 2.03677 5.5573 2.31901 5.41349C2.63988 5.25 3.05992 5.25 3.9 5.25ZM9.1875 9C9.1875 9.10355 9.10355 9.1875 9 9.1875C8.89645 9.1875 8.8125 9.10355 8.8125 9C8.8125 8.89645 8.89645 8.8125 9 8.8125C9.10355 8.8125 9.1875 8.89645 9.1875 9ZM12.9375 9C12.9375 9.10355 12.8536 9.1875 12.75 9.1875C12.6464 9.1875 12.5625 9.10355 12.5625 9C12.5625 8.89645 12.6464 8.8125 12.75 8.8125C12.8536 8.8125 12.9375 8.89645 12.9375 9ZM5.4375 9C5.4375 9.10355 5.35355 9.1875 5.25 9.1875C5.14645 9.1875 5.0625 9.10355 5.0625 9C5.0625 8.89645 5.14645 8.8125 5.25 8.8125C5.35355 8.8125 5.4375 8.89645 5.4375 9Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>

                        <h3>{t('Search by Last 4 Digits of Card Number')}</h3>
                    </div>
                    <span className={styles.arrow}><ChevronDown /></span>
                </div>
                {activeDropdown === 0 && (
                    <div className={styles.dropdownContent}>
                        <div className={styles.dropdownItem}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    searchUser("last4", inputValues.join(""));
                                }} className={styles.searchNumbers}>
                                <div className={styles.nums}>
                                    {inputValues.map((value, index) => (
                                        <input
                                            key={index}
                                            maxLength={1}
                                            value={value}
                                            onChange={(e) => {
                                                handleInputChange(index, e.target.value);
                                            }}
                                            className={styles}
                                            onKeyDown={(e) => handleInputKeyDown(index, e)}
                                            ref={(input) => (inputRefs.current[index] = input)}
                                        />
                                    ))}
                                </div>

                                <button type="submit">{t('Lookup')}</button>
                            </form>

                            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                                {searchState.last4?.loading ? (
                                    <div style={{ width: "100px" }}>
                                        <InstaPayLoader />
                                    </div>
                                ) : searchState.last4?.error ? (
                                    <div className={styles.error}>{searchState.last4.error}</div>
                                ) : (
                                    searchState.last4.data?.map((item) => (
                                        item?.cards?.map((card) => (
                                            <UserInfo
                                                key={card?.last4}
                                                name={item?.user?.fullName}
                                                pfp={item?.user?.profileImage}
                                                country={item?.user?.country}
                                                card={card?.last4}
                                                currency={card?.currency}
                                                data={data}
                                                onClick={() => dataHandler('recipient', {
                                                    user: item.user,
                                                    card: card
                                                })}
                                            />
                                        ))
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.customDropdown}>
                <div
                    className={`${styles.dropdownHeader} ${activeDropdown === 1 ? styles.active : ''}`}
                    onClick={() => toggleDropdown(1)}
                >
                    <div>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                                <path d="M15 16.7307C15 15.684 15 15.1607 14.8708 14.7349C14.58 13.7761 13.8297 13.0257 12.8709 12.7349C12.445 12.6057 11.9217 12.6057 10.875 12.6057H7.125C6.07833 12.6057 5.55499 12.6057 5.12914 12.7349C4.17034 13.0257 3.42003 13.7761 3.12918 14.7349C3 15.1607 3 15.684 3 16.7307M12.375 6.60571C12.375 8.46967 10.864 9.98071 9 9.98071C7.13604 9.98071 5.625 8.46967 5.625 6.60571C5.625 4.74175 7.13604 3.23071 9 3.23071C10.864 3.23071 12.375 4.74175 12.375 6.60571Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>

                        <h3>{t('Search by Username')}</h3>
                    </div>
                    <span className={styles.arrow}><ChevronDown /></span>
                </div>
                {activeDropdown === 1 && (
                    <div className={styles.dropdownContent}>
                        <div className={styles.dropdownItem}>
                            <form onSubmit={(e) => { e.preventDefault(); searchUser("username", userName); }} className={styles.searchNumbers} style={{ gap: "20px" }}>
                                <div className={styles.nums} style={{ width: "100%" }}>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        style={{ width: "100%", padding: "12px 14px", textAlign: "start" }}
                                        placeholder={t('Enter username')}
                                    />
                                </div>

                                <button type='submit'>{t('Lookup')}</button>
                            </form>

                            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                                {searchState.username.loading ? (
                                    <div style={{ width: "100px" }}>
                                        <InstaPayLoader />
                                    </div>
                                ) : searchState.username.error ? (
                                    <div className={styles.error}>{searchState.username.error}</div>
                                ) : (
                                    searchState.username.data?.cards?.map((card) => (
                                        <UserInfo
                                            key={card?.last4}
                                            name={searchState.username.data?.user?.fullName}
                                            pfp={searchState.username.data?.user?.profileImage}
                                            country={searchState.username.data?.user?.country}
                                            card={card?.last4}
                                            currency={card?.currency}
                                            data={data}
                                            onClick={() => dataHandler('recipient', {
                                                user: searchState.username?.data?.user,
                                                card: card
                                            })}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.customDropdown}>
                <div
                    className={`${styles.dropdownHeader} ${activeDropdown === 2 ? styles.active : ''}`}
                    onClick={() => toggleDropdown(2)}
                >

                    <div>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                                <g clip-path="url(#clip0_4003_7363)">
                                    <path d="M3.00002 17.3438C3.45195 17.4807 4.06237 17.4807 5.1 17.4807H12.9C13.9376 17.4807 14.548 17.4807 15 17.3438M3.00002 17.3438C2.90312 17.3144 2.8135 17.2788 2.72852 17.2355C2.30516 17.0198 1.96095 16.6756 1.74524 16.2522C1.5 15.7709 1.5 15.1408 1.5 13.8807V6.08071C1.5 4.82059 1.5 4.19054 1.74524 3.70923C1.96095 3.28587 2.30516 2.94166 2.72852 2.72595C3.20982 2.48071 3.83988 2.48071 5.1 2.48071H12.9C14.1601 2.48071 14.7902 2.48071 15.2715 2.72595C15.6948 2.94166 16.039 3.28587 16.2548 3.70923C16.5 4.19054 16.5 4.82059 16.5 6.08071V13.8807C16.5 15.1408 16.5 15.7709 16.2548 16.2522C16.039 16.6756 15.6948 17.0198 15.2715 17.2355C15.1865 17.2788 15.0969 17.3144 15 17.3438M3.00002 17.3438C3.00026 16.7368 3.0039 16.4156 3.05764 16.1454C3.29436 14.9554 4.22466 14.0251 5.41473 13.7884C5.70453 13.7307 6.05302 13.7307 6.75 13.7307H11.25C11.947 13.7307 12.2955 13.7307 12.5853 13.7884C13.7753 14.0251 14.7056 14.9554 14.9424 16.1454C14.9961 16.4156 14.9997 16.7368 15 17.3438M12 8.10571C12 9.76257 10.6569 11.1057 9 11.1057C7.34315 11.1057 6 9.76257 6 8.10571C6 6.44886 7.34315 5.10571 9 5.10571C10.6569 5.10571 12 6.44886 12 8.10571Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_4003_7363">
                                        <rect width="18" height="18" fill="white" transform="translate(0 0.980713)" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </span>

                        <h3>{t('Select from Saved Contacts')}</h3>
                    </div>
                    <span className={styles.arrow}><ChevronDown /></span>
                </div>
                {activeDropdown === 2 && (
                    <div className={styles.dropdownContent}>
                        {/* <div className={styles.dropdownItem}>Option 1</div>
                        <div className={styles.dropdownItem}>Option 2</div>
                        <div className={styles.dropdownItem}>Option 3</div> */}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipientSelect;