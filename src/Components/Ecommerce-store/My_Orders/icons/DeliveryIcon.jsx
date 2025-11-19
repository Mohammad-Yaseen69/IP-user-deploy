const DeliveryIcon = () => {
    return (
        <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.6 }}
        >
            <g transform="translate(10, 30)">
                <rect
                    x="0"
                    y="20"
                    width="50"
                    height="30"
                    rx="4"
                    fill="#D0D0D0"
                    stroke="#B0B0B0"
                    strokeWidth="2"
                />
                <rect
                    x="50"
                    y="25"
                    width="25"
                    height="25"
                    rx="4"
                    fill="#C0C0C0"
                    stroke="#A0A0A0"
                    strokeWidth="2"
                />
                <rect
                    x="52"
                    y="28"
                    width="18"
                    height="15"
                    rx="2"
                    fill="#E8E8E8"
                    stroke="#B0B0B0"
                    strokeWidth="1"
                />
                <circle cx="12" cy="55" r="8" fill="#888" stroke="#666" strokeWidth="2" />
                <circle cx="12" cy="55" r="4" fill="#AAA" />
                <circle cx="45" cy="55" r="8" fill="#888" stroke="#666" strokeWidth="2" />
                <circle cx="45" cy="55" r="4" fill="#AAA" />
                <circle cx="65" cy="55" r="8" fill="#888" stroke="#666" strokeWidth="2" />
                <circle cx="65" cy="55" r="4" fill="#AAA" />
            </g>
        </svg>
    );
};

export default DeliveryIcon;

