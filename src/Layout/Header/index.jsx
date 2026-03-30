import React, { useContext } from "react";
import { Grid } from "react-feather";
import CustomizerContext from "../../Helper/Customizer";
import LeftHeader from "./LeftHeader/LeftHeader";
import RightHeader from "./RightHeader/RightHeader";
import { Image } from "../../AbstractElements";
import { Link } from "react-router-dom";


const Header = () => {
  const { togglSidebar, setTogglSidebar } = useContext(CustomizerContext);

  return (
    <div className={`page-header  ${togglSidebar ? "close_icon" : ""}`}>
      <div className="header-wrapper row m-0">
        <div className="header-logo-wrapper col-auto p-0" onClick={() => setTogglSidebar(!togglSidebar)} data-testid="logo">
          <div className="toggle-sidebar">
            <Grid className="status_toggle middle sidebar-toggle" />
          </div>
          <div className="logo-header-main">
            <Link to={`${window.location.origin}/dashboard/default`}>
              <Image attrImage={{ className: 'img-fluid for-light img-100', src: `${require('../../assets/images/logo/logo2.webp')}`, alt: 'logo' }} />
              <Image attrImage={{ className: 'img-fluid for-dark', src: `${require('../../assets/images/logo/logo.webp')}`, alt: 'logo' }} />
            </Link>
          </div>
        </div>
        <LeftHeader />
        <RightHeader />
      </div>
    </div>
  );
};

export default Header;
