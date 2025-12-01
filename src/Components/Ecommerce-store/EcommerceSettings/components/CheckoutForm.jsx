import { useTranslation } from "react-i18next"
import { Toggle } from "../../../MyMasterCard/CardPurchased"
import style from "../Styles/GeneralFrom.module.scss"
const CheckoutForm = ({ errors, register, activeTab, }) => {
  const { t } = useTranslation()
  return (
    <>
      <div>
        <h4>{t("Checkout")}</h4>
      </div>
      <div className={style.generalForm} >
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <div>
            </div>
            <h2>{t("Payment Options")}</h2>
            <p>{t("Manage which payment methods customers can use at checkout.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div className={style.inputGroup}>
            <label>{t("Enable Cash on Delivery")}</label>
            <select
              {...register("Cash", { required: t("Cash Type is required") })}
              defaultValue={["Newest"]}
            >
              <option value="Newest">Newest</option>
              <option value="no">Video</option>
            </select>
            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label>{t("Enable Card Payments")}</label>
            <select
              {...register("Card", { required: t("Card Type is required") })}
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
            <label>{t("Enable Wallet Payments")}</label>
            <select
              {...register("Wallet", { required: t("Wallet Type is required") })}
              defaultValue={["yes"]}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {errors.Description && (
              <p className={style.error}>{errors.Description.message}</p>
            )}
          </div>
          <div className={style.inputGroup}>
            <label>{t("Enable Coupons or Discount Codes")}</label>
            <select
              {...register("Coupons", { required: t("Coupons Type is required") })}
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
              {...register("CurrencySymbol", { required: t("CurrencySymbol Type is required") })}
              defaultValue={["no"]}
            >
              <option value="Newest">Yes</option>
              <option value="no">no</option>
            </select>
            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>
          <div className={style.inputGroup}>
            <label>{t("Decimal Precision")}</label>
            <select
              {...register("Decimal_Precision", { required: t("Decimal Precision Type is required") })}
              defaultValue={["2"]}
            >
              <option value="yes">2</option>
              <option value="no">4</option>
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
            <h2>{t("Confirmation")}</h2>
            <p>{t("Customize what customers see and where they go after completing a purchase.")}</p>
          </div>
        </div>
        <div
          className={style.form}
        >
          <div className={style.inputGroup}>
            <label>{t("Success Message")}</label>
            <input
              {...register("succesMessage", { required: t("succes Message Type is required") })}
              defaultValue={"Thank you for your purchase! Your order will be delivered soon 🌸"}
            />

            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>
          <div className={style.inputGroup}>
            <label>{t("Redirect After Checkout")}</label>
            <select
              defaultValue={"/order-success"}
            >
              <option value="/order-success">/order-success</option>
              <option value="/order-success">/order-success</option>
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
            <h2>{t("Notifications")}</h2>
            <p>{t("Enable automated messages to confirm orders and share updates.")}</p>
          </div>
        </div>
        <div
          className={style.form}
        >
          <div
            className={style.toggleSection}
          >
            <Toggle />

            <label >{t("Email Order Confirmation")}</label>
          </div>
          <div
            className={style.toggleSection}
          >
            <Toggle />

            <label >{t("WhatsApp Confirmation")}</label>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutForm
