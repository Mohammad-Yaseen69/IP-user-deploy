const GrowthIcon = () => {
    return (
        <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.6 }}
        >
            <g transform="translate(10, 20)">
                <rect x="0" y="50" width="12" height="20" rx="2" fill="#D0D0D0" />
                <rect x="15" y="45" width="12" height="25" rx="2" fill="#C0C0C0" />
                <rect x="30" y="40" width="12" height="30" rx="2" fill="#B0B0B0" />
                <rect x="45" y="35" width="12" height="35" rx="2" fill="#A0A0A0" />
                <rect x="60" y="30" width="12" height="40" rx="2" fill="#909090" />
                <path
                    d="M6 60 L21 55 L36 50 L51 45 L66 40"
                    stroke="#888"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
                <path
                    d="M70 35 L75 30 L80 35 M75 30 L75 45"
                    stroke="#666"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </g>
        </svg>
    );
};

export default GrowthIcon;

