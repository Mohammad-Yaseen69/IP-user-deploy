import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AssistantWidget from '../../Components/AssistantWidget'
import { UserContext } from '../../Context/UserContext'

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }),
}))

vi.mock('axios', () => ({
    default: {
        defaults: {},
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}))

const chatKitOptions = { current: null }

const chatKitMethods = {
    setComposerValue: vi.fn(),
    focusComposer: vi.fn(),
}

vi.mock('@openai/chatkit-react', () => ({
    useChatKit: (options) => {
        chatKitOptions.current = options
        return { control: { options }, ...chatKitMethods }
    },
    ChatKit: (props) => <div data-testid="chatkit" className={props.className} />,
}))

const voice = { onTranscript: null, status: 'idle', error: null }

vi.mock('../../Components/AssistantWidget/useVoiceInput', () => ({
    isVoiceInputSupported: () => true,
    useVoiceInput: ({ onTranscript }) => {
        voice.onTranscript = onTranscript
        return { status: voice.status, error: voice.error, toggle: vi.fn(), dismissError: vi.fn() }
    },
}))

const SIGNED_IN = { userDetails: { _id: 'user-123' }, token: 'jwt-abc' }
const THREAD_KEY = 'instapay.assistant.thread:user-123'

const installLocalStorage = () => {
    const store = new Map()
    Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
            getItem: (key) => (store.has(key) ? store.get(key) : null),
            setItem: (key, value) => store.set(key, String(value)),
            removeItem: (key) => store.delete(key),
            clear: () => store.clear(),
            key: (index) => [...store.keys()][index] ?? null,
            get length() {
                return store.size
            },
        },
    })
    return store
}

let store

const renderWidget = (userValue = SIGNED_IN) =>
    render(
        <MemoryRouter initialEntries={['/dashboard/default']}>
            <UserContext.Provider value={userValue}>
                <AssistantWidget />
            </UserContext.Provider>
        </MemoryRouter>
    )

const openPanel = (user) => user.click(screen.getByRole('button', { name: 'Open assistant' }))

beforeEach(() => {
    chatKitOptions.current = null
    voice.onTranscript = null
    voice.status = 'idle'
    voice.error = null
    chatKitMethods.setComposerValue.mockClear()
    chatKitMethods.focusComposer.mockClear()
    store = installLocalStorage()
    globalThis.fetch = vi.fn()
})

afterEach(() => {
    vi.restoreAllMocks()
})

