import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AssistantWidget from '../../Components/AssistantWidget'
import { UserContext } from '../../Context/UserContext'

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }),
}))

// UserContext sets `axios.defaults.withCredentials` at import time, which the
// shared setup mock does not provide.
vi.mock('axios', () => ({
    default: {
        defaults: {},
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}))

// ChatKit renders a custom element backed by an iframe, which jsdom cannot run.
// The stub keeps the last options so the session handshake stays assertable.
const chatKitOptions = { current: null }

vi.mock('@openai/chatkit-react', () => ({
    useChatKit: (options) => {
        chatKitOptions.current = options
        return { control: { options } }
    },
    ChatKit: (props) => <div data-testid="chatkit" className={props.className} />,
}))

const SIGNED_IN = { userDetails: { _id: 'user-123' }, token: 'jwt-abc' }

const renderWidget = (userValue = SIGNED_IN) =>
    render(
        <MemoryRouter initialEntries={['/dashboard/default']}>
            <UserContext.Provider value={userValue}>
                <AssistantWidget />
            </UserContext.Provider>
        </MemoryRouter>
    )

beforeEach(() => {
    chatKitOptions.current = null
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

    describe('panel', () => {
        it('stays closed until the launcher is clicked', () => {
            renderWidget()

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('mounts ChatKit when opened', async () => {
            const user = userEvent.setup()
            renderWidget()

            await user.click(screen.getByRole('button', { name: 'Open assistant' }))

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByTestId('chatkit')).toBeInTheDocument()
        })

        it('closes on Escape', async () => {
            const user = userEvent.setup()
            renderWidget()
            await user.click(screen.getByRole('button', { name: 'Open assistant' }))

            await user.keyboard('{Escape}')

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
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

        // On <ChatKit> this would be a DOM error attribute, not the
        // `chatkit.error` event, and the panel's error state would never show.
        it('registers onError as a hook option rather than a component prop', () => {
            renderWidget()

            expect(typeof chatKitOptions.current.onError).toBe('function')
        })
    })

    it('shows an error state when ChatKit reports a failure', async () => {
        const user = userEvent.setup()
        renderWidget()
        await user.click(screen.getByRole('button', { name: 'Open assistant' }))
        vi.spyOn(console, 'error').mockImplementation(() => { })

        await act(async () => {
            chatKitOptions.current.onError({ error: new Error('session expired') })
        })

        expect(screen.getByText('The assistant is unavailable right now.')).toBeInTheDocument()
        expect(screen.queryByTestId('chatkit')).not.toBeInTheDocument()
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
