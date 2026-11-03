import React, { useEffect, useState } from "react";

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
    <div className={`loader-wrapper ${!show ? "" : "d-none"}`}>
      {/* <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"> </div>
      <div className="dot"></div> */}
      <div style={{ height: "500px", width: "500px" }}>
        <img
          src={"/load.gif"}
          alt="Loader"
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

export default Loader;
