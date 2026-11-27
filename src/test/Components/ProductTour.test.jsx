import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProductTour from "../../Components/ProductTour";
import TourButton from "../../Components/ProductTour/TourButton";
import { startProductTour, TOUR_SEEN_KEY } from "../../Components/ProductTour/start";
import { tourTabs } from "../../Components/ProductTour/tabs";
import { UserContext } from "../../Context/UserContext";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: "en" } }),
}));

vi.mock("axios", () => ({
  default: {
    defaults: {},
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

const pages = vi.hoisted(() => {
  let open;
  const loaded = new Promise((resolve) => (open = resolve));
  return { loaded, open: () => open() };
});
vi.mock("../../Components/ProductTour/pageChunks", () => ({
  PAGE_CHUNKS: { "/dashboard/default": [() => pages.loaded] },
}));

const individual = { _id: "u1", account_type: "individual" };

const titles = (userDetails, can = () => true) =>
  tourTabs(userDetails, can).map((tab) => tab.title);

describe("tourTabs", () => {
  it("leaves business-only and third-party tabs out for an individual", () => {
    const tabs = titles({ account_type: "individual" });
    expect(tabs[0]).toBe("Dashboard");
    expect(tabs).toContain("My Wallets");
    expect(tabs).not.toContain("Delegate Access");
    expect(tabs).not.toContain("Activity Feed");
    expect(tabs).not.toContain("Third-Party senders");
    expect(tabs).not.toContain("Logout");
  });

  it("shows a business with third-party sending every tab", () => {
    const tabs = titles({ account_type: "business", isThirdPartyAllowed: true });
    expect(tabs).toEqual(
      expect.arrayContaining(["Delegate Access", "Activity Feed", "Third-Party senders"]),
    );
  });

  it("drops tabs the agent has no permission for", () => {
    const tabs = titles({ account_type: "business" }, (key) => key !== "wallet.view");
    expect(tabs).not.toContain("My Wallets");
    expect(tabs).not.toContain("Crypto Hub");
    expect(tabs).toContain("Payments");
  });

  it("gives each tab its page route", () => {
    const dashboard = tourTabs(individual, () => true)[0];
    expect(dashboard.route).toBe("/dashboard/default");
  });
});

describe("ProductTour", () => {
  afterEach(() => {
    cleanup();
    document.querySelectorAll(".driver-popover, .driver-overlay").forEach((el) => el.remove());
    vi.clearAllMocks();
  });

  let path;
  const Path = () => {
    path = useLocation().pathname;
    return null;
  };

  const renderTour = (children) =>
    render(
      <UserContext.Provider value={{ userDetails: individual }}>
        <MemoryRouter initialEntries={["/settings"]}>
          <ProductTour />
          <Path />
          {children}
        </MemoryRouter>
      </UserContext.Provider>,
    );

  it("loads the pages, shows the language selector, then walks the menu tab by tab", async () => {
    const user = userEvent.setup();
    renderTour(
      <>
        <div data-tour="language" />
        <button type="button" data-tour="assistant" />
      </>,
    );

    act(() => startProductTour());
    expect(await screen.findByText("Welcome to InstaPay")).toBeInTheDocument();
    expect(localStorage.setItem).toHaveBeenCalledWith(TOUR_SEEN_KEY, '["u1"]');
    const stepCount = tourTabs(individual, () => true).length + 4;
    expect(screen.getByText(`1 / ${stepCount}`)).toBeVisible();

    expect(screen.getByRole("button", { name: "Loading pages..." })).toHaveClass(
      "driver-popover-btn-disabled",
    );
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Welcome to InstaPay")).toBeInTheDocument();

    await act(async () => pages.open());
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByText("Change language")).toBeInTheDocument();
    expect(path).toBe("/settings");

    await user.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(path).toBe("/dashboard/default"));
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(path).toBe("/analytics"));

    await user.click(screen.getByRole("button", { name: /Back/ }));
    await waitFor(() => expect(path).toBe("/dashboard/default"));

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Dashboard")).not.toBeInTheDocument());
  });

  it("only shows the tour button where the tour is mounted", () => {
    const { unmount } = render(<TourButton />);
    expect(screen.queryByRole("button", { name: "Take a tour" })).not.toBeInTheDocument();
    unmount();

    renderTour(<TourButton />);
    expect(screen.getByRole("button", { name: "Take a tour" })).toBeInTheDocument();
  });

  it("starts the tour without the click reaching the dashboard's profile-completion handler", async () => {
    const user = userEvent.setup();
    const pageClick = vi.fn();
    renderTour(
      <div onClick={pageClick}>
        <TourButton />
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Take a tour" }));

    expect(await screen.findByText("Welcome to InstaPay")).toBeInTheDocument();
    expect(pageClick).not.toHaveBeenCalled();
  });
});
