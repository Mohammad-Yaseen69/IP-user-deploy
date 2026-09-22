import { DatePicker } from '@material-ui/pickers';
import { FieldLabel, Hint, SelectField, TextField } from './index';
import CountryDropDown from '../../../../AddBeneficiary/CountryDropDown';
import styles from '../AddBeneficiaryFlowV2.module.css';
import { getFieldDef } from '../vendorFields';

const sanitise = (value, def) => {
    let next = value;
    if (def.alphanumeric) next = next.replace(/[^a-zA-Z0-9]/g, '');
    if (def.uppercase) next = next.toUpperCase();
    return next;
};

const datePickerInputProps = {
    disableUnderline: true,
    style: {
        background: '#fff',
        border: 'none',
        boxShadow: 'none',
        padding: '0 10px',
        minHeight: '40px',
        fontWeight: 500,
    },
};

const datePickerInnerInputProps = {
    style: {
        background: '#fff',
        border: 'none',
        boxShadow: 'none',
        padding: '2px 0px',
        minHeight: '40px',
    },
};

const FieldShell = ({ id, label, error, hint, flex, children }) => (
    <div className={`${styles.field} ${flex ? styles.fieldFlex : ''}`}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        {children}
        <Hint error={!!error}>{error || hint}</Hint>
    </div>
);

const DynamicField = ({ name, defs, value, onChange, error, flex = true, disabled = false }) => {
    const def = getFieldDef(name, defs);

    const id = `abf-${name}`;
    const required = def.required !== false;
    const label = required ? `${def.label} *` : def.label;

    if (def.type === 'date') {
        return (
            <FieldShell id={id} label={label} error={error} hint={def.hint} flex={flex}>
                <div className={`${styles.inputShell} ${error ? styles.inputShellError : ''}`}>
                    <DatePicker
                        id={id}
                        format="DD/MM/YYYY"
                        value={value || null}
                        onChange={(next) => onChange(next ? next.format('YYYY-MM-DD') : '')}
                        placeholder="DD/MM/YYYY"
                        disabled={disabled}
                        InputProps={datePickerInputProps}
                        inputProps={datePickerInnerInputProps}
                        style={{ flex: 1, width: '100%' }}
                        disableFuture={!!def.disableFuture}
                        openTo={def.disableFuture ? 'year' : 'date'}
                        views={['year', 'month', 'date']}
                        clearable
                        autoOk
                    />
                </div>
            </FieldShell>
        );
    }

    if (def.type === 'country') {
        return (
            <FieldShell id={id} label={label} error={error} hint={def.hint} flex={flex}>
                <CountryDropDown
                    country={value || ''}
                    disabled={disabled}
                    onSelect={(selected) => onChange(selected?.alpha3 || '')}
                />
            </FieldShell>
        );
    }

    if (def.type === 'select') {
        return (
            <SelectField
                flex={flex}
                id={id}
                label={label}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                options={def.options || []}
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
            error={error}
            hint={def.hint}
        />
    );
};

export default DynamicField;
