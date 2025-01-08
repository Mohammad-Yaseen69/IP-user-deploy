import { motion } from 'framer-motion';

const FaceAnimation = ({ input, currentInput, isCorrect, verification, startTyping }) => {
    const offset = startTyping ? currentInput * 5 : 0;

    const leftShift = -8;
    const centerX = 40; // Center X position for eyes and mouth
    const eyeOffset = startTyping ? offset : 10; // Adjust eye position when not typing
    const mouthStart = centerX - 5 + leftShift + offset;
    const mouthEnd = centerX + 5 + leftShift + offset;
    const mouthControl = verification
        ? isCorrect
            ? 70
            : 60
        : 65;

    const mouthPath = `M${mouthStart} 65 Q ${centerX + leftShift + offset} ${mouthControl}, ${mouthEnd} 65`;

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <motion.svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                animate={{
                    rotateY: startTyping ? -2 + currentInput * 2 : 0,
                    skewX: startTyping ? 12 - currentInput * 4 : 0,
                    transition: { duration: 0.5, ease: "easeInOut" },
                }}
                style={{
                    transform: `scaleX(1) scaleY(1) scaleZ(1) rotateX(${startTyping ? -13 : 0}deg) rotateZ(0deg) translateX(0px) translateY(0px) translateZ(0px)`,
                    perspective: "998px",
                    perspectiveOrigin: "50% 50%",
                }}
            >
                <rect x="15" y="0" width="80" height="80" rx="15" ry="15" fill="black" />
                <motion.circle
                    cx={centerX - 10 + leftShift + eyeOffset}
                    cy="50"
                    r="8"
                    fill="white"
                    animate={{
                        cx: centerX - 10 + leftShift + eyeOffset,
                        transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                />
                <motion.circle
                    cx={centerX - 20 + leftShift + eyeOffset * 1.4}
                    cy="53"
                    r="2"
                    fill="black"
                    animate={{
                        cx: centerX - 15 + leftShift + eyeOffset * 1.4,
                        transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                />
                <motion.circle
                    cx={centerX + 10 + leftShift + eyeOffset}
                    cy="50"
                    r="8"
                    fill="white"
                    animate={{
                        cx: centerX + 10 + leftShift + eyeOffset,
                        transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                />
                <motion.circle
                    cx={centerX + 8 + leftShift + eyeOffset * 1.4}
                    cy="53"
                    r="2"
                    fill="black"
                    animate={{
                        cx: centerX + 4 + leftShift + eyeOffset * 1.4,
                        transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                />
                <motion.line
                    x1={centerX - 14 + leftShift + eyeOffset}
                    y1="38"
                    x2={centerX - 6 + leftShift + eyeOffset}
                    y2="38"
                    stroke="#363336"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{
                        x1: centerX - 14 + leftShift + eyeOffset,
                        x2: centerX - 6 + leftShift + eyeOffset,
                        transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                />
                <motion.line
                    x1={centerX + 6 + leftShift + eyeOffset}
                    y1="38"
                    x2={centerX + 14 + leftShift + eyeOffset}
                    y2="38"
                    stroke="#363336"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{
                        x1: centerX + 6 + leftShift + eyeOffset,
                        x2: centerX + 14 + leftShift + eyeOffset,
                        transition: { duration: 0.5, ease: "easeInOut" },
                    }}
                />
                <motion.path
                    d={mouthPath}
                    fill="transparent"
                    stroke="white"
                    strokeWidth="2"
                    animate={{
                        d: mouthPath,
                        transition: {
                            type: "keyframes",
                            values: [
                                `M${mouthStart} 65 Q ${centerX + leftShift + offset} 65, ${mouthEnd} 65`,
                                `M${mouthStart} 65 Q ${centerX + leftShift + offset} 70, ${mouthEnd} 65`,
                                `M${mouthStart} 65 Q ${centerX + leftShift + offset} 60, ${mouthEnd} 65`,
                            ],
                            duration: 0.5,
                            ease: "easeInOut",
                        },
                    }}
                />
            </motion.svg>
        </div>
    );
};

export default FaceAnimation;