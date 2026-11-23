import { useContext } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { UserContext } from "../../Context/UserContext";
import { useDebounce } from "../useDebounce/useDebounce";
import { useInfiniteScroll } from "../useInfiniteScroll";

export const BENEFICIARIES_PAGE_KEY = ["beneficiaries", "page"];

export const useBeneficiariesPage = ({ limit = 20, search = "", type = "all", sort }) => {
  const { userDetails } = useContext(UserContext);
  const accountId = userDetails?._id;
  const debouncedSearch = useDebounce(search.trim(), 400);

  const query = useInfiniteQuery({
    queryKey: [
      ...BENEFICIARIES_PAGE_KEY,
      accountId,
      { limit, search: debouncedSearch, type, sort },
    ],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: pageParam, limit, type, sort });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return apiWrapper({
        endpoint: `/api/beneficiary/get-user-beneficiaries/${accountId}?${params.toString()}`,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage?.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!accountId,
  });

  const loaderRef = useInfiniteScroll({
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetching,
    fetchNextPage: query.fetchNextPage,
  });

  return {
    ...query,
    loaderRef,
    beneficiaries: query.data?.pages.flatMap((p) => p?.beneficiaryList || []) || [],
    total: query.data?.pages[0]?.pagination?.total || 0,
  };
};

export const useInvalidateBeneficiaryPages = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: BENEFICIARIES_PAGE_KEY });
};
