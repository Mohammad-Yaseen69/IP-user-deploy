import { Toggle as CardToggle } from "../../MyMasterCard/CardPurchased"


export const Field = ({ label, required, children, toggle }) => (
    <div style={{ display: 'flex', flexDirection: toggle ? "row" : 'column', gap: 3, marginBottom: 7, justifyContent: toggle && "space-between", padding: toggle && "12px", borderRadius: toggle && "8px", background: toggle && "#F9F9F9", alignItems: toggle && 'center' }}>
        <label style={{ fontWeight: 600, fontSize: 13 }}>
            {label} {required && <span style={{ color: '#e11d48' }}>*</span>}
        </label>
        {children}
    </div>
)

export const TextInput = ({ value, onChange, placeholder, onBlur, ...props }) => (
    <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            outline: 'none'
        }}
        onBlur={onBlur}
        {...props}
    />
)

export const TextArea = ({ value, onChange, placeholder, rows = 4 }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            outline: 'none',
            resize: 'vertical'
        }}
    />
)

export const Select = ({ value, onChange, options, placeholder = 'Select' }) => (
    <select
        value={value}
        onChange={onChange}
        style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            outline: 'none'
        }}
    >
        <option value="">{placeholder}</option>
        {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
)

export const Toggle = ({ checked, onChange }) => (
    <CardToggle checked={checked} onChange={onChange} />
)


export const ButtonForRequests = ({ isLoading, onClick, children }) => {

    return (
        <button
            type="button"
            disabled={isLoading}
            onClick={onClick}
            style={{
                border: 'none',
                outline: 'none',
                padding: '10px 16px',
                borderRadius: 8,
                fontWeight: 700,
                background: isLoading ? '#d1d5db' : '#5926F0',
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
        >
            {children}
        </button>
    )
}