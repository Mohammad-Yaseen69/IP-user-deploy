import { useTranslation } from "react-i18next";
import style from "./styles/index.module.scss";


const Generalnfo = () => {
    const { t } = useTranslation()
    return (
        <div>
            <>
                <div className={style.tabContent}>
                    <div className={style.infoGrid}>
                        <div>
                            <h6>{t("Product Name")}</h6>
                            <p>iPhone 13 Pro Max 128GB</p>
                        </div>
                        <div>
                            <h6>{t("Product Category")}</h6>
                            <p>Smartphone</p>
                        </div>
                        <div>
                            <h6>{t("Brand")}</h6>
                            <p>Apple</p>
                        </div>
                        <div>
                            <h6>{t("SKU")}</h6>
                            <p>#PRD-98716253-9</p>
                        </div>
                        <div>
                            <h6>{t("Weight")}</h6>
                            <p>238 grams</p>
                        </div>
                        <div>
                            <h6>{t("Dimensions")}</h6>
                            <p>146.7 x 71.5 x 7.65 mm</p>
                        </div>
                    </div>

                    {/* ===== Variants Section ===== */}
                    <div className={style.variantBox}>
                        <h6>{t("Variants")}</h6>
                        <div className={style.variantChips}>
                            <span>Black</span>
                            <span>Blue</span>
                            <span>Red</span>
                        </div>
                    </div>

                    {/* ===== Description Section ===== */}
                    <div className={style.descriptionBox}>
                        <h6>{t("Descriptions")}</h6>
                        <p>
                            The iPhone 13 Pro Max (Model) features a stunning 6.7-inch OLED display
                            with Super Retina XDR technology, offering vibrant color reproduction
                            and contrast ratios. Powered by the A15 Bionic chip, this smartphone
                            delivers faster performance, improved battery life, and enhanced camera
                            capabilities. Includes up to 1TB of storage for professional-grade
                            photography and 4K video recording.
                        </p>
                    </div>

                    {/* ===== Shipping Info ===== */}

                </div>
                <div className={style.shippingBox}>
                    <h6>{t("Shipping Information")}</h6>
                    <p>
                        Ships in 2–3 business days from our warehouse. Free standard shipping on
                        orders over $100. Expedited shipping available.
                    </p>
                </div></>
        </div>
    )
}

export default Generalnfo
