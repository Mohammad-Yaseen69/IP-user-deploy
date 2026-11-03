import { useEffect, useRef } from "react";

export const useInfiniteScroll = ({ hasNextPage, isFetching, fetchNextPage }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!hasNextPage || isFetching) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && fetchNextPage(),
      {
        threshold: 0.1,
      },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, fetchNextPage]);

  return ref;
};
