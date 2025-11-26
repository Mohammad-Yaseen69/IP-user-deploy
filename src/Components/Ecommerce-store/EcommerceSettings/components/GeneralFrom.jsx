import { Facebook, Instagram, Linkedin, Trash2, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import logo from "../../assets/icons/Logo.png";
import style from "../Styles/GeneralFrom.module.scss";
import StoreFrontForm from './StoreFrontForm';
import ProductsForm from './ProductsForm';
const socialLinksData = [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/flowerstore", icon: "in" }, // Placeholder for icon
    { name: "Instagram", url: "https://www.instagram.com/flowerstore", icon: "instagram" },
    { name: "Facebook", url: "https://www.facebook.com/flowerstore", icon: "facebook" },
    { name: "X", url: "https://www.x.com/flowerstore", icon: "x" },
];
const GeneralFrom = () => {
    const { t } = useTranslation()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const renderIcon = (iconName) => {
        switch (iconName) {
            case 'in': return <div style={{ color: '#fff' }}><Linkedin size={20} /></div>;
            case 'instagram': return <div style={{ color: '#fff' }}><Instagram size={20} /></div>;
            case 'facebook': return <div style={{ color: '#fff' }}><Facebook size={20} /></div>;
            case 'x': return <div style={{ color: '#fff' }}><X size={20} /></div>;
            default: return null;
        }
    };
    const onSubmit = (data) => {
        console.log("GENERAL FORM DATA:", data);
    };
    return (
        <div className={style.formContainer}>
            <form onSubmit={handleSubmit(onSubmit)} className={style.formContent}>
                <div className={style.leftCol}>
                    <div>
                        <h4>{t("General")}</h4>
                    </div>
                    <h2>{t("Store Information")}</h2>
                    <p>{t("Everything that defines the store’s identity and basics")}</p>
                    <div className={style.heroSection}>
                        <h4>{t("Store front")}</h4>
                        <div>
                        </div>
                        <h2>{t("Hero Section")}</h2>
                        <p>{t("Control what customers see first — customize your banner, message, and CTA.")}</p>
                    </div>
                    <div className={style.heroSection2}>

                        <h2>{t("Theme & Typography")}</h2>
                        <p>{t("Define your store’s look with colors, fonts, and visual styles that match your brand.")}</p>
                    </div>
                    <div className={style.heroSection3}>

                        <h2>{t("Layout Options")}</h2>
                        <p>{t("Adjust your product grid, spacing, and filters for the perfect browsing experience.")}</p>
                    </div>

                </div>

                <div className={style.form}>
                    <div className={style.logoSection}>
                        <div className={style.logoPreview}>
                            <span>{t("Store Logo")}</span>
                            <div>
                                <img src={logo} alt="logo" />
                                <div className={style.trashIcon}>
                                    <Trash2 size={15} />
                                </div>
                            </div>
                            <span className={style.logoSize}>256 x 256</span>

                        </div>
                        <div className={style.logoPreview}>
                            <span>{t("Store Logo")}</span>
                            <div className={style.UploadLogo}>
                                <img src={logo} alt="logo" />
                                <div className={style.trashIcon1}>
                                    <Trash2 size={20} />
                                </div></div>
                            <span className={style.logoSize}>64 x 64</span>
                        </div>
                    </div>
                    <div className={style.inputGroup}>
                        <label>{t("Store Name")}</label>
                        <input
                            type="text"
                            {...register("storeName", { required: t("Store Name is required") })}
                            defaultValue={"Flower Store"}
                        />
                        {errors.storeName && (
                            <p className={style.error}>{errors.storeName.message}</p>
                        )}
                    </div>
                    <div className={style.inputGroup}>
                        <label>{t("Email Address")}</label>
                        <input
                            type="text"
                            {...register("email", { required: t("Email is required") })}
                            defaultValue={"flowerstore@gmail.com"}
                        />
                        {errors.storeName && (
                            <p className={style.error}>{errors.storeName.message}</p>
                        )}
                    </div>
                    <div className={style.inputGroup}>
                        <label>{t("Phone Number")}</label>
                        <input
                            type="text"
                            {...register("PhoneNumber", { required: t("Phone Number is required") })}
                            defaultValue={"(555) 123-4567"}
                        />
                        {errors.storeName && (
                            <p className={style.error}>{errors.storeName.message}</p>
                        )}
                    </div>
                    <div className={style.socialLinksContainer}>
                        <h6>{t("Social Media Links")}</h6>
                        {socialLinksData.map((link, index) => (
                            <div key={index} className={style.socialLinkRow}>

                                <div className={style.socialLinkName}>
                                    <div className={style.iconWrapper}>
                                        {renderIcon(link.icon)}
                                    </div>
                                    {link.name}
                                </div>

                                <div className={style.socialLinkInput}>
                                    <input
                                        type="url"
                                        {...register(link.name, {
                                            required: t(`${link.name} link is required`)
                                        })}
                                        defaultValue={link.url}
                                        placeholder={`Enter ${link.name} URL`}
                                    />
                                    {errors[link.name] && (
                                        <p className={style.error}>{errors[link.name].message}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={style.inputGroup}>
                        <label>{t("Store Description")}</label>
                        <select
                            {...register("Description", { required: t("Description is required") })}
                            defaultValue={["Discover the beauty of fresh blooms!"]}

                        >
                            <option value="Discover the beauty of fresh blooms!">Discover the beauty of fresh blooms!</option>
                            <option value="Handcrafted floral arrangements">Handcrafted floral arrangements</option>
                            <option value="For every occasion">For every occasion</option>
                        </select>
                        {errors.Description && (
                            <p className={style.error}>{errors.Description.message}</p>
                        )}
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Currency")}</label>
                        <select
                            {...register("Currency", { required: t("Currency is required") })}
                            defaultValue={["USD"]}

                        >
                            <option value="USD">(USD)</option>
                            <option value="EUR">(EUR)</option>
                            <option value="GBP">(GBP)</option>
                        </select>
                        {errors.Currency && (
                            <p className={style.error}>{errors.Currency.message}</p>
                        )}
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Language")}</label>
                        <select

                            {...register("Language", { required: t("Language is required") })}
                            defaultValue={["English"]}
                        //
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                        {errors.Language && (
                            <p className={style.error}>{errors.Language.message}</p>
                        )}
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Timezone")}</label>
                        <select
                            {...register("Timezone", { required: t("Timezone is required") })}
                            defaultValue={["UTC-5"]}

                        >
                            <option value="UTC-5">UTC-5</option>
                            <option value="UTC+0">UTC+0</option>
                            <option value="UTC+5:30">UTC+5:30</option>
                        </select>
                        {errors.Timezone && (
                            <p className={style.error}>{errors.Timezone.message}</p>
                        )}
                    </div>
                    <StoreFrontForm t={t} handleSubmit={handleSubmit} register={register} errors={errors} onSubmit={onSubmit} />
                    <ProductsForm register={register} errors={errors} onSubmit={onSubmit} />
                </div>


            </form>

        </div>
    )
}

export default GeneralFrom
