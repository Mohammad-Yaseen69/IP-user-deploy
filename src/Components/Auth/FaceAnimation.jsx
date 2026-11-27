import { motion } from "framer-motion";

const FaceAnimation = ({ input, currentInput, isCorrect, verification, startTyping }) => {
  const offset = startTyping ? currentInput * 3 : 0; // Reduced from 5 to 3 to keep movement in bounds

  const getEyePosition = (currentInput) => {
    let xOffset = 0;
    let yOffset = 0;

    switch (currentInput) {
      case 1: // Start - looking more left and slightly up
        xOffset = -8; // More to the left
        yOffset = 2.5; // Slightly up
        break;
      case 2: // Moving right with consistent spacing
        xOffset = -9;
        yOffset = 2.8;
        break;
      case 3: // Continuing right movement
        xOffset = -10;
        yOffset = 3.0;
        break;
      case 4: // Further right
        xOffset = -11;
        yOffset = 2.8;
        break;
      case 5: // Almost final position
        xOffset = -12;
        yOffset = 2.5;
        break;
      case 6: // Final position - moving up
        xOffset = -12; // Maintain x position from previous
        yOffset = 1.8; // Move up more significantly
        break;
      default:
        xOffset = 0;
        yOffset = 0;
    }

    return { x: xOffset, y: yOffset };
  };

  const position = getEyePosition(currentInput);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="51"
          height="62"
          viewBox="0 0 51 62"
          fill="none"
        >
          <g filter="url(#filter0_di_3651_220)">
            <ellipse cx="25.1692" cy="23.8433" rx="16.1225" ry="21.3254" fill="#FAFAFA" />
            <path
              d="M25.1687 3.14386C29.3819 3.14386 33.2432 5.4005 36.071 9.14093C38.8991 12.8817 40.6657 18.0778 40.6658 23.8431C40.6658 29.6083 38.899 34.8045 36.071 38.5452C33.2432 42.2857 29.3819 44.5433 25.1687 44.5433C20.9556 44.5431 17.0951 42.2855 14.2673 38.5452C11.4394 34.8045 9.67261 29.6083 9.67261 23.8431C9.67265 18.0778 11.4393 12.8817 14.2673 9.14093C17.0951 5.40064 20.9556 3.14403 25.1687 3.14386Z"
              stroke="#C8B7FA"
              stroke-width="1.25098"
              stroke-miterlimit="2.61313"
              stroke-linejoin="round"
            />
          </g>
          <motion.g
            filter="url(#filter1_d_3651_220)"
            animate={{
              x: startTyping ? position.x + offset : 0,
              y: startTyping ? position.y : 0,
              transition: { duration: 0.5, ease: "easeInOut" },
            }}
          >
            <motion.ellipse
              cx="25.1692"
              cy="28.4197"
              rx="8.92197"
              ry="9.44776"
              fill="url(#paint0_linear_3651_220)"
            />
          </motion.g>
          <defs>
            <filter
              id="filter0_di_3651_220"
              x="0.16464"
              y="0.724805"
              width="50.0091"
              height="60.4149"
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
              <feOffset dy="7.08891" />
              <feGaussianBlur stdDeviation="4.441" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.34902 0 0 0 0 0.14902 0 0 0 0 0.941176 0 0 0 0.1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_3651_220"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_3651_220"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2.50197" />
              <feGaussianBlur stdDeviation="3.14831" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.564706 0 0 0 0 0.431373 0 0 0 0 0.960784 0 0 0 0.35 0"
              />
              <feBlend mode="normal" in2="shape" result="effect2_innerShadow_3651_220" />
            </filter>
            <filter
              id="filter1_d_3651_220"
              x="14.5793"
              y="18.9719"
              width="21.1799"
              height="22.2315"
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
              <feOffset dy="1.66798" />
              <feGaussianBlur stdDeviation="0.83399" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.564706 0 0 0 0 0.431373 0 0 0 0 0.960784 0 0 0 0.49 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_3651_220"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_3651_220"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_3651_220"
              x1="25.1692"
              y1="18.9719"
              x2="18.176"
              y2="34.5021"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#906EF5" />
              <stop offset="1" stop-color="#5926F0" />
            </linearGradient>
          </defs>
        </svg>

        <svg
          style={{ marginLeft: "-15px" }}
          xmlns="http://www.w3.org/2000/svg"
          width="51"
          height="62"
          viewBox="0 0 51 62"
          fill="none"
        >
          <g filter="url(#filter0_di_3651_223)">
            <ellipse cx="25.9163" cy="23.8433" rx="16.1225" ry="21.3254" fill="#FAFAFA" />
            <path
              d="M25.9158 3.14386C30.1291 3.14386 33.9903 5.4005 36.8182 9.14093C39.6462 12.8817 41.4128 18.0778 41.4129 23.8431C41.4129 29.6083 39.6461 34.8045 36.8182 38.5452C33.9903 42.2857 30.1291 44.5433 25.9158 44.5433C21.7028 44.5431 17.8422 42.2855 15.0145 38.5452C12.1865 34.8045 10.4197 29.6083 10.4197 23.8431C10.4198 18.0778 12.1864 12.8817 15.0145 9.14093C17.8422 5.40064 21.7028 3.14403 25.9158 3.14386Z"
              stroke="#C8B7FA"
              stroke-width="1.25098"
              stroke-miterlimit="2.61313"
              stroke-linejoin="round"
            />
          </g>
          <motion.g
            filter="url(#filter1_d_3651_223)"
            animate={{
              x: startTyping ? position.x + offset : 0,
              y: startTyping ? position.y : 0,
              transition: { duration: 0.5, ease: "easeInOut" },
            }}
          >
            <motion.ellipse
              cx="25.9164"
              cy="28.4197"
              rx="8.92197"
              ry="9.44776"
              fill="url(#paint0_linear_3651_223)"
            />
          </motion.g>
          <defs>
            <filter
              id="filter0_di_3651_223"
              x="0.911764"
              y="0.724805"
              width="50.0091"
              height="60.4149"
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
              <feOffset dy="7.08891" />
              <feGaussianBlur stdDeviation="4.441" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.34902 0 0 0 0 0.14902 0 0 0 0 0.941176 0 0 0 0.1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_3651_223"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_3651_223"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2.50197" />
              <feGaussianBlur stdDeviation="3.14831" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.564706 0 0 0 0 0.431373 0 0 0 0 0.960784 0 0 0 0.35 0"
              />
              <feBlend mode="normal" in2="shape" result="effect2_innerShadow_3651_223" />
            </filter>
            <filter
              id="filter1_d_3651_223"
              x="15.3264"
              y="18.9719"
              width="21.1799"
              height="22.2315"
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
              <feOffset dy="1.66798" />
              <feGaussianBlur stdDeviation="0.83399" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.564706 0 0 0 0 0.431373 0 0 0 0 0.960784 0 0 0 0.49 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_3651_223"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_3651_223"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_3651_223"
              x1="25.9164"
              y1="18.9719"
              x2="18.9232"
              y2="34.5021"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#906EF5" />
              <stop offset="1" stop-color="#5926F0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default FaceAnimation;
