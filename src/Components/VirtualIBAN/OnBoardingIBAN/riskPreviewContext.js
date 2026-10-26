import { createContext, useContext } from "react";

export const RiskPreviewContext = createContext({ data: null, isFetching: false });

export const useRiskPreviewContext = () => useContext(RiskPreviewContext);
