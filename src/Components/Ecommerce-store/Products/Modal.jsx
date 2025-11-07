import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'react-feather';
import { Modal } from 'reactstrap';
import style from './styles/Modal.module.scss';

function ModalComponent({
    open,
    onClose,
    icon,
    title,
    description,
    primaryLabel,
    secondaryLabel,
    onPrimary,
    onSecondary,
    children,
    ...rest
}) {
    const { t } = useTranslation();

    if (!open) {
        return null;
    }

    const handleSecondary = onSecondary || onClose;
    const handlePrimary = onPrimary || onClose;
    const secondaryText = secondaryLabel || t('Done');
    const primaryText = primaryLabel || t('View Product');

    return (
        <Modal
            isOpen={open}
            toggle={onClose}
            centered
            modalClassName={style.ModalWrapper}
            contentClassName={style.ModalContent}
            backdropClassName={style.Backdrop}
            {...rest}
        >
            <button className={style.CloseButton} onClick={onClose} aria-label={t('Close')}>
                <X size={18} />
            </button>

            {icon && (
                <div className={style.IconWrapper}>
                    <div className={style.IconCircle}>{icon}</div>
                </div>
            )}

            {title && <h4 className={style.Title}>{title}</h4>}
            {description && <p className={style.Description}>{description}</p>}

            {children}

            <div className={style.Actions}>
                <button className={style.SecondaryButton} onClick={handleSecondary} type="button">
                    {secondaryText}
                </button>
                <button className={style.PrimaryButton} onClick={handlePrimary} type="button">
                    {primaryText}
                </button>
            </div>
        </Modal>
    );
}

export default ModalComponent;