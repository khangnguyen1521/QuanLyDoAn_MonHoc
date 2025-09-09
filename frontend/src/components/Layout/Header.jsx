import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Target, 
  Users,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../UI/Logo';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Giao dịch', href: '/transactions', icon: PlusCircle },
    { name: 'Báo cáo', href: '/reports', icon: BarChart3 },
    { name: 'Mục tiêu', href: '/goals', icon: Target },
    { name: 'Nhóm', href: '/groups', icon: Users },
    { name: 'Lời mời', href: '/invites', icon: Mail },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Logo className="ml-2" size="small" />
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-1">
                {/* User Info */}
                <div className="flex items-center space-x-2 mr-1">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white max-w-16 truncate hidden sm:block">
                    {user.fullName}
                  </span>
                </div>
                
                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex lg:items-center lg:justify-between bg-white dark:bg-gray-800 px-6 py-4 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Logo size="normal" />
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 xl:space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-32 xl:max-w-48">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32 xl:max-w-48">
                    {user.email}
                  </span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 xl:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200 flex items-center space-x-2"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-gray-800">
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
              <Logo size="small" />
              <button
                type="button"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {isAuthenticated && user && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* User Info in Sidebar */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 shadow-md"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
