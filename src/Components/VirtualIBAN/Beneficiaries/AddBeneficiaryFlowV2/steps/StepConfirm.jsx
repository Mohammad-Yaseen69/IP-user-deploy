import { useContext } from 'react';
import { SummaryCard, SummaryRow } from '../components';
import { METHOD_CONTEXT_LABEL } from '../constants';
import { getFieldDef } from '../vendorFields';
import { UserContext } from '../../../../../Context/UserContext';

const StepConfirm = ({ form, requirements, onEditStep }) => {
    const { allowedCountries } = useContext(UserContext);

    const countryLabel =
        (allowedCountries || []).find((c) => c.country_iso_code === form.country)?.country_name ||
        form.country;

    const labelFor = (name) => getFieldDef(name, requirements?.defs).label || name;

    const displayValue = (name, value) => {
        if (!value) return '-';
        const def = getFieldDef(name, requirements?.defs);
        if (def.type === 'country') {
            return (
                (allowedCountries || []).find((c) => c.country_iso_code === value)?.country_name ||
                value
            );
        }
        if (def.options) {
            return def.options.find((option) => option.value === value)?.label || value;
        }
        if (def.type === 'date') {
            const [year, month, day] = String(value).split('-');
            return day && month && year ? `${day}/${month}/${year}` : value;
        }
        return value;
    };

    const beneficiaryRows = (requirements?.beneficiaryFields || []).filter(
        (name) => form.beneficiary[name],
    );
    const channelRows = (requirements?.channelFields || []).filter((name) => form.channel[name]);

    return (
        <>
            <SummaryCard heading="Recipient" action="Edit" onAction={() => onEditStep(1)}>
                <SummaryRow
                    label="Type"
                    value={form.recipient_type === 'business' ? 'Business' : 'Individual'}
                />
                <SummaryRow label="Country" value={countryLabel} />
                {beneficiaryRows.map((name) => (
                    <SummaryRow
                        key={name}
                        label={labelFor(name)}
                        value={displayValue(name, form.beneficiary[name])}
                    />
                ))}
            </SummaryCard>

            <SummaryCard heading="Payout channel" action="Edit" onAction={() => onEditStep(2)}>
                <SummaryRow label="Method" value={METHOD_CONTEXT_LABEL[form.method] || ''} />
                {channelRows.map((name) => (
                    <SummaryRow
                        key={name}
                        label={labelFor(name)}
                        value={displayValue(name, form.channel[name])}
                    />
                ))}
            </SummaryCard>
        </>
    );
};

export default StepConfirm;
