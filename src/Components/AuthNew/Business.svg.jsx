import React from "react";

const BusinessSVG = ({ size, color, isActive }) => {
  return isActive ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 184 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_3813_7799)">
        <rect
          x="21.9219"
          y="18"
          width="140.916"
          height="140.916"
          rx="22.5466"
          fill="white"
        />
        <path
          d="M78.1643 52.8244C72.4405 52.8244 67.2236 56.2062 64.8633 61.425L61.7345 68.3485C58.7179 70.9489 56.7422 74.8096 56.7422 79.1201C56.7422 86.9486 63.1667 93.3779 70.9889 93.3779C75.5143 93.3779 79.096 90.9164 81.7104 87.5884C84.3249 90.9156 87.8791 93.3779 92.404 93.3779C96.8873 93.3779 100.46 90.9679 103.077 87.6928C105.693 90.9725 109.284 93.3779 113.771 93.3779C121.593 93.3779 128.01 86.9486 128.01 79.1201C128.01 74.9047 126.089 71.1708 123.192 68.5781L119.681 60.8473C117.479 55.9802 112.615 52.8242 107.276 52.8242L78.1643 52.8244ZM81.7034 96.871C78.6539 98.9348 75.1717 100.503 70.9889 100.503C68.5228 100.503 66.1573 100.056 63.9455 99.2717V113.39C63.9455 119.251 68.7553 124.092 74.6115 124.092H81.6965V116.953C81.6965 111.092 86.541 106.272 92.3972 106.272C98.2534 106.272 103.063 111.092 103.063 116.953V124.092H110.225C116.081 124.092 120.891 119.251 120.891 113.39V99.244C118.656 100.047 116.267 100.503 113.771 100.503C109.607 100.503 106.132 98.9514 103.077 96.9059C100.031 98.9479 96.5645 100.503 92.4042 100.503C88.2234 100.503 84.7449 98.9343 81.7034 96.871Z"
          fill="#5926F0"
        />
        <rect
          x="22.9219"
          y="19"
          width="138.916"
          height="138.916"
          rx="21.5466"
          stroke="#5926F0"
          stroke-width="2"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_3813_7799"
          x="0.784412"
          y="0.101995"
          width="183.189"
          height="183.191"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3.23946" />
          <feGaussianBlur stdDeviation="10.5687" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.34902 0 0 0 0 0.14902 0 0 0 0 0.941176 0 0 0 0.09 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3813_7799"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3813_7799"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 184 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_3813_7231)">
        <rect
          x="21.9219"
          y="18"
          width="140.916"
          height="140.916"
          rx="22.5466"
          fill="white"
        />
        <path
          d="M78.1643 52.8244C72.4405 52.8244 67.2236 56.2062 64.8633 61.425L61.7345 68.3485C58.7179 70.9489 56.7422 74.8096 56.7422 79.1201C56.7422 86.9486 63.1667 93.3779 70.9889 93.3779C75.5143 93.3779 79.096 90.9164 81.7104 87.5884C84.3249 90.9156 87.8791 93.3779 92.404 93.3779C96.8873 93.3779 100.46 90.9679 103.077 87.6928C105.693 90.9725 109.284 93.3779 113.771 93.3779C121.593 93.3779 128.01 86.9486 128.01 79.1201C128.01 74.9047 126.089 71.1708 123.192 68.5781L119.681 60.8473C117.479 55.9802 112.615 52.8242 107.276 52.8242L78.1643 52.8244ZM81.7034 96.871C78.6539 98.9348 75.1717 100.503 70.9889 100.503C68.5228 100.503 66.1573 100.056 63.9455 99.2717V113.39C63.9455 119.251 68.7553 124.092 74.6115 124.092H81.6965V116.953C81.6965 111.092 86.541 106.272 92.3972 106.272C98.2534 106.272 103.063 111.092 103.063 116.953V124.092H110.225C116.081 124.092 120.891 119.251 120.891 113.39V99.244C118.656 100.047 116.267 100.503 113.771 100.503C109.607 100.503 106.132 98.9514 103.077 96.9059C100.031 98.9479 96.5645 100.503 92.4042 100.503C88.2234 100.503 84.7449 98.9343 81.7034 96.871Z"
          fill={color}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_3813_7231"
          x="0.784412"
          y="0.101995"
          width="183.189"
          height="183.191"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3.23946" />
          <feGaussianBlur stdDeviation="10.5687" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.34902 0 0 0 0 0.14902 0 0 0 0 0.941176 0 0 0 0.09 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3813_7231"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3813_7231"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default BusinessSVG;
