import MuiSkeleton from "@mui/material/Skeleton";

const BASE_SX = {
  bgcolor: "#efebfa",
  "&::after": {
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.75), transparent)",
  },
};

const Skeleton = ({ sx, variant = "rounded", ...props }) => (
  <MuiSkeleton animation="wave" variant={variant} sx={{ ...BASE_SX, ...sx }} {...props} />
);

export default Skeleton;
