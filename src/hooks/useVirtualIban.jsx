import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiWrapper } from "../utils/Functions/apiWrapper"
import {
    asVirtualIban,
    asVirtualIbanArray,
    unwrapVirtualIbanResponse,
} from "../Components/VirtualIBAN/utils/virtualIban"
import { useContext } from "react"
import { UserContext } from "../Context/UserContext"
import { useIdempotency } from "./Payments/useIdempotency"

export const virtualIbanQueryKeys = {
    all: ["virtual-iban"],
    list: () => [...virtualIbanQueryKeys.all, "list"],
    detail: (id) => [...virtualIbanQueryKeys.all, "detail", id],
    balance: (id) => [...virtualIbanQueryKeys.all, "balance", id],
    processingStatus: () => [...virtualIbanQueryKeys.all, "processing-status"],
}

export const useVirtualIbans = (accountId) =>
    useQuery({
        queryKey: [...virtualIbanQueryKeys.list(), accountId],
        enabled: !!accountId,
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/virtual-iban?account_id=${accountId}`,
                method: "GET",
                isDecrypted: true,
            })

            return asVirtualIbanArray(res)
        },
        gcTime: 0,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    })

export const useIbanFee = () => {
    const { userDetails } = useContext(UserContext)

    return useQuery({
        queryKey: ['IbanFee', userDetails?.level?._id],
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/account-settings/fee-details?service_name=iban_activation&account_level=${userDetails?.level?._id}`,
                method: "GET",
                isDecrypted: true,
            })

            return res.data
        },
        gcTime: 0,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
        enabled: !!userDetails?.level?._id,
    })
}

export const usePendingStatus = (enabled = true) =>
    useQuery({
        queryKey: virtualIbanQueryKeys.processingStatus(),
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: "/api/virtual-iban/creation-status",
                method: "GET",
                isDecrypted: true,
            })

            return res?.data?.inProgress || res?.data?.data?.inProgress || false
        },
        enabled,
        gcTime: 0,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    })

export const useVirtualIbanDetails = (ibanId) =>
    useQuery({
        queryKey: virtualIbanQueryKeys.detail(ibanId),
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/virtual-iban/${ibanId}`,
                method: "GET",
                isDecrypted: true,
            })

            return asVirtualIban(res)
        },
        enabled: !!ibanId,
        gcTime: 0,
        staleTime: 0
    })

export const useVirtualIbanProcessingStatus = usePendingStatus

export const useVirtualIbanBlock = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ ibanId, action }) =>
            apiWrapper({
                endpoint: `/api/virtual-iban/${ibanId}/action`,
                method: "POST",
                payload: { action },
                isDecrypted: true,
                isEncrypted: true,
            }),
        onSuccess: (_, variables) => {
            const ibanId = variables?.ibanId
            if (ibanId) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(ibanId) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(ibanId) })
            }
        }
    })
}

export const useSyncVirtualIbanBalance = (ibanId) =>
    useQuery({
        queryKey: virtualIbanQueryKeys.balance(ibanId),
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/virtual-iban/balance/${ibanId}`,
                method: "GET",
                isDecrypted: true,
            })
            const data = unwrapVirtualIbanResponse(res)
            return data
        },
        enabled: !!ibanId,
        gcTime: 0,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    })

export const useCreateVirtualIban = () => {
    return useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/initiate",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
    })
}

export const useUpdateVirtualIbanStatus = useVirtualIbanBlock

export const useVirtualIbanTransferFee = () =>
    useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/transfer/fee",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
    })

export const useExecuteVirtualIbanTransfer = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/transfer",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            if (variables?.iban_id) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(variables.iban_id) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(variables.iban_id) })
            }
        },
    })
}

export const useVirtualIbanPayoutFee = () =>
    useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/payout/fee",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
    })

export const useVirtualIbanPayoutDirect = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/payout",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            if (variables?.iban_id) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(variables.iban_id) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(variables.iban_id) })
            }
        },
    })
}


export const useVirtualIbanCryptoTopupFee = () =>
    useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/topup/crypto/fee",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
    })

export const useExecuteVirtualIbanCryptoTopup = () => {
    const queryClient = useQueryClient()
    const { getKey } = useIdempotency()

    return useMutation({
        mutationFn: ({ idempotencyKey, ...payload }) => apiWrapper({
            endpoint: "/api/virtual-iban/topup/crypto",
            method: "POST",
            payload,
            isEncrypted: true,
            isDecrypted: true,
            idempotencyKey: idempotencyKey || getKey(),
        }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            if (variables?.iban_id) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(variables?.iban_id) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(variables?.iban_id) })
            }
        },
    })
}

const useVirtualIbanGraphData = (filter = "this_year") =>
    useQuery({
        queryKey: [...virtualIbanQueryKeys.all, "graph-data", filter],
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/virtual-iban/graph-data?filter=${filter}`,
                method: "GET",
                isDecrypted: true,
            })

            return res?.data?.data || res?.data || null
        },
        gcTime: 0,
        staleTime: 0,
    })
export default useVirtualIbanGraphData

export const useVirtualIbanSwiftPayoutFee = () =>
    useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/payout/swift/fee",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
    })

export const useVirtualIbanSwiftPayoutDirect = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload) =>
            apiWrapper({
                endpoint: "/api/virtual-iban/payout/swift",
                method: "POST",
                payload,
                isEncrypted: true,
                isDecrypted: true,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.all })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            if (variables?.iban_id) {
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(variables.iban_id) })
                queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(variables.iban_id) })
            }
        },
    })
}
