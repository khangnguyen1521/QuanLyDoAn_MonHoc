import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Target, 
  Users,
  Mail,
  Settings,
  Wallet,
} from 'lucide-react';
import Logo from '../UI/Logo';

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Giao dịch', href: '/transactions', icon: PlusCircle },
    { name: 'Báo cáo', href: '/reports', icon: BarChart3 },
    { name: 'Mục tiêu', href: '/goals', icon: Target },
    { name: 'Nhóm', href: '/groups', icon: Users },
    { name: 'Lời mời', href: '/invites', icon: Mail },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <Logo size="small" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
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
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
