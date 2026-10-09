import { useContext, useEffect, useState } from 'react'
import { Briefcase, ChevronUp, Globe, Hash, MapPin, Plus, Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { FaHand } from 'react-icons/fa6'
import { UserContext } from '../../../../Context/UserContext'
import Magicsvg from '../magicsvg'
import styles from '../style/onboardingSteps.module.css'
import SidebarProgress from './SidebarProgress'
import { BsDot } from 'react-icons/bs'
import AiIcon from "../../../../assets/icons/ai-icon.svg";
import StepProgress from './StepProgress'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const formatDateForInput = (val) => {
    if (!val) return '';
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }
        if (/^\d{4}$/.test(trimmed)) {
            return `${trimmed}-01-01`;
        }
        if (trimmed.includes('T')) {
            const datePart = trimmed.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
        }
        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
            const parts = trimmed.split(/[\/\-]/);
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const day = String(parsed.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    if (val instanceof Date && !isNaN(val.getTime())) {
        const year = val.getFullYear();
        const month = String(val.getMonth() + 1).padStart(2, '0');
        const day = String(val.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return '';
};

const CompanyStep = ({ onNext, onBack, onChange, userType, data = {}, currentStep }) => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)

    const agentDefault = userDetails?.parentIdAgent?.username || userDetails?.parentIdAgent?.agentCode || ''

    const initialDate = userDetails?.company?.date_of_incorporation || data.dateOfIncorporation || ''

    const [form, setForm] = useState({
        legalName: userDetails?.company_name || '',
        tradingName: data.tradingName || '',
        registrationNumber: userDetails?.company?.registration_number || data.registrationNumber || '',
        legalStructure: data.legalStructure || '',
        countryOfIncorporation: userDetails?.country_name || '',
        registeredAddress: userDetails?.address || '',
        website: data.website || '',
        legalForm: userDetails?.category?.name || '',
        dateOfIncorporation: formatDateForInput(initialDate),
        taxNumber: userDetails?.company?.tax_id || data.taxNumber || '',
        mainContact: data.mainContact || '',
        agent: agentDefault,
    })


    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, []);

    useEffect(() => {
        const rawDate = userDetails?.company?.date_of_incorporation || data.dateOfIncorporation || '';
        if (rawDate && !form?.dateOfIncorporation) {
            const formatted = formatDateForInput(rawDate);
            if (formatted) {
                setForm(prev => ({ ...prev, dateOfIncorporation: formatted }));
            }
        }
    }, [userDetails?.company?.date_of_incorporation, data.dateOfIncorporation]);

    useEffect(() => {
        onChange?.(form)
    }, [form]);

    const isFormValid = Boolean(
        form.countryOfIncorporation?.trim() &&
        form.registrationNumber?.trim() &&
        form.legalName?.trim() &&
        form.registeredAddress?.trim() &&
        form.dateOfIncorporation?.trim()
    )

    const set = (key) => (e) => {
        let value = e.target.value;

        if (key === "registrationNumber") {
            if (!/^[a-zA-Z0-9\u00C0-\u024F\s-]*$/.test(value)) {
                return;
            }
        }

        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    const handleContinue = () => {
        onNext(form, 'company')
    }

    const steps = [
        { num: '01', label: t('Account'), completed: true, key:'account' },
        { num: '02', label: t('Company'), active: true, key:'company' },
        { num: '03', label: t('Activity'), active: false, key:'activity' },
        { num: '04', label: t('Ownership'), active: false, key:'ownership' },
        { num: '05', label: t('Documents'), active: false, key:'documents' },
        { num: '06', label: t('Review'), active: false, key:'review' }
    ]

    const DateField = ({ isMobile }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                value={dayjs(form?.dateOfIncorporation) || ""}
                sx={{ 
                    background: isMobile? '#fff' : '#FAFBFF',
                    '& input':{ p: '14.5px 14px 14.5px 12.5px', fontSize: isMobile ? 14 : '13.5px', color: '#1B1F2A', fontWeight: isMobile ? 500 : 400 },
                    '& .MuiInputBase-root': { height: isMobile ? '51px' :'44px' },
                    '& fieldset': { borderRadius: isMobile ? '12px' :'6px', border: '1.5px solid #E2E8F0', },
                    '& .Mui-focused fieldset':{ borderColor: '#4A32E3 !important', borderWidth: '1.5px !important' },
                    '& .Mui-focused' : {boxShadow: '0 0 0 3px rgba(74, 50, 227, 0.1)', background: '#fff'},
                    '& svg': { width: 18, height: 18}
                }}
                disableFuture={true}
                onChange={(value)=>set("dateOfIncorporation")({ target: { value:dayjs(value).format("YYYY-MM-DD") } })}
                renderInput={(params) => <input {...params} />}
                disabled={Boolean(userDetails?.company?.date_of_incorporation)}
                readOnly={Boolean(userDetails?.company?.date_of_incorporation)}
            />
        </LocalizationProvider>
    )
    return (
        <div className={styles.onboardingLayout}>
            <div>
                <div className={styles.wizardSteps}>
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`${styles.step} ${step.active ? styles.active : ""
                                } ${step.completed ? styles.completed : ""
                                }`}
                        >
                            <div className={styles.stepLine}></div>

                            <div className={styles.stepContent}>
                                <span className={styles.stepNumber}>{step.num} <BsDot /></span>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>                
                <StepProgress
                  percent={30} 
                  currentStep={currentStep} 
                />
            </div>
            <div className={styles.upperlayout}>
                <p>
                    {t("Start with your registration number, we'll pull what we can from the registry and let you confirm.")}
                </p>
                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <Magicsvg />
                    </div>
                    <img 
                        src={AiIcon} 
                        alt="AI Icon"
                        width={10}
                        height={10}
                    />

                    <div className={styles.infoContent}>
                        <span className={styles.infoTitle}>
                            {t("INSTAPAY ASSISTANT")}
                        </span>

                        <p>
                            {t("Start with your registration number, I'll pull the rest from the registry. Add your agent if one referred you.")}
                        </p>
                    </div>
                </div>

                <div className={styles.noticeCard}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M15.8906 6.75L14.2969 3.54688C14.2135 3.39062 14.0938 3.26042 13.9375 3.15625C13.7812 3.05208 13.6042 3 13.4062 3C13.3229 3 13.2422 3.01042 13.1641 3.03125C13.0859 3.05208 13.0156 3.07812 12.9531 3.10938L11.4062 3.89062L8.125 3.01562C8.10417 3.01562 8.08333 3.01302 8.0625 3.00781C8.04167 3.0026 8.02083 3 8 3C7.97917 3 7.95833 3.0026 7.9375 3.00781C7.91667 3.01302 7.89583 3.01562 7.875 3.01562L4.59375 3.89062L3.04688 3.10938C2.98438 3.07812 2.91406 3.05208 2.83594 3.03125C2.75781 3.01042 2.67708 3 2.59375 3C2.39583 3 2.21875 3.04948 2.0625 3.14844C1.90625 3.2474 1.78646 3.38021 1.70312 3.54688L0.109375 6.75C0.078125 6.8125 0.0520833 6.88021 0.03125 6.95312C0.0104167 7.02604 0 7.10417 0 7.1875C0 7.38542 0.0494792 7.5625 0.148438 7.71875C0.247396 7.875 0.380208 7.99479 0.546875 8.07812L2.23438 8.9375L5.70312 11.4062C5.73438 11.4271 5.76302 11.4427 5.78906 11.4531C5.8151 11.4635 5.84375 11.474 5.875 11.4844L9.875 12.4844C9.89583 12.4844 9.91667 12.487 9.9375 12.4922C9.95833 12.4974 9.97917 12.5 10 12.5C10.0729 12.5 10.138 12.487 10.1953 12.4609C10.2526 12.4349 10.3073 12.401 10.3594 12.3594L13.7969 8.90625L15.4531 8.07812C15.6094 7.99479 15.7396 7.875 15.8438 7.71875C15.9479 7.5625 16 7.38542 16 7.1875C16 7.10417 15.9896 7.02604 15.9688 6.95312C15.9479 6.88021 15.9219 6.80729 15.8906 6.73438V6.75ZM12.4688 8.82812L10.3125 7.10938C10.2708 7.07812 10.224 7.05208 10.1719 7.03125C10.1198 7.01042 10.0625 7 10 7C9.92708 7 9.86198 7.01302 9.80469 7.03906C9.7474 7.0651 9.69271 7.09896 9.64062 7.14062C9.08854 7.70312 8.52604 7.98698 7.95312 7.99219C7.38021 7.9974 6.89583 7.875 6.5 7.625L9.20312 5H11.1875L12.8906 8.40625L12.4688 8.82812ZM2.59375 4L3.875 4.64062L2.28125 7.82812L1 7.1875L2.59375 4ZM9.84375 11.4531L6.21875 10.5312L3.14062 8.34375L4.89062 4.84375L8 4.01562L8.60938 4.17188L5.79688 6.92188C5.70312 7.00521 5.63021 7.10938 5.57812 7.23438C5.52604 7.35938 5.5 7.48958 5.5 7.625C5.5 7.80208 5.54167 7.96354 5.625 8.10938C5.70833 8.25521 5.82292 8.375 5.96875 8.46875C6.60417 8.875 7.28646 9.04948 8.01562 8.99219C8.74479 8.9349 9.41146 8.65625 10.0156 8.15625L11.75 9.54688L9.84375 11.4531ZM13.7188 7.82812L12.125 4.64062L13.4062 4L15 7.1875L13.7188 7.82812ZM8.23438 13.625C8.20312 13.7292 8.14323 13.8177 8.05469 13.8906C7.96615 13.9635 7.86458 14 7.75 14C7.72917 14 7.70833 13.9974 7.6875 13.9922C7.66667 13.987 7.64583 13.9844 7.625 13.9844L5.03125 13.3281C5 13.3281 4.96875 13.3203 4.9375 13.3047C4.90625 13.2891 4.88021 13.2708 4.85938 13.25L3.20312 12.0781C3.15104 12.0365 3.10677 11.9818 3.07031 11.9141C3.03385 11.8464 3.01562 11.7708 3.01562 11.6875C3.01562 11.5521 3.0651 11.4349 3.16406 11.3359C3.26302 11.237 3.38021 11.1875 3.51562 11.1875C3.56771 11.1875 3.61719 11.1953 3.66406 11.2109C3.71094 11.2266 3.75521 11.2448 3.79688 11.2656L5.35938 12.3906L7.875 13.0156C7.98958 13.0469 8.08073 13.1068 8.14844 13.1953C8.21615 13.2839 8.25 13.3854 8.25 13.5C8.25 13.5208 8.25 13.5417 8.25 13.5625C8.25 13.5833 8.24479 13.6042 8.23438 13.625Z" fill="#3B17A8" />
                    </svg>
                    <img 
                        src={AiIcon} 
                        alt="AI Icon"
                        width={10}
                        height={10}
                    />
                    <p>
                        {t("Agent detected. If this agent has a negotiated package, our team will apply it automatically to your activation pack.")}
                    </p>
                </div>
            </div>

            <div className={styles.mainArea}>

                <div className={styles.formContainer2}>
                    <div
                        className={styles.onboardingForm2}
                        style={{ width: "100%" }}
                    >

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("COUNTRY OF INCORPORATION")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <MapPin className={styles.inputIcon} size={16} />

                                    <input
                                        type="text"
                                        onChange={set("registrationNumber")}
                                        placeholder="CHE-105.837.234"
                                        disabled
                                        className={styles.textInput}
                                        readOnly
                                        value={form.countryOfIncorporation}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("REGISTRATION NUMBER")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Hash className={styles.inputIcon} size={16} />

                                    <input
                                        type="text"
                                        className={styles.textInput}
                                        value={form.registrationNumber}
                                        onChange={set("registrationNumber")}
                                        placeholder="CHE-105.837.234"
                                        pattern="^[a-zA-Z0-9\u00C0-\u024F\s-]+$"
                                        title="Only letters, numbers, spaces, and dashes are allowed."
                                        disabled={Boolean(userDetails?.company?.registration_number)}
                                        readOnly={Boolean(userDetails?.company?.registration_number)}
                                    />
                                </div>
                            </div>

                            <button className={styles.lookupBtn}>
                                <Search size={12}/> 
                                <span>{t('Look up on registry')}</span>
                            </button>
                        
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("LEGAL COMPANY NAME")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.inputIcon} size={16} />

                                    <input
                                        className={styles.textInput}
                                        value={form.legalName}
                                        onChange={set("legalName")}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("TRADING NAME")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.inputIcon} size={16} />

                                    <input
                                        className={styles.textInput}
                                        value={form.tradingName}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^[A-Za-z\s]*$/.test(value)) {
                                                set("tradingName")(e);
                                            }
                                        }}

                                    />
                                </div>
                            </div>

                            <div className={`${styles.inputGroup} ${styles.legalFormField1}`}>
                                <label className={styles.inputLabel}>
                                    {t("LEGAL FORM")}
                                </label>

                                <input
                                    style={{ padding: "14.5px 14px 14.5px 12.5px" }}
                                    className={styles.textInput}
                                    value={form.legalForm}
                                    onChange={set("legalForm")}
                                    placeholder="SA"
                                    disabled
                                    readOnly
                                />
                            </div>

                            <div className={`${styles.inputGroup} ${styles.dateIncoField1}`}>
                                <label className={styles.inputLabel}>
                                   {t("DATE OF INCORPORATION")}
                                </label>
                                <DateField />
                            </div>

                            <div className={styles.twoInputRow}>
                                 <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t("LEGAL FORM")}
                                    </label>

                                    <input
                                        style={{ padding: "14.5px 14px 14.5px 12.5px" }}
                                        className={styles.textInput}
                                        value={form.legalForm}
                                        onChange={set("legalForm")}
                                        placeholder="SA"
                                        disabled
                                        readOnly
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>
                                        {t('Incorporated')}
                                    </label>
                                    <DateField isMobile={true} />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("TAX / VAT NUMBER")}
                                </label>

                                <input
                                    style={{ padding: "14.5px 14px 14.5px 12.5px" }}
                                    className={styles.textInput}
                                    value={form.taxNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                                        setForm((prev) => ({
                                            ...prev,
                                            taxNumber: value,
                                        }));
                                    }} placeholder="CHE-105.837.234 VAT"
                                    disabled={Boolean(userDetails?.company?.tax_id)}
                                    readOnly={Boolean(userDetails?.company?.tax_id)}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("WEBSITE")}
                                </label>

                                <div className={styles.inputWrapper}>
                                    <Globe className={styles.inputIcon} size={16} />

                                    <input
                                        className={styles.textInput}
                                        value={form.website}
                                        onChange={set("website")}
                                        placeholder="https://"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>
                                {t("REGISTERED ADDRESS")}
                            </label>

                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.inputIcon} size={16} />

                                <input
                                    className={styles.textInput}
                                    value={form.registeredAddress}
                                    onChange={set("registeredAddress")}
                                    placeholder={t("Street, City, Country")}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("MAIN CONTACT PERSON")}
                                </label>

                                <input
                                    style={{ padding: "14.5px 14px 14.5px 12.5px" }}
                                    className={styles.textInput}
                                    value={form.mainContact}
                                    onChange={set("mainContact")}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>
                                    {t("AGENT / INTRODUCER (IF ANY)")}
                                </label>

                                <input
                                    className={styles.textInput}
                                    value={form.agent}
                                    onChange={set("agent")}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>

                    </div>

                </div>
                <div className={styles.sidebarArea}>
                    <SidebarProgress
                        percent={30}
                        stepsLeft={4}
                        currentStepKey="company"
                        assistantMessage="Great start! Now let's capture your company's legal identity. This helps us verify your registration."
                    />
                </div>
            </div>
            <div className={styles.navigationFooter} style={{ justifyContent: "flex-end" }}>
                <button
                    onClick={handleContinue}
                    className={styles.continueButton}
                    disabled={!isFormValid}
                    style={{ opacity: !isFormValid ? 0.5 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
                >
                    {t("Continue")}
                </button>
            </div>
        </div>
    )
}

export default CompanyStep
