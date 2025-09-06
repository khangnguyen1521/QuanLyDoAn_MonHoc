import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthRedirect = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect authenticated users to transactions page
    return <Navigate to="/transactions" replace />;
  }

  return children;
};

export default AuthRedirect;
