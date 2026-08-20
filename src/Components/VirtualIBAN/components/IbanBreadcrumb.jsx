import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import styles from './IbanBreadcrumb.module.css';

const IbanBreadcrumb = ({ items = [] }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!items || items.length === 0) return null;

    return (
        <nav aria-label="breadcrumb" className={styles.navigationRow}>
            <ol className={styles.breadcrumbList}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const label = typeof item === 'string' ? item : item.label;
                    const translatedLabel = t(label);

                    const handleClick = () => {
                        if (isLast) return;
                        if (typeof item.onClick === 'function') {
                            item.onClick();
                        } else if (item.path) {
                            navigate(item.path);
                        } else if (item.to) {
                            navigate(item.to);
                        }
                    };

                    const isClickable = !isLast && (typeof item.onClick === 'function' || item.path || item.to);

                    return (
                        <li key={index} className={styles.breadcrumbItem}>
                            {isClickable ? (
                                <button
                                    type="button"
                                    className={styles.breadcrumbLink}
                                    onClick={handleClick}
                                >
                                    {translatedLabel}
                                </button>
                            ) : (
                                <span className={isLast ? styles.breadcrumbActive : styles.breadcrumbStatic}>
                                    {translatedLabel}
                                </span>
                            )}
                            {!isLast && (
                                <span className={styles.breadcrumbSeparator} aria-hidden="true">
                                    &gt;
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default IbanBreadcrumb;
