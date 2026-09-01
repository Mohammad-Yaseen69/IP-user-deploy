import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
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

// jsdom has no MediaRecorder, so the real hook reports unsupported and the mic
// button never renders. The stub keeps the composer's voice affordance testable.
vi.mock('../../Components/AssistantWidget/useVoiceInput', () => ({
    isVoiceInputSupported: () => true,
    useVoiceInput: () => ({
        status: 'idle',
        error: null,
        toggle: vi.fn(),
        dismissError: vi.fn(),
    }),
}))

const SIGNED_IN = { userDetails: { _id: 'user-123' }, token: 'jwt-abc' }

/** The endpoint answers with newline-delimited JSON, streamed. */
const ndjson = (events) => ({
    ok: true,
    body: new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder()
            events.forEach((event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)))
            controller.close()
        },
    }),
})

/** A whole reply delivered in one chunk, then the closing event. */
const reply = ({ reply: text, navigateTo = null }) =>
    ndjson([
        { type: 'delta', text },
        { type: 'done', reply: text, navigateTo },
    ])

const sessionOk = { ok: true, json: async () => ({ success: true, data: { token: 'sess-1' } }) }

/**
 * The widget exchanges the user's token for a session token before its first
 * message, so the mock has to answer both endpoints.
 */
const mockApi = (chatResponse) => {
    globalThis.fetch.mockImplementation((url) =>
        Promise.resolve(String(url).includes('/session') ? sessionOk : chatResponse)
    )
}

/** Calls to the chat endpoint only, ignoring the session handshake. */
const chatCalls = () =>
    globalThis.fetch.mock.calls.filter(([url]) => String(url).includes('/chat'))

let location = null

const LocationSpy = () => {
    location = useLocation().pathname + useLocation().search
    return null
}

const renderWidget = (userValue = SIGNED_IN) =>
    render(
        <MemoryRouter initialEntries={['/dashboard/default']}>
            <UserContext.Provider value={userValue}>
                <AssistantWidget />
                <LocationSpy />
            </UserContext.Provider>
        </MemoryRouter>
    )

const open = (user) => user.click(screen.getByRole('button', { name: 'Open assistant' }))

const ask = async (user, text) => {
    await user.type(screen.getByPlaceholderText('Ask about payments, limits, verification…'), text)
    await user.click(screen.getByRole('button', { name: 'Send' }))
}

beforeEach(() => {
    location = null
    globalThis.fetch = vi.fn()
})

