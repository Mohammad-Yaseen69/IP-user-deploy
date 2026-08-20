import React from 'react';
import { ArrowLeft, Copy, AlertTriangle, Info, Tag, ChevronLeft, ChevronRight } from 'react-feather';
import styles from '../style/DepositDetails.module.css';
import IbanBreadcrumb from '../../components/IbanBreadcrumb';

const DepositDetails = () => {

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Copied: ${text}`);
    };

    return (
        <div className={styles.container}>
            <IbanBreadcrumb items={[
                { label: "My virtual bank", path: "/virtual-IBAN" },
                { label: "Deposit" }
            ]} />

            <span className={styles.tagHeader}>Receiving money from outside SEPA</span>
            <h1 className={styles.mainHeading}>Share the right bank details for your incoming payment</h1>
            <p className={styles.subHeading}>
                To receive international payments from outside SEPA, please share the relevant bank account details below with the sender. Make sure the sender includes the required remittance information exactly as shown, together with your company name or individual name, to help us identify and allocate the payment correctly.
            </p>

            <div className={styles.alertBox}>
                <div className={styles.alertTitle}>
                    <AlertTriangle size={18} />
                    <span>Always include the correct reference</span>
                </div>
                <p className={styles.alertText}>
                    Add the correct reference to the remittance information. Missing or incorrect references may delay the allocation of funds to your InstaPay account.
                </p>
            </div>

            <div className={styles.cardsGrid}>

                <div className={styles.bankCard}>
                    <div className={styles.cardHeaderRow}>
                        <div className={styles.currencyIcon}>€</div>
                        <div className={styles.currencyMeta}>
                            <h4>EUR - Euro</h4>
                            <p>Receive EUR payments from outside SEPA</p>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Account holder name</h5>
                                <p>System Pay Services (Malta) Limited</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("System Pay Services (Malta) Limited")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Account holder address</h5>
                                <p>Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Account number / IBAN</h5>
                                <p>ES8201828510940200010371</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("ES8201828510940200010371")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>BIC / SWIFT</h5>
                                <p>BBVAESMMXXX</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BBVAESMMXXX")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Bank name</h5>
                                <p>BANCO BILBAO VIZCAYA ARGENTARIA S.A.</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BANCO BILBAO VIZCAYA ARGENTARIA S.A.")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Bank address</h5>
                                <p>Pz De San Nicolas 4, Bilbao, 48005, Spain</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Pz De San Nicolas 4, Bilbao, 48005, Spain")}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.remittanceBox}>
                        <div className={styles.remittanceHeader}>
                            <Tag size={14} /> Remittance information to include
                        </div>
                        <div className={styles.remittanceValueRow}>
                            <span className={styles.remittanceCode}>REF GJL55V3 - [Your Company or Individual Name]</span>
                            <button className={styles.copyBtn} onClick={() => handleCopy("REF GJL55V3")}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <p className={styles.remittanceExample}>Example: REF GJL55V3 - ABC Trading Ltd or REF GJL55V3 - John Smith</p>
                    </div>
                    <div className={styles.copyAllDetails}>
                        <Copy size={20} /> Copy all details
                    </div>
                </div>

                <div className={styles.bankCard}>
                    <div className={styles.cardHeaderRow}>
                        <div className={styles.currencyIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>$</div>
                        <div className={styles.currencyMeta}>
                            <h4>USD - US Dollar</h4>
                            <p>Receive USD payments from outside SEPA</p>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Account holder name</h5>
                                <p>System Pay Services (Malta) Limited</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("System Pay Services (Malta) Limited")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Account holder address</h5>
                                <p>Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Account number / IBAN</h5>
                                <p>ES8201828510940200010371</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("ES8201828510940200010371")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>BIC / SWIFT</h5>
                                <p>BBVAESMMXXX</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BBVAESMMXXX")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Bank name</h5>
                                <p>BANCO BILBAO VIZCAYA ARGENTARIA S.A.</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BANCO BILBAO VIZCAYA ARGENTARIA S.A.")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>Bank address</h5>
                                <p>Pz De San Nicolas 4, Bilbao, 48005, Spain</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Pz De San Nicolas 4, Bilbao, 48005, Spain")}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.remittanceBox}>
                        <div className={styles.remittanceHeader}>
                            <Tag size={14} /> Remittance information to include
                        </div>
                        <div className={styles.remittanceValueRow}>
                            <span className={styles.remittanceCode}>REF PY9F4G3 - [Your Company or Individual Name]</span>
                            <button className={styles.copyBtn} onClick={() => handleCopy("REF PY9F4G3")}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <p className={styles.remittanceExample}>Example: REF PY9F4G3 - ABC Trading Ltd or REF PY9F4G3 - John Smith</p>
                    </div>
                    <div className={styles.copyAllDetails}>
                        <Copy size={20} /> Copy all details
                    </div>
                </div>

            </div>
            <div className={styles.needHelpBanner}>
                <h4>Need help?</h4>
                <p>
                    Contact InstaPay Support before sharing bank details if you are unsure which currency or payment route applies to your incoming transfer. <span className={styles.needHelpLink}>Contact Support</span>
                </p>
            </div>

            <p className={styles.bottomDisclaimer}>
                These details apply only to payments received from outside SEPA. Use the account that matches the currency of the incoming transfer.
            </p>
        </div>
    );
};

export default DepositDetails;