import { useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "react-toastify"
import { getErrorMessage } from "../../../../Helper/getErrorMessage"
import { useIdempotency } from "../../../../hooks/Payments/useIdempotency"
import { unwrapVirtualIbanResponse } from "../../utils/virtualIban"
import { createCryptoChannel, getCryptoChannels } from "../api/cryptoChannels"

export const cryptoChannelsQueryKey = (virtualIbanId) => ["virtual-iban", "crypto-channels", virtualIbanId]

/**
 * Crypto channels for one virtual IBAN: the list (kept in React Query so it
 * shares cache/invalidation conventions with the rest of the vIBAN feature)
 * plus an imperative `createChannel` for the "Add channel" modal.
 */
export const useCryptoChannels = (virtualIbanId) => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { getKey, reset } = useIdempotency()
    const [creating, setCreating] = useState(false)

    const queryKey = cryptoChannelsQueryKey(virtualIbanId)

    const { data: channels = [], isLoading, isFetching, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await getCryptoChannels(virtualIbanId)
            const payload = unwrapVirtualIbanResponse(res)
            return Array.isArray(payload?.channels) ? payload.channels : []
        },
        enabled: !!virtualIbanId,
        gcTime: 0,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    })

    const createChannel = useCallback(async ({ payCurrency, displayCurrency }) => {
        if (!virtualIbanId || !payCurrency) return null

        setCreating(true)
        try {
            const res = await createCryptoChannel({
                virtualIbanId,
                payCurrency,
                displayCurrency,
                idempotencyKey: getKey(),
            })

            if (res?.status) {
                const payload = unwrapVirtualIbanResponse(res)
                reset()
                if (Array.isArray(payload?.channels)) {
                    queryClient.setQueryData(queryKey, payload.channels)
                }
                return payload?.channel || null
            }

            toast.error(t(res?.message || "Failed to add crypto channel."))
            return null
        } catch (err) {
            toast.error(getErrorMessage(err, t("Failed to add crypto channel. Please try again.")))
            return null
        } finally {
            setCreating(false)
        }
    }, [virtualIbanId, getKey, reset, queryClient, queryKey, t])

    return {
        channels,
        isLoading: isLoading || isFetching,
        creating,
        createChannel,
        refetch,
    }
}

export default useCryptoChannels
