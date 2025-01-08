import React from 'react'

const IndividualSVG = ({ size, color, isActive }) => {
  return (
    isActive
      ?
      <svg width={size} height={size} viewBox="0 0 185 184" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_3813_7885)">
          <rect x="22" y="18" width="140.916" height="140.916" rx="22.5466" fill="white" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M108.877 69.8387C108.877 79.0457 101.413 86.5095 92.2059 86.5095C82.9989 86.5095 75.5352 79.0457 75.5352 69.8387C75.5352 60.6317 82.9989 53.168 92.2059 53.168C101.413 53.168 108.877 60.6317 108.877 69.8387ZM99.4786 90.3424C99.8157 90.2027 100.177 90.1308 100.542 90.1309C105.698 90.1371 110.642 92.1882 114.288 95.8343C117.934 99.4804 119.985 104.424 119.991 109.58V115.137C119.989 117.347 119.11 119.466 117.547 121.028C115.984 122.591 113.866 123.47 111.656 123.472H72.7572C70.5473 123.47 68.4286 122.591 66.8659 121.028C65.3033 119.466 64.4243 117.347 64.4219 115.137V109.58C64.4279 104.424 66.4789 99.4802 70.1251 95.8341C73.7712 92.1879 78.7147 90.1369 83.8711 90.1309C84.6079 90.131 85.3145 90.4238 85.8355 90.9449L88.2777 93.3869C89.3208 94.4269 90.7337 95.0109 92.2066 95.0109C93.6795 95.0109 95.0924 94.4269 96.1355 93.3869L98.5775 90.9449C98.8353 90.6868 99.1416 90.4821 99.4786 90.3424Z" fill="#5926F0" />
          <rect x="23" y="19" width="138.916" height="138.916" rx="21.5466" stroke="#5926F0" stroke-width="2" />
        </g>
        <defs>
          <filter id="filter0_d_3813_7885" x="0.862537" y="0.101995" width="183.189" height="183.191" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="3.23946" />
            <feGaussianBlur stdDeviation="10.5687" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.34902 0 0 0 0 0.14902 0 0 0 0 0.941176 0 0 0 0.09 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3813_7885" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3813_7885" result="shape" />
          </filter>
        </defs>
      </svg>
      :
      <svg width={size} height={size} viewBox="0 0 185 184" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_3813_7225)">
          <rect x="22" y="18" width="140.916" height="140.916" rx="22.5466" fill="white" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M108.877 69.8387C108.877 79.0457 101.413 86.5095 92.2059 86.5095C82.9989 86.5095 75.5352 79.0457 75.5352 69.8387C75.5352 60.6317 82.9989 53.168 92.2059 53.168C101.413 53.168 108.877 60.6317 108.877 69.8387ZM99.4786 90.3424C99.8157 90.2027 100.177 90.1308 100.542 90.1309C105.698 90.1371 110.642 92.1882 114.288 95.8343C117.934 99.4804 119.985 104.424 119.991 109.58V115.137C119.989 117.347 119.11 119.466 117.547 121.028C115.984 122.591 113.866 123.47 111.656 123.472H72.7572C70.5473 123.47 68.4286 122.591 66.8659 121.028C65.3033 119.466 64.4243 117.347 64.4219 115.137V109.58C64.4279 104.424 66.4789 99.4802 70.1251 95.8341C73.7712 92.1879 78.7147 90.1369 83.8711 90.1309C84.6079 90.131 85.3145 90.4238 85.8355 90.9449L88.2777 93.3869C89.3208 94.4269 90.7337 95.0109 92.2066 95.0109C93.6795 95.0109 95.0924 94.4269 96.1355 93.3869L98.5775 90.9449C98.8353 90.6868 99.1416 90.4821 99.4786 90.3424Z" fill={color} />
        </g>
        <defs>
          <filter id="filter0_d_3813_7225" x="0.862537" y="0.101995" width="183.189" height="183.191" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="3.23946" />
            <feGaussianBlur stdDeviation="10.5687" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.34902 0 0 0 0 0.14902 0 0 0 0 0.941176 0 0 0 0.09 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3813_7225" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3813_7225" result="shape" />
          </filter>
        </defs>
      </svg>
  )
}

export default IndividualSVG