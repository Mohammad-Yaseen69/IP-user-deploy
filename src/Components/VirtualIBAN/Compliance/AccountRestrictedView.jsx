import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './compliance.module.css';

const AccountRestrictedView = ({ restrictedData, onResolve }) => {
    const { t } = useTranslation();

    if (!restrictedData) return null;

    return (
        <div className={styles.restrictedContainer}>
            <div className={styles.warningIconBox}>
                <span className={styles.alertIcon}>⚠️</span>
            </div>
            <h2 className={styles.restrictedTitle}>
                {restrictedData.title || t('compliance.restrictedDefaultTitle', 'Your account is temporarily restricted')}
            </h2>
            <p className={styles.restrictedSubtitle}>
                {restrictedData.subtitle || t('compliance.restrictedDefaultSubtitle', 'A compliance deadline passed without a response. Resolve the items below to restore full access.')}
            </p>
            <div className={styles.restrictedCardBox}>
                {(restrictedData.items || []).map((item, index) => (
                    <div key={item._id || item.id || index} className={styles.restrictedItemRow}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.badgeOverdue}>
                            {item.status || t('compliance.overdueBadge', 'Overdue')}
                        </span>
                    </div>
                ))}
            </div>
            <button
                type="button"
                className={styles.resolveBtn}
                onClick={onResolve}
            >
                {t('compliance.resolveNowBtn', 'Resolve now')}
            </button>
        </div>
    );
};

export default AccountRestrictedView;