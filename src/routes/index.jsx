import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import PrivateRoute from '../components/PrivateRoute';
import AuthGuard from '../components/AuthGuard';
import Home from '../pages/Home';
import Movies from '../pages/Movies';
import MovieDetail from '../pages/MovieDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import MovieManagement from '../pages/admin/MovieManagement';
import MovieDetails from '../pages/admin/MovieDetails';
import SeatSelection from '../pages/SeatSelection';
import ErrorBoundary from '../components/ErrorBoundary';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthGuard>
              <Login />
            </AuthGuard>
          }
        />
        <Route
          path="/register"
          element={
            <AuthGuard>
              <Register />
            </AuthGuard>
          }
        />

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />

        {/* Protected Routes */}
        <Route
          path="booking/:showtimeId"
          element={
            <ErrorBoundary
              fallback={<div>Something went wrong</div>}
              onError={(error) => console.error('Error in SeatSelection:', error)}
            >
              <PrivateRoute>
                <SeatSelection />
              </PrivateRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin/*"
          element={
            <PrivateRoute roles={['admin']}>
              <Routes>
                <Route path="movies" element={<MovieManagement />} />
                <Route path="movies/:id" element={<MovieDetails />} />
                {/* Thêm các route admin khác ở đây */}
              </Routes>
            </PrivateRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes; 