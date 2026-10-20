import { useEffect } from "react";
import { Navigate, useParams } from "react-router";
import { PAGES, pathFor, resolvePage } from "../../stateMachines/copyTrading";
import { resumePendingWork } from "./api";
import { USE_MOCK_API } from "./api/config";
import { PAGE_COMPONENTS } from "./pages";
import { useCopyTradingState } from "./state/store";
import PresenterControls from "./ui/PresenterControls";
import "./i18n/index";

let resumed = false;

/* Copy Trading portal (Figma WEB-01…WEB-14). Routes: /copy-trading and /copy-trading/:screen. */
const CopyTrading = () => {
  const { screen = PAGES.DASHBOARD } = useParams();
  const state = useCopyTradingState();

  useEffect(() => {
    if (resumed) return;
    resumed = true;
    resumePendingWork();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  const allowed = resolvePage(screen, state);
  if (allowed !== screen) return <Navigate to={pathFor(allowed)} replace />;

  const Page = PAGE_COMPONENTS[allowed];
  return (
    <>
      <Page />
      {USE_MOCK_API && <PresenterControls />}
    </>
  );
};

export default CopyTrading;
