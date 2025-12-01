import style from "../Styles/GeneralFrom.module.scss";
import { useTranslation } from 'react-i18next';
const ProductsForm = ({ errors, register, activeTab }) => {
  const { t } = useTranslation();
  return (
    <>
      <div>
        <h4>{t("Products")}</h4>

      </div>
      <div className={style.generalForm} >
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <div>
            </div>
            <h2>{t("Display Settings")}</h2>
            <p>{t("Choose how products appear — grid layout, sorting, and quick actions.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div className={style.inputGroup}>
            <label>{t("Default Sort By")}</label>
            <select
              {...register("sort", { required: t("sort Type is required") })}
              defaultValue={["Image"]}
            >
              <option value="Image">Newest</option>
              <option value="no">Video</option>
            </select>
            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label>{t("Show Ratings")}</label>
            <select
              {...register("Ratings", { required: t("Ratings Type is required") })}
              defaultValue={["yes"]}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label>{t("Show Stock Info")}</label>
            <select
              {...register("Stock", { required: t("Stock Type is required") })}
              defaultValue={["yes"]}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.Description && (
              <p className={style.error}>{errors.Description.message}</p>
            )}
          </div>


        </div>
      </div>
      <div className={style.generalForm} style={{
        marginTop: activeTab === 1 ? "0px" : "50px"
      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>

            <div>
            </div>
            <h2>{t("Price Settings")}</h2>
            <p>{t("Customize how prices are displayed, including currency symbols and decimals.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div className={style.inputGroup}>
            <label>{t("Show Currency Symbol")}</label>
            <select
              {...register("sort", { required: t("sort Type is required") })}
              defaultValue={["yes"]}
            >
              <option value="yes">Yes</option>
              <option value="no">no</option>
            </select>
            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label>{t("Decimal Precision")}</label>
            <select
              defaultValue={["1"]}
            >
              <option value="yes">1</option>
              <option value="no">1</option>
            </select>
            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>




        </div>
      </div>
      <div className={style.generalForm} style={{
        marginTop: activeTab === 1 ? "0px" : "50px"
      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <div>
            </div>
            <h2>{t("Pagination")}</h2>
            <p>{t("Control how customers browse through product pages or infinite scroll.")}</p>
          </div>
        </div>
        <div
          className={style.form}
        >
          <div className={style.inputGroup}>
            <label>{t("Type:")}</label>
            <select
              defaultValue={"Infinite Scroll"}
            >
              <option value="yes">Infinite Scroll</option>
              <option value="no">Infinite Scroll</option>
            </select>

          </div>
        </div>
      </div>
    </>
  )
}

export default ProductsForm
