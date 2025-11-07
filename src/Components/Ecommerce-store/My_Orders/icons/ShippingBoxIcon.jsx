const ShippingBoxIcon = () => {
    return (
        <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.6 }}
        >
            <g transform="translate(20, 40)">
                <path
                    d="M40 0 L80 20 L40 40 L0 20 Z"
                    fill="#D4A574"
                    stroke="#C49564"
                    strokeWidth="2"
                />
                <path
                    d="M80 20 L80 60 L40 80 L40 40 Z"
                    fill="#B89564"
                    stroke="#A88554"
                    strokeWidth="2"
                />
                <path
                    d="M0 20 L40 40 L40 80 L0 60 Z"
                    fill="#E4B584"
                    stroke="#D4A574"
                    strokeWidth="2"
                />
                <rect
                    x="15"
                    y="50"
                    width="30"
                    height="20"
                    rx="2"
                    fill="#F5E6D3"
                    stroke="#D4A574"
                    strokeWidth="1.5"
                />
                <line
                    x1="20"
                    y1="57"
                    x2="40"
                    y2="57"
                    stroke="#C49564"
                    strokeWidth="1"
                />
                <line
                    x1="20"
                    y1="63"
                    x2="35"
                    y2="63"
                    stroke="#C49564"
                    strokeWidth="1"
                />
            </g>
        </svg>
    );
};

export default ShippingBoxIcon;

