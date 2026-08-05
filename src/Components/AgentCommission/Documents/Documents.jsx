import { useTranslation } from 'react-i18next';
import useWindowWidth from '../../../utils/useWindowWidth';
import TopRight from '../../topRight';
import styles from '../styles/documents.module.css';

const Documents = () => {
    const { t } = useTranslation();
    const width = useWindowWidth();

    const missingDocsList = [
        {
            id: 1,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15.75 21H5.25C5.05109 21 4.86032 20.921 4.71967 20.7803C4.57902 20.6397 4.5 20.4489 4.5 20.25V6.75C4.5 6.55109 4.57902 6.36032 4.71967 6.21967C4.86032 6.07902 5.05109 6 5.25 6H12.75L16.5 9.75V20.25C16.5 20.4489 16.421 20.6397 16.2803 20.7803C16.1397 20.921 15.9489 21 15.75 21Z" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7.5 6V3.75C7.5 3.55109 7.57902 3.36032 7.71967 3.21967C7.86032 3.07902 8.05109 3 8.25 3H15.75L19.5 6.75V17.25C19.5 17.4489 19.421 17.6397 19.2803 17.7803C19.1397 17.921 18.9489 18 18.75 18H16.5" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8.25 14.25H12.75" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8.25 17.25H12.75" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>,
            doc: "Reseller Agreement · Contract",

        },
        {
            id: 2,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14.25 21L9.75 14.25L7.15875 18.1369L5.625 15.75L2.25 21H14.25Z" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14.25 3V8.25H19.5" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M18 21H18.75C18.9489 21 19.1397 20.921 19.2803 20.7803C19.421 20.6397 19.5 20.4489 19.5 20.25V8.25L14.25 3H5.25C5.05109 3 4.86032 3.07902 4.71967 3.21967C4.57902 3.36032 4.5 3.55109 4.5 3.75V12" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>,
            doc: "Certificate of Incorporation · KYB"
        },
        {
            id: 3,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16.5 12C16.5035 14.9325 15.9321 17.8373 14.8181 20.55" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15.3544 8.99982C14.7468 8.32043 13.9473 7.84154 13.0616 7.62652C12.1759 7.41151 11.2458 7.47051 10.3943 7.79572C9.54292 8.12093 8.81031 8.69701 8.29347 9.44772C7.77663 10.1984 7.49994 11.0884 7.5 11.9998C7.50269 14.2869 6.92188 16.5369 5.8125 18.537" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 3.51201C10.3577 3.03356 11.8103 2.88752 13.2361 3.08614C14.6619 3.28476 16.0193 3.82225 17.1945 4.65356C18.3698 5.48487 19.3287 6.58578 19.9908 7.86402C20.6529 9.14226 20.999 10.5606 21 12.0001C21.0011 14.0188 20.7766 16.0313 20.3306 18.0001" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2.18439 15.7498C2.72366 14.5733 3.00191 13.294 3.00001 11.9998C2.99877 10.7334 3.26542 9.48104 3.78245 8.32498C4.29949 7.16892 5.05522 6.1353 6.00001 5.29199" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10.3669 19.5C10.1794 19.9144 9.97436 20.3206 9.75186 20.7188" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 12C12.0022 13.5177 11.8132 15.0296 11.4375 16.5" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>,
            doc: "Director eKYC · KYB",
        },
        {
            id: 4,
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18.75 21H5.25C5.05109 21 4.86032 20.921 4.71967 20.7803C4.57902 20.6397 4.5 20.4489 4.5 20.25V3.75C4.5 3.55109 4.57902 3.36032 4.71967 3.21967C4.86032 3.07902 5.05109 3 5.25 3H14.25L19.5 8.25V20.25C19.5 20.4489 19.421 20.6397 19.2803 20.7803C19.1397 20.921 18.9489 21 18.75 21Z" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14.25 3V8.25H19.5" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 12.75H15" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 15.75H15" stroke="#5926F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>,
            doc: "Payout IBAN confirmation · Banking",

        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <div className={styles.headerTitle}>
                    <h1>{t("Documents")}</h1>
                    <p>{t("Review missing client documents and send reminders.")}</p>
                </div>
                <div className={styles.topright}>
                    {width > 1000 && <TopRight />}
                </div>
            </div>

            <div className={styles.main}>


                <div className={styles.tableContainer}>


                    {missingDocsList.map((item) => (
                        <div key={item.id} className={styles.tableDataRow}>
                            <div className={styles.docName}>

                                <div className={styles.docIcon}>{item.icon}</div>
                                <p>{item.doc}</p>

                            </div>
                            <div className={styles.docStatus}>
                                <button className={styles.reminderBtn1}>
                                    {t("Signed")}
                                </button>
                                <button className={styles.reminderBtn}>
                                    {t("View")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Documents;
