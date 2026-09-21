import { useContext, useMemo } from 'react';
import { SelectField, TextField } from './index';
import { UserContext } from '../../../../../Context/UserContext';
import { getFieldDef } from '../vendorFields';

/*
 * Renders one vendor-declared field from its definition. The vendor decides
 * which fields exist; this decides how each one looks.
 */

const sanitise = (value, def) => {
    let next = value;
    if (def.alphanumeric) next = next.replace(/[^a-zA-Z0-9]/g, '');
    if (def.uppercase) next = next.toUpperCase();
    return next;
};

const DynamicField = ({ name, defs, value, onChange, error, flex = true, disabled = false }) => {
    const { allowedCountries } = useContext(UserContext);
    const def = getFieldDef(name, defs);

    const countryOptions = useMemo(
        () =>
            (allowedCountries || []).map((country) => ({
                value: country.country_iso_code,
                label: country.country_name,
            })),
        [allowedCountries],
    );

    const id = `abf-${name}`;
    const required = def.required !== false;
    const label = required ? `${def.label} *` : def.label;

    if (def.type === 'select' || def.type === 'country') {
        return (
            <SelectField
                flex={flex}
                id={id}
                label={label}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                options={def.type === 'country' ? countryOptions : def.options || []}
                placeholder={def.placeholder || `Select ${def.label.toLowerCase()}`}
                error={error}
            />
        );
    }

    return (
        <TextField
            flex={flex}
            id={id}
            label={label}
            value={value || ''}
            onChange={(next) => onChange(sanitise(next, def))}
            placeholder={def.placeholder}
            disabled={disabled}
            inputMode={def.type === 'tel' ? 'tel' : undefined}
            type={def.type === 'date' ? 'date' : undefined}
            error={error}
            hint={def.hint}
        />
    );
};

export default DynamicField;
