import { useTypingText } from "../Context/UseTypingEffect";

const TypingSpan = ({ words }) => {
    const { word } = useTypingText(
        words,
        130,
        20
    );
    return (
        <>{word}</>
    )
}

export default TypingSpan