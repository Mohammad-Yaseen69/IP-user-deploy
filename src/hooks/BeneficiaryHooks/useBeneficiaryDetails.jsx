import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";

const detailsKey = (id) => ["beneficiaries", "details", id];

export const fetchBeneficiaryDetails = async (id) =>
  (await apiWrapper({ endpoint: `/api/beneficiary/get-details/${id}` }))?.beneficiaryData;

export const useBeneficiaryDetails = (id, { enabled = true } = {}) =>
  useQuery({
    queryKey: detailsKey(id),
    queryFn: () => fetchBeneficiaryDetails(id),
    enabled: !!id && enabled,
    gcTime: 0,
    retry: false,
  });

export const useInvalidateBeneficiaryDetails = () => {
  const queryClient = useQueryClient();
  return (id) => queryClient.invalidateQueries({ queryKey: detailsKey(id) });
};
