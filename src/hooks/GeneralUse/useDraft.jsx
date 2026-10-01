import { useCallback, useEffect, useRef, useState } from 'react'
import { apiWrapper } from '../../utils/Functions/apiWrapper'
import { encryptData } from '../../Helper/EssentilaMethods/Encryption'

const DEFAULT_DEBOUNCE_MS = 800

const draftEndpoint = (scope) => `/api/drafts/${scope}`

// Saves whatever is still pending while the tab is closing; axios requests would be cancelled.
const sendKeepalive = (scope, patch) => {
    try {
        fetch(`${import.meta.env.VITE_IP_DEV_API}${draftEndpoint(scope)}`, {
            method: 'PUT',
            keepalive: true,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                source: 'user',
            },
            body: JSON.stringify({ data: encryptData({ data: patch }) }),
        })
    } catch (err) {
        console.error('Unable to save draft before leaving', err)
    }
}

/**
 * Server-side draft for a multi-step form, so users can leave and continue later.
 * Scopes are registered on the backend (utils/drafts/draftScopes.js).
 *
 * - data:   saved form values; update(patch) merges top-level keys and autosaves them
 * - files:  documents already uploaded to the draft ({ slot, name, file_link, mime, meta })
 * - update() is ignored until the draft has loaded, so an empty form never overwrites it
 */
const useDraft = (scope, { enabled = true, debounceMs = DEFAULT_DEBOUNCE_MS } = {}) => {
    const [data, setData] = useState({})
    const [files, setFiles] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [saveStatus, setSaveStatus] = useState('idle')

    const dataRef = useRef({})
    const pendingRef = useRef({})
    const timerRef = useRef(null)
    const isLoadedRef = useRef(false)
    const slotQueuesRef = useRef({})
    const enabledRef = useRef(enabled)
    enabledRef.current = enabled

    const load = useCallback(async () => {
        try {
            const res = await apiWrapper({ endpoint: draftEndpoint(scope), method: 'GET' })
            const draft = res?.data
            dataRef.current = draft?.data || {}
            setData(dataRef.current)
            setFiles(draft?.files || [])
        } catch (err) {
            // Without a draft the form simply starts empty
            console.error(`Unable to load ${scope} draft`, err)
            dataRef.current = {}
            setData({})
            setFiles([])
        } finally {
            isLoadedRef.current = true
            setIsLoaded(true)
        }
    }, [scope])

    useEffect(() => {
        if (!enabled) return
        isLoadedRef.current = false
        setIsLoaded(false)
        load()
    }, [enabled, load])

    const flush = useCallback(async () => {
        clearTimeout(timerRef.current)
        timerRef.current = null
        const patch = pendingRef.current
        if (!Object.keys(patch).length || !enabledRef.current) return
        pendingRef.current = {}
        setSaveStatus('saving')
        try {
            await apiWrapper({
                endpoint: draftEndpoint(scope),
                method: 'PUT',
                isEncrypted: true,
                payload: { data: patch },
            })
            setSaveStatus('saved')
        } catch (err) {
            console.error(`Unable to save ${scope} draft`, err)
            // Keep the values so the next save retries them
            pendingRef.current = { ...patch, ...pendingRef.current }
            setSaveStatus('error')
        }
    }, [scope])

    const update = useCallback((patch) => {
        if (!enabledRef.current || !isLoadedRef.current || !patch) return
        const changed = Object.keys(patch).filter(
            key => JSON.stringify(patch[key]) !== JSON.stringify(dataRef.current[key])
        )
        if (!changed.length) return

        changed.forEach(key => {
            dataRef.current = { ...dataRef.current, [key]: patch[key] }
            pendingRef.current = { ...pendingRef.current, [key]: patch[key] }
        })
        setData(dataRef.current)

        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(flush, debounceMs)
    }, [debounceMs, flush])

    // Drops unsaved changes, e.g. right before a final submit that clears the draft
    const cancelPending = useCallback(() => {
        clearTimeout(timerRef.current)
        timerRef.current = null
        pendingRef.current = {}
    }, [])

    // Uploads to the same slot run one after another, so the server always ends up with the
    // file that was picked last
    const uploadFile = useCallback((slot, file, meta) => {
        const run = async () => {
            const formData = new FormData()
            formData.append('file', file)
            if (meta) formData.append('meta', JSON.stringify(meta))
            const res = await apiWrapper({
                endpoint: `${draftEndpoint(scope)}/files/${slot}`,
                method: 'POST',
                isFormData: true,
                payload: formData,
            })
            const entry = res?.data
            if (entry?.slot) {
                setFiles(prev => [...prev.filter(f => f.slot !== entry.slot), entry])
            }
            return entry
        }
        const previous = slotQueuesRef.current[slot] || Promise.resolve()
        const current = previous.catch(() => {}).then(run)
        slotQueuesRef.current[slot] = current
        return current
    }, [scope])

    const removeFile = useCallback(async (slot) => {
        await apiWrapper({ endpoint: `${draftEndpoint(scope)}/files/${slot}`, method: 'DELETE' })
        setFiles(prev => prev.filter(f => f.slot !== slot))
    }, [scope])

    const clear = useCallback(async () => {
        cancelPending()
        await apiWrapper({ endpoint: draftEndpoint(scope), method: 'DELETE' })
        dataRef.current = {}
        setData({})
        setFiles([])
    }, [scope, cancelPending])

    // Re-reads the draft after the server changed it (e.g. a submission consumed part of it)
    const reload = useCallback(async () => {
        cancelPending()
        await load()
    }, [cancelPending, load])

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (Object.keys(pendingRef.current).length && enabledRef.current) {
                sendKeepalive(scope, pendingRef.current)
                pendingRef.current = {}
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            // Leaving the page inside the app: save what is still waiting
            flush()
        }
    }, [scope, flush])

    return {
        data,
        files,
        isLoaded: enabled ? isLoaded : true,
        saveStatus,
        update,
        flush,
        cancelPending,
        uploadFile,
        removeFile,
        clear,
        reload,
    }
}

export default useDraft
