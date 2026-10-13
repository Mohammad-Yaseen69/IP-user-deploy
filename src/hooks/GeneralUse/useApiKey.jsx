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
      const res = await axios.get(
        `${BASE}/api/userkey/get-apikey/${accountId}`,
        {
          headers,
        },
      );
      return decryptData(res.data.data);
    },
    retry: 0,
    retryOnMount: false,
  });
};

export const useCreateUserKey = ({ headers, accountId }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ webhook_url, account, features }) => {
      const payload = { webhook_url, account, features };
      const data = encryptData(payload);
      const res = await axios.post(
        `${BASE}/api/userkey/create-user-key`,
        { data },
        { headers },
      );
      return decryptData(res.data.data);
    },
    onSuccess: (data, variables) => {
      const acc = variables?.account || accountId;
      if (acc) {
        qc.setQueryData(["userApiKey", acc], data);
      }
    },
  });
};

export const useRegenerateUserKey = ({ headers, accountId }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${BASE}/api/userkey/regenerate-user-key`,
        {},
        { headers },
      );
      return decryptData(res.data.data);
    },
    onSuccess: (data) => {
      if (accountId) {
        qc.setQueryData(["userApiKey", accountId], (prev) => {
          const prevKey = prev?.userKey || {};
          return {
            ...prev,
            userKey: { ...prevKey, api_key: data?.userKey?.api_key },
          };
        });
      }
    },
  });
};

export const useUpdateWebhookUrl = ({ headers, accountId }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ webhook_url }) => {
      const data = encryptData({ webhook_url });
      const res = await axios.put(
        `${BASE}/api/userkey/update-webhook-url`,
        { data },
        { headers },
      );
      return decryptData(res.data.data);
    },
    onSuccess: (data) => {
      if (accountId) {
        qc.setQueryData(["userApiKey", accountId], (prev) => {
          const prevKey = prev?.userKey || {};
          return {
            ...prev,
            userKey: { ...prevKey, webhook_url: data?.userKey?.webhook_url },
          };
        });
      }
    },
  });
};
export const useUpdateFeatures = ({ headers, accountId }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ features }) => {
      const data = encryptData({ features });
      const res = await axios.put(
        `${BASE}/api/userkey/update-features`,
        { data },
        { headers },
      );
      return decryptData(res.data.data);
    },
    onSuccess: (data) => {
      if (accountId) {
        qc.setQueryData(["userApiKey", accountId], (prev) => {
          const prevKey = prev?.userKey || {};
          return {
            ...prev,
            userKey: { ...prevKey, features: data?.userKey?.features },
          };
        });
      }
    },
  });
};

export const useDeleteUserKey = ({ headers, accountId }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`${BASE}/api/userkey/delete-user-key`, {
        headers,
      });
      return decryptData(res.data.data);
    },
    onSuccess: () => {
      if (accountId) {
        qc.setQueryData(["userApiKey", accountId], null);
      }
    },
  });
};

export const useUpdateUserKeyStatus = ({ headers, accountId }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, account }) => {
      const data = encryptData({ status, account });
      const res = await axios.post(
        `${BASE}/api/userkey/update-user-key-status`,
        { data },
        { headers },
      );
      return decryptData(res.data.data);
    },
    onSuccess: (resp, variables) => {
      const acc = variables?.account || accountId;
      if (acc) {
        qc.setQueryData(["userApiKey", acc], (prev) => {
          const prevKey = prev?.userKey || {};
          return {
            ...prev,
            userKey: { ...prevKey, status: resp?.userKey?.status },
          };
        });
      }
    },
  });
};
