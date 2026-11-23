import { useContext } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { UserContext } from "../../Context/UserContext";
import { useDebounce } from "../useDebounce/useDebounce";

export const BENEFICIARIES_PAGE_KEY = ["beneficiaries", "page"];

export const useBeneficiariesPage = ({ page, limit = 20, search = "", type = "all", sort }) => {
  const { userDetails } = useContext(UserContext);
  const accountId = userDetails?._id;
  const debouncedSearch = useDebounce(search.trim(), 400);

  const query = useQuery({
    queryKey: [
      ...BENEFICIARIES_PAGE_KEY,
      accountId,
      { page, limit, search: debouncedSearch, type, sort },
    ],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit, type, sort });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiWrapper({
        endpoint: `/api/beneficiary/get-user-beneficiaries/${accountId}?${params.toString()}`,
      });
    },
    enabled: !!accountId,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    beneficiaries: query.data?.beneficiaryList || [],
    totalPages: query.data?.pagination?.totalPages || 0,
    total: query.data?.pagination?.total || 0,
  };
};

export const useInvalidateBeneficiaryPages = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: BENEFICIARIES_PAGE_KEY });
};
