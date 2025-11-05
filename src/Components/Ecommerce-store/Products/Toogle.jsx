import React from "react";
import "./styles/index.module.scss";

const Toogle = ({ props }) => {
    return (
        <div className="form-check form-switch" onClick={(e) => props.click(e)}>
            <input
                className="form-check-input" type="checkbox" id="flexSwitchCheckDefault"
            />
        </div>
    );
};

export default Toogle;
