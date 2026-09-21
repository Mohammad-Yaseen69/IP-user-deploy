import { useContext, useMemo } from 'react';
import { AlertTriangle, Copy, Tag } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styles from '../style/DepositDetails.module.css';
import IbanBreadcrumb from '../../components/IbanBreadcrumb';
import { UserContext } from '../../../../Context/UserContext';
import { INTL_DEPOSIT_ACCOUNTS, getPaymentReference } from '../../utils/virtualIban';

const CARD_META = {
    eur: {
        symbol: '€',
        title: 'EUR - Euro',
        subtitle: 'Receive EUR payments from outside SEPA',
        iconStyle: undefined,
    },
    usd: {
        symbol: '$',
        title: 'USD - US Dollar',
        subtitle: 'Receive USD payments from outside SEPA',
        iconStyle: { background: '#FEF3C7', color: '#D97706' },
    },
};

const CURRENCIES = ['eur', 'usd'];

const DepositDetails = () => {
    const { t } = useTranslation();
    const { userDetails } = useContext(UserContext);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert(`${t('Copied')}: ${text}`);
    };

    const cards = useMemo(() => CURRENCIES.map((currency) => {
        const account = INTL_DEPOSIT_ACCOUNTS[currency];
        const reference = getPaymentReference(null, userDetails, currency);

        const rows = [
            { label: 'Account holder name', value: account.beneficiaryName },
            { label: 'Account holder address', value: account.beneficiaryAddress },
            { label: 'Account number / IBAN', value: account.accountNumber },
            { label: 'BIC / SWIFT', value: account.bankCode },
            { label: 'Bank name', value: account.bankName },
            { label: 'Bank address', value: account.bankAddress },
        ];

        const allDetails = [
            ...rows.map((row) => `${t(row.label)}: ${row.value}`),
            `${t('Remittance information')}: ${reference}`,
        ].join('\n');

        return { currency, account, reference, rows, allDetails, meta: CARD_META[currency] };
    }), [userDetails, t]);

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
                {cards.map(({ currency, reference, rows, allDetails, meta }) => (
                    <div className={styles.bankCard} key={currency}>
                        <div className={styles.cardHeaderRow}>
                            <div className={styles.currencyIcon} style={meta.iconStyle}>{meta.symbol}</div>
                            <div className={styles.currencyMeta}>
                                <h4>{t(meta.title)}</h4>
                                <p>{t(meta.subtitle)}</p>
                            </div>
                        </div>

                        <div className={styles.infoBlock}>
                            {rows.map((row) => (
                                <div className={styles.dataRow} key={row.label}>
                                    <div className={styles.labelStack}>
                                        <h5>{t(row.label)}</h5>
                                        <p>{row.value}</p>
                                    </div>
                                    <button className={styles.copyBtn} onClick={() => handleCopy(row.value)}>
                                        <Copy size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.remittanceBox}>
                            <div className={styles.remittanceHeader}>
                                <Tag size={14} /> {t('Remittance information to include')}
                            </div>
                            <div className={styles.remittanceValueRow}>
                                <span className={styles.remittanceCode}>{reference}</span>
                                <button className={styles.copyBtn} onClick={() => handleCopy(reference)}>
                                    <Copy size={16} />
                                </button>
                            </div>
                            <p className={styles.remittanceExample}>
                                {t('Example')}: {reference} - ABC Trading Ltd
                            </p>
                        </div>

                        <div
                            className={styles.copyAllDetails}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleCopy(allDetails)}
                            onKeyDown={(event) => event.key === 'Enter' && handleCopy(allDetails)}
                        >
                            <Copy size={20} /> {t('Copy all details')}
                        </div>
                    </div>
                ))}
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
