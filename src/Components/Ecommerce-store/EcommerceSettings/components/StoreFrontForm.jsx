import { UploadCloud } from 'react-feather';
import style from "../Styles/GeneralFrom.module.scss";
import { useTranslation } from 'react-i18next';
const StoreFrontForm = ({ errors, register, activeTab }) => {
  const { t } = useTranslation();
  return (

    <div
      className={style.form}
      style={{
        marginTop: activeTab === 1 ? "0px" : "50px"
      }}
    >

      <div className={style.inputGroup}>
        <label>{t("Background Type")}</label>
        <select
          {...register("BackgroundType", { required: t("Background Type is required") })}
          defaultValue={["Image"]}
        >
          <option value="Image">Image</option>
          <option value="Video">Video</option>
        </select>
        {errors.BackgroundType && (
          <p className={style.error}>{errors.BackgroundType.message}</p>
        )}
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
      <div className={style.inputGroup}>
        <label>{t("Heading Text")}</label>
        <input
          type="text"
          {...register("headingText", { required: t("Heading Text is required") })}
          defaultValue={"Discover the Beauty of Fresh Blooms!"}
        />
        {errors.storeName && (
          <p className={style.error}>{errors.storeName.message}</p>
        )}
      </div>

      <div className={style.inputGroup}>
        <label>{t("Subheading Text")}</label>
        <input
          {...register("Subheading", { required: t("Subheading is required") })}
          defaultValue={["Shop Our Handcrafted Floral Arrangements Today."]}
        />
        {errors.Description && (
          <p className={style.error}>{errors.Description.message}</p>
        )}
      </div>
      <div className={style.inputGroup} >
        <label>{t("CTA Button Label & Link")}</label>
        <div className={style.ctaGroup}>
          <input
            {...register("CTA", { required: t("CTA Button Label & Link is required") })}
            defaultValue={["View All Arrangements"]}
          />
          <select
            {...register("products", { required: t("CTA Button Label & Link  is required") })}
            defaultValue={["Products"]}

          >
            <option value="CTA Button Label & Link ">CTA Button Label & Link </option>
            <option value="EUR">(EUR)</option>
            <option value="GBP">(GBP)</option>
          </select>
        </div>
        {errors.Description && (
          <p className={style.error}>{errors.Description.message}</p>
        )}
      </div>
      <div
        className={style.form}
        style={{
          marginTop: "50px"
        }}
      >

        <div className={style.inputGroup}>

          <label>{t("Primary Color Picker")}</label>
          <input
            type="color"
            {...register("primaryColor", { required: t("Primary Color is required") })}
            defaultValue="#3BAF85"
          />
          {errors.primaryColor && (
            <p className={style.error}>{errors.primaryColor.message}</p>
          )}
        </div>
        <div className={style.inputGroup}>

          <label>{t("Accent Color Picker")}</label>
          <input
            type="color"
            {...register("accentColor", { required: t("accent Color is required") })}
            defaultValue="#E0F7EC"
          />
          {errors.primaryColor && (
            <p className={style.error}>{errors.primaryColor.message}</p>
          )}
        </div>

        <div className={style.inputGroup}>
          <label>{t("Secondary Color Picker")}</label>
          <input
            type="color"
            {...register("secondryColor", { required: t("secondry Color is required") })}
            defaultValue="#FF69B4"
          />
          {errors.storeName && (
            <p className={style.error}>{errors.storeName.message}</p>
          )}
        </div>
        <div className={style.inputGroup}>
          <h5>{t("Font Family")}</h5>
          <label style={{ color: "#8a8a8a" }}
          >{t("Heading")}</label>
          <select

            {...register("Language", { required: t("Language is required") })}
            defaultValue={["popins"]}
          //
          >
            <option value="English">popins</option>
            <option value="Spanish">popins</option>
            <option value="French">popins</option>
          </select>
        </div>
        <div className={style.inputGroup}>
          <label style={{ color: "#8a8a8a" }}
          >{t("Body")}</label>
          <select

            {...register("Language", { required: t("Language is required") })}
            defaultValue={["inter"]}
          //
          >
            <option value="English">inter</option>
            <option value="Spanish">popins</option>
            <option value="French">popins</option>
          </select>
        </div>

      </div>
      <div
        className={style.form}
        style={{
          marginTop: "50px"
        }}
      >


        <div className={style.inputGroup}>

          <label
          >{t("Product Grid Layout")}</label>
          <select

            {...register("grid", { required: t("grid  is required") })}
            defaultValue={[4]}
          //
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div className={style.inputGroup}>
          <label
          >{t("Show Filters")}</label>
          <select

            {...register("filter", { required: t("filter is required") })}
            defaultValue={["No"]}
          //
          >
            <option value="yes">yes</option>
            <option value="no">No</option>

          </select>
        </div>
        <div className={style.inputGroup}>
          <label
          >{t("Spacing Density")}</label>
          <select

            {...register("Density", { required: t("Density is required") })}
            defaultValue={["No"]}
          //
          >
            <option value="Compact">Compact</option>
            <option value="Spanish">No</option>

          </select>
        </div>

      </div>
    </div>
  )
}

export default StoreFrontForm
