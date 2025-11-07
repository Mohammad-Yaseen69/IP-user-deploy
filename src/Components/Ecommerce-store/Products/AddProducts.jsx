import { IconButton } from "@mui/material";
import { useState } from "react";
import { X } from "react-feather";
import { useTranslation } from "react-i18next";
import ProductsForm from "./ProductsForm";
import style from "./styles/AddProduct.module.scss";

function AddProducts({ setExpandDrower, onCreate }) {
    const { t } = useTranslation();
    const [files, setFiles] = useState([]);
    const [inventoryEnabled, setInventoryEnabled] = useState(false);
    const [variantEnabled, setVariantEnabled] = useState(false);
    const [variants, setVariants] = useState([{ id: 1 }]);
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...newFiles]);
        e.target.value = "";
    };
    const handleAddVariant = () => {
        setVariants([...variants, { id: variants.length + 1 }]);
    };
    const handleCreate = () => {
        setExpandDrower(false)
        onCreate?.()
    }
    return (
        <div className={style.DrawerContainer}>
            <div className={style.Header}>
                <div>
                    <p>{t("Product Details")}</p>
                    <span>#PRD-98716253-9</span>
                </div>
                <IconButton onClick={() => setExpandDrower(false)}>
                    <X />
                </IconButton>
            </div>


            <ProductsForm
                files={files}
                handleFileChange={handleFileChange}
                inventoryEnabled={inventoryEnabled}
                setInventoryEnabled={setInventoryEnabled}
                variantEnabled={variantEnabled}
                setVariantEnabled={setVariantEnabled}
                variants={variants}
                handleAddVariant={handleAddVariant}
                handleCreate={handleCreate}
            />

        </div>

    );
}

export default AddProducts;
