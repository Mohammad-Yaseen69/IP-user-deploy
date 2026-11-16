import React, { useEffect, useState } from "react";
import LoaderMark from "../../Components/Loader/LoaderMark";

const Loader = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 3000);
    return () => {
      clearTimeout(timeout);
    };
  }, [show]);

  return (
    <div className={`loader-wrapper ${!show ? "" : "d-none"}`} style={{ overflow: "hidden" }}>
      {/* <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"> </div>
      <div className="dot"></div> */}
      <LoaderMark page role="img" aria-label="Loader" />
    </div>
  );
};

export default Loader;
