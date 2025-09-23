import ComingBgImg from '../Components/Pages/ComingSoon/ComingBgImg';
import ComingSimple from '../Components/Pages/ComingSoon/ComingSimple';

import ErrorPage1 from '../Components/Pages/ErrorPages/error-page1';
import ErrorPage2 from '../Components/Pages/ErrorPages/error-page2';
import ErrorPage3 from '../Components/Pages/ErrorPages/error-page3';
import ErrorPage4 from '../Components/Pages/ErrorPages/error-page4';

import Logins from '../Auth/Signin';
import LoginOne from '../Components/Pages/Auth/LoginOne';
import LoginTwo from '../Components/Pages/Auth/LoginTwo';
import LoginValidation from '../Components/Pages/Auth/LoginValidation';
import LoginSweetalert from '../Components/Pages/Auth/LoginSweetalert';
import LoginTooltip from '../Components/Pages/Auth/LoginTooltip';
import RegisterSimple from '../Components/Pages/Auth/RegisterSimple';
import RegisterBgImg from '../Components/Pages/Auth/RegisterBgImg';
import RegisterVideo from '../Components/Pages/Auth/RegisterVideo';
import UnlockUser from '../Components/Pages/Auth/UnlockUser';
import ForgetPwd from '../Components/Pages/Auth/ForgetPwd';
import CreatePwd from '../Components/Pages/Auth/CreatePwd';
import Maintenance from '../Components/Pages/Auth/Maintenance';
import LoginSample from '../Components/Pages/Auth/Login';
import ErrorPage5 from '../Components/Pages/ErrorPages/error-page5';
import ComingsoonVideo from '../Components/Pages/ComingSoon/ComingBgVideo';
import AuthComponent from '../Components/AuthComponent';
import AuthNew from '../Components/AuthNew';

export const authRoutes = [
  // { path: `${window.location.origin}/auth/login`, Components: <AuthComponent /> },
  { path: `${window.location.origin}/login`, Components: <AuthNew /> },
  { path: `${window.location.origin}/signup`, Components: <AuthNew /> },
  { path: `${window.location.origin}/signup/:code`, Components: <AuthNew /> },
  // { path: `${window.location.origin}/login`, Components: <AuthComponent /> },
  { path: `${window.location.origin}/authentication/login-simple`, Components: <LoginSample /> },
  { path: `${window.location.origin}/authentication/login-img`, Components: <LoginOne /> },
  { path: `${window.location.origin}/authentication/login-bg-img`, Components: <LoginTwo /> },
  { path: `${window.location.origin}/authentication/login-validation`, Components: <LoginValidation /> },
  { path: `${window.location.origin}/authentication/login-tooltip`, Components: <LoginTooltip /> },
  { path: `${window.location.origin}/authentication/login-sweetalert`, Components: <LoginSweetalert /> },
  { path: `${window.location.origin}/authentication/register-simpleimg`, Components: <RegisterSimple /> },
  { path: `${window.location.origin}/authentication/register-bg-img`, Components: <RegisterBgImg /> },
  { path: `${window.location.origin}/authentication/register-video`, Components: <RegisterVideo /> },
  { path: `${window.location.origin}/authentication/unlock-user`, Components: <UnlockUser /> },
  { path: `${window.location.origin}/authentication/forget-pwd`, Components: <ForgetPwd /> },
  { path: `${window.location.origin}/authentication/create-pwd`, Components: <CreatePwd /> },
  { path: `${window.location.origin}/authentication/maintenance`, Components: <Maintenance /> },

  //Coming soon
  {
    path: `${window.location.origin}/coming/comingbgvideo`, Components: <ComingsoonVideo />,
  },
  { path: `${window.location.origin}/coming/comingsimple`, Components: <ComingSimple /> },
  {
    path: `${window.location.origin}/coming/comingbgimage`, Components: <ComingBgImg />
  },

  //Error Page
  { path: `${window.location.origin}/error/error-page1`, Components: <ErrorPage1 /> },
  { path: `${window.location.origin}/error/error-page2`, Components: <ErrorPage2 /> },
  { path: `${window.location.origin}/error/error-page3`, Components: <ErrorPage3 /> },
  { path: `${window.location.origin}/error/error-page4`, Components: <ErrorPage4 /> },
  { path: `${window.location.origin}/error/error-page5`, Components: <ErrorPage5 /> },
];