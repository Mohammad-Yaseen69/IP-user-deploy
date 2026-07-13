import { Box, FormControl, IconButton, MenuItem, Modal, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { ArrowLeft, Info, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from './DynamicChannelModal.module.css';

const DynamicChannelModal = ({ open, handleClose, beneficiaryData, onSave }) => {
    const { t } = useTranslation();

    const countryConfigs = {
        spain: { label: 'Spain, Germany, France', swiftRequired: false, placeholder: 'ES65 6849 0001 5900 0113 6464' },
        senegal: { label: 'Senegal, Morocco', swiftRequired: true, placeholder: 'SN65 7849 0001 5900 0113 1122' },
        uk: { label: 'United Kingdom', swiftRequired: false, placeholder: 'GB29 UKBU 6016 1331 9268 11' },
        usa: { label: 'United States', swiftRequired: true, placeholder: 'Routing / Account Number combo' }
    };

    const [channelType, setChannelType] = useState('bank_account');
    const [selectedCountry, setSelectedCountry] = useState('spain');

    // Form States
    const [iban, setIban] = useState('');
    const [swift, setSwift] = useState('');
    const [cryptoNetwork, setCryptoNetwork] = useState('ethereum');
    const [walletAddress, setWalletAddress] = useState('');
    const [mobileProvider, setMobileProvider] = useState('mpesa');
    const [mobileNumber, setMobileNumber] = useState('');

    useEffect(() => {
        setIban('');
        setSwift('');
        setWalletAddress('');
        setMobileNumber('');
    }, [selectedCountry, channelType]);

    const currentConfig = countryConfigs[selectedCountry] || countryConfigs.spain;

    const commonInputStyles = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "11px",
            background: "#FAF9FD",
            border: "1px solid #ECE9F5",
            transition: "all 0.2s ease-in-out",
            "& fieldset": { border: "none" },
            "&:hover": { borderColor: "#D1C9E9" },
            "&.Mui-focused": { border: "1px solid #4F46E5", background: "#FFFFFF" }
        },
        "& .MuiOutlinedInput-input": {
            padding: "11px 13px",
            fontSize: "14px",
            color: "#101828",
        },
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let payload = { channelType, region: currentConfig.label };

        if (channelType === 'bank_account') {
            if (currentConfig.swiftRequired && !swift) {
                alert(t("SWIFT/BIC is required for this region"));
                return;
            }
            payload = { ...payload, iban, swift };
        } else if (channelType === 'crypto') {
            if (!walletAddress) return alert(t("Wallet address is required"));
            payload = { ...payload, cryptoNetwork, walletAddress };
        } else if (channelType === 'mobile_wallet') {
            if (!mobileNumber) return alert(t("Mobile number is required"));
            payload = { ...payload, mobileProvider, mobileNumber };
        }

        onSave(payload);
        handleClose();
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="dynamic-channel-modal">
            <Box className={styles.modalBox}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.iconCircle}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M16.9102 1.08984C16.8281 1.00781 16.7373 0.946289 16.6377 0.905273C16.5381 0.864258 16.4297 0.84375 16.3125 0.84375C16.1953 0.84375 16.084 0.864258 15.9785 0.905273C15.873 0.946289 15.7852 1.00781 15.7148 1.08984L12.2344 4.57031L12.0586 4.39453C11.8242 4.17188 11.5547 3.99316 11.25 3.8584C10.9453 3.72363 10.6172 3.65625 10.2656 3.65625C9.91406 3.65625 9.58594 3.72363 9.28125 3.8584C8.97656 3.99316 8.70703 4.17188 8.47266 4.39453L7.03125 5.83594L6.78516 5.58984C6.70312 5.50781 6.6123 5.44629 6.5127 5.40527C6.41309 5.36426 6.30469 5.34375 6.1875 5.34375C5.95312 5.34375 5.75391 5.42578 5.58984 5.58984C5.42578 5.75391 5.34375 5.95312 5.34375 6.1875C5.34375 6.30469 5.36426 6.41309 5.40527 6.5127C5.44629 6.6123 5.50781 6.70312 5.58984 6.78516L5.83594 7.03125L4.39453 8.47266C4.17188 8.70703 3.99316 8.97656 3.8584 9.28125C3.72363 9.58594 3.65625 9.91406 3.65625 10.2656C3.65625 10.6172 3.72363 10.9453 3.8584 11.25C3.99316 11.5547 4.17188 11.8242 4.39453 12.0586L4.57031 12.2344L1.08984 15.7148C1.01953 15.7969 0.960938 15.8877 0.914062 15.9873C0.867187 16.0869 0.84375 16.1953 0.84375 16.3125C0.84375 16.5469 0.925781 16.7461 1.08984 16.9102C1.25391 17.0742 1.45312 17.1562 1.6875 17.1562C1.80469 17.1562 1.91602 17.1357 2.02148 17.0947C2.12695 17.0537 2.21484 16.9922 2.28516 16.9102L5.76562 13.4297L5.94141 13.6055C6.17578 13.8281 6.44531 14.0068 6.75 14.1416C7.05469 14.2764 7.38281 14.3438 7.73438 14.3438C8.08594 14.3438 8.41699 14.2764 8.72754 14.1416C9.03809 14.0068 9.30469 13.8281 9.52734 13.6055L10.9688 12.1641L11.2148 12.4102C11.2969 12.4922 11.3877 12.5537 11.4873 12.5947C11.5869 12.6357 11.6953 12.6562 11.8125 12.6562C12.0469 12.6562 12.2461 12.5742 12.4102 12.4102C12.5742 12.2461 12.6562 12.0469 12.6562 11.8125C12.6562 11.6953 12.6357 11.5869 12.5947 11.4873C12.5537 11.3877 12.4922 11.2969 12.4102 11.2148L12.1641 10.9688L13.6055 9.52734C13.8398 9.29297 14.0215 9.02344 14.1504 8.71875C14.2793 8.41406 14.3438 8.08594 14.3438 7.73438C14.3438 7.38281 14.2793 7.05469 14.1504 6.75C14.0215 6.44531 13.8398 6.17578 13.6055 5.94141L13.4297 5.76562L16.9102 2.28516C16.9922 2.20312 17.0537 2.1123 17.0947 2.0127C17.1357 1.91309 17.1562 1.80469 17.1562 1.6875C17.1562 1.57031 17.1357 1.46191 17.0947 1.3623C17.0537 1.2627 16.9922 1.17188 16.9102 1.08984ZM8.33203 12.4102C8.26172 12.4922 8.17383 12.5537 8.06836 12.5947C7.96289 12.6357 7.85156 12.6562 7.73438 12.6562C7.61719 12.6562 7.50879 12.6357 7.40918 12.5947C7.30957 12.5537 7.21875 12.4922 7.13672 12.4102L5.58984 10.8633C5.50781 10.7812 5.44629 10.6904 5.40527 10.5908C5.36426 10.4912 5.34375 10.3828 5.34375 10.2656C5.34375 10.1484 5.36426 10.0371 5.40527 9.93164C5.44629 9.82617 5.50781 9.73828 5.58984 9.66797L7.03125 8.22656L9.77344 10.9688L8.33203 12.4102ZM12.4102 8.33203L10.9688 9.77344L8.22656 7.03125L9.66797 5.58984C9.73828 5.50781 9.82617 5.44629 9.93164 5.40527C10.0371 5.36426 10.1484 5.34375 10.2656 5.34375C10.3828 5.34375 10.4912 5.36426 10.5908 5.40527C10.6904 5.44629 10.7812 5.50781 10.8633 5.58984L12.4102 7.13672C12.4922 7.21875 12.5537 7.30957 12.5947 7.40918C12.6357 7.50879 12.6562 7.61719 12.6562 7.73438C12.6562 7.85156 12.6357 7.96289 12.5947 8.06836C12.5537 8.17383 12.4922 8.26172 12.4102 8.33203ZM5.99414 2.33789C5.9707 2.29102 5.9502 2.23535 5.93262 2.1709C5.91504 2.10645 5.90625 2.04492 5.90625 1.98633C5.90625 1.75195 5.98828 1.55273 6.15234 1.38867C6.31641 1.22461 6.51562 1.14258 6.75 1.14258C6.91406 1.14258 7.06348 1.18359 7.19824 1.26562C7.33301 1.34766 7.43555 1.45312 7.50586 1.58203V1.59961L8.06836 2.72461C8.0918 2.77148 8.1123 2.83008 8.12988 2.90039C8.14746 2.9707 8.15625 3.04102 8.15625 3.11133C8.15625 3.3457 8.07422 3.54492 7.91016 3.70898C7.74609 3.87305 7.54688 3.95508 7.3125 3.95508C7.14844 3.95508 6.99902 3.91113 6.86426 3.82324C6.72949 3.73535 6.62695 3.62109 6.55664 3.48047V3.46289L5.99414 2.33789ZM1.21289 6.38086C1.2832 6.24023 1.38574 6.12598 1.52051 6.03809C1.65527 5.9502 1.80469 5.90625 1.96875 5.90625C2.03906 5.90625 2.10645 5.91504 2.1709 5.93262C2.23535 5.9502 2.29688 5.9707 2.35547 5.99414H2.33789L3.46289 6.55664C3.61523 6.62695 3.73535 6.72949 3.82324 6.86426C3.91113 6.99902 3.95508 7.14844 3.95508 7.3125C3.95508 7.54688 3.87305 7.74609 3.70898 7.91016C3.54492 8.07422 3.3457 8.15625 3.11133 8.15625C3.04102 8.15625 2.9707 8.14746 2.90039 8.12988C2.83008 8.1123 2.76562 8.0918 2.70703 8.06836H2.72461L1.59961 7.50586C1.45898 7.43555 1.34473 7.33301 1.25684 7.19824C1.16895 7.06348 1.125 6.91406 1.125 6.75C1.125 6.67969 1.13379 6.6123 1.15137 6.54785C1.16895 6.4834 1.18945 6.42188 1.21289 6.36328V6.38086ZM16.7871 11.6191C16.7168 11.7598 16.6143 11.874 16.4795 11.9619C16.3447 12.0498 16.1953 12.0938 16.0312 12.0938C15.9609 12.0938 15.8936 12.085 15.8291 12.0674C15.7646 12.0498 15.7031 12.0293 15.6445 12.0059H15.6621L14.5371 11.4434C14.3965 11.373 14.2852 11.2705 14.2031 11.1357C14.1211 11.001 14.0801 10.8516 14.0801 10.6875C14.0801 10.4531 14.1621 10.2539 14.3262 10.0898C14.4902 9.92578 14.6895 9.84375 14.9238 9.84375C14.9824 9.84375 15.0439 9.85254 15.1084 9.87012C15.1729 9.8877 15.2344 9.9082 15.293 9.93164H15.2754L16.4004 10.4941C16.541 10.5645 16.6553 10.667 16.7432 10.8018C16.8311 10.9365 16.875 11.0859 16.875 11.25C16.875 11.3203 16.8662 11.3877 16.8486 11.4521C16.8311 11.5166 16.8105 11.5781 16.7871 11.6367V11.6191ZM12.0059 15.6621C12.0293 15.709 12.0498 15.7676 12.0674 15.8379C12.085 15.9082 12.0938 15.9785 12.0938 16.0488C12.0938 16.2832 12.0117 16.4824 11.8477 16.6465C11.6836 16.8105 11.4844 16.8926 11.25 16.8926C11.0859 16.8926 10.9365 16.8486 10.8018 16.7607C10.667 16.6729 10.5645 16.5586 10.4941 16.418V16.4004L9.93164 15.2754C9.9082 15.2285 9.8877 15.1729 9.87012 15.1084C9.85254 15.0439 9.84375 14.9824 9.84375 14.9238C9.84375 14.6895 9.92578 14.4902 10.0898 14.3262C10.2539 14.1621 10.4531 14.0801 10.6875 14.0801C10.8516 14.0801 11.001 14.1211 11.1357 14.2031C11.2705 14.2852 11.373 14.3906 11.4434 14.5195V14.5371L12.0059 15.6621Z" fill="white" />
                            </svg>
                        </div>
                        <div className={styles.headerTitles}>
                            <h2>{t("Add payout channel")}</h2>
                            <p>{t("Sample beneficiary")} • {selectedCountry.toUpperCase()}</p>
                        </div>
                    </div>
                    <IconButton onClick={handleClose} className={styles.closeBtn}>
                        <X size={18} />
                    </IconButton>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* Main Dropdown - Always visible */}
                    <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>{t("Channel type")}</label>
                        <FormControl fullWidth size="small">
                            <Select
                                value={channelType}
                                onChange={(e) => setChannelType(e.target.value)}
                                className={styles.muiSelect}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (selected === "bank_account") return (<div className={styles.selectRenderValue}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10" fill="none">
                                            <path d="M0.8125 4.0625H2.03125V7.3125H1.21875C1.10872 7.3125 1.01351 7.3527 0.933105 7.43311C0.852702 7.51351 0.8125 7.60872 0.8125 7.71875C0.8125 7.82878 0.852702 7.92399 0.933105 8.00439C1.01351 8.0848 1.10872 8.125 1.21875 8.125H10.9688C11.0788 8.125 11.174 8.0848 11.2544 8.00439C11.3348 7.92399 11.375 7.82878 11.375 7.71875C11.375 7.60872 11.3348 7.51351 11.2544 7.43311C11.174 7.3527 11.0788 7.3125 10.9688 7.3125H10.1562V4.0625H11.375C11.485 4.0625 11.5802 4.0223 11.6606 3.94189C11.741 3.86149 11.7812 3.76628 11.7812 3.65625C11.7812 3.58008 11.7643 3.51237 11.7305 3.45312C11.6966 3.39388 11.6501 3.34733 11.5908 3.31348L6.30957 0.0634766C6.27572 0.0465498 6.24186 0.0317383 6.20801 0.019043C6.17415 0.00634766 6.13607 0 6.09375 0C6.05143 0 6.01335 0.00634766 5.97949 0.019043C5.94564 0.0317383 5.91178 0.0465498 5.87793 0.0634766L0.59668 3.31348C0.537435 3.34733 0.490885 3.39388 0.457031 3.45312C0.423177 3.51237 0.40625 3.58008 0.40625 3.65625C0.40625 3.76628 0.446452 3.86149 0.526855 3.94189C0.607259 4.0223 0.702474 4.0625 0.8125 4.0625ZM2.84375 4.0625H4.46875V7.3125H2.84375V4.0625ZM6.90625 4.0625V7.3125H5.28125V4.0625H6.90625ZM9.34375 7.3125H7.71875V4.0625H9.34375V7.3125ZM6.09375 0.888672L9.94043 3.25H2.24707L6.09375 0.888672ZM12.1875 9.34375C12.1875 9.45378 12.1473 9.54899 12.0669 9.62939C11.9865 9.7098 11.8913 9.75 11.7812 9.75H0.40625C0.296224 9.75 0.201009 9.7098 0.120605 9.62939C0.0402018 9.54899 0 9.45378 0 9.34375C0 9.23372 0.0402018 9.13851 0.120605 9.05811C0.201009 8.9777 0.296224 8.9375 0.40625 8.9375H11.7812C11.8913 8.9375 11.9865 8.9777 12.0669 9.05811C12.1473 9.13851 12.1875 9.23372 12.1875 9.34375Z" fill="#4A32E3" />
                                        </svg>
                                        <span>{t("Bank account")}</span></div>);
                                    if (selected === "crypto") return (<div className={styles.selectRenderValue}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" className={styles.menuIcon}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0 0-4z"></path><circle cx="18" cy="12" r="1"></circle></svg><span>{t("Crypto wallet")}</span></div>);
                                    if (selected === "mobile_wallet") return (<div className={styles.selectRenderValue}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className={styles.menuIcon}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg><span>{t("Mobile wallet")}</span></div>);
                                    return selected;
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "11px",
                                        background: "#FAF9FD",
                                        border: "1px solid #ECE9F5",
                                        padding: "2px",
                                        "& fieldset": { border: "none" }
                                    }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        style: { borderRadius: '18px', marginTop: '4px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }
                                    }
                                }}
                            >
                                <MenuItem value="bank_account" className={styles.customMenuItem}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" className={styles.menuIcon}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="21" x2="9" y2="9"></line><line x1="15" y1="21" x2="15" y2="9"></line><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                                    {t("Bank account")}
                                </MenuItem>
                                <MenuItem value="crypto" className={styles.customMenuItem}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" className={styles.menuIcon}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0 0-4z"></path><circle cx="18" cy="12" r="1"></circle></svg>
                                    {t("Crypto wallet")}
                                </MenuItem>
                                <MenuItem value="mobile_wallet" className={styles.customMenuItem}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className={styles.menuIcon}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>
                                    {t("Mobile wallet")}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </div>

                    {/* ------------- DYNAMIC FIELDS SECTION ------------- */}

                    {/* 1. BANK ACCOUNT FIELDS */}
                    {channelType === 'bank_account' && (
                        <>
                            <div className={styles.infoBanner}>
                                <Info size={16} className={styles.infoIcon} />
                                <span>{t("Fields adapt automatically to")} <strong>{currentConfig.label}</strong>.</span>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>{t("IBAN / Account Number")}</label>
                                <TextField
                                    fullWidth size="small" variant="outlined" required
                                    placeholder={currentConfig.placeholder}
                                    value={iban} onChange={(e) => setIban(e.target.value)}
                                    sx={commonInputStyles}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>
                                    {t("SWIFT / BIC")}{" "}
                                    <span className={styles.optionalText}>
                                        {currentConfig.swiftRequired ? t("(required)") : t("(optional)")}
                                    </span>
                                </label>
                                <TextField
                                    fullWidth size="small" variant="outlined" required={currentConfig.swiftRequired}
                                    placeholder={currentConfig.swiftRequired ? "SCBLPKKX" : t("Optional")}
                                    value={swift} onChange={(e) => setSwift(e.target.value)}
                                    sx={commonInputStyles}
                                />
                            </div>
                        </>
                    )}

                    {/* 2. CRYPTO WALLET FIELDS */}
                    {channelType === 'crypto' && (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>{t("Network")}</label>
                                <Select
                                    value={cryptoNetwork}
                                    onChange={(e) => setCryptoNetwork(e.target.value)}
                                    size="small"
                                    sx={{ ...commonInputStyles, padding: 0 }}
                                >
                                    <MenuItem value="ethereum">Ethereum (ERC-20)</MenuItem>
                                    <MenuItem value="tron">Tron (TRC-20)</MenuItem>
                                    <MenuItem value="bitcoin">Bitcoin (BTC)</MenuItem>
                                </Select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>{t("Wallet Address")}</label>
                                <TextField
                                    fullWidth size="small" variant="outlined" required
                                    placeholder="0x1234...abcd"
                                    value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)}
                                    sx={commonInputStyles}
                                />
                            </div>
                        </>
                    )}

                    {/* 3. MOBILE WALLET FIELDS */}
                    {channelType === 'mobile_wallet' && (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>{t("Mobile Provider")}</label>
                                <Select
                                    value={mobileProvider}
                                    onChange={(e) => setMobileProvider(e.target.value)}
                                    size="small"
                                    sx={{ ...commonInputStyles, padding: 0 }}
                                >
                                    <MenuItem value="mpesa">M-Pesa</MenuItem>
                                    <MenuItem value="mtn">MTN Mobile Money</MenuItem>
                                    <MenuItem value="orange">Orange Money</MenuItem>
                                </Select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>{t("Mobile Number")}</label>
                                <TextField
                                    fullWidth size="small" variant="outlined" required type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
                                    sx={commonInputStyles}
                                />
                            </div>
                        </>
                    )}

                    {/* Footer Buttons */}
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={handleClose} className={styles.backButton}>
                            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
                            {t("Back")}
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            {t("Save channel")}
                        </button>
                    </div>

                </form>
            </Box>
        </Modal>
    );
};

export default DynamicChannelModal;