import { Dialog } from '@mui/material';
import { useState } from 'react';
import { ArrowRight, Check, Plus, X } from 'react-feather';
import styles from "../style/PriceActivation.module.css";

const NewActivationPackModal = ({ open, handleClose }) => {
    const [step, setStep] = useState(1);
    const [setBy, setSetBy] = useState('agent');

    const [services, setServices] = useState([
        { id: 'iban', label: 'Activation fee (one-time)', active: true },
        { id: 'monthly', label: 'Monthly IBAN fee', active: false },
        { id: 'sepa_in', label: 'SEPA inward', active: false },
        { id: 'sepa_out', label: 'SEPA outward', active: false },
        { id: 'swift_in', label: 'SWIFT inward', active: false },
        { id: 'swift_out', label: 'SWIFT outward', active: false },
        { id: 'crypto', label: 'Crypto on/off-ramp', active: false },
    ]);
    const [fees, setFees] = useState([
        { id: 1, name: 'Activation fee (one-time)', flat: '0', percent: '0' },
        { id: 2, name: 'Monthly IBAN fee', flat: '0', percent: '0' },
        { id: 3, name: 'SEPA inward', flat: '0', percent: '0' },
        { id: 4, name: 'SEPA outward', flat: '0', percent: '0' },
        { id: 5, name: 'SWIFT inward', flat: '0', percent: '0' },
        { id: 6, name: 'SWIFT outward', flat: '0', percent: '0' },
        { id: 7, name: 'Crypto on/off-ramp', flat: '0', percent: '0' },
    ]);

    const handleInputChange = (id, field, value) => {
        setFees(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };
    const [step1Fees, setStep1Fees] = useState([
        { id: 1, name: 'Activation fee (one-time)', flat: '0', percent: '0' },
        { id: 2, name: 'Monthly IBAN fee', flat: '0', percent: '0' },
        { id: 3, name: 'SEPA inward', flat: '0', percent: '0' },
    ]);

    const toggleService = (id) => {
        setServices(prev => prev.map(srv => srv.id === id ? { ...srv, active: !srv.active } : srv));
    };
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{ style: { borderRadius: '14px', maxWidth: '620px', width: '100%', scrollbarWidth: "none", } }}
        >
            <div className={styles.modalContainer}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.iconWrapper}>
                            <Plus size={20} />
                        </div>
                        <h2 className={styles.title}>New activation pack</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {step === 1 && (
                    <div className={styles.content}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Pack Name</label>
                            <input type="text" className={styles.input} placeholder="e.g. Growth - Pack Two" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Set By</label>
                            <div className={styles.toggleGroup}>
                                <button
                                    className={`${styles.toggleBtn} ${setBy === 'institution' ? styles.toggleBtnActive : ''}`}
                                    onClick={() => setSetBy('institution')}
                                >
                                    Konstanz Kingdom / InstaPay
                                </button>
                                <button
                                    className={`${styles.toggleBtn} ${setBy === 'agent' ? styles.toggleBtnActive : ''}`}
                                    onClick={() => setSetBy('agent')}
                                >
                                    Agent
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Link to Agent (Optional)</label>
                            <input type="text" className={styles.input} placeholder="- None / Null -" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Agent Revenue Model</label>
                            <div className={styles.toggleGroup}>
                                <button className={`${styles.toggleBtn} ${styles.toggleBtnActive}`}>
                                    1. Markup on our services
                                </button>
                                <button className={styles.toggleBtn}>
                                    2. Commission on our fees
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label}>Markup Type</label>
                                <input type="text" className={styles.input} defaultValue="percentage" />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label}>Markup Value</label>
                                <input type="text" className={styles.input} defaultValue="0" />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <span className={styles.subLabel}>Apply markup on these services</span>
                            <div className={styles.servicesContainer}>
                                {services.map((srv) => (
                                    <button
                                        key={srv.id}
                                        className={`${styles.serviceTag} ${srv.active ? styles.serviceTagActive : ''}`}
                                        onClick={() => toggleService(srv.id)}
                                    >
                                        {srv.active && <Check size={14} />}
                                        {srv.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.step1FeeSection}>
                            <h4 className={styles.feeHeader}>Fee schedule</h4>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>FEE ITEM</th>
                                        <th className={styles.textRight}>FLAT (€)</th>
                                        <th className={styles.textRight}>% OF AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {step1Fees.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.name}</td>
                                            <td className={styles.textRight}>
                                                <input type="text" className={styles.tableInput} defaultValue={row.flat} />
                                            </td>
                                            <td className={styles.textRight}>
                                                <input type="text" className={styles.tableInput} defaultValue={row.percent} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.content}>
                        <h3 className={styles.sectionTitle}>Fee schedule</h3>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>FEE ITEM</th>
                                    <th className={styles.textRight}>FLAT (€)</th>
                                    <th className={styles.textRight}>% OF AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fees.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.name}</td>
                                        <td className={styles.textRight}>
                                            <input
                                                type="text"
                                                className={styles.tableInput}
                                                value={row.flat}
                                                onChange={(e) => handleInputChange(row.id, 'flat', e.target.value)}
                                            />
                                        </td>
                                        <td className={styles.textRight}>
                                            <input
                                                type="text"
                                                className={styles.tableInput}
                                                value={row.percent}
                                                onChange={(e) => handleInputChange(row.id, 'percent', e.target.value)}
                                            />
                                        </td>
                                    </tr>

                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>

                    {step === 1 ? (
                        <button className={styles.submitBtn} onClick={() => setStep(2)}>
                            Next Step <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button className={styles.submitBtn} onClick={handleClose}>
                            Create pack <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default NewActivationPackModal;