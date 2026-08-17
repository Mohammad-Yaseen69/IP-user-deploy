import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useNavigationTool } from '../../Components/AssistantWidget/useNavigationTool'
import { UserContext } from '../../Context/UserContext'

vi.mock('axios', () => ({
    default: {
        defaults: {},
        get: vi.fn(() => Promise.resolve({ data: {} })),
        post: vi.fn(() => Promise.resolve({ data: {} })),
    },
}))

const restrictedUser = {
    userDetails: { _id: 'u1', account_type: 'business' },
    isAgentLogin: true,
    agentDetails: {
        permissions: ['wallet.view'],
        deniedPermissions: [],
        role: { permissions: ['wallet.view'], deniedPermissions: [] },
    },
}

const setup = (userValue = { userDetails: null }) => {
    let location = null
    const onNavigate = vi.fn()

    const wrapper = ({ children }) => (
        <MemoryRouter initialEntries={['/dashboard/default']}>
            <UserContext.Provider value={userValue}>
                {children}
                <LocationSpy onChange={(value) => { location = value }} />
            </UserContext.Provider>
        </MemoryRouter>
    )

    const LocationSpy = ({ onChange }) => {
        const current = useLocation()
        onChange(`${current.pathname}${current.search}`)
        return null
    }

    const { result } = renderHook(() => useNavigationTool({ onNavigate }), { wrapper })

    const call = async (toolCall) => {
        let toolResult
        await act(async () => {
            toolResult = await result.current(toolCall)
        })
        return toolResult
    }

    return { call, onNavigate, getLocation: () => location }
}

describe('useNavigationTool', () => {
    describe('navigate_to_page', () => {
        it('navigates to a known page', async () => {
            const { call, onNavigate, getLocation } = setup()

            const result = await call({ name: 'navigate_to_page', params: { page_id: 'wallets' } })

            expect(result.ok).toBe(true)
            expect(getLocation()).toBe('/wallets')
            expect(onNavigate).toHaveBeenCalledOnce()
        })

        it('preserves the query string on a deep link', async () => {
            const { call, getLocation } = setup()

            await call({ name: 'navigate_to_page', params: { page_id: 'send_money' } })

            expect(getLocation()).toBe('/payments?payment_action=send_money')
        })

        it('refuses an id that is not in the registry', async () => {
            const { call, onNavigate, getLocation } = setup()

            const result = await call({ name: 'navigate_to_page', params: { page_id: 'steal_funds' } })

            expect(result.ok).toBe(false)
            expect(result.reason).toBe('unknown_page')
            expect(getLocation()).toBe('/dashboard/default')
            expect(onNavigate).not.toHaveBeenCalled()
        })

        it('keeps tool results small', async () => {
            const { call } = setup()

            const ok = await call({ name: 'navigate_to_page', params: { page_id: 'wallets' } })
            const refused = await call({ name: 'navigate_to_page', params: { page_id: 'nope' } })

            expect(Object.keys(ok)).toEqual(['ok'])
            expect(Object.keys(refused).sort()).toEqual(['ok', 'reason'])
        })

        it.each([
            [{ page_id: 42 }],
            [{}],
            [undefined],
        ])('refuses a malformed params payload: %j', async (params) => {
            const { call, getLocation } = setup()

            const result = await call({ name: 'navigate_to_page', params })

            expect(result.ok).toBe(false)
            expect(getLocation()).toBe('/dashboard/default')
        })

        it('refuses a page the user has no permission for', async () => {
            const { call, onNavigate, getLocation } = setup(restrictedUser)

            const result = await call({ name: 'navigate_to_page', params: { page_id: 'send_money' } })

            expect(result.ok).toBe(false)
            expect(result.reason).toBe('not_permitted')
            expect(getLocation()).toBe('/dashboard/default')
            expect(onNavigate).not.toHaveBeenCalled()
        })

        it('still allows a permitted page for a restricted user', async () => {
            const { call, getLocation } = setup(restrictedUser)

            const result = await call({ name: 'navigate_to_page', params: { page_id: 'wallets' } })

            expect(result.ok).toBe(true)
            expect(getLocation()).toBe('/wallets')
        })

        it('allows ungated pages for a restricted user', async () => {
            const { call, getLocation } = setup(restrictedUser)

            const result = await call({ name: 'navigate_to_page', params: { page_id: 'update_pin' } })

            expect(result.ok).toBe(true)
            expect(getLocation()).toBe('/update-pin')
        })
    })

    it('refuses a tool it does not implement', async () => {
        const { call, getLocation } = setup()

        const result = await call({ name: 'transfer_funds', params: { amount: 1000 } })

        expect(result.ok).toBe(false)
        expect(result.reason).toBe('unknown_tool')
        expect(getLocation()).toBe('/dashboard/default')
    })
})
