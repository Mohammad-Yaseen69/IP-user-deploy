import { useTranslation } from 'react-i18next'
import style from "../Styles/GeneralFrom.module.scss"
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { Toggle } from "../../../MyMasterCard/CardPurchased"

const ShippingForm = ({ errors, register, activeTab, setValue }) => {
  const { t } = useTranslation()
  const [countries, setCountries] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() !== "") {
        setCountries([...countries, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const removeCountry = (index) => {
    setCountries(countries.filter((_, i) => i !== index));
  };
  useEffect(() => {
    setValue("Country", countries);
  }, [countries]);

  return (
    <>
      <div>
        <h4>{t("Shipping")}</h4>
      </div>
      <div className={style.generalForm} >
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <div>
            </div>
            <h2>{t("General")}</h2>
            <p>{t("Define where you ship, default courier, and estimated delivery times.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div className={style.inputGroup}>
            <label>{t("Supported Countries / Regions (multi-select)")}</label>

            <div className={style.tagInputContainer}>
              {countries.map((country, index) => (
                <div className={style.tag} key={index}>
                  {country}
                  <X size={15} className={style.remove} onClick={() => removeCountry(index)} />
                </div>
              ))}

              <input
                type="text"
                value={inputValue}
                placeholder="Type and press Enter"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />

            </div>
          </div>

          <div className={style.inputGroup}>
            <label>{t("Estimated Delivery Text")}</label>
            <input
              {...register("DeleveryText", { required: t("DeleveryText Type is required") })}
              defaultValue={"2–4 business days within Egypt, 5–7 days international."}
            />

            {errors.DeleveryText && (
              <p className={style.error}>{errors.DeleveryText.message}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label>{t("Default Courier")}</label>
            <select
              {...register("Courier", { required: t("Courier Type is required") })}
              defaultValue={["Fedex"]}
            >
              <option value="yes">Fedex</option>
              <option value="no">Fedex</option>
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

            <h2>{t("Shipping Rates")}</h2>
            <p>{t("Set free, flat, or weight-based rates depending on your delivery policy.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div
            className={style.toggleSection}
          >
            <Toggle />

            <label >{t("Free Shipping")}</label>
          </div>

          <div className={style.inputGroup}>
            <label>{t("Flat Rate")}</label>
            <input
              type='number'
              {...register("Flat", { required: t("Flat Type is required") })}
              defaultValue={["6.99"]}
            />

            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>

          <div className={style.inputGroup} >
            <label>{t("Weight-based Shipping")}</label>
            <div className={style.ctaGroup}>

              <div>
                <label>{t("MinWeight")}</label>
                <input
                  type='number'
                  defaultValue={"1"}
                />
                <input
                  type='number'
                  defaultValue={"3"}
                />
                <input
                  type='text'
                  defaultValue={"add new"}
                />
              </div>

              <div>
                <label>{t("MaxWeight")}</label>
                <input
                  type='number'
                  defaultValue={"1"}
                />
                <input
                  type='number'
                  defaultValue={"3"}
                />
                <input
                  type='text'
                  defaultValue={"add new"}
                />
              </div>
              <div>
                <label>{t("Price")}</label>
                <input
                  type='number'
                  defaultValue={"2.99"}
                />
                <input
                  type='number'
                  defaultValue={"5.99"}
                />
                <input
                  type='text'
                  defaultValue={"add new"}
                />
              </div>

            </div>

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

            <h2>{t("Tracking")}</h2>
            <p>{t("Enable order tracking for customers and connect with courier links.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div
            className={style.toggleSection}
          >
            <Toggle />

            <label >{t("Enable Shipment Tracking")}</label>
          </div>

          <div className={style.inputGroup}>
            <label>{t("Tracking URL Template")}</label>
            <input
              type='text'
              {...register("Tracking", { required: t("Tracking Type is required") })}
              defaultValue={["https://track.example.com/{{courier}}/{{tracking_number}}"]}
            />

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

            <h2>{t("Returns")}</h2>
            <p>{t("Let customers return products easily — set your policy and terms here.")}</p>
          </div>



        </div>
        <div
          className={style.form}
        >

          <div
            className={style.toggleSection}
          >
            <Toggle />

            <label >{t("Enable Returns  ")}</label>
          </div>

          <div className={style.inputGroup}>
            <label>{t("Return Policy Text")}</label>
            <input
              type='text'
              {...register("Tracking", { required: t("Tracking Type is required") })}
              defaultValue={"Returns accepted within 7 days of delivery in original packaging."}
            />

            {errors.BackgroundType && (
              <p className={style.error}>{errors.BackgroundType.message}</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ShippingForm
