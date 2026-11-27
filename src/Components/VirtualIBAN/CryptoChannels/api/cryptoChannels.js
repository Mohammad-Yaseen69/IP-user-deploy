import { apiWrapper } from "../../../../utils/Functions/apiWrapper";

/**
 * Add a crypto receiving channel to a virtual IBAN. The backend provisions
 * every network the asset supports; deposits on any of them are detected,
 * converted and credited to the vIBAN's `displayCurrency` balance.
 */
export const createCryptoChannel = ({
  virtualIbanId,
  payCurrency,
  displayCurrency,
  idempotencyKey,
}) =>
  apiWrapper({
    endpoint: "/api/virtual-iban/channel",
    method: "POST",
    payload: { virtualIbanId, payCurrency, displayCurrency },
    isEncrypted: true,
    isDecrypted: true,
    idempotencyKey,
  });

/** All crypto channels already added to a virtual IBAN. */
export const getCryptoChannels = (virtualIbanId) =>
  apiWrapper({
    endpoint: `/api/virtual-iban/channel/${virtualIbanId}`,
    method: "GET",
    isDecrypted: true,
  });

/** Flatten a channel's primary address + its alternatives into a network list. */
export const getChannelNetworks = (channel) => {
  if (!channel) return [];

  return [
    {
      network: channel.network || "Primary",
      protocol: channel.protocol || "",
      address: channel.address || "",
      isPrimary: true,
    },
    ...(Array.isArray(channel.alternatives)
      ? channel.alternatives.map((alt) => ({
          network: alt.network || "",
          protocol: alt.protocol || "",
          address: alt.address || "",
          isPrimary: false,
        }))
      : []),
  ];
};
