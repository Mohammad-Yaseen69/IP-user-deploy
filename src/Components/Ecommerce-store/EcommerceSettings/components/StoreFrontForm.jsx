import { Plus, UploadCloud } from 'react-feather';
import style from "../Styles/GeneralFrom.module.scss";
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
const StoreFrontForm = ({ errors, register, activeTab }) => {
  const { t } = useTranslation();
  return (
    <>
      <div>
        <h4>{t("Store front")}</h4>
      </div>
      <div className={style.generalForm} >        <div className={style.leftCol}>
        <div className={style.heroSection}>
          <div>
          </div>
          <h2>{t("Hero Section")}</h2>
          <p>{t("Control what customers see first — customize your banner, message, and CTA.")}</p>
        </div>
      </div>
        <div
          className={style.form}
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

        </div>
      </div>
      <div className={style.generalForm} style={{
        marginTop: "50px"
      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <h2>{t("Theme & Typography")}</h2>
            <p>{t("Define your store’s look with colors, fonts, and visual styles that match your brand.")}</p>
          </div>
        </div>

        <div
          className={style.form}

        >

          <div className={style.inputGroup}>

            <label>{t("Primary Color Picker")}</label>
            <div className={style.ctaGroup}>
              <input
                type="color"
                className={style.colorPicker}
                {...register("primaryColor", { required: t("Primary Color is required") })}
                defaultValue="#3BAF85"
              />
              <input
                type="text"
                {...register("primaryColor", { required: t("Primary Color is required") })}
                defaultValue="#3BAF85"
              />
            </div>
            {errors.primaryColor && (
              <p className={style.error}>{errors.primaryColor.message}</p>
            )}
          </div>
          <div className={style.inputGroup}>

            <label>{t("Accent Color Picker")}</label>
            <div className={style.ctaGroup}>

              <input
                type="color"
                className={style.colorPicker}
                {...register("accentColor", { required: t("accent Color is required") })}
                defaultValue="#E0F7EC"
              />
              <input
                type="text"
                {...register("accentColor", { required: t("accent Color is required") })}
                defaultValue="#E0F7EC"
              />
            </div>

            {errors.primaryColor && (
              <p className={style.error}>{errors.primaryColor.message}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label>{t("Secondary Color Picker")}</label>
            <div className={style.ctaGroup}>
              <input
                type="color"
                className={style.colorPicker}
                {...register("secondryColor", { required: t("secondry Color is required") })}
                defaultValue="#FF69B4"
              />
              <input
                type="text"
                {...register("secondryColor", { required: t("secondry Color is required") })}
                defaultValue="#FF69B4"
              />
            </div>
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
      </div>
      <div className={style.generalForm} style={{
        marginTop: "50px"
      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <h2>{t("Layout Options")}</h2>
            <p>{t("Adjust your product grid, spacing, and filters for the perfect browsing experience.")}</p>
          </div>
        </div>
        <div
          className={style.form}

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
      </div >
      <div className={style.generalForm} style={{
        marginTop: "50px"
      }}>
        <div className={style.leftCol}>

          <div className={style.heroSection}>
            <h2>{t("Custom Sections")}</h2>
            <p>{t("Add or remove homepage sections like “About,” “Featured Products,” and banners.")}</p>
          </div>
        </div>
        <div
          className={style.form}

        >


          <div className={style.inputGroup}>

            <h4
            >{t("Add Featured Products Section")}</h4>
            <p style={{
              color: "#8a8a8a"
            }}
            >{("Showcase and manage the products you want customers to notice first.")}</p>
            <div><Button><Plus size={20} />{t("Add New Product")}</Button></div>
            <div className={style.orderItems}>
              <div>
                <div>
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2V8ZW58MHx8MHx8&w=1000&q=80" alt="img" />
                  <div className={style.rightInfo}>
                    <h5>Product Name</h5>
                    <p><span>white</span><span>128 GB</span><span>$3748</span></p>
                  </div>
                </div>
                <div className={style.priceQty}>
                  <h5>$1,499.00</h5>
                  <p>Remove</p>
                </div>
              </div>
              <div>
                <div>
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2V8ZW58MHx8MHx8&w=1000&q=80" alt="img" />
                  <div className={style.rightInfo}>
                    <h5>Product Name</h5>
                    <p><span>white</span><span>128 GB</span><span>$3748</span></p>
                  </div>
                </div>
                <div className={style.priceQty}>
                  <h5>$1,499.00</h5>
                  <p>Remove</p>
                </div>
              </div>
            </div>
          </div>

          <div className={style.inputGroup}>
            <h5>{t("Add About Section")}</h5>
            <label style={{ color: "#8a8a8a" }}
            >{t("Heading")}</label>
            <select

              {...register("Language", { required: t("Language is required") })}
              defaultValue={["Handcrafted pieces that feel personal"]}
            //
            >
              <option value="English">Handcrafted pieces that feel personal</option>
              <option value="Spanish">popins</option>
              <option value="French">popins</option>
            </select>
          </div>
          <div className={style.inputGroup}>
            <label style={{ color: "#8a8a8a" }}
            >{t("Body")}</label>
            <select

              {...register("Language", { required: t("Language is required") })}
              defaultValue={["Our arrangements are designed to bring joy, elegance, and a personal touch to your special moments."]}
            //
            >
              <option value="English">Our arrangements are designed to bring joy, elegance, and a personal touch to your special moments.</option>
              <option value="Spanish">popins</option>
              <option value="French">popins</option>
            </select>
          </div>
          <div className={style.UploadGroup}>
            <label>{t("Upload  media")}</label>

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
          <div className={style.inputGroup} >
            <label>{t("Footer Links")}</label>
            <div className={style.ctaGroup}>

              <div>
                <label>{t("Label")}</label>
                <div
                >{t("About Us")}</div>
                <div
                >{t("Contact")}</div>
                <div
                >{t("Privacy Policy")}</div>
              </div>

              <div>
                <label>{t("Links")}</label>
                <input
                  type='url'
                  defaultValue={"/about"}
                />
                <input
                  type='url'
                  defaultValue={"/contact"}
                />
                <input
                  type='url'
                  defaultValue={"/privacy"}
                />
              </div>

            </div>

            {errors.Description && (
              <p className={style.error}>{errors.Description.message}</p>
            )}
          </div>
        </div>
      </div >
    </>
  )
}

export default StoreFrontForm
