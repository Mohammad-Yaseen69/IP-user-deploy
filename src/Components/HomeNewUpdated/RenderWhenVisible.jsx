import { useEffect, useRef, useState } from "react";

const RenderWhenVisible = ({ children, minHeight = 0, rootMargin = "200px" }) => {
  const placeholderRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (isVisible) return undefined;
    const node = placeholderRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (isVisible) return children;
  return <div ref={placeholderRef} style={{ minHeight }} aria-hidden="true" />;
};

export default RenderWhenVisible;
