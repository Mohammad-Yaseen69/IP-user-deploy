import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material'
import { decryptData } from '../../Helper/EssentilaMethods/Decryption'
import { toast } from 'react-toastify'
import { Copy } from 'react-feather'

const TEXT_EMPTY = '(empty)'
const ACCESS_CODE = import.meta.env.VITE_PASS_CODE
const ACCESS_STORAGE_KEY = 'data_decrypt_access_granted'

const isObjectLike = (value) => value !== null && typeof value === 'object'

const JsonNode = ({ label, value, level = 0 }) => {
    const [expanded, setExpanded] = useState(level === 0)

    const isArray = Array.isArray(value)
    const isObject = isObjectLike(value) && !isArray

    const toggleable = isArray || isObject
    const indent = 16

    if (!toggleable) {
        return (
            <div style={{ paddingLeft: level * indent, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', lineHeight: 1.5 }}>
                {label !== undefined ? (
                    <>
                        <span style={{ color: '#6b7280' }}>{String(label)}</span>
                        <span>: </span>
                    </>
                ) : null}
                <span style={{ color: typeof value === 'string' ? '#10b981' : '#3b82f6' }}>{JSON.stringify(value)}</span>
            </div>
        )
    }

    const entries = isArray
        ? value.map((v, i) => [i, v])
        : Object.keys(value).sort().map((k) => [k, value[k]])

    return (
        <div style={{ paddingLeft: level * indent, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
                <span style={{ width: 16, display: 'inline-block', color: '#6b7280' }}>{expanded ? '▼' : '▶'}</span>
                {label !== undefined ? (
                    <>
                        <span style={{ color: '#6b7280', marginRight: 4 }}>{String(label)}</span>
                        <span>: </span>
                    </>
                ) : null}
                <span style={{ color: '#ef4444', marginLeft: 4 }}>{isArray ? `[${value.length}]` : '{'}{!isArray ? Object.keys(value).length : ''}{!isArray ? '}' : ''}</span>
                <span style={{ color: '#6b7280', marginLeft: 8 }}>{isArray ? 'Array' : 'Object'}</span>
            </div>
            {expanded && (
                <div>
                    {entries.length === 0 ? (
                        <div style={{ paddingLeft: indent, color: '#6b7280' }}>{TEXT_EMPTY}</div>
                    ) : (
                        entries.map(([k, v]) => (
                            <JsonNode key={k} label={k} value={v} level={level + 1} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

const JsonViewer = ({ data }) => {
    return (
        <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 12,
            background: '#0b1220',
            color: '#e5e7eb',
            overflow: 'auto',
            maxHeight: 480
        }}>
            <JsonNode value={data} />
        </div>
    )
}

// ---- Access gate modal ----
const AccessGateModal = ({ open, onSuccess, onDenied }) => {
    const TEXT_TITLE = 'Restricted Access'
    const TEXT_DESC = 'Enter the access code to continue.'
    const TEXT_PLACEHOLDER = 'Enter access code'
    const TEXT_SUBMIT = 'Unlock'
    const TEXT_ERROR = 'Invalid code. Access denied.'

    const [code, setCode] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = () => {
        if (code.trim() === ACCESS_CODE) {
            setError("")
            onSuccess()
        } else {
            setError(TEXT_ERROR)
            toast.error(TEXT_ERROR)
            onDenied()
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            onClose={() => { }} 
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>{TEXT_TITLE}</DialogTitle>
            <DialogContent>
                <p style={{ marginTop: 0, color: '#6b7280', fontSize: 14 }}>{TEXT_DESC}</p>
                <TextField
                    autoFocus
                    fullWidth
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={TEXT_PLACEHOLDER}
                    error={Boolean(error)}
                    helperText={error}
                    variant="outlined"
                    size="small"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth>
                    {TEXT_SUBMIT}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const DataDecrypt = () => {
    const TEXT_DECRYPT = 'Decrypt'
    const TEXT_COPY = 'Copy JSON'
    const TEXT_HINT = 'Decrypted JSON will appear here'
    const TEXT_SUCCESS = 'JSON copied to clipboard!'

    const navigate = useNavigate()

    const [hasAccess, setHasAccess] = useState(() => localStorage.getItem(ACCESS_STORAGE_KEY) === 'true')
    const [modalOpen, setModalOpen] = useState(() => localStorage.getItem(ACCESS_STORAGE_KEY) !== 'true')

    const handleAccessGranted = () => {
        localStorage.setItem(ACCESS_STORAGE_KEY, 'true')
        setHasAccess(true)
        setModalOpen(false)
    }

    const handleAccessDenied = () => {
        setModalOpen(false)
        navigate('/')
    }

    const [str, setStr] = useState("")
    const [data, setData] = useState(null)
    const [error, setError] = useState("")

    const handleDecrypt = () => {
        try {
            setError("")
            const dec = decryptData(str)
            setData(dec)
            // Keep console for debugging purposes
            console.log(dec)
        } catch (e) {
            setData(null)
            setError(e?.message || 'Failed to decrypt data')
        }
    }

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            toast.success(TEXT_SUCCESS)
        }
    }

    return (
        <>
            <AccessGateModal
                open={modalOpen}
                onSuccess={handleAccessGranted}
                onDenied={handleAccessDenied}
            />

            {hasAccess && (
                <>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                        <input
                            type="text"
                            value={str}
                            onChange={a => setStr(a.target.value)}
                            placeholder="Paste encrypted string..."
                            style={{ flex: 1, minWidth: 240, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
                        />
                        <button onClick={handleDecrypt} style={{ padding: '8px 12px', border: '1px solid #111827', background: '#111827', color: '#fff', borderRadius: 6 }}>
                            {TEXT_DECRYPT}
                        </button>
                        {data && (
                            <button
                                onClick={handleCopy}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #059669',
                                    background: '#059669',
                                    color: '#fff',
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                <Copy size={16} />
                                {TEXT_COPY}
                            </button>
                        )}
                    </div>
                    {error ? (
                        <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>
                    ) : null}
                    {data !== null ? (
                        <JsonViewer data={data} />
                    ) : (
                        <div style={{ color: '#6b7280' }}>{TEXT_HINT}</div>
                    )}
                </>
            )}
        </>
    )
}

export default DataDecrypt