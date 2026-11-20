import { createContext, useContext, useMemo, useState } from "react";

const BalanceVisibilityContext = createContext({
  hidden: false,
  toggleHidden: () => {},
});

export const BalanceVisibilityProvider = ({ children }) => {
  const [hidden, setHidden] = useState(false);

  const value = useMemo(
    () => ({ hidden, toggleHidden: () => setHidden((prev) => !prev) }),
    [hidden],
  );

  return (
    <BalanceVisibilityContext.Provider value={value}>{children}</BalanceVisibilityContext.Provider>
  );
};

export const useBalanceVisibility = () => useContext(BalanceVisibilityContext);
