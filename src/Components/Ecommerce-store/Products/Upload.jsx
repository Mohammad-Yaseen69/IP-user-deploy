import React from 'react'
import style from "./styles/AddProduct.module.scss";
import { Plus, UploadCloud } from 'react-feather';
import { useTranslation } from 'react-i18next';

const UploadComponent = ({ files, handleFileChange }) => {
    const { t } = useTranslation();

    return (
        <>
            {files.length === 0 ? (
                <div
                    className={style.imgBox}
                >
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/jpeg, image/png, video/mp4"
                        multiple
                        onChange={handleFileChange}
                        disabled={files.length >= 4}
                    />
                    <UploadCloud />
                    <span>{t("Choose a file or drag & drop it here.")}</span>
                    <p>
                        {t("You can upload up to 4 images & 1 video With")} <br />
                        {t("Format support JPEG, PNG, MP4, Max 50MB")}
                    </p>
                </div>
            ) : (
                <div className={style.imgBox2}>

                    <div
                        className={style.uploadBox}
                        // onClick={() => document.getElementById("fileInput").click()}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/jpeg, image/png, video/mp4"
                            multiple
                            onChange={handleFileChange}
                        />
                        <Plus />
                    </div>
                    <div className={style.uploadedBox2}>
                        {files.map((file, index) => (
                            <div key={index}>
                                {file.type.startsWith("image/") ? (
                                    <img src={URL.createObjectURL(file)} alt="" />
                                ) : (
                                    <video src={URL.createObjectURL(file)} controls />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default UploadComponent
