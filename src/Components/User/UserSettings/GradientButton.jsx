import { Btn } from "../../../AbstractElements";

const GradientButton = ({ value, size, attr }) => {
  return (
    <Btn
      attrBtn={{
        gradient: "true",
        size: size.toLowerCase(),
        style: {
          background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
          border: "none",
          outline: "none",
        },
        ...attr,
      }}
    >
      {value}
    </Btn>
  );
};

export default GradientButton;
