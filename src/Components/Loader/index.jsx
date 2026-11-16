import LoaderMark from "./LoaderMark";

const InstaPayLoader = ({ opacity = 1, fallback = false, transparent, fullHeight = false }) => {
  if (fallback) {
    return (
      <div
        style={{
          height: fullHeight ? "100%" : "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: transparent ? "transparent" : "#fff",
          opacity,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <LoaderMark page />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        opacity,
        background: "transparent",
      }}
    >
      <LoaderMark
        cover
        role="img"
        aria-label="Loader"
        style={{ height: "100%", width: "100%", opacity }}
      />
    </div>
  );
};

export default InstaPayLoader;

// console.log(load)
// return fallback ? (<div
//     style={{
//         height: "100vh",
//         width: "100vw",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: transparent ? "transparent" : "#fff",
//         opacity,
//         overflow: "hidden",
//     }}
//     aria-hidden="true"
// >
//     <img
//         src={load}
//         alt="loading"
//         style={{
//             height: "70%",
//             width: "70%",
//             objectFit: "contain",
//             // transform: "scale(4)"
//         }}
//         decoding="async"
//         rel='preload'
//         fetchpriority="high"
//     />
// </div>) :
//     (
//         <img src={load} alt="Loader" style={{ height: "100%", width: "100%", objectFit: "cover", mixBlendMode: "darken", opacity }} />
//     )
