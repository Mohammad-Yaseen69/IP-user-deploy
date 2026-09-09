import { SwipeableDrawer } from "@mui/material";
import React from "react";
import SidebarProgress from "./SidebarProgress";

const AssistantDrawer = ({ open, toggleDrawer }) => {
  return (
    <SwipeableDrawer
      anchor={"bottom"}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          maxHeight: "80vh",
          borderTopLeftRadius: "25px",
          borderTopRightRadius: "25px",
        },
      }}
      onClose={toggleDrawer}
      onOpen={toggleDrawer}
    >
      <SidebarProgress
        mobileView={true}
        percent={30}
        stepsLeft={4}
        currentStepKey="company"
        assistantMessage="Great start! Now let's capture your company's legal identity. This helps us verify your registration."
      />
    </SwipeableDrawer>
  );
};

export default AssistantDrawer;
