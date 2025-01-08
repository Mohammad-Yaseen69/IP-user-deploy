import React from 'react'

const InstaIcon = ({ size }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_3813_7335)">
                <rect x="7" y="3" width="54" height="54" rx="16" fill="#FCFCFC" />
                <path d="M41 16H27C23.1503 16 20 19.149 20 23V37C20 40.8497 23.1503 44 27 44H41C44.8497 44 48 40.8497 48 37V23C48 19.149 44.8497 16 41 16ZM34 35.8331C30.7779 35.8331 28.1666 33.2207 28.1666 30C28.1666 26.7779 30.7779 24.1666 34 24.1666C37.2207 24.1666 39.8334 26.7779 39.8334 30C39.8334 33.2207 37.2207 35.8331 34 35.8331ZM41.5834 24.1666C40.616 24.1666 39.8334 23.3829 39.8334 22.4166C39.8334 21.4502 40.616 20.6666 41.5834 20.6666C42.5509 20.6666 43.3334 21.4502 43.3334 22.4166C43.3334 23.3829 42.5509 24.1666 41.5834 24.1666Z" fill="#5926F0" />
            </g>
            <defs>
                <filter id="filter0_d_3813_7335" x="0" y="0" width="68" height="68" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="3.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3813_7335" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3813_7335" result="shape" />
                </filter>
            </defs>
        </svg>
    )
}

export default InstaIcon