import { useContext } from "react";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../../Context/UserContext";

const useAvailableMethods = () => {
  const { userDetails } = useContext(UserContext);

  const { data: methods, isLoading } = useQuery({
    queryKey: ["AvailableMethods"],
    queryFn: () =>
      apiWrapper({
        endpoint: `/api/payment/get-available-methods/${userDetails?._id}/${userDetails?.country_iso_code}`,
      }).then((dec) => dec?.data),
    retry: 3,
  });
  return { methods, isLoading };
};

export default useAvailableMethods;
