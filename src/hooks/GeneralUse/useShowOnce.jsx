import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";

export const useShowOnce = (name) => {
  const { userDetails } = useContext(UserContext);
  const userId = userDetails?._id;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const storageKey = `seen_${name}_${userId}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "true");
    setIsOpen(true);
  }, [name, userId]);

  return [isOpen, setIsOpen];
};
