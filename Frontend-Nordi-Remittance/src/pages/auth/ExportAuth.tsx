import { useParams } from "react-router-dom";
import Login from "./Login";
import Signup from "./signup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import VerifySuccess from "./VerifySuccess";

// component to handle the routing
const Auth = () => {
  const { page } = useParams(); // Get the :page parameter from the URL

  return (
    <>
      {page === "login" && <Login />}
      {page === "signup" && <Signup />}
      {page === "forgot-password" && <ForgotPassword />}
      {page === "reset-password" && <ResetPassword />}
      {page === "verify-email" && <VerifySuccess />}
    </>
  );
};

export default Auth;
