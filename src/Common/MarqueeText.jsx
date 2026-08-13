import { useEffect, useRef, useState } from "react";
import "./MarqueeText.css";


const MarqueeText = ({ text, className = "" }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [overflowAmount, setOverflowAmount] = useState(0);

    useEffect(() => {
        const measure = () => {
            if (containerRef.current && textRef.current) {
                const diff = textRef.current.scrollWidth - containerRef.current.clientWidth;
                setOverflowAmount(diff > 0 ? diff : 0);
            }
        };

        measure();
        window.addEventListener("resize", measure);

        const t = setTimeout(measure, 350);

        return () => {
            window.removeEventListener("resize", measure);
            clearTimeout(t);
        };
    }, [text]);

    const isOverflowing = overflowAmount > 0;

    return (
        <span
            className={`marquee-container ${className}`}
            ref={containerRef}
            style={{ "--marquee-distance": `${overflowAmount}px` }}
        >
            <span
                className={`marquee-text ${isOverflowing ? "marquee-can-scroll" : ""}`}
                ref={textRef}
            >
                {text}
            </span>
        </span>
    );
};

export default MarqueeText; 