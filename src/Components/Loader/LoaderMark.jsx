const LoaderMark = ({ cover = false, page = false, ...props }) => (
  <svg
    className={page ? "ip-mark ip-mark-page" : "ip-mark"}
    viewBox="0 0 1920 1080"
    preserveAspectRatio={cover ? "xMidYMid slice" : "xMidYMid meet"}
    {...props}
  >
    <path className="ip-mark-square" d="M815 486h156v155H815z" />
    <path className="ip-mark-lower" d="M815 641h156v155z" />
    <path className="ip-mark-upper" d="M815 331h156v155z" />
    <path className="ip-mark-round" d="M971 331a155 155 0 0 1 0 310z" />
  </svg>
);

export default LoaderMark;
