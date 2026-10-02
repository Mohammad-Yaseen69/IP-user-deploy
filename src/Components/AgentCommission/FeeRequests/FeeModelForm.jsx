import { useTranslation } from 'react-i18next';
import { Button, FormGroup, Input, Label, Table } from 'reactstrap';
import { NO_PERCENT_FEE_IDS } from './feeSchedule';

const blockNegativeInput = (e) => {
    if (['-', 'e', 'E'].includes(e.key)) e.preventDefault();
};

const FeeModelForm = ({
    heading,
    title,
    onTitleChange,
    feeSchedule,
    onFeeChange,
    onSubmit,
    onCancel,
    submitting,
    submitLabel,
    submittingLabel,
}) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={onSubmit}>
            {heading && (
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px 0', color: '#111827' }}>
                    {heading}
                </h3>
            )}
            <FormGroup>
                <Label style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                    {t("Fee Model Title / Name")} <span style={{ color: 'red' }}>*</span>
                </Label>
                <Input
                    type="text"
                    placeholder={t("e.g. VIP Corporate Pricing Plan")}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                    style={{ maxWidth: '500px' }}
                />
                <small style={{ color: '#6B7280' }}>
                    {t("Give this fee model a descriptive title for your reference.")}
                </small>
            </FormGroup>

            <div style={{ marginTop: '24px', marginBottom: '16px', fontWeight: 700, fontSize: '16px', color: '#111827' }}>
                {t("Fee Schedule Configuration")}
            </div>

            <Table responsive bordered hover>
                <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                        <th>{t("Fee Line Item")}</th>
                        <th>{t("Flat Amount (€ EUR)")}</th>
                        <th>{t("Percentage (%)")}</th>
                    </tr>
                </thead>
                <tbody>
                    {feeSchedule.map((item, idx) => {
                        const isNoPercent = NO_PERCENT_FEE_IDS.includes(item.id);
                        return (
                            <tr key={item.id}>
                                <td style={{ verticalAlign: 'middle', fontWeight: 600, fontSize: '13px', color: '#374151' }}>{item.name}</td>
                                <td>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0"
                                        onKeyDown={blockNegativeInput}
                                        value={item.flatEuro}
                                        onChange={(e) => onFeeChange(idx, 'flatEuro', e.target.value)}
                                        style={{ width: '130px' }}
                                    />
                                </td>
                                <td style={{ verticalAlign: 'middle' }}>
                                    {!isNoPercent && (
                                        <Input
                                            type="number"
                                            step="any"
                                            min="0"
                                            onKeyDown={blockNegativeInput}
                                            value={item.percentAmount}
                                            onChange={(e) => onFeeChange(idx, 'percentAmount', e.target.value)}
                                            style={{ width: '130px' }}
                                        />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <Button type="button" outline onClick={onCancel}>
                    {t("Cancel")}
                </Button>
                <Button type="submit" disabled={submitting} style={{ background: '#5926F0', border: 'none', padding: '10px 24px' }}>
                    {submitting ? submittingLabel : submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default FeeModelForm;
