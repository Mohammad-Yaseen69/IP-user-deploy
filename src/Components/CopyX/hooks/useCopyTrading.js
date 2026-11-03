import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { pathFor } from "../../../stateMachines/copyTrading";
import { ensureRate, loadCatalog, setAllocation, setFundingWallet } from "../api";
import { allocationPresets } from "../state/selectors";
import { useCopyTradingState } from "../state/store";
import useInstaPayAccounts from "./useInstaPayAccounts";
import useReceivingAccounts from "./useReceivingAccounts";

const SUPPORT_URL = "https://wa.me/41783192428";

let catalogRequested = false;

/* Default funding wallet: the customer's default InstaPay wallet, else the one with the largest balance. */
const pickDefaultWallet = (wallets) =>
  wallets.find((wallet) => wallet.isDefault) ||
  [...wallets].sort((a, b) => b.balance - a.balance)[0] ||
  null;

/* Everything a page needs: journey state, navigation, and the customer's real InstaPay data. */
const useCopyTrading = () => {
  const state = useCopyTradingState();
  const navigate = useNavigate();
  const account = useInstaPayAccounts();
  const receiving = useReceivingAccounts();
  const { wallets } = account;

  useEffect(() => {
    if (catalogRequested && state.strategies.length) return;
    catalogRequested = true;
    loadCatalog().catch(() => {
      catalogRequested = false;
    });
  }, []);

  const fundingWallet = wallets.find((wallet) => wallet.id === state.draft.walletId) || null;

  /* Keep the draft pointed at a real wallet and its exchange rate. */
  useEffect(() => {
    if (!wallets.length || fundingWallet) return;
    const wallet = pickDefaultWallet(wallets);
    if (wallet) setFundingWallet(wallet);
  }, [wallets, fundingWallet]);

  useEffect(() => {
    if (state.draft.currency) ensureRate(state.draft.currency);
  }, [state.draft.currency]);

  /* Start a fresh draft at the middle preset once the wallet's rate is known. */
  const presets = allocationPresets(state);
  useEffect(() => {
    if (!state.draft.allocation && presets.length) setAllocation(presets[1]);
  }, [state.draft.allocation, presets.join()]);

  const go = useCallback((page) => navigate(pathFor(page)), [navigate]);
  const openSupport = useCallback(() => window.open(SUPPORT_URL, "_blank", "noopener"), []);

  return {
    state,
    go,
    navigate,
    openSupport,
    customer: {
      name: account.customerName,
      firstName: account.customerName.split(" ")[0],
      country: account.countryName,
    },
    iban: account.ibans.find((item) => item.active) || null,
    wallets,
    fundingWallet,
    receiving,
  };
};

export default useCopyTrading;
