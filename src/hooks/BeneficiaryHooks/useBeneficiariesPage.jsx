import { useContext, useEffect, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { UserContext } from "../../Context/UserContext";
import { useDebounce } from "../useDebounce/useDebounce";
import { useInfiniteScroll } from "../useInfiniteScroll";

export const BENEFICIARIES_PAGE_KEY = ["beneficiaries", "page"];

// `filters` are the payment-picker filters the API understands: channel, country, payer, beneficiary_type, id.
export const useBeneficiariesPage = ({
  limit = 10,
  search = "",
  type = "all",
  sort,
  filters = {},
  enabled = true,
}) => {
  const { userDetails } = useContext(UserContext);
  const accountId = userDetails?._id;
  const debouncedSearch = useDebounce(search.trim(), 400);

  const query = useInfiniteQuery({
    queryKey: [
      ...BENEFICIARIES_PAGE_KEY,
      accountId,
      { limit, search: debouncedSearch, type, sort, filters },
    ],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: pageParam, limit, type, sort });
      if (debouncedSearch) params.set("search", debouncedSearch);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") params.set(key, value);
      });
      return apiWrapper({
        endpoint: `/api/beneficiary/get-user-beneficiaries/${accountId}?${params.toString()}`,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage?.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!accountId && enabled,
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

export const useBeneficiaryPicker = ({ filters, enabled = true, limit = 20 }) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const page = useBeneficiariesPage({
    limit,
    search: query,
    type: typeFilter,
    sort: sortBy,
    filters,
    enabled,
  });

  return {
    ...page,
    server: {
      query,
      setQuery,
      typeFilter,
      setTypeFilter,
      sortBy,
      setSortBy,
      hasNextPage: page.hasNextPage,
      loaderRef: page.loaderRef,
      isLoading: page.isLoading,
    },
  };
};

export const useAllBeneficiaries = ({ filters, enabled = true }) => {
  const page = useBeneficiariesPage({ limit: 100, sort: "date_desc", filters, enabled });
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = page;

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...page, isComplete: page.isFetched && !hasNextPage };
};

export const fetchBeneficiaryMatch = async (accountId, filters, id) => {
  const params = new URLSearchParams({ page: 1, limit: 1, id });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  });
  const res = await apiWrapper({
    endpoint: `/api/beneficiary/get-user-beneficiaries/${accountId}?${params.toString()}`,
  });
  return res?.beneficiaryList?.[0] ?? null;
};
