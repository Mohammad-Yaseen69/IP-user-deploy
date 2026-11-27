import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const flag = vi.hoisted(() => ({ on: true }));

vi.mock("../../utils/Functions/paytently", () => ({
  get usePaytently() {
    return flag.on;
  },
}));
vi.mock("../../utils/Functions/apiWrapper", () => ({
  apiWrapper: vi.fn(() => Promise.resolve({ data: ["card"] })),
}));
vi.mock("../../Context/UserContext", async () => {
  const { createContext } = await import("react");
  return { UserContext: createContext({}) };
});
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (s) => s }) }));
vi.mock("../../Components/CardMaintenanceModal", () => ({
  default: ({ isOpen }) => (isOpen ? <div>card-maintenance</div> : null),
}));

import { UserContext } from "../../Context/UserContext";
import Channels from "../../Components/AddFunds/WalletFundsFlow/Channels";

describe("VITE_PAYTENTLY_ENABLED", () => {
  afterEach(() => vi.unstubAllEnvs());

  const load = async () => {
    const actual = await vi.importActual("../../utils/Functions/paytently");
    return actual.usePaytently;
  };

  it.each([
    [undefined, true],
    ["true", true],
    ["false", false],
  ])("value %s gives usePaytently=%s", async (value, expected) => {
    vi.resetModules();
    if (value !== undefined) vi.stubEnv("VITE_PAYTENTLY_ENABLED", value);
    expect(await load()).toBe(expected);
  });
});

describe("Add funds card channel", () => {
  const userDetails = {
    _id: "u1",
    country_iso_code: "PK",
    level: { topup_channel: { card_payment: true } },
  };

  const renderChannels = (setChannel) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <UserContext.Provider value={{ userDetails }}>
          <Channels setChannel={setChannel} channel={null} />
        </UserContext.Provider>
      </QueryClientProvider>,
    );

  beforeEach(() => vi.spyOn(console, "log").mockImplementation(() => {}));

  it("selects card when Paytently is on", async () => {
    flag.on = true;
    const setChannel = vi.fn();
    renderChannels(setChannel);
    fireEvent.click(await screen.findByText("Payment Card"));
    expect(setChannel).toHaveBeenCalledWith(expect.objectContaining({ value: "card" }));
    expect(screen.queryByText("card-maintenance")).toBeNull();
  });

  it("shows maintenance when Paytently is off", async () => {
    flag.on = false;
    const setChannel = vi.fn();
    renderChannels(setChannel);
    fireEvent.click(await screen.findByText("Payment Card"));
    await waitFor(() => expect(screen.getByText("card-maintenance")).toBeInTheDocument());
    expect(setChannel).not.toHaveBeenCalled();
  });
});
