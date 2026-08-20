import { AlertTriangle, ChevronLeft, ChevronRight, Copy, Tag } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from '../style/DepositDetails.module.css';
import IbanBreadcrumb from '../../components/IbanBreadcrumb';

const DepositDetails = () => {
    const { t } = useTranslation();
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`${t('Copied')}: ${text}`);
    };

    return (
        <div className={styles.container}>
            <IbanBreadcrumb items={[
                { label: "My virtual bank", path: "/virtual-IBAN" },
                { label: "Deposit" }
            ]} />

            <span className={styles.tagHeader}>{t('Receiving money from outside SEPA')}</span>
            <h1 className={styles.mainHeading}>{t('Share the right bank details for your incoming payment')}</h1>
            <p className={styles.subHeading}>
                {t('To receive international payments from outside SEPA, please share the relevant bank account details below with the sender. Make sure the sender includes the required remittance information exactly as shown, together with your company name or individual name, to help us identify and allocate the payment correctly.')}
            </p>

            <div className={styles.alertBox}>
                <div className={styles.alertTitle}>
                    <AlertTriangle size={18} />
                    <span>{t('Always include the correct reference')}</span>
                </div>
                <p className={styles.alertText}>
                    {t('Add the correct reference to the remittance information. Missing or incorrect references may delay the allocation of funds to your InstaPay account.')}
                </p>
            </div>

            <div className={styles.cardsGrid}>

                <div className={styles.bankCard}>
                    <div className={styles.cardHeaderRow}>
                        <div className={styles.currencyIcon}>{t('€')}</div>
                        <div className={styles.currencyMeta}>
                            <h4>{t('EUR - Euro')}</h4>
                            <p>{t('Receive EUR payments from outside SEPA')}</p>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Account holder name')}</h5>
                                <p>{t('System Pay Services (Malta) Limited')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("System Pay Services (Malta) Limited")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Account holder address')}</h5>
                                <p>{t('Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Account number / IBAN')}</h5>
                                <p>{t('ES8201828510940200010371')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("ES8201828510940200010371")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('BIC / SWIFT')}</h5>
                                <p>{t('BBVAESMMXXX')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BBVAESMMXXX")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Bank name')}</h5>
                                <p>{t('BANCO BILBAO VIZCAYA ARGENTARIA S.A.')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BANCO BILBAO VIZCAYA ARGENTARIA S.A.")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Bank address')}</h5>
                                <p>{t('Pz De San Nicolas 4, Bilbao, 48005, Spain')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Pz De San Nicolas 4, Bilbao, 48005, Spain")}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.remittanceBox}>
                        <div className={styles.remittanceHeader}>
                            <Tag size={14} /> {t('Remittance information to include')}
                        </div>
                        <div className={styles.remittanceValueRow}>
                            <span className={styles.remittanceCode}>{t('REF GJL55V3 - [Your Company or Individual Name]')}</span>
                            <button className={styles.copyBtn} onClick={() => handleCopy("REF GJL55V3")}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <p className={styles.remittanceExample}>{t('Example: REF GJL55V3 - ABC Trading Ltd or REF GJL55V3 - John Smith')}</p>
                    </div>
                    <div className={styles.copyAllDetails}>
                        <Copy size={20} /> {t('Copy all details')}
                    </div>
                </div>

                <div className={styles.bankCard}>
                    <div className={styles.cardHeaderRow}>
                        <div className={styles.currencyIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>{t('$')}</div>
                        <div className={styles.currencyMeta}>
                            <h4>{t('USD - US Dollar')}</h4>
                            <p>{t('Receive USD payments from outside SEPA')}</p>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Account holder name')}</h5>
                                <p>{t('System Pay Services (Malta) Limited')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("System Pay Services (Malta) Limited")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Account holder address')}</h5>
                                <p>{t('Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Ruby Workspaces Office 3 Pendergardens Triq Gort, San Ġiljan, STJ 9023, Malta")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Account number / IBAN')}</h5>
                                <p>{t('ES8201828510940200010371')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("ES8201828510940200010371")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('BIC / SWIFT')}</h5>
                                <p>{t('BBVAESMMXXX')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BBVAESMMXXX")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Bank name')}</h5>
                                <p>{t('BANCO BILBAO VIZCAYA ARGENTARIA S.A.')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("BANCO BILBAO VIZCAYA ARGENTARIA S.A.")}>
                                <Copy size={16} />
                            </button>
                        </div>

                        <div className={styles.dataRow}>
                            <div className={styles.labelStack}>
                                <h5>{t('Bank address')}</h5>
                                <p>{t('Pz De San Nicolas 4, Bilbao, 48005, Spain')}</p>
                            </div>
                            <button className={styles.copyBtn} onClick={() => handleCopy("Pz De San Nicolas 4, Bilbao, 48005, Spain")}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.remittanceBox}>
                        <div className={styles.remittanceHeader}>
                            <Tag size={14} /> {t('Remittance information to include')}
                        </div>
                        <div className={styles.remittanceValueRow}>
                            <span className={styles.remittanceCode}>{t('REF PY9F4G3 - [Your Company or Individual Name]')}</span>
                            <button className={styles.copyBtn} onClick={() => handleCopy("REF PY9F4G3")}>
                                <Copy size={16} />
                            </button>
                        </div>
                        <p className={styles.remittanceExample}>{t('Example: REF PY9F4G3 - ABC Trading Ltd or REF PY9F4G3 - John Smith')}</p>
                    </div>
                    <div className={styles.copyAllDetails}>
                        <Copy size={20} /> {t('Copy all details')}
                    </div>
                </div>

            </div>
            <div className={styles.needHelpBanner}>
                <h4>{t('Need help?')}</h4>
                <p>
                    {t('Contact InstaPay Support before sharing bank details if you are unsure which currency or payment route applies to your incoming transfer.')} <span className={styles.needHelpLink}>{t('Contact Support')}</span>
                </p>
            </div>

            <p className={styles.bottomDisclaimer}>
                {t('These details apply only to payments received from outside SEPA. Use the account that matches the currency of the incoming transfer.')}
            </p>
        </div>
    );
};

export default DepositDetails;