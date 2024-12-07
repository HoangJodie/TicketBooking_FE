import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  console.log('AuthGuard - User:', user)
  console.log('AuthGuard - Loading:', loading)

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && Object.keys(user).length > 0) {
    console.log('Redirecting to home...')
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AuthGuard; 