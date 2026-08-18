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

/** An agent-login user whose role denies `payments.*`. */
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

    const LocationSpy = ({ onChange }) => {
        const current = useLocation()
        onChange(`${current.pathname}${current.search}`)
        return null
    }

    const wrapper = ({ children }) => (
        <MemoryRouter initialEntries={['/dashboard/default']}>
            <UserContext.Provider value={userValue}>
                {children}
                <LocationSpy onChange={(value) => { location = value }} />
            </UserContext.Provider>
        </MemoryRouter>
    )

    const { result } = renderHook(() => useNavigationTool(), { wrapper })

    // Navigation re-renders, so the call has to run inside act() for the
    // location spy to reflect it.
    const go = (pageId) => {
        let outcome
        act(() => { outcome = result.current(pageId) })
        return outcome
    }

    return { go, getLocation: () => location }
}

describe('useNavigationTool', () => {
    it('navigates to a known page', () => {
        const { go, getLocation } = setup()

        expect(go('wallets').ok).toBe(true)
        expect(getLocation()).toBe('/wallets')
    })

    it('preserves the query string on a deep link', () => {
        const { go, getLocation } = setup()

        go('send_money')

        expect(getLocation()).toBe('/payments?payment_action=send_money')
    })

    it.each([
        ['an id outside the registry', 'steal_funds'],
        ['a non-string', 42],
        ['nothing', undefined],
    ])('refuses %s', (_label, pageId) => {
        const { go, getLocation } = setup()

        const result = go(pageId)

        expect(result.ok).toBe(false)
        expect(result.reason).toBe('unknown_page')
        expect(getLocation()).toBe('/dashboard/default')
    })

    describe('permissions', () => {
        it('refuses a page the user has no permission for', () => {
            const { go, getLocation } = setup(restrictedUser)

            const result = go('send_money')

            expect(result.ok).toBe(false)
            expect(result.reason).toBe('not_permitted')
            expect(getLocation()).toBe('/dashboard/default')
        })

        it('still allows a permitted page', () => {
            const { go, getLocation } = setup(restrictedUser)

            expect(go('wallets').ok).toBe(true)
            expect(getLocation()).toBe('/wallets')
        })

        it('allows ungated pages', () => {
            const { go, getLocation } = setup(restrictedUser)

            // update_pin carries no `permission`, so role rules do not apply.
            expect(go('update_pin').ok).toBe(true)
            expect(getLocation()).toBe('/update-pin')
        })
    })
})
