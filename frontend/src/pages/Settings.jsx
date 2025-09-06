import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  HelpCircle,
  Settings as SettingsIcon,
  Lock,
  Globe,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { exportToCSV, formatTransactionsForCSV, formatGoalsForCSV } from '../utils/csvExport';
import { financialAPI } from '../services/financialAPI';
import { goalsAPI } from '../services/goalsAPI';
import toast from 'react-hot-toast';

const Settings = () => {
  const { theme, setTheme, isDarkMode } = useTheme();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [settings, setSettings] = useState({
    // Profile settings
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    
    // Password change
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    budgetAlerts: true,
    transactionAlerts: true,
    
    // Appearance settings
    currency: 'VND',
    language: 'vi',
    dateFormat: 'dd/mm/yyyy',
    
    // Privacy settings
    dataSharing: false,
    analytics: true,
    twoFactorAuth: false,
    sessionTimeout: '30'
  });

  // Update settings when user data changes
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      }));
    }
  }, [user]);

  const tabs = [
    { id: 'profile', name: 'Hồ sơ', icon: User, color: 'from-blue-500 to-indigo-500' },
    { id: 'notifications', name: 'Thông báo', icon: Bell, color: 'from-yellow-500 to-orange-500' },
    { id: 'appearance', name: 'Giao diện', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { id: 'privacy', name: 'Bảo mật', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { id: 'data', name: 'Dữ liệu', icon: Database, color: 'from-red-500 to-rose-500' },
    { id: 'help', name: 'Trợ giúp', icon: HelpCircle, color: 'from-gray-500 to-gray-600' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Validate profile data
  const validateProfile = (data) => {
    const errors = {};
    
    if (!data.name.trim()) {
      errors.name = 'Tên là bắt buộc';
    }
    
    if (!data.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (data.phone && !/^[0-9]{10,11}$/.test(data.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }
    
    return errors;
  };

  // Validate password change
  const validatePasswordChange = (data) => {
    const errors = {};
    
    if (!data.currentPassword) {
      errors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    }
    
    if (!data.newPassword) {
      errors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (data.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    return errors;
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      // Validate profile data (không bao gồm email)
      const profileData = {
        name: settings.name,
        phone: settings.phone
      };
      
      const errors = {};
      
      if (!profileData.name.trim()) {
        errors.name = 'Tên là bắt buộc';
      }
      
      if (settings.phone && !/^[0-9]{10,11}$/.test(settings.phone)) {
        errors.phone = 'Số điện thoại không hợp lệ';
      }
      
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach(error => toast.error(error));
        return;
      }

      setUpdating(true);
      const response = await updateProfile(profileData);
      
      if (response.success || response.user) {
        toast.success('Cập nhật hồ sơ thành công!');
        // Cập nhật lại localStorage và state
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      // Validate password data
      const passwordData = {
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword,
        confirmPassword: settings.confirmPassword
      };
      
      const errors = validatePasswordChange(passwordData);
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach(error => toast.error(error));
        return;
      }

      setUpdating(true);
      const response = await updateProfile({
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword
      });
      
      if (response.success || response.user) {
        toast.success('Đổi mật khẩu thành công!');
        // Clear password fields
        setSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        // Cập nhật localStorage nếu có user mới
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Mật khẩu hiện tại không đúng hoặc không thể đổi mật khẩu');
    } finally {
      setUpdating(false);
    }
  };

  // Handle save settings
  const handleSave = () => {
    if (activeTab === 'profile') {
      handleProfileUpdate();
    } else {
      // Show success notification for other settings
      toast.success('Cài đặt đã được lưu thành công!');
    }
  };

  // Export all data as CSV
  const handleExportAllData = async () => {
    try {
      setExportLoading(true);
      toast.loading('Đang chuẩn bị dữ liệu xuất...');

      // Get all data
      const [transactionsResponse, goalsResponse] = await Promise.all([
        financialAPI.getTransactions(),
        goalsAPI.getGoals().catch(() => ({ data: [] })) // Handle if goals API fails
      ]);

      if (!transactionsResponse.success) {
        throw new Error('Không thể lấy dữ liệu giao dịch');
      }

      const transactions = transactionsResponse.data || [];
      const goals = goalsResponse.data || [];

      // Format data for CSV
      const transactionsCSV = formatTransactionsForCSV(transactions);
      const goalsCSV = formatGoalsForCSV(goals);

      // Combine all data
      const allData = [
        // Add section headers
        { 'Loại dữ liệu': 'GIAO DỊCH', 'Thông tin': '--- Danh sách tất cả giao dịch ---' },
        ...transactionsCSV.map(row => ({ 'Loại dữ liệu': 'Giao dịch', ...row })),
        { 'Loại dữ liệu': '', 'Thông tin': '' }, // Empty row
        { 'Loại dữ liệu': 'MỤC TIÊU', 'Thông tin': '--- Danh sách tất cả mục tiêu ---' },
        ...goalsCSV.map(row => ({ 'Loại dữ liệu': 'Mục tiêu', ...row }))
      ];

      // Generate filename with timestamp
      const timestamp = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const filename = `MonexoData_${timestamp}`;

      // Export CSV
      const result = exportToCSV(allData, filename);
      
      if (result.success) {
        toast.dismiss();
        toast.success(`Đã xuất ${transactions.length} giao dịch và ${goals.length} mục tiêu thành công!`);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error exporting data:', error);
      toast.dismiss();
      toast.error(`Lỗi xuất dữ liệu: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-8">
      {/* Profile Info */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-600" />
            Thông tin cá nhân
          </h3>
          <p className="text-gray-600 mt-1">Cập nhật thông tin hồ sơ của bạn</p>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <Button variant="outline" className="mb-2 rounded-2xl">
                Tải ảnh lên
              </Button>
              <p className="text-sm text-gray-500">JPG, PNG tối đa 2MB</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Họ và tên"
              value={settings.name}
              onChange={(e) => handleSettingChange('name', e.target.value)}
              className="rounded-2xl"
              required
              helperText="Tên hiển thị của bạn"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={settings.email}
                  className="rounded-2xl bg-gray-50 dark:bg-gray-700"
                  disabled
                  helperText="Email không thể thay đổi để đảm bảo bảo mật"
                />
                <div className="absolute right-3 top-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <Input
              label="Số điện thoại"
              value={settings.phone}
              onChange={(e) => handleSettingChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
              className="rounded-2xl"
              helperText="Số điện thoại liên hệ (tùy chọn)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái tài khoản
              </label>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                <div className="flex items-center text-green-700">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Đã xác thực</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Tài khoản của bạn đã được xác thực và hoạt động bình thường
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleProfileUpdate}
              disabled={updating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-8"
            >
              {updating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Cập nhật hồ sơ
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lock className="w-6 h-6 mr-3 text-red-600" />
            Đổi mật khẩu
          </h3>
          <p className="text-gray-600 mt-1">Cập nhật mật khẩu để bảo vệ tài khoản</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="relative">
              <Input
                label="Mật khẩu hiện tại"
                type={showPassword ? "text" : "password"}
                value={settings.currentPassword}
                onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="rounded-2xl pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Mật khẩu mới"
                type="password"
                value={settings.newPassword}
                onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="rounded-2xl"
                required
              />
              
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                value={settings.confirmPassword}
                onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                className="rounded-2xl"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Mật khẩu mạnh nên có:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ít nhất 8 ký tự</li>
                    <li>Bao gồm chữ hoa và chữ thường</li>
                    <li>Có ít nhất 1 số và 1 ký tự đặc biệt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={handlePasswordChange}
              disabled={updating}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl px-6"
            >
              {updating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <Bell className="w-6 h-6 mr-3 text-yellow-600" />
          Cài đặt thông báo
        </h3>
        <p className="text-gray-600 mt-1">Quản lý các loại thông báo bạn muốn nhận</p>
      </div>
      <div className="p-6">
        <div className="space-y-8">
          {[
            {
              key: 'emailNotifications',
              title: 'Thông báo email',
              description: 'Nhận thông báo quan trọng qua email',
              icon: '📧'
            },
            {
              key: 'pushNotifications', 
              title: 'Thông báo đẩy',
              description: 'Nhận thông báo trên thiết bị của bạn',
              icon: '🔔'
            },
            {
              key: 'weeklyReport',
              title: 'Báo cáo hàng tuần',
              description: 'Nhận báo cáo tài chính chi tiết hàng tuần',
              icon: '📊'
            },
            {
              key: 'budgetAlerts',
              title: 'Cảnh báo ngân sách',
              description: 'Thông báo khi bạn vượt quá ngân sách đã đặt',
              icon: '⚠️'
            },
            {
              key: 'transactionAlerts',
              title: 'Thông báo giao dịch',
              description: 'Xác nhận mỗi khi có giao dịch mới',
              icon: '💰'
            }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <p className="font-bold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Palette className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
            Giao diện và hiển thị
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Tùy chỉnh giao diện theo sở thích của bạn</p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
                Chủ đề giao diện
              </label>
              <div className="space-y-3">
                {[
                  { value: 'light', label: 'Sáng', icon: Sun, desc: 'Giao diện sáng, dễ nhìn ban ngày' },
                  { value: 'dark', label: 'Tối', icon: Moon, desc: 'Giao diện tối, bảo vệ mắt ban đêm' },
                  { value: 'auto', label: 'Tự động', icon: Monitor, desc: 'Theo cài đặt hệ thống' }
                ].map((themeOption) => {
                  const IconComponent = themeOption.icon;
                  return (
                    <label key={themeOption.value} className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer transition-colors bg-white dark:bg-gray-700">
                      <input
                        type="radio"
                        name="theme"
                        value={themeOption.value}
                        checked={theme === themeOption.value}
                        onChange={(e) => setTheme(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${theme === themeOption.value ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-500'}`}>
                        {theme === themeOption.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                        <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{themeOption.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{themeOption.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {/* Current Theme Status */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-blue-700 dark:text-blue-300">
                    Hiện tại: <strong>{isDarkMode ? 'Chế độ tối' : 'Chế độ sáng'}</strong>
                    {theme === 'auto' && ' (Tự động)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                  Đơn vị tiền tệ
                </label>
                <Select
                  options={[
                    { value: 'VND', label: '🇻🇳 VND (Việt Nam Đồng)' },
                    { value: 'USD', label: '🇺🇸 USD (Đô la Mỹ)' },
                    { value: 'EUR', label: '🇪🇺 EUR (Euro)' },
                    { value: 'JPY', label: '🇯🇵 JPY (Yen Nhật)' }
                  ]}
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="rounded-2xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                  Ngôn ngữ
                </label>
                <Select
                  options={[
                    { value: 'vi', label: '🇻🇳 Tiếng Việt' },
                    { value: 'en', label: '🇺🇸 English' },
                    { value: 'zh', label: '🇨🇳 中文' },
                    { value: 'ja', label: '🇯🇵 日本語' }
                  ]}
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="rounded-2xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                  Định dạng ngày
                </label>
                <Select
                  options={[
                    { value: 'dd/mm/yyyy', label: '31/12/2024' },
                    { value: 'mm/dd/yyyy', label: '12/31/2024' },
                    { value: 'yyyy-mm-dd', label: '2024-12-31' }
                  ]}
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  className="rounded-2xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-green-600" />
            Bảo mật và quyền riêng tư
          </h3>
          <p className="text-gray-600 mt-1">Quản lý cài đặt bảo mật tài khoản của bạn</p>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {[
              {
                key: 'twoFactorAuth',
                title: 'Xác thực hai yếu tố',
                description: 'Thêm lớp bảo mật bổ sung cho tài khoản của bạn',
                icon: '🔐',
                recommended: true
              },
              {
                key: 'dataSharing',
                title: 'Chia sẻ dữ liệu',
                description: 'Cho phép chia sẻ dữ liệu ẩn danh để cải thiện dịch vụ',
                icon: '📊'
              },
              {
                key: 'analytics',
                title: 'Phân tích sử dụng',
                description: 'Cho phép thu thập dữ liệu phân tích để cải thiện trải nghiệm',
                icon: '📈'
              }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-bold text-gray-900">{item.title}</p>
                      {item.recommended && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          Khuyến nghị
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                </label>
              </div>
            ))}

            <div className="border-t pt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Thời gian hết hạn phiên đăng nhập
                </label>
                <Select
                  options={[
                    { value: '15', label: '15 phút' },
                    { value: '30', label: '30 phút' },
                    { value: '60', label: '1 giờ' },
                    { value: '240', label: '4 giờ' },
                    { value: 'never', label: 'Không bao giờ' }
                  ]}
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  className="rounded-2xl max-w-xs"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Tự động đăng xuất sau thời gian không hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-8">
      {/* Export Data */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Download className="w-6 h-6 mr-3 text-blue-600" />
            Xuất dữ liệu
          </h3>
          <p className="text-gray-600 mt-1">Tải xuống bản sao dữ liệu của bạn</p>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Tải xuống tất cả dữ liệu của bạn bao gồm giao dịch và mục tiêu dưới dạng file CSV. 
            Dữ liệu sẽ được xuất với định dạng phù hợp để mở bằng Excel hoặc Google Sheets.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Thông tin xuất dữ liệu:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>File CSV có thể mở bằng Excel, Google Sheets</li>
                  <li>Dữ liệu được mã hóa UTF-8 hỗ trợ tiếng Việt</li>
                  <li>Bao gồm tất cả giao dịch và mục tiêu của bạn</li>
                  <li>Tên file sẽ có dạng: MonexoData_DD-MM-YYYY.csv</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleExportAllData}
              disabled={exportLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl px-6 shadow-lg hover:shadow-green-500/25 hover:scale-105 transform transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportLoading ? 'Đang xuất...' : 'Xuất dữ liệu CSV'}
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Định dạng Excel tương thích
            </div>
          </div>
        </div>
      </div>

      {/* Delete Data */}
      <div className="bg-white rounded-3xl shadow-lg border border-red-200 overflow-hidden">
        <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-pink-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trash2 className="w-6 h-6 mr-3 text-red-600" />
            Xóa dữ liệu
          </h3>
          <p className="text-gray-600 mt-1">Xóa vĩnh viễn tài khoản và dữ liệu</p>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-2">⚠️ Cảnh báo quan trọng:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hành động này không thể hoàn tác</li>
                  <li>Tất cả dữ liệu sẽ bị xóa vĩnh viễn</li>
                  <li>Bạn sẽ không thể khôi phục tài khoản</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 rounded-2xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tất cả giao dịch
            </Button>
            <Button 
              variant="danger"
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tài khoản vĩnh viễn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="w-6 h-6 mr-3 text-gray-600" />
            Trợ giúp & Hỗ trợ
          </h3>
          <p className="text-gray-600 mt-1">Nhận hỗ trợ và thông tin về ứng dụng</p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                {
                  title: 'Câu hỏi thường gặp',
                  description: 'Tìm câu trả lời cho các câu hỏi phổ biến',
                  icon: '❓',
                  action: 'Xem FAQ'
                },
                {
                  title: 'Hướng dẫn sử dụng',
                  description: 'Video và tài liệu hướng dẫn chi tiết',
                  icon: '📖',
                  action: 'Xem hướng dẫn'
                },
                {
                  title: 'Liên hệ hỗ trợ',
                  description: 'Gửi yêu cầu hỗ trợ trực tiếp',
                  icon: '💬',
                  action: 'Liên hệ ngay'
                },
                {
                  title: 'Cộng đồng',
                  description: 'Tham gia cộng đồng người dùng Monexo',
                  icon: '👥',
                  action: 'Tham gia'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    {item.action}
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin ứng dụng
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phiên bản:</span>
                  <span className="font-semibold">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật lần cuối:</span>
                  <span className="font-semibold">15/01/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nền tảng:</span>
                  <span className="font-semibold">Web App</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hỗ trợ:</span>
                  <span className="font-semibold">support@monexo.com</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-200">
                <Button variant="outline" size="sm" className="w-full rounded-2xl border-blue-300 text-blue-700 hover:bg-blue-100">
                  Kiểm tra cập nhật
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'privacy': return renderPrivacySettings();
      case 'data': return renderDataSettings();
      case 'help': return renderHelpSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 to-slate-600/5 dark:from-gray-400/10 dark:to-slate-400/10 rounded-3xl -m-4"></div>
        
        <div className="relative p-6">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            Cài đặt
            <span className="ml-2 text-2xl">⚙️</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-4 text-sm font-semibold text-left transition-all duration-300 rounded-2xl mb-2 ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-102'
                    }`}
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    <span>{tab.name}</span>
                    {isActive && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderContent()}
          
          {activeTab !== 'help' && activeTab !== 'data' && (
            <div className="flex justify-end pt-8">
              <div className="flex space-x-4">
                <Button 
                  variant="outline"
                  className="rounded-2xl px-8 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Hủy thay đổi
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-8 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transform transition-all duration-300"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;