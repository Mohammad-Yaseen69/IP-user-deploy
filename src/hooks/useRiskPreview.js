import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { apiWrapper } from "../utils/Functions/apiWrapper"
import { useDebounce } from "./useDebounce/useDebounce"

// Live risk feedback for the IBAN onboarding form. The backend scores the form with
// the same engine compliance uses, but only returns the level and customer-safe
// feedback. Nothing is stored and it never blocks the flow.
export const useRiskPreview = (payload, enabled = true) => {
    const serialized = JSON.stringify(payload)
    const debounced = useDebounce(serialized, 700)

    return useQuery({
        queryKey: ["iban-risk-preview", debounced],
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: "/api/risk/preview",
                method: "POST",
                payload: JSON.parse(debounced),
                isEncrypted: true,
            })
            if (!res?.status) throw new Error(res?.message || "Risk preview unavailable")
            return res.data
        },
        enabled,
        staleTime: 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    })
}
