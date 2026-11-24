import { useSyncExternalStore } from "react";
import { COPY_STATUS } from "../../../stateMachines/copyTrading";

const STORAGE_KEY = "copy-trading-journey-v4";
const CHANNEL_NAME = "copy-trading";

/*
 * Client copy of the server-side journey. With the mock API it is the source of truth; with the
 * real API every response is written here through the adapters, so screens read one shape either way.
 *
 * Strategies run in parallel with separate funds: everything that belongs to one strategy lives in
 * its own slot under `copies[strategyId]`. Screens read a view of the focused strategy
 * (`draft.strategyId`), so `state.copy`, `state.funding`, `state.broker` and `state.withdrawal`
 * always describe that one strategy, while `state.copies` holds all of them.
 */
const SLOT_KEYS = ["copy", "funding", "broker", "withdrawal", "withdrawDraft"];

export const emptySlot = () => ({
  copy: {
    status: COPY_STATUS.NONE,
    strategyId: null,
    mandateVersion: null,
    consentedAt: null,
    activatedAt: null,
    lastAckAt: null,
    capitalCents: 0,
    pending: null,
    lastAction: null,
  },
  funding: null,
  broker: null,
  withdrawDraft: { amountCents: 10000, mode: "gross", netAmount: 0 },
  withdrawal: null,
});

const EMPTY_SLOT = emptySlot();

export const createInitialState = () => ({
  v: 4,
  profile: { brokerLink: "not_linked", brokerAccountId: null },
  strategies: [],
  paymentMethods: [],
  /* walletId/currency: the real InstaPay wallet funding the allocation, which is entered in its currency. */
  draft: {
    strategyId: null,
    walletId: null,
    currency: null,
    allocation: 0,
    method: null,
    quote: null,
    amendment: false,
  },
  copies: {},
  activity: [],
  idempotency: {},
  /* units of each currency per 1 USD, filled from the InstaPay rate service */
  rates: { USD: 1 },
  resetAt: Date.now(),
});

const slotOf = (raw, id) => (id && raw.copies[id]) || EMPTY_SLOT;

const project = (raw, id = raw.draft.strategyId) => ({ ...raw, ...slotOf(raw, id) });

/* Splits a view back into the shared part and the slot of strategy `id` (written only when the updater changed it). */
const commit = (raw, id, next) => {
  const top = { ...next };
  SLOT_KEYS.forEach((key) => delete top[key]);
  const current = slotOf(raw, id);
  const changed = SLOT_KEYS.some((key) => next[key] !== current[key]);
  if (!id || !changed) return top;
  return {
    ...top,
    copies: { ...top.copies, [id]: Object.fromEntries(SLOT_KEYS.map((key) => [key, next[key]])) },
  };
};

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return parsed?.v === 4 ? { ...createInitialState(), ...parsed } : createInitialState();
  } catch {
    return createInitialState();
  }
};

let raw = read();
let view = project(raw);
const listeners = new Set();
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;

const emit = () => listeners.forEach((listener) => listener());

channel?.addEventListener("message", (event) => {
  if (!event.data?.state) return;
  raw = event.data.state;
  view = project(raw);
  emit();
});

const write = (next) => {
  raw = next;
  view = project(raw);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  } catch {
    /* storage blocked: this tab keeps working */
  }
  channel?.postMessage({ state: raw });
  emit();
};

/* The focused strategy's view. */
export const getState = () => view;

/* Updates the focused view; slot fields go back to the strategy that was focused when it was read. */
export const setState = (updater) => {
  const next = typeof updater === "function" ? updater(view) : updater;
  if (!next || next === view) return;
  write(commit(raw, raw.draft.strategyId, next));
};

/* A view of any strategy, used by work that keeps running after the customer looks elsewhere. */
export const getStateFor = (id) =>
  !id || id === raw.draft.strategyId
    ? view
    : { ...project(raw, id), draft: { ...raw.draft, strategyId: id } };

export const setStateFor = (id, updater) => {
  if (!id || id === raw.draft.strategyId) return setState(updater);
  const scoped = getStateFor(id);
  const next = updater(scoped);
  if (!next || next === scoped) return;
  write({ ...commit(raw, id, next), draft: raw.draft });
};

/* Whole-state replacement (presenter presets); takes the stored shape with `copies`. */
export const replaceState = (next) => write(next);

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useCopyTradingState = () => useSyncExternalStore(subscribe, getState);
