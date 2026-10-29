import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const useCopyToClipboard = (t) => {
  const [isCopied, setIsCopied] = useState(null);
  const timerRef = useRef(null);

  const handleCopy = useCallback(
    async (val, type) => {
      try {
        if (!val) return;

        await navigator.clipboard.writeText(String(val));

        setIsCopied(type);

        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          setIsCopied(null);
          timerRef.current = null;
        }, 3000);
      } catch {
        toast.error(t("Failed to copy"));
      }
    },
    [t],
  );

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { handleCopy, isCopied };
};

export default useCopyToClipboard;
