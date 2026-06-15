import { useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CheckCircle, Plus } from "react-feather";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { z } from "zod";
import { UserContext } from "../../../Context/UserContext";
import PhoneInput from "../../PhoneInput";
import CountryDropDown from "../../AddBeneficiary/CountryDropDown";
import CitiesDropDown from "../../CitiesDropDown";
import NestedDropdown from "../../NestedDropdown";
import DateMomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import iso2 from "../../AddFunds/WalletFund/countries_iso2.json";
import { useQuery } from "@tanstack/react-query";
import { apiWrapper } from "../../../utils/Functions/apiWrapper";
import { BeneficiaryRelation, BUSINESS_RELATIONSHIPS, friendsAndFamily, occupations } from "../../../utils/Data";

const optionalEmail = z.string().optional().refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Enter a valid email address",
});

const isPastOrToday = (value) => {
    if (!value) return true;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d <= today;
}

const isAtLeastYears = (value, years) => {
    if (!value) return false;

    const [year, month, day] = value.split("-").map(Number);

    const dob = new Date(year, month - 1, day);

    const today = new Date();

    const cutoff = new Date(
        today.getFullYear() - years,
        today.getMonth(),
        today.getDate()
    );

    return dob <= cutoff;
};

const idTypeData = {
    'passport': 'Passport',
    'id-card': "Id Card",
    'driving-license': "Driving License",
    'residence-permit': "Residence Permit"
}

