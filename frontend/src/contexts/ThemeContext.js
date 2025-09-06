import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  theme: 'light', // 'light', 'dark', 'auto'
  isDarkMode: false,
  isSystemDarkMode: false
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_DARK_MODE: 'SET_DARK_MODE',
  SET_SYSTEM_DARK_MODE: 'SET_SYSTEM_DARK_MODE'
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload.theme
      };

    case THEME_ACTIONS.SET_DARK_MODE:
      return {
        ...state,
        isDarkMode: action.payload.isDarkMode
      };

    case THEME_ACTIONS.SET_SYSTEM_DARK_MODE:
      return {
        ...state,
        isSystemDarkMode: action.payload.isSystemDarkMode
      };

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Get saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('monexo-theme');
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: { theme: savedTheme }
      });
    }
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      dispatch({
        type: THEME_ACTIONS.SET_SYSTEM_DARK_MODE,
        payload: { isSystemDarkMode: e.matches }
      });
    };

    // Set initial system theme
    dispatch({
      type: THEME_ACTIONS.SET_SYSTEM_DARK_MODE,
      payload: { isSystemDarkMode: mediaQuery.matches }
    });

    // Listen for changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;

      switch (state.theme) {
        case 'dark':
          shouldBeDark = true;
          break;
        case 'light':
          shouldBeDark = false;
          break;
        case 'auto':
          shouldBeDark = state.isSystemDarkMode;
          break;
        default:
          shouldBeDark = false;
      }

      // Update state if needed
      if (state.isDarkMode !== shouldBeDark) {
        dispatch({
          type: THEME_ACTIONS.SET_DARK_MODE,
          payload: { isDarkMode: shouldBeDark }
        });
      }

      // Apply to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
  }, [state.theme, state.isSystemDarkMode, state.isDarkMode]);

  // Set theme action
  const setTheme = (newTheme) => {
    if (['light', 'dark', 'auto'].includes(newTheme)) {
      dispatch({
        type: THEME_ACTIONS.SET_THEME,
        payload: { theme: newTheme }
      });
      localStorage.setItem('monexo-theme', newTheme);
    }
  };

  // Toggle theme action (for quick toggle)
  const toggleTheme = () => {
    const newTheme = state.isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Context value
  const value = {
    ...state,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
