const isUsableInstaWallet = (wallet) =>
  wallet?.wallet_type === "insta" &&
  !wallet?.blocked &&
  !wallet?.admin_blocked &&
  wallet?.status?.toLowerCase() === "active";

export const getDefaultSenderWallet = (userWallets = []) =>
  userWallets.find(isUsableInstaWallet) ?? userWallets.find((wallet) => wallet?.default);
