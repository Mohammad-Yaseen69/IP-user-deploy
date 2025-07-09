import React, { useState } from 'react'
import styles from "./BankDeposit.module.scss"
import Dropzone from '../../Portfolio/CustomDropZone'

const BankDeposit = () => {
    const [bankList, setBankList] = useState([
        {
            name: "ABC Bank, Pakistan"
        },
        {
            name: "DEF Bank, Pakistan"
        },
    ])


    const [file, setFile] = useState()



    const selectedBank = {
        "Bank Name": "ABC Bank, Pakistan",
        "Account Name": "InstaPay Services Ltd.",
        "BAN": "AE47 0331 2345 6789 0123 456",
        "SWIFT/BIC Code": "NTBAAEAD",
        "Account Number": "123456789012",
        "Bank Address": "National Trust Tower, Sheikh Zayed Road, Dubai, UAE",
        "Reference (Mandatory)": "AddFunds-987654321"
    }

    return (
        <div className={styles.container}>
            {/* Bank Lists */}
            {/* <div className={styles.bankList}>
                <h4>Select the InstaPay bank account that you want to transfer the funds to:</h4>
                <div className={styles.list}>
                    {bankList?.map((item, idx) => (
                        <div key={idx} className={styles.item}>
                            <span>
                                {item.name}
                            </span>

                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 12L10 8L6 4" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    ))}
                </div>
            </div> */}


            {/* Bank Details */}
            {/* <div className={styles.bankDets}>
                <h4>
                    To fund your wallet, please make a bank transfer of <span> 101 USD</span> to the account below. It is essential that you include your unique reference code: <span>AddFunds-987654321</span>  in the transfer details. This allows us to credit your wallet correctly.
                </h4>

                <div className={styles.bankData}>
                    {Object.keys(selectedBank)?.map((key, idx) => (
                        <div key={idx} className={styles.data}>
                            <p>
                                {key}
                            </p>

                            <div>
                                <span>
                                    {selectedBank[key]}
                                </span>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <g clip-path="url(#clip0_5849_2992)">
                                        <path d="M5.33203 5.33331V3.46665C5.33203 2.71991 5.33203 2.34654 5.47736 2.06133C5.60519 1.81044 5.80916 1.60647 6.06004 1.47864C6.34526 1.33331 6.71863 1.33331 7.46536 1.33331H12.532C13.2788 1.33331 13.6521 1.33331 13.9374 1.47864C14.1882 1.60647 14.3922 1.81044 14.52 2.06133C14.6654 2.34654 14.6654 2.71991 14.6654 3.46665V8.53331C14.6654 9.28005 14.6654 9.65342 14.52 9.93863C14.3922 10.1895 14.1882 10.3935 13.9374 10.5213C13.6521 10.6666 13.2788 10.6666 12.532 10.6666H10.6654M3.46536 14.6666H8.53203C9.27877 14.6666 9.65214 14.6666 9.93735 14.5213C10.1882 14.3935 10.3922 14.1895 10.52 13.9386C10.6654 13.6534 10.6654 13.28 10.6654 12.5333V7.46665C10.6654 6.71991 10.6654 6.34654 10.52 6.06133C10.3922 5.81044 10.1882 5.60647 9.93735 5.47864C9.65214 5.33331 9.27877 5.33331 8.53203 5.33331H3.46536C2.71863 5.33331 2.34526 5.33331 2.06004 5.47864C1.80916 5.60647 1.60519 5.81044 1.47736 6.06133C1.33203 6.34654 1.33203 6.71991 1.33203 7.46665V12.5333C1.33203 13.28 1.33203 13.6534 1.47736 13.9386C1.60519 14.1895 1.80916 14.3935 2.06004 14.5213C2.34526 14.6666 2.71863 14.6666 3.46536 14.6666Z" stroke="#5926F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_5849_2992">
                                            <rect width="16" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>


            </div> */}


            {/* File upload */}

            {/* <div className={styles.fileUpload}>
                <h4>After completing your bank transfer, upload a screenshot or receipt as proof of payment.</h4>

                <Dropzone file={file} setFile={setFile}  />

            </div> */}


            {/* success */}
            <div className={styles.success}>
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                        <path d="M8.0013 15.4167H13.0013M6.0013 1.66666H15.0013C15.468 1.66666 15.7014 1.66666 15.8796 1.75748C16.0364 1.83738 16.1639 1.96486 16.2438 2.12166C16.3346 2.29992 16.3346 2.53328 16.3346 2.99999V4.72875C16.3346 5.1364 16.3346 5.34023 16.2886 5.53204C16.2478 5.7021 16.1804 5.86468 16.089 6.0138C15.986 6.18199 15.8418 6.32612 15.5536 6.61437L13.1108 9.05718C12.7808 9.3872 12.6158 9.5522 12.5539 9.74248C12.4996 9.90985 12.4996 10.0901 12.5539 10.2575C12.6158 10.4478 12.7808 10.6128 13.1108 10.9428L15.5536 13.3856C15.8418 13.6739 15.986 13.818 16.089 13.9862C16.1804 14.1353 16.2478 14.2979 16.2886 14.4679C16.3346 14.6597 16.3346 14.8636 16.3346 15.2712V17C16.3346 17.4667 16.3346 17.7001 16.2438 17.8783C16.1639 18.0351 16.0364 18.1626 15.8796 18.2425C15.7014 18.3333 15.468 18.3333 15.0013 18.3333H6.0013C5.53459 18.3333 5.30124 18.3333 5.12298 18.2425C4.96617 18.1626 4.83869 18.0351 4.7588 17.8783C4.66797 17.7001 4.66797 17.4667 4.66797 17V15.2712C4.66797 14.8636 4.66797 14.6597 4.71402 14.4679C4.75485 14.2979 4.82219 14.1353 4.91357 13.9862C5.01664 13.818 5.16076 13.6739 5.44902 13.3856L7.89183 10.9428C8.22184 10.6128 8.38685 10.4478 8.44867 10.2575C8.50305 10.0901 8.50305 9.90985 8.44867 9.74248C8.38685 9.5522 8.22184 9.38719 7.89183 9.05718L5.44902 6.61437C5.16077 6.32612 5.01664 6.18199 4.91357 6.0138C4.82219 5.86468 4.75485 5.7021 4.71402 5.53204C4.66797 5.34023 4.66797 5.1364 4.66797 4.72875V2.99999C4.66797 2.53328 4.66797 2.29992 4.7588 2.12166C4.83869 1.96486 4.96617 1.83738 5.12298 1.75748C5.30124 1.66666 5.53459 1.66666 6.0013 1.66666Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <h4 style={{ color: "black", textAlign:"center", marginBottom: "0px" }}>We are checking your transfer details. This may take up to 1–3 business days. You’ll receive a confirmation when your wallet is credited.</h4>
            </div>
        </div>
    )
}

export default BankDeposit
