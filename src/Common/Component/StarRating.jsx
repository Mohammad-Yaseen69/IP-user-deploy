import { Rating, SvgIcon } from "@mui/material";

const StarIcon = () => (
  <SvgIcon fontSize="inherit">
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </SvgIcon>
);

const StarBorderIcon = () => (
  <SvgIcon fontSize="inherit">
    <path d="m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28z" />
  </SvgIcon>
);

const StarRating = ({ value, onChange, readOnly = false, className }) => (
  <Rating
    value={Number(value) || 0}
    onChange={(_, next) => {
      if (next !== null) onChange?.(next);
    }}
    readOnly={readOnly}
    precision={readOnly ? 0.1 : 1}
    icon={<StarIcon />}
    emptyIcon={<StarBorderIcon />}
    className={className}
    sx={{
      color: "inherit",
      fontSize: "2em",
      "& .MuiRating-iconEmpty": { color: "inherit" },
    }}
  />
);

export default StarRating;
