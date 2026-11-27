export const FlagSvg = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="9"
      viewBox="0 0 12 9"
      fill="none"
      {...props}
    >
      <rect width="12" height="8.57143" rx="2" fill="white" />
      <mask
        id="mask0"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="12"
        height="9"
      >
        <rect width="12" height="8.57143" rx="2" fill="white" />
      </mask>
      <g mask="url(#mask0)">
        <rect width="12" height="8.57143" fill="#FF0000" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.14284 5.14287H3.76189C3.5778 5.14287 3.42856 4.99363 3.42856 4.80953V3.76191C3.42856 3.57782 3.5778 3.42858 3.76189 3.42858H5.14284V2.04763C5.14284 1.86353 5.29208 1.71429 5.47618 1.71429H6.5238C6.70789 1.71429 6.85713 1.86353 6.85713 2.04763V3.42858H8.23808C8.42218 3.42858 8.57142 3.57782 8.57142 3.76191V4.80953C8.57142 4.99363 8.42218 5.14287 8.23808 5.14287H6.85713V6.52382C6.85713 6.70791 6.70789 6.85715 6.5238 6.85715H5.47618C5.29208 6.85715 5.14284 6.70791 5.14284 6.52382V5.14287Z"
          fill="white"
        />
      </g>
    </svg>
  );
};
