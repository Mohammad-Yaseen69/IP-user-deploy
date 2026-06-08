import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiWrapper } from "../../../utils/Functions/apiWrapper"

export const virtualIbanQueryKeys = {
    all: ["virtual-iban"],
    list: () => [...virtualIbanQueryKeys.all, "list"],
    detail: (id) => [...virtualIbanQueryKeys.all, "detail", id],
    balance: (id) => [...virtualIbanQueryKeys.all, "balance", id],
}

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const asArray = (value) => {
    const unwrapped = unwrap(value)

    if (Array.isArray(unwrapped)) return unwrapped
    if (Array.isArray(unwrapped?.data)) return unwrapped.data
    if (Array.isArray(unwrapped?.ibans)) return unwrapped.ibans
    if (Array.isArray(unwrapped?.virtualIbans)) return unwrapped.virtualIbans
    if (Array.isArray(unwrapped?.items)) return unwrapped.items
    if (Array.isArray(unwrapped?.results)) return unwrapped.results

    return []
}

export const useVirtualIbans = () =>
    useQuery({
        queryKey: virtualIbanQueryKeys.list(),
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: "/api/virtual-iban",
                method: "GET",
                isDecrypted: true,
            })

            console.log(res, "res in useVirtualIbans")
            return res?.data || []
        },
    })

export const useVirtualIbanDetails = (ibanId) =>
    useQuery({
        queryKey: virtualIbanQueryKeys.detail(ibanId),
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/virtual-iban/${ibanId}`,
                method: "GET",
                isDecrypted: false,
            })
            return unwrap(res)
        },
        enabled: !!ibanId,
    })

export const useSyncVirtualIbanBalance = (ibanId) =>
    useQuery({
        queryKey: virtualIbanQueryKeys.balance(ibanId),
        queryFn: async () => {
            const res = await apiWrapper({
                endpoint: `/api/virtual-iban/balance/${ibanId}`,
                method: "GET",
                isDecrypted: false,
            })
            return unwrap(res)
        },
        enabled: !!ibanId,
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
                isDecrypted: false,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.list() })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.detail(variables?.iban_id) })
            queryClient.invalidateQueries({ queryKey: virtualIbanQueryKeys.balance(variables?.iban_id) })
        },
    })
}
