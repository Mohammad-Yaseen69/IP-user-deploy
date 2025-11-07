import React from 'react'
import UploadComponent from './Upload'
import style from "./styles/AddProduct.module.scss"
import { useTranslation } from 'react-i18next'
import { FolderPlus, Plus } from 'react-feather'
import { Toggle } from '../../MyMasterCard/CardPurchased'
const ProductsForm = ({
    files,
    handleFileChange,
    inventoryEnabled,
    setInventoryEnabled,
    variantEnabled,
    setVariantEnabled,
    variants,
    handleAddVariant,
}) => {
    const { t } = useTranslation();
    return (
        <div className={style.Content}>
            <h4>{t("Product Images")}</h4>
            <UploadComponent files={files} handleFileChange={handleFileChange} />

            <label>
                {t("Product Name")}
                <input type="text" placeholder={t("Enter your product title")} />
            </label>

            <label>
                {t("Description")}
                <textarea
                    rows="3"
                    placeholder={t("Write your product description here...")}
                ></textarea>
            </label>

            <div className={style.flexRow}>
                <label>
                    {t("Brand")}
                    <select>
                        <option>{t("Select brand")}</option>
                    </select>
                </label>
                <label>
                    {t("Category")}
                    <select>
                        <option>{t("Select your product category")}</option>
                    </select>
                </label>
            </div>

            <div className={style.variantBox}>
                <Toggle checked={inventoryEnabled} onChange={() => setInventoryEnabled(prev => !prev)} />
                <div>
                    <h6>{t("Inventory Stock")}</h6>
                    <p>
                        {t(
                            "Enable this to add product stock in the inventory."
                        )}
                    </p>
                </div>
            </div>
            {inventoryEnabled && (
                <label>
                    {t("Stock")}
                    <input type="number" placeholder={t("Enter your product stock")} />
                </label>
            )}
            <div className={style.variantBox}>
                <Toggle checked={inventoryEnabled} onChange={() => setInventoryEnabled(prev => !prev)} />
                <div>
                    <h6>{t("Create Product Variants")}</h6>
                    <p>
                        {t(
                            "Enable this to add product variations such as color, size, or other attributes."
                        )}
                    </p>
                </div>
            </div>

            {
                !variantEnabled && <label>
                    {t("Price Amount")}
                    <div className={style.priceBox}>
                        <select>
                            <option>{t("Currency")}</option>
                        </select>
                        <input type="number" placeholder="0" />
                    </div>
                </label>
            }
            {
                variantEnabled &&
                variants.map((variant, index) => (
                    <label key={variant.id}>
                        {t(`Variant ${index + 1}`)}
                        <div className={style.priceBox}>
                            <input type="text" placeholder="Color" />
                            <span>{t("$8465")}</span>
                        </div>
                    </label>
                ))
            }
            {
                variantEnabled && <div className={style.divider}>
                    <div className={style.line}></div>
                    <button><FolderPlus /> {t("Add Categories")}</button>
                    <button onClick={handleAddVariant}>
                        <Plus /> {t("Add Variant")}</button>
                    <div className={style.line}></div>

                </div>
            }
            <div className={style.footer}>
                <button className={style.cancel}>{t("Cancel")}</button>
                <button className={style.create}>{t("Create")}</button>
            </div>
        </div>
    )
}

export default ProductsForm