describe('AssistantWidget', () => {
    describe('gating', () => {
        it.each([
            ['no user and no token', { userDetails: null, token: '' }],
            ['a token but no user id', { userDetails: null, token: 'jwt-abc' }],
            ['a user id but no token', { userDetails: { _id: 'user-123' }, token: '' }],
        ])('renders nothing with %s', (_label, userValue) => {
            renderWidget(userValue)

            expect(screen.queryByRole('button', { name: 'Open assistant' })).not.toBeInTheDocument()
        })

        it('renders the launcher once signed in', () => {
            renderWidget()

            expect(screen.getByRole('button', { name: 'Open assistant' })).toBeInTheDocument()
        })
    })

    describe('panel visibility', () => {
        it('does not expose the dialog until opened', () => {
            renderWidget()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('keeps ChatKit mounted while closed', () => {
            renderWidget()

            expect(screen.getByTestId('chatkit')).toBeInTheDocument()
        })

        it('exposes the dialog when opened', async () => {
            const user = userEvent.setup()
            renderWidget()

            await openPanel(user)

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('hides the dialog on Escape but keeps the conversation mounted', async () => {
            const user = userEvent.setup()
            renderWidget()
            await openPanel(user)

            await user.keyboard('{Escape}')

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
            expect(screen.getByTestId('chatkit')).toBeInTheDocument()
        })

        it('keeps the same ChatKit instance across open and close', async () => {
            const user = userEvent.setup()
            renderWidget()
            const before = screen.getByTestId('chatkit')

            await openPanel(user)
            await user.click(screen.getByRole('button', { name: 'Close' }))

            expect(screen.getByTestId('chatkit')).toBe(before)
        })
    })

    describe('thread persistence', () => {
        it('starts a new thread when nothing is stored', () => {
            renderWidget()

            expect(chatKitOptions.current.initialThread).toBeNull()
        })

        it('resumes the stored thread for this user', () => {
            store.set(THREAD_KEY, 'thr_existing')

            renderWidget()

            expect(chatKitOptions.current.initialThread).toBe('thr_existing')
        })

        it('ignores a thread stored against a different user', () => {
            store.set('instapay.assistant.thread:someone-else', 'thr_theirs')

            renderWidget()

            expect(chatKitOptions.current.initialThread).toBeNull()
        })

        it('stores the thread id when ChatKit reports a change', () => {
            renderWidget()

            act(() => chatKitOptions.current.onThreadChange({ threadId: 'thr_new' }))

            expect(store.get(THREAD_KEY)).toBe('thr_new')
        })

        it('forgets the thread when ChatKit reports a new one', () => {
            store.set(THREAD_KEY, 'thr_old')
            renderWidget()

            act(() => chatKitOptions.current.onThreadChange({ threadId: null }))

            expect(store.has(THREAD_KEY)).toBe(false)
        })
    })

    describe('logout', () => {
        it('clears every stored thread when the token is gone', () => {
            store.set(THREAD_KEY, 'thr_mine')
            store.set('instapay.assistant.thread:other', 'thr_other')
            store.set('unrelated-key', 'keep-me')

            renderWidget({ userDetails: null, token: '' })

            expect(store.has(THREAD_KEY)).toBe(false)
            expect(store.has('instapay.assistant.thread:other')).toBe(false)
            expect(store.get('unrelated-key')).toBe('keep-me')
        })

        it('leaves stored threads alone while signed in', () => {
            store.set(THREAD_KEY, 'thr_mine')

            renderWidget()

            expect(store.get(THREAD_KEY)).toBe('thr_mine')
        })
    })

    describe('voice input', () => {
        it('offers a mic button when the browser supports recording', async () => {
            const user = userEvent.setup()
            renderWidget()

            await openPanel(user)

            expect(screen.getByRole('button', { name: 'Record a voice message' })).toBeInTheDocument()
        })

        it('places the mic below the conversation, next to the input', async () => {
            const user = userEvent.setup()
            renderWidget()
            await openPanel(user)

            const chat = screen.getByTestId('chatkit')
            const mic = screen.getByRole('button', { name: 'Record a voice message' })

            const micComesAfterChat = chat.compareDocumentPosition(mic) & Node.DOCUMENT_POSITION_FOLLOWING
            expect(Boolean(micComesAfterChat)).toBe(true)
        })

        it('hands the transcript to ChatKit as a params object', () => {
            renderWidget()

            act(() => voice.onTranscript('I want to send money'))

            expect(chatKitMethods.setComposerValue).toHaveBeenCalledWith({
                text: 'I want to send money',
            })
        })

        it('puts the transcript in the composer rather than sending it', () => {
            renderWidget()

            act(() => voice.onTranscript('send money to Ali'))

            expect(chatKitMethods.setComposerValue).toHaveBeenCalled()
            expect(chatKitMethods.focusComposer).toHaveBeenCalled()
        })

        it('surfaces a voice error to the user', async () => {
            const user = userEvent.setup()
            voice.error = 'permission_denied'
            renderWidget()

            await openPanel(user)

            expect(screen.getByText(/Microphone access was blocked/)).toBeInTheDocument()
        })
    })

    describe('ChatKit configuration', () => {
        it('registers a client tool handler so the agent can navigate', () => {
            renderWidget()

            expect(typeof chatKitOptions.current.onClientTool).toBe('function')
        })

        it('themes the chat with the InstaPay accent', () => {
            renderWidget()

            expect(chatKitOptions.current.theme.color.accent.primary).toBe('#5926f0')
        })

        it('offers starter prompts on the new-thread screen', () => {
            renderWidget()

            expect(chatKitOptions.current.startScreen.prompts.length).toBeGreaterThan(0)
        })

        it('leaves ChatKit dictation off in favour of our own mic', () => {
            renderWidget()

            expect(chatKitOptions.current.composer.dictation.enabled).toBe(false)
        })

        it('registers onError as a hook option rather than a component prop', () => {
            renderWidget()

            expect(typeof chatKitOptions.current.onError).toBe('function')
        })
    })

    it('shows an error state when ChatKit reports a failure', async () => {
        const user = userEvent.setup()
        renderWidget()
        await openPanel(user)
        vi.spyOn(console, 'error').mockImplementation(() => { })

        await act(async () => {
            chatKitOptions.current.onError({ error: new Error('session expired') })
        })

        expect(screen.getByText('The assistant is unavailable right now.')).toBeInTheDocument()
    })

    describe('session handshake', () => {
        it('exchanges the user token for a client secret', async () => {
            globalThis.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ client_secret: 'cs_live_123' }),
            })
            renderWidget()

            const secret = await chatKitOptions.current.api.getClientSecret(null)

            expect(secret).toBe('cs_live_123')

            const [url, init] = globalThis.fetch.mock.calls[0]
            expect(url).toBe('/api/chatkit/session')
            expect(init.method).toBe('POST')
            expect(init.headers.Authorization).toBe('Bearer jwt-abc')
            expect(JSON.parse(init.body)).toEqual({ userId: 'user-123' })
        })

        it('never puts the token in the URL', async () => {
            globalThis.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ client_secret: 'cs_live_123' }),
            })
            renderWidget()

            await chatKitOptions.current.api.getClientSecret(null)

            expect(globalThis.fetch.mock.calls[0][0]).not.toContain('jwt-abc')
        })

        it('throws when the endpoint rejects, so ChatKit surfaces the failure', async () => {
            globalThis.fetch.mockResolvedValue({ ok: false, status: 401 })
            renderWidget()

            await expect(chatKitOptions.current.api.getClientSecret(null)).rejects.toThrow('401')
        })

        it('throws when the endpoint returns no secret', async () => {
            globalThis.fetch.mockResolvedValue({ ok: true, json: async () => ({}) })
            renderWidget()

            await expect(chatKitOptions.current.api.getClientSecret(null)).rejects.toThrow(
                /no client secret/i
            )
        })
    })
})
