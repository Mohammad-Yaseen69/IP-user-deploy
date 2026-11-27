import { useSyncExternalStore } from "react";

export const TOUR_START_EVENT = "instapay:product-tour";
export const TOUR_SEEN_KEY = "ip_product_tour_seen";

export const startProductTour = () => window.dispatchEvent(new Event(TOUR_START_EVENT));

let tourAvailable = false;
const listeners = new Set();

export const setTourAvailable = (value) => {
  tourAvailable = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTourAvailable = () => useSyncExternalStore(subscribe, () => tourAvailable);
