import LoaderMark from "../../Components/Loader/LoaderMark";

const Loader = () => (
  <div className="loader-wrapper" style={{ overflow: "hidden" }}>
    <LoaderMark page role="img" aria-label="Loader" />
  </div>
);

export default Loader;
