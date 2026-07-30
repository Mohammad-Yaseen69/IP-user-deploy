// import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
// import Loader from "../Layout/Loader";
import { AgentCommissionRoutes, authRoutes, guestRoutes, publicRoutes, routes } from "./Routes";
import Layout from "../Layout/Layout";
import AgentLayout from "../Layout/AgentLayout";

const Routers = () => {
  return (
    // <Suspense fallback={<Loader />}>
    <Routes>
      {
        publicRoutes.map((item, i) => (
          <Route key={item.path} path={item.path} element={item.component} />
        ))
      }
      {routes.map((item, i) => (
        <Route element={<Layout />} key={i}>
          <Route path={item.path} element={item.component} />
        </Route>
      ))}
      {AgentCommissionRoutes.map((item, i) => (
        <Route element={<AgentLayout />} key={i}>
          <Route path={item.path} element={item.component} />
        </Route>
      ))}
      {
        authRoutes.map(item => (
          <Route key={item.path} path={item.path} element={item.component} />
        ))
      }
      {
        guestRoutes.map(item => (
          <Route key={item.path} path={item.path} element={item.component} />
        ))
      }
    </Routes>
    // </Suspense>
  );
};

export default Routers;