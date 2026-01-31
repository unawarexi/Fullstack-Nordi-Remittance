import { useParams } from 'react-router-dom';
import Login from './Login';
import Signup from './signup';

// component to handle the routing
const Auth = () => {
  const { page } = useParams(); // Get the :page parameter from the URL

  return (
    <>
    {page === 'login' && <Login />}
    {page === 'signup' && <Signup />}
    </>
  );
};

export default Auth;
