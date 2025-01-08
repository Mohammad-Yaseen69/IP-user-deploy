import React from "react";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { auth0 } from "../Config/Config";
import { Auth0Provider } from "@auth0/auth0-react";
import { configureFakeBackend, authHeader, handleResponse } from "../Services/fack.backend";
import Callback from '../Auth/Callback';
import Loader from "../Layout/Loader";
import { authRoutes } from "./AuthRoutes";
import LayoutRoutes from "../Route/LayoutRoutes";
import PrivateRoute from "./PrivateRoute";
import VerifyPhone from "../Components/VerifyPhone/VerifyPhone";
import Requests from "../Components/Requests";
import NewLayout from "../Components/NewDsLayout";
import AuthNew from "../Components/AuthNew";
import UserProfilePublic from "../Components/UserProfilePublic";

// setup fake backend
configureFakeBackend();
const Routers = () => {
  const [authenticated, setAuthenticated] = useState(localStorage.getItem("login"));
  const jwt_token = localStorage.getItem("token");

  useEffect(() => {
    let abortController = new AbortController();
    const requestOptions = { method: "GET", headers: authHeader() };
    fetch("/users", requestOptions).then(handleResponse);
    setAuthenticated(JSON.parse(localStorage.getItem("login")));
    console.ignoredYellowBox = ["Warning: Each", "Warning: Failed"];
    console.disableYellowBox = true;
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <Auth0Provider domain={auth0.domain} clientId={auth0.clientId} redirectUri={auth0.redirectUri}>
      <BrowserRouter basename={"/"}>
        <>
          {/* <Suspense fallback={<Loader />}> */}
          <Routes>
            <Route path={"/"} element={<PrivateRoute />}>
              {authenticated || jwt_token ? (
                <>
                  <Route exact path={`${process.env.PUBLIC_URL}`} element={<Navigate to={`${process.env.PUBLIC_URL}/dashboard/default`} />} />
                  <Route exact path={`/`} element={<Navigate to={`${process.env.PUBLIC_URL}/dashboard/default`} />} />
                  <Route path={`/new-dashboard`} element={<NewLayout />} />
                  <Route path={`/*`} element={<LayoutRoutes />} />
                </>
              ) : (
                ""
              )}
            </Route>
            <Route path={`/requests/:id`} element={<Requests />} />
            <Route path={`${process.env.PUBLIC_URL}/callback`} render={() => <Callback />} />
            <Route exact path={`${process.env.PUBLIC_URL}/auth/login`} element={<AuthNew />} />
            <Route exact path={`${process.env.PUBLIC_URL}/auth/signup`} element={<AuthNew />} />
            <Route exact path={`${process.env.PUBLIC_URL}/auth/signup/:code`} element={<AuthNew />} />
            {/* <Route exact path={`${process.env.PUBLIC_URL}/profile/:user_name`} element={<UserProfilePublic />} /> */}
            <Route exact path={`${process.env.PUBLIC_URL}/verify-phone`} element={<VerifyPhone />} />
            {authRoutes.map(({ path, Components }, i) => (
              <Route path={path} element={Components} key={i} />
            ))}
          </Routes>
          {/* </Suspense> */}
        </>
      </BrowserRouter>
    </Auth0Provider>
  );
};

export default Routers;
