import { useCallback, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { hasPermission } from "../../utils/Functions/hasPermission";


export const usePermission = () => {
    const { userDetails, isAgentLogin, agentDetails } = useContext(UserContext)


    return useCallback((permission) => {
        if (!userDetails || userDetails?.account_type === "individual" || !isAgentLogin) {
            return true;
        }

        // const agentDetailsData = userDetails?.agentDetails

        if (!agentDetails) return true

        
        const isAllowed = hasPermission({
            permission,
            adminAllowed: agentDetails?.permissions || [],
            adminDenied: agentDetails?.deniedPermissions || [],
            roleAllowed: agentDetails?.role?.permissions || [],
            roleDenied: agentDetails?.role?.deniedPermissions || [],
        })

        return isAllowed
    }, [userDetails])
};