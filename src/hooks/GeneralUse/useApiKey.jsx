import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { encryptData } from "../../Helper/EssentilaMethods/Encryption";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";

const BASE = import.meta.env.VITE_IP_DEV_API;

export const useGetApiKey = ({ accountId, headers, enabled = true }) => {
    return useQuery({
        queryKey: ["userApiKey", accountId],
        enabled: !!accountId && enabled,
        queryFn: async () => {
            const res = await axios.get(`${BASE}/api/userkey/get-apikey/${accountId}`, {
                headers
            });
            return decryptData(res.data.data);
        }
    });
};

export const useCreateUserKey = ({ headers }) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ webhook_url, account }) => {
            const payload = { webhook_url, account };
            const data = encryptData(payload);
            const res = await axios.post(`${BASE}/api/userkey/create-user-key`, { data }, { headers });
            return decryptData(res.data.data);
        },
        onSuccess: (data, variables) => {
            if (variables?.account) {
                qc.invalidateQueries({ queryKey: ["userApiKey", variables.account] });
            }
        }
    });
};

export const useRegenerateUserKey = ({ headers, accountId }) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await axios.post(`${BASE}/api/userkey/regenerate-user-key`, {}, { headers });
            return decryptData(res.data.data);
        },
        onSuccess: () => {
            if (accountId) {
                qc.invalidateQueries({ queryKey: ["userApiKey", accountId] });
            }
        }
    });
};

