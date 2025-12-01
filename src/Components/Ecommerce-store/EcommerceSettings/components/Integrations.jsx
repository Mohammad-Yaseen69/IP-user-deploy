import { UploadCloud } from "react-feather";
import { useTranslation } from "react-i18next";
import style from "../Styles/GeneralFrom.module.scss";

const Integration = ({ errors, register, activeTab }) => {
    const { t } = useTranslation();

    return (
        <>
            <div>
                <h4>{t("Integrations")}</h4>
            </div>
            <div className={style.generalForm}
            >
                <div className={style.leftCol}>
                    <div className={style.heroSection}>
                        <h2>{t("Analytics")}</h2>
                        <p>
                            {t(
                                "Connect your store with analytics platforms to track visitors and conversions."
                            )}
                        </p>
                    </div>
                </div>

                <div className={style.form}>
                    <div className={style.inputGroup}>
                        <label>{t("Google Analytics ID")}</label>
                        <input
                            {...register("google_analytics")}
                            defaultValue="G-12ABCXYZ"
                        />
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Meta Pixel ID")}</label>
                        <input {...register("meta_pixel")} defaultValue="987654321" />
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Hotjar ID")}</label>
                        <input {...register("hotjar")} defaultValue="HJ-123456" />
                    </div>
                </div>
            </div>

            <div className={style.generalForm} style={{
                marginTop: "50px"
            }}>
                <div className={style.leftCol}>
                    <div className={style.heroSection}>
                        <h2>{t("Marketing")}</h2>
                        <p>
                            {t(
                                "Add chat widgets or newsletter tools to boost engagement and communication."
                            )}
                        </p>
                    </div>
                </div>

                <div className={style.form}>
                    <div className={style.inputGroup}>
                        <label>{t("Newsletter Integration")}</label>
                        <input
                            {...register("newsletter")}
                            defaultValue="Mailchimp"
                        />
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Chat Widget")}</label>
                        <input
                            {...register("chat_widget")}
                            defaultValue="Crisp"
                        />
                    </div>
                </div>
            </div>

            <div className={style.generalForm} style={{
                marginTop: "50px"
            }}>
                <div className={style.leftCol}>
                    <div className={style.heroSection}>
                        <h2>{t("SEO")}</h2>
                        <p>
                            {t(
                                "Optimize how your store appears on Google and social media platforms."
                            )}
                        </p>
                    </div>
                </div>

                <div className={style.form}>
                    <div className={style.inputGroup}>
                        <label>{t("Meta Title")}</label>
                        <input {...register("meta_title")} defaultValue="Flower Store – Fresh Blooms & Elegant Arrangements" />
                    </div>

                    <div className={style.inputGroup}>
                        <label>{t("Meta Description")}</label>
                        <input
                            {...register("meta_description")}
                            defaultValue="Shop handcrafted flower arrangements online. Same-day delivery available."
                        />
                    </div>
                    <div className={style.UploadGroup}>
                        <label>{t("Upload hero media")}</label>

                        <div className={style.DropZone}>
                            <input
                                type="file"
                                className={style.FileInput}
                                {...register("media", { required: t("media is required") })}
                            />

                            <div className={style.DropZoneContent}>
                                <div className={style.IconWrapper}>
                                    <UploadCloud size={40} />
                                </div>

                                <span className={style.DragDropText}>
                                    {t("Drag & drop medias, or ")}
                                    <a href="#browse" className={style.BrowseLink}>{t("browse")}</a>
                                </span>

                                <p className={style.FormatInfo}>
                                    {t("Supported formats: PNG, JPG. Maximum file size: 5 MB")}
                                </p>
                            </div>
                        </div>

                        {errors.media && (
                            <p className={style.error}>{errors.media.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Integration;
