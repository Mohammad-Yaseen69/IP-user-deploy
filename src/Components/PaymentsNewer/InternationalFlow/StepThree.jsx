import { useTranslation } from "react-i18next";
import styles from "./styles/stepthree.module.css";
import { reasons } from "../AmountAndCurrency";
import file from "../files/file.svg";
import { useState } from "react";

const StepThree = ({ data, dataHandler }) => {
    const { t } = useTranslation();
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        let totalSize = 0;
        let imageCount = 0;
        let videoCount = 0;

        for (let i = 0; i < files.length; i++) {
            totalSize += files[i].size;
            if (files[i].type.startsWith("image/")) {
                imageCount += 1;
            } else if (files[i].type.startsWith("video/")) {
                videoCount += 1;
            }
        }

        if (imageCount > 4 || videoCount > 1 || files.length > 5 || totalSize > 20 * 1024 * 1024) {
            setError(t("You can upload a maximum of 4 images, 1 video, and the total size should not exceed 20 MB."));
        } else {
            setError("");
            dataHandler("files", files);
        }
    };

    return (
        <div className={styles.container}>
            <select value={data.reason} onChange={e => dataHandler("reason", e.target.value)}>
                <option value="" disabled>{t("Select Remark Reason")}</option>
                {
                    Object.keys(reasons).map(item => (
                        <option value={item} key={item}>{reasons[item]}</option>
                    ))
                }
            </select>
            <div className={styles.comment_files}>
                <input type="text" placeholder={t("Comments")} value={data.comment} onChange={e => dataHandler("comment", e.target.value)} />
                <label htmlFor="files" className={styles.files}>
                    <span style={{ whiteSpace: "nowrap" }}>{t("Attach Files")}</span>
                    <img src={file} alt="" />
                    <input type="file" id="files" hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
                </label>
            </div>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.files_prev}>
                {
                    data.files.length > 0
                        ?
                        data.files.map(item => (
                            <span><strong>{t("File Name")}</strong>: {item?.name}</span>
                        ))
                        :
                        ""
                }
            </div>
        </div>
    );
};

export default StepThree;