const baseAddressSchema = {
    email: optionalEmail,
    phone: z.string().min(7, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    postal_code: z.string().optional(),
    country_name: z.string().min(1, "Country is required"),
    country_iso_code: z.string().min(2, "Country code is required"),
    user_nationaility: z.string().optional(),
};

const senderFileFieldsSchema = {
    id_front: z.any().optional(),
    id_back: z.any().optional(),
    selfie: z.any().optional(),
    kyb_registry_extract: z.any().optional(),
    kyb_proof_of_authority: z.any().optional(),
    kyb_ubos: z.any().optional(),
    kyb_id_collection: z.any().optional(),
    kyb_additional_docs: z.any().optional(),
};

const individualSenderSchema = z.object({
    sender_type: z.literal("individual"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    dob: z.string().min(1, "Date of birth is required").
        refine((v) => isPastOrToday(v), { message: "Date cannot be in the future" }).
        refine((v) => isAtLeastYears(v, 15), { message: "Sender must be at least 15 years old" }),
    gender: z.string().optional(),
    occupation: z.string().optional(),
    source_of_funds: z.string().optional(),
    country_of_birth_iso_code: z.string().optional(),
    beneficiary_relationship: z.string().optional(),
    province_state: z.string().optional(),
    save_for_future: z.boolean().optional(),
    ...baseAddressSchema,
    extras: z.object({
        idNumber: z.string().optional(),
        documentType: z.string().optional(),
        dateOfIssue: z.string().optional().refine((v) => !v || isPastOrToday(v), { message: "Date cannot be in the future" }),
        dateOfExpiry: z.string().optional(),
        idCountryIsoCode: z.string().optional(),
    }).refine((extras) => {
        if (!extras.dateOfExpiry) return true;
        const expiry = new Date(extras.dateOfExpiry);
        if (Number.isNaN(expiry.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiry < today) return false; // expiry cannot be in the past
        if (extras.dateOfIssue) {
            const issue = new Date(extras.dateOfIssue);
            if (Number.isNaN(issue.getTime())) return false;
            // expiry must be strictly after issue date
            const minExpiry = new Date(issue.getFullYear(), issue.getMonth(), issue.getDate() + 1);
            if (expiry < minExpiry) return false;
        }
        return true;
    }, { message: "Date of expiry must be after issue date and cannot be in the past" }),
    ...senderFileFieldsSchema,
});

const businessSenderSchema = z.object({
    sender_type: z.literal("business"),
    company_name: z.string().min(1, "Company name is required"),
    trading_name: z.string().optional(),
    registration_number: z.string().optional(),
    tax_id: z.string().optional(),
    date_of_incorporation: z.string().optional().refine((v) => !v || isPastOrToday(v), { message: "Date cannot be in the future" }),
    business_relationship: z.string().optional(),
    save_for_future: z.boolean().optional(),
    ...baseAddressSchema,
    representative: z.object({
        first_name: z.string().min(1, "Representative first name is required"),
        last_name: z.string().min(1, "Representative last name is required"),
        nationality: z.string().optional(),
        address: z.string().optional(),
        postal_code: z.string().optional(),
        dob: z.string().optional().refine((v) => !v || isPastOrToday(v), { message: "Date cannot be in the future" }).
            refine((v) => !v || isAtLeastYears(v, 15), { message: "Representative must be at least 15 years old" }),
        gender: z.string().optional(),
        extras: z.object({
            idNumber: z.string().optional(),
            documentType: z.string().optional(),
            dateOfIssue: z.string().optional().refine((v) => !v || isPastOrToday(v), { message: "Date cannot be in the future" }),
            dateOfExpiry: z.string().optional(),
            idCountryIsoCode: z.string().optional(),
        }).refine((extras) => {
            if (!extras.dateOfExpiry) return true;
            const expiry = new Date(extras.dateOfExpiry);
            if (Number.isNaN(expiry.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiry < today) return false;
            if (extras.dateOfIssue) {
                const issue = new Date(extras.dateOfIssue);
                if (Number.isNaN(issue.getTime())) return false;
                const minExpiry = new Date(issue.getFullYear(), issue.getMonth(), issue.getDate() + 1);
                if (expiry < minExpiry) return false;
            }
            return true;
        }, { message: "Date of expiry must be after issue date and cannot be in the past" }),
    }),
    ...senderFileFieldsSchema,
});

const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
};

const inputStyle = {
    width: "100%",
    border: "1px solid #E5E5E5",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    fontWeight: 500,
    outline: "none",
    background: "#fff",
};

const zodFormResolver = (schema) => async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
        return { values: result.data, errors: {} };
    }

    const errors = {};

    result.error.issues.forEach((issue) => {
        issue.path.reduce((acc, key, index) => {
            if (index === issue.path.length - 1) {
                acc[key] = { type: issue.code, message: issue.message };
            } else {
                acc[key] = acc[key] || {};
            }

            return acc[key];
        }, errors);
    });

    return { values: {}, errors };
};

const getStates = async (iso2Value) => {
    const res = await apiWrapper({ endpoint: `/api/country/get-states/${iso2Value}` });
    return res?.data || [];
};

const AddSenderFormModal = ({ isOpen, toggle, data, senderAccountType, onSubmit, isSubmitting = false, editSender = null, addingFromMenu = false }) => {
    const { t } = useTranslation();
    const { userDetails } = useContext(UserContext);
    const [phoneError, setPhoneError] = useState("");
    const schema = senderAccountType === "business" ? businessSenderSchema : individualSenderSchema;
    const [, forceUpdate] = useState({});


    console.log(editSender, "edit sender")
    const form = useForm({
        resolver: zodFormResolver(schema),
        mode: "onBlur",
        defaultValues: {
            sender_type: senderAccountType,
            first_name: "",
            last_name: "",
            dob: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postal_code: "",
            country_name: data?.country?.name || "",
            country_iso_code: data?.country?.alpha3 || "",
            user_nationaility: data?.country?.alpha3 || "",
            occupation: "",
            source_of_funds: "",
            country_of_birth_iso_code: data?.country?.alpha3 || "",
            beneficiary_relationship: "",
            province_state: "",
            company_name: "",
            trading_name: "",
            registration_number: "",
            tax_id: "",
            date_of_incorporation: "",
            business_relationship: "",
            save_for_future: addingFromMenu && !editSender,
            extras: {
                idNumber: "",
                documentType: "",
                dateOfIssue: "",
                dateOfExpiry: "",
                idCountryIsoCode: data?.country?.alpha3 || "",
            },
            representative: {
                first_name: "",
                last_name: "",
                nationality: data?.country?.alpha3 || "",
                address: "",
                postal_code: "",
                dob: "",
                gender: "",
                extras: {
                    idNumber: "",
                    documentType: "",
                    dateOfIssue: "",
                    dateOfExpiry: "",
                    idCountryIsoCode: data?.country?.alpha3 || "",
                },
            },
        },
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = form;
    const selectedCountryName = watch("country_name");
    const selectedCountryIsoCode = watch("country_iso_code");
    const selectedCity = watch("city");
    const selectedStateName = watch("state_name");
    const selectedPhone = watch("phone");


    console.log(watch("phone"), "watch phone")
    const iso2Value = useMemo(() => iso2[selectedCountryIsoCode?.toUpperCase()], [selectedCountryIsoCode]);
    const { data: stateData = [] } = useQuery({
        queryKey: ["GetStates", iso2Value],
        queryFn: () => getStates(iso2Value),
        staleTime: Infinity,
        cacheTime: Infinity,
        enabled: !!iso2Value,
    });

    console.log(editSender, "editing sender")

    useEffect(() => {
        if (!isOpen) return;

        if (!editSender) {
            reset();
            return;
        }

        const values = editSender || {};
        const representative = values.representative || {};
        const extras = values.extras || {};
        const representativeExtras = representative.extras || {};

        console.log(values?.phone, "phone h bhai")
        reset({
            sender_type: senderAccountType,
            first_name: values.first_name || "",
            last_name: values.last_name || "",
            dob: values.dob || "",
            gender: values.gender || "",
            email: values.email || "",
            phone: values.phone || "",
            address: values.address || "",
            city: values.city || "",
            postal_code: values.postal_code || "",
            country_name: values.country_name || data?.country?.name || "",
            country_iso_code: values.country_iso_code || data?.country?.alpha3 || "",
            user_nationaility: values.user_nationaility || values.country_iso_code || data?.country?.alpha3 || "",
            occupation: values.occupation || "",
            source_of_funds: values.source_of_funds || "",
            country_of_birth_iso_code: values.country_of_birth_iso_code || values.country_iso_code || data?.country?.alpha3 || "",
            beneficiary_relationship: values.beneficiary_relationship || "",
            province_state: values.province_state || "",
            state_name: values.state_name || values.province_state || "",
            company_name: values.company_name || "",
            trading_name: values.trading_name || "",
            registration_number: values.registration_number || "",
            tax_id: values.tax_id || "",
            date_of_incorporation: values.date_of_incorporation || "",
            business_relationship: values.business_relationship || "",
            save_for_future: values.save_for_future ?? false,
            extras: {
                idNumber: extras.idNumber || "",
                documentType: extras.documentType || "",
                dateOfIssue: extras.dateOfIssue || "",
                dateOfExpiry: extras.dateOfExpiry || "",
                idCountryIsoCode: extras.idCountryIsoCode || values.country_iso_code || data?.country?.alpha3 || "",
            },
            representative: {
                first_name: representative.first_name || "",
                last_name: representative.last_name || "",
                nationality: representative.nationality || values.country_iso_code || data?.country?.alpha3 || "",
                address: representative.address || "",
                postal_code: representative.postal_code || "",
                dob: representative.dob || "",
                gender: representative.gender || "",
                extras: {
                    idNumber: representativeExtras.idNumber || "",
                    documentType: representativeExtras.documentType || "",
                    dateOfIssue: representativeExtras.dateOfIssue || "",
                    dateOfExpiry: representativeExtras.dateOfExpiry || "",
                    idCountryIsoCode: representativeExtras.idCountryIsoCode || values.country_iso_code || data?.country?.alpha3 || "",
                },
            },
        });
        forceUpdate({})
    }, [senderAccountType, data?.country?.name, data?.country?.alpha3, editSender, editSender?.phone, isOpen, addingFromMenu]);

    useEffect(() => {
        register("state_name");
    }, [register]);

    useEffect(() => {
        if (!selectedCountryIsoCode) return;

        setValue("user_nationaility", selectedCountryIsoCode, { shouldValidate: true });
        setValue("country_of_birth_iso_code", selectedCountryIsoCode, { shouldValidate: true });
        setValue("extras.idCountryIsoCode", selectedCountryIsoCode, { shouldValidate: true });
        setValue("representative.nationality", selectedCountryIsoCode, { shouldValidate: true });
        setValue("representative.extras.idCountryIsoCode", selectedCountryIsoCode, { shouldValidate: true });
    }, [selectedCountryIsoCode, setValue]);

    const renderNestedError = (path) => {
        const error = path.split(".").reduce((acc, key) => acc?.[key], errors);
        return error?.message ? <span style={{ color: "#E64067", fontSize: "11px", fontWeight: 600 }}>{t(error.message)}</span> : null;
    };

    const renderField = (name, label, type = "text", options = null, required = false) => (
        <label style={fieldStyle}>
            <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>
                {t(label)} {required ? <span style={{ color: "#E64067" }}>*</span> : null}
            </span>
            {options ?
                <select {...register(name)} style={inputStyle}>
                    <option value="">{t("Select")}</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{t(option.label)}</option>
                    ))}
                </select>
                :
                <input {...register(name)} type={type} style={inputStyle} />
            }
            {renderNestedError(name)}
        </label>
    );

    const dateInputProps = {
        disableUnderline: true,
        style: {
            background: "#fff",
            border: "none",
            boxShadow: "none",
            padding: "0 10px",
            minHeight: "40px",
            fontWeight: 500,
        },
    };

    const renderDateField = (name, label, required = false, allowFuture = false) => (
        <label style={fieldStyle}>
            <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>
                {t(label)} {required ? <span style={{ color: "#E64067" }}>*</span> : null}
            </span>
            {
                (() => {
                    const isDob = /(^|\.)dob$/i.test(name);
                    const isExpiry = /expiry/i.test(name);
                    const pickerProps = {};

                    if (!allowFuture) {
                        pickerProps.disableFuture = true;
                        pickerProps.maxDate = new Date();
                    }

                    if (isDob) {
                        const maxDob = new Date();
                        maxDob.setFullYear(maxDob.getFullYear() - 15);
                        pickerProps.maxDate = maxDob;
                        pickerProps.disableFuture = true;
                    }
                    if (isExpiry) {
                        const issueFieldName = name.includes("representative")
                            ? "representative.extras.dateOfIssue"
                            : "extras.dateOfIssue";

                        const issueDate = watch(issueFieldName);

                        if (issueDate) {
                            const [year, month, day] = issueDate.split("-").map(Number);

                            pickerProps.minDate = new Date(year, month - 1, day + 1);
                        } else {
                            pickerProps.minDate = new Date();
                        }
                    }

                    return (
                        <DatePicker
                            format="DD/MM/YYYY"
                            className="form-control custom-datepicker"
                            style={{ ...inputStyle, padding: 0, display: "flex", justifyContent: "center", position: "static" }}
                            value={watch(name) || null}
                            onChange={(date) => setValue(name, date ? date.format("YYYY-MM-DD") : "", { shouldValidate: true, shouldDirty: true })}
                            placeholder="DD/MM/YYYY"
                            InputProps={dateInputProps}
                            inputProps={{
                                style: {
                                    background: "#fff",
                                    border: "none",
                                    boxShadow: "none",
                                    padding: "2px 0",
                                    minHeight: "40px",
                                },
                            }}
                            minDate={pickerProps.minDate}
                            disablePast={false}
                            clearable
                            autoOk
                            {...pickerProps}
                        />
                    );
                })()
            }
            {renderNestedError(name)}
        </label>
    );

    const renderLocationFields = () => (
        <>
            <label style={fieldStyle}>
                <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>{t("Country")} <span style={{ color: "#E64067" }}>*</span></span>
                <CountryDropDown
                    onSelect={(selectedCountry) => {
                        const country = { ...selectedCountry };
                        if (country?.name?.toLowerCase()?.includes("bolivia")) {
                            country.name = "Bolivia, Plurinational State of bolivia";
                        }
                        setValue("country_name", country?.name || "", { shouldValidate: true, shouldDirty: true });
                        setValue("country_iso_code", country?.alpha3 || "", { shouldValidate: true, shouldDirty: true });
                        setValue("user_nationaility", country?.alpha3 || "", { shouldValidate: true, shouldDirty: true });
                        setValue("country_of_birth_iso_code", country?.alpha3 || "", { shouldValidate: true, shouldDirty: true });
                        setValue("extras.idCountryIsoCode", country?.alpha3 || "", { shouldValidate: true, shouldDirty: true });
                        setValue("representative.nationality", country?.alpha3 || "", { shouldValidate: true, shouldDirty: true });
                        setValue("representative.extras.idCountryIsoCode", country?.alpha3 || "", { shouldValidate: true, shouldDirty: true });
                        setValue("city", "", { shouldValidate: true, shouldDirty: true });
                        setValue("province_state", "", { shouldValidate: true, shouldDirty: true });
                        setValue("state_name", "", { shouldDirty: true });
                        setValue("phone", "", { shouldValidate: true, shouldDirty: true });
                    }}
                    country={selectedCountryIsoCode}
                />
                {renderNestedError("country_name") || renderNestedError("country_iso_code")}
            </label>
            <label style={fieldStyle}>
                <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>{t("City")} <span style={{ color: "#E64067" }}>*</span></span>
                <CitiesDropDown
                    disabled={!selectedCountryName}
                    country={selectedCountryName}
                    userCity={selectedCity}
                    setUserCity={(city) => setValue("city", city, { shouldValidate: true, shouldDirty: true })}
                    iso_3={selectedCountryIsoCode}
                />
                {renderNestedError("city")}
            </label>
            <label style={fieldStyle}>
                <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>{t("Province / State")}</span>
                <CitiesDropDown
                    disabled={!selectedCountryName}
                    country={selectedCountryName}
                    userCity={selectedStateName || watch("province_state")}
                    setUserCity={(stateName, stateCode) => {
                        setValue("state_name", stateName, { shouldDirty: true });
                        setValue("province_state", stateCode || stateName, { shouldValidate: true, shouldDirty: true });
                    }}
                    iso_3={selectedCountryIsoCode}
                    isState
                    title="Select Province"
                    stateData={stateData}
                />
                {renderNestedError("province_state")}
            </label>
        </>
    );

    console.log(selectedPhone, "selectedPhone")
    const renderPhoneField = () => (
        <label style={fieldStyle}>
            <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>{t("Phone Number")} <span style={{ color: "#E64067" }}>*</span></span>
            <PhoneInput
                key={editSender?._id || "new"}
                customStyles={{
                    boxShadow: "none",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                    padding: "10px 12px"
                }}
                country={selectedCountryIsoCode}
                setPhone={(phone) => setValue("phone", phone)}
                disabled={!selectedCountryIsoCode}
                setCountry={() => { }}
                phone={(editSender ? editSender.phone : selectedPhone)?.trim()}
                setError={setPhoneError}
                inThirdParty={true}
                error={phoneError}
            />
            {renderNestedError("phone")}
        </label>
    );

    const renderRelationshipField = () => (
        <label style={fieldStyle}>
            <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>{t("Beneficiary Relationship")}</span>
            <NestedDropdown
                child={friendsAndFamily}
                parent={BeneficiaryRelation}
                value={watch("beneficiary_relationship")}
                setter={(value) => setValue("beneficiary_relationship", value, { shouldValidate: true, shouldDirty: true })}
                subKey="Friends & Family"
                defaultValue="Select Relationship"
                style={{ border: "1px solid #E5E5E5", borderRadius: "8px" }}
            />
        </label>
    );

    const renderFileField = (name, label) => (
        <label style={fieldStyle}>
            <span style={{ color: "#454545", fontSize: "12px", fontWeight: 700 }}>{t(label)}</span>
            <input {...register(name)} type="file" style={{ ...inputStyle, padding: "8px 10px" }} />
        </label>
    );

    const submitForm = (values) => {
        const hiddenCountryValues = {
            user_nationaility: values.country_iso_code,
            ...(values.sender_type === "individual" ? {
                country_of_birth_iso_code: values.country_iso_code,
                extras: {
                    ...values.extras,
                    idCountryIsoCode: values.country_iso_code,
                },
            } : {}),
            ...(values.sender_type === "business" ? {
                representative: {
                    ...values.representative,
                    nationality: values.country_iso_code,
                    extras: {
                        ...values.representative?.extras,
                        idCountryIsoCode: values.country_iso_code,
                    },
                },
            } : {}),
        };

        onSubmit({
            ...values,
            ...hiddenCountryValues,
            account: userDetails?._id,
            ...(addingFromMenu && !editSender ? {
                save_for_future: true,
                addingFromMenu: true,
            } : {}),
        });
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "980px", width: "calc(100% - 2rem)", margin: "1rem auto" }}>
            <ModalHeader toggle={toggle}>
                <span style={{ color: "#5926F0", fontWeight: 800 }}>{editSender ? t("Edit Sender") : t("Add New Sender")}</span>
            </ModalHeader>
            <ModalBody style={{ maxHeight: "78vh", overflow: "auto" }}>
                <MuiPickersUtilsProvider utils={DateMomentUtils}>
                    <form onSubmit={handleSubmit(submitForm)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 }}>
                                <Plus size={16} color="#5926F0" />
                                {senderAccountType === "business" ? t("Business Sender") : t("Individual Sender")}
                            </div>
                            {!addingFromMenu && (
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#606060" }}>
                                    <input type="checkbox" {...register("save_for_future")} />
                                    {t("Save for future")}
                                </label>
                            )}
                            {addingFromMenu && !editSender && (
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "#5926F0" }}>
                                    {t("Save for future")}
                                </span>
                            )}
                        </div>

                        <input type="hidden" {...register("sender_type")} value={senderAccountType} />

                        {senderAccountType === "individual" ?
                            <>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#5926F0" }}>{t("Personal Details")}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                                    {renderField("first_name", "First Name", "text", null, true)}
                                    {renderField("last_name", "Last Name", "text", null, true)}
                                    {renderDateField("dob", "Date of Birth", true)}
                                    {renderField("gender", "Gender", "text", [
                                        { value: "MALE", label: "Male" },
                                        { value: "FEMALE", label: "Female" },
                                        { value: "OTHER", label: "Other" },
                                    ])}
                                    {renderField("occupation", "Occupation", "text", Object.keys(occupations).map(key => ({ value: key, label: occupations[key] })))}
                                    {renderField("source_of_funds", "Source of Funds", "text", [
                                        { value: "SALARY", label: "Salary" },
                                        { value: "SAVINGS", label: "Savings" },
                                        { value: "BUSINESS", label: "Business" },
                                        { value: "OTHER", label: "Other" },
                                    ])}
                                    {renderRelationshipField()}
                                </div>
                            </>
                            :
                            <>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#5926F0" }}>{t("Business Details")}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                                    {renderField("company_name", "Company Name", "text", null, true)}
                                    {renderField("trading_name", "Trading Name")}
                                    {renderField("registration_number", "Registration Number")}
                                    {renderField("tax_id", "Tax ID")}
                                    {renderDateField("date_of_incorporation", "Date of Incorporation")}
                                    {renderField("business_relationship", "Business Relationship", "text", Object.keys(BUSINESS_RELATIONSHIPS).map(key => ({ value: key, label: BUSINESS_RELATIONSHIPS[key] })))}
                                </div>
                            </>
                        }

                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#5926F0" }}>{t("Contact and Address")}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                            {renderField("email", "Email", "email")}
                            {renderPhoneField()}
                            {renderField("address", "Address", "text", null, true)}
                            {renderLocationFields()}
                            {renderField("postal_code", "Postal Code")}
                        </div>

                        {senderAccountType === "business" &&
                            <>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#5926F0" }}>{t("Representative Details")}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                                    {renderField("representative.first_name", "First Name", "text", null, true)}
                                    {renderField("representative.last_name", "Last Name", "text", null, true)}
                                    {renderField("representative.address", "Address")}
                                    {renderField("representative.postal_code", "Postal Code")}
                                    {renderDateField("representative.dob", "Date of Birth")}
                                    {renderField("representative.gender", "Gender", "text", [
                                        { value: "MALE", label: "Male" },
                                        { value: "FEMALE", label: "Female" },
                                        { value: "OTHER", label: "Other" },
                                    ])}
                                </div>
                            </>
                        }

                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#5926F0" }}>{t("Identity Details")}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                            {senderAccountType === "business" ?
                                <>
                                    {renderField("representative.extras.idNumber", "ID Number")}
                                    {renderField("representative.extras.documentType", "Document Type", "text", Object.keys(idTypeData).map(key => ({ value: key, label: idTypeData[key] })))}
                                    {renderDateField("representative.extras.dateOfIssue", "Date of Issue")}
                                    {renderDateField("representative.extras.dateOfExpiry", "Date of Expiry", false, true)}
                                </>
                                :
                                <>
                                    {renderField("extras.idNumber", "ID Number")}
                                    {renderField("extras.documentType", "Document Type", "text", Object.keys(idTypeData).map(key => ({ value: key, label: idTypeData[key] })))}
                                    {renderDateField("extras.dateOfIssue", "Date of Issue")}
                                    {renderDateField("extras.dateOfExpiry", "Date of Expiry", false, true)}
                                </>
                            }
                        </div>

                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#5926F0" }}>{t("Documents")}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                            {renderFileField("id_front", senderAccountType === "business" ? "Representative ID Front" : "ID Front")}
                            {renderFileField("id_back", senderAccountType === "business" ? "Representative ID Back" : "ID Back")}
                            {renderFileField("selfie", senderAccountType === "business" ? "Representative Selfie" : "Selfie")}
                            {senderAccountType === "business" ?
                                <>
                                    {renderFileField("kyb_registry_extract", "Registry Extract")}
                                    {renderFileField("kyb_proof_of_authority", "Proof of Authority")}
                                    {renderFileField("kyb_ubos", "UBO Documentation")}
                                    {renderFileField("kyb_id_collection", "ID Documents Collection")}
                                    {renderFileField("kyb_additional_docs", "Additional Documents")}
                                </>
                                : null}
                        </div>

                        <button disabled={isSubmitting} type="submit" style={{ alignSelf: "flex-end", border: "none", borderRadius: "8px", background: isSubmitting ? "#9E8AED" : "#5926F0", color: "#fff", padding: "10px 16px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle size={16} />
                            {isSubmitting ? t(editSender ? "Updating Sender" : "Adding Sender") : t(editSender ? "Update Sender" : addingFromMenu ? "Add Sender" : "Use This Sender")}
                        </button>
                    </form>
                </MuiPickersUtilsProvider>
            </ModalBody>
        </Modal>
    );
};

export default AddSenderFormModal;
