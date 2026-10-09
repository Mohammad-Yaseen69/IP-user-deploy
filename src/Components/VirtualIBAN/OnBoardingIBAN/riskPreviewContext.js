import { createContext, useContext } from 'react'

// Live risk preview for the onboarding steps; provided by OnBoardingIBAN/index.jsx.
export const RiskPreviewContext = createContext({ data: null, isFetching: false })

export const useRiskPreviewContext = () => useContext(RiskPreviewContext)
