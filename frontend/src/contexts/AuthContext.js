import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, authHelpers } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authHelpers.getToken();
        const user = authHelpers.getCurrentUser();

        if (token && user) {
          // Verify token is still valid
          const response = await authAPI.getMe();
          
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: response.user,
              token: token
            }
          });
        } else {
          dispatch({
            type: AUTH_ACTIONS.AUTH_LOGOUT
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Token is invalid, clear auth data
        authHelpers.clearAuthData();
        dispatch({
          type: AUTH_ACTIONS.AUTH_LOGOUT
        });
      }
    };

    initializeAuth();
  }, []);

  // Login action
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await authAPI.login(credentials);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.user,
          token: response.accessToken
        }
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { error: error.message }
      });
      throw error;
    }
  };

  // Register action
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await authAPI.register(userData);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.user,
          token: response.accessToken
        }
      });

      return response;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { error: error.message }
      });
      throw error;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authHelpers.clearAuthData();
      dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
    }
  };

  // Update profile action
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Cập nhật user trong context nếu có user mới
      if (response.user) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { user: response.user }
        });
      }

      return response;
    } catch (error) {
      console.error('AuthContext updateProfile error:', error);
      throw error;
    }
  };

  // Clear error action
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
