import { Navigate } from "react-router";
import { MENU } from "../Layout/SidebarNew/SbNMenu";

const PermissionFallback = ({ can }) => {
  let fallbackPath = null;
  for (const section of MENU) {
    if (section.menu) {
      for (const item of section.menu) {
        if (item.type === "link" && item.url) {
          if (!item.permission || can(item.permission)) {
            try {
              const urlObj = new URL(item.url, window.location.origin);
              fallbackPath = urlObj.pathname + urlObj.search;
            } catch (e) {
              fallbackPath = item.url;
            }
            break;
          }
        }
      }
    }
    if (fallbackPath) break;
  }

  if (fallbackPath && fallbackPath !== window.location.pathname) {
    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        width: "100%",
        marginTop: "10vh",
      }}
    >
      You don&apos;t have permission to view this page.
    </div>
  );
};

export default PermissionFallback;
