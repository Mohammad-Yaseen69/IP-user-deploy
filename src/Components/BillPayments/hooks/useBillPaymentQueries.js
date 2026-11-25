import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSavedBill,
  confirmBillPayment,
  deleteSavedBill,
  getRecentBillPayments,
  getSavedBills,
  updateSavedBill,
  getBillCountries,
  getBillPayment,
  getBillers,
  getBillProducts,
  getBillQuote,
  lookupBillStatements,
} from "../api/billPayments";

const ONE_HOUR = 60 * 60 * 1000;

export const billPaymentKeys = {
  countries: ["bill-payment", "countries"],
  billers: (countryAlpha3) => ["bill-payment", "billers", countryAlpha3],
  products: (params) => ["bill-payment", "products", params],
  payment: (referenceId) => ["bill-payment", "payment", referenceId],
  savedBills: ["bill-payment", "saved-bills"],
  recentPayments: ["bill-payment", "recent-payments"],
};

export const useBillCountries = () =>
  useQuery({
    queryKey: billPaymentKeys.countries,
    queryFn: getBillCountries,
    staleTime: ONE_HOUR,
  });

export const useBillers = (countryAlpha3) =>
  useQuery({
    queryKey: billPaymentKeys.billers(countryAlpha3),
    queryFn: () => getBillers(countryAlpha3),
    enabled: !!countryAlpha3,
    staleTime: ONE_HOUR,
  });

export const useBillProducts = ({ countryAlpha3, billerId, walletId }) =>
  useQuery({
    queryKey: billPaymentKeys.products({ countryAlpha3, billerId, walletId }),
    queryFn: () => getBillProducts({ countryAlpha3, billerId, walletId }),
    enabled: !!countryAlpha3 && !!billerId && !!walletId,
  });

export const useSavedBills = () =>
  useQuery({ queryKey: billPaymentKeys.savedBills, queryFn: getSavedBills });

export const useRecentBillPayments = () =>
  useQuery({ queryKey: billPaymentKeys.recentPayments, queryFn: getRecentBillPayments });

const useSavedBillMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: billPaymentKeys.savedBills }),
  });
};

export const useAddSavedBill = () => useSavedBillMutation(addSavedBill);
export const useUpdateSavedBill = () => useSavedBillMutation(updateSavedBill);
export const useDeleteSavedBill = () => useSavedBillMutation(deleteSavedBill);

export const useBillStatements = () => useMutation({ mutationFn: lookupBillStatements });

const PENDING_STATUS = "INITIATED";

export const useBillPaymentStatus = (referenceId) =>
  useQuery({
    queryKey: billPaymentKeys.payment(referenceId),
    queryFn: () => getBillPayment(referenceId),
    enabled: !!referenceId,
    refetchInterval: ({ state }) =>
      state.status !== "error" && (state.data?.status || PENDING_STATUS) === PENDING_STATUS
        ? 5000
        : false,
  });

export const useBillQuote = () => useMutation({ mutationFn: getBillQuote });

// One quote per wallet, so each wallet's total (fee included) is known before it can be picked.
export const useBillWalletQuotes = (params, walletIds, enabled) =>
  useQueries({
    queries: walletIds.map((walletId) => ({
      queryKey: ["bill-payment", "quote-preview", { ...params, walletId }],
      queryFn: () => getBillQuote({ ...params, walletId }),
      enabled,
      staleTime: 60 * 1000,
      retry: false,
    })),
  });

export const useBillIbanQuote = (params, ibanId, enabled) =>
  useQuery({
    queryKey: ["bill-payment", "quote-preview", { ...params, ibanId }],
    queryFn: () => getBillQuote({ ...params, ibanId }),
    enabled: enabled && !!ibanId,
    staleTime: 60 * 1000,
    retry: false,
  });

export const useConfirmBillPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmBillPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billPaymentKeys.savedBills });
      queryClient.invalidateQueries({ queryKey: billPaymentKeys.recentPayments });
    },
  });
};