afterEach(() => vi.restoreAllMocks())

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

        it('opens with a greeting and starter prompts', async () => {
            const user = userEvent.setup()
            renderWidget()

            await open(user)

            expect(screen.getByText('Try one of these')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Why is my account limited?' })).toBeInTheDocument()
        })

        it('closes on Escape', async () => {
            const user = userEvent.setup()
            renderWidget()
            await open(user)

            await user.keyboard('{Escape}')

            await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
        })
    })

    describe('conversation', () => {
        it('sends the question and shows the reply', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'Fees show before you confirm.', navigateTo: null }))
            renderWidget()
            await open(user)

            await ask(user, 'what are the fees')

            expect(await screen.findByText('Fees show before you confirm.')).toBeInTheDocument()

            const [url, init] = chatCalls()[0]
            expect(url).toContain('/api/assistant/chat')
            expect(JSON.parse(init.body).message).toBe('what are the fees')
        })

        // The point of the handshake: the InstaPay token is verified once, at
        // /session, and messages carry the short-lived token instead — so the
        // bot never calls the InstaPay API per turn.
        it('exchanges the user token for a session token, once', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'ok', navigateTo: null }))
            renderWidget()
            await open(user)

            await ask(user, 'first')
            await screen.findByText('ok')
            await ask(user, 'second')
            await waitFor(() => expect(chatCalls()).toHaveLength(2))

            const sessionCalls = globalThis.fetch.mock.calls.filter(([url]) =>
                String(url).includes('/session')
            )
            expect(sessionCalls).toHaveLength(1)
            expect(sessionCalls[0][1].headers.Authorization).toBe('Bearer jwt-abc')

            // Every message carries the session token, never the user's own.
            chatCalls().forEach(([, init]) => {
                expect(init.headers.Authorization).toBe('Bearer sess-1')
            })
        })

        // The page list is what stops the agent offering something this user's
        // role cannot open, so it has to travel with every request.
        it('sends only pages this user may open', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'ok', navigateTo: null }))
            renderWidget()
            await open(user)

            await ask(user, 'hello')

            const { pages } = JSON.parse(chatCalls()[0][1].body)
            expect(pages.length).toBeGreaterThan(0)
            expect(pages[0]).toHaveProperty('id')
            expect(pages[0]).toHaveProperty('description')
            // Routes and permissions stay client-side; the bot never needs them.
            expect(pages[0]).not.toHaveProperty('route')
            expect(pages[0]).not.toHaveProperty('permission')
        })

        it('carries history so follow-ups make sense', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'first answer', navigateTo: null }))
            renderWidget()
            await open(user)
            await ask(user, 'first question')
            await screen.findByText('first answer')

            await ask(user, 'and then?')

            await waitFor(() => expect(chatCalls()).toHaveLength(2))
            const { history } = JSON.parse(chatCalls()[1][1].body)
            expect(history).toEqual([
                { role: 'user', content: 'first question' },
                { role: 'assistant', content: 'first answer' },
            ])
        })

        it('navigates when the agent asks it to', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'Taking you there.', navigateTo: 'wallets' }))
            renderWidget()
            await open(user)

            await ask(user, 'take me to my wallets')

            await waitFor(() => expect(location).toBe('/wallets'))
        })

        it('ignores a destination that is not in the registry', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'Done.', navigateTo: 'steal_funds' }))
            renderWidget()
            await open(user)

            await ask(user, 'go somewhere')

            expect(await screen.findByText('Done.')).toBeInTheDocument()
            expect(location).toBe('/dashboard/default')
        })

        it('says so when the destination is refused', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'Taking you there.', navigateTo: 'steal_funds' }))
            renderWidget()
            await open(user)

            await ask(user, 'go somewhere')

            expect(await screen.findByText(/couldn't open that page/i)).toBeInTheDocument()
            expect(location).toBe('/dashboard/default')
        })

        it('renders the reply as it streams in', async () => {
            const user = userEvent.setup()
            mockApi(
                ndjson([
                    { type: 'delta', text: 'Fees ' },
                    { type: 'delta', text: 'are shown ' },
                    { type: 'delta', text: 'before you confirm.' },
                    { type: 'done', reply: 'Fees are shown before you confirm.', navigateTo: null },
                ])
            )
            renderWidget()
            await open(user)

            await ask(user, 'what are the fees')

            expect(await screen.findByText('Fees are shown before you confirm.')).toBeInTheDocument()
        })

        // A dropped chunk must not leave a half-written message on screen.
        it('settles on the server’s final text', async () => {
            const user = userEvent.setup()
            mockApi(
                ndjson([
                    { type: 'delta', text: 'partial' },
                    { type: 'done', reply: 'the complete answer', navigateTo: null },
                ])
            )
            renderWidget()
            await open(user)

            await ask(user, 'anything')

            expect(await screen.findByText('the complete answer')).toBeInTheDocument()
            expect(screen.queryByText('partial')).not.toBeInTheDocument()
        })

        it('handles an event split across chunk boundaries', async () => {
            const user = userEvent.setup()
            const line = `${JSON.stringify({ type: 'done', reply: 'reassembled', navigateTo: null })}\n`
            mockApi({
                ok: true,
                body: new ReadableStream({
                    start(controller) {
                        const encoder = new TextEncoder()
                        controller.enqueue(encoder.encode(line.slice(0, 12)))
                        controller.enqueue(encoder.encode(line.slice(12)))
                        controller.close()
                    },
                }),
            })
            renderWidget()
            await open(user)

            await ask(user, 'anything')

            expect(await screen.findByText('reassembled')).toBeInTheDocument()
        })

        it('shows a fallback when the request fails', async () => {
            const user = userEvent.setup()
            vi.spyOn(console, 'error').mockImplementation(() => { })
            globalThis.fetch.mockResolvedValue({ ok: false, status: 502 })
            renderWidget()
            await open(user)

            await ask(user, 'anything')

            expect(await screen.findByText(/assistant is unavailable/i)).toBeInTheDocument()
        })

        it('clears the conversation on reset', async () => {
            const user = userEvent.setup()
            mockApi(reply({ reply: 'an answer', navigateTo: null }))
            renderWidget()
            await open(user)
            await ask(user, 'a question')
            await screen.findByText('an answer')

            await user.click(screen.getByRole('button', { name: 'Start a new chat' }))

            await waitFor(() => expect(screen.queryByText('an answer')).not.toBeInTheDocument())
            expect(screen.getByText('Try one of these')).toBeInTheDocument()
        })
    })
})
