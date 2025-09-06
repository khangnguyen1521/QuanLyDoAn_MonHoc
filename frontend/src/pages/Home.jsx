import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Target, 
  TrendingUp, 
  Users, 
  Wallet,
  CheckCircle,
  Star
} from 'lucide-react';
import Footer from '../components/Layout/Footer';

const Home = () => {
  const features = [
    {
      icon: Wallet,
      title: 'Quản lý tài chính thông minh',
      description: 'Theo dõi thu chi, phân loại giao dịch và quản lý ngân sách một cách dễ dàng và hiệu quả.'
    },
    {
      icon: BarChart3,
      title: 'Báo cáo chi tiết',
      description: 'Xem báo cáo trực quan với biểu đồ và thống kê giúp bạn hiểu rõ tình hình tài chính.'
    },
    {
      icon: Target,
      title: 'Đặt mục tiêu tiết kiệm',
      description: 'Thiết lập và theo dõi các mục tiêu tài chính để đạt được ước mơ của bạn.'
    },
    {
      icon: Shield,
      title: 'Bảo mật tuyệt đối',
      description: 'Dữ liệu của bạn được bảo vệ với công nghệ mã hóa tiên tiến và an toàn tuyệt đối.'
    },
    {
      icon: Smartphone,
      title: 'Giao diện thân thiện',
      description: 'Thiết kế hiện đại, responsive và dễ sử dụng trên mọi thiết bị.'
    },
    {
      icon: TrendingUp,
      title: 'Phân tích xu hướng',
      description: 'Nhận biết xu hướng chi tiêu và đưa ra gợi ý để cải thiện tài chính cá nhân.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Người dùng tin tưởng' },
    { number: '50M+', label: 'Giao dịch được xử lý' },
    { number: '99.9%', label: 'Thời gian hoạt động' },
    { number: '4.9/5', label: 'Đánh giá từ người dùng' }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Doanh nhân',
      content: 'Monexo đã giúp tôi quản lý tài chính cá nhân một cách hiệu quả , đầy đủ tính năng , dễ sử dụng và đẹp.',
      rating: 5
    },
    {
      name: 'Trần Thị B',
      role: 'Nhân viên văn phòng',
      content: 'Ứng dụng rất tiện lợi, giúp tôi theo dõi chi tiêu hàng ngày và tiết kiệm được nhiều hơn.',
      rating: 5
    },
    {
      name: 'Lê Minh C',
      role: 'Sinh viên',
      content: 'Với sinh viên như tôi, việc quản lý tiền túi rất quan trọng. Monexo giúp tôi làm điều đó dễ dàng.',
      rating: 5
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-800">
        {/* Simple Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Ứng dụng quản lý tài chính tin cậy
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-white leading-tight">
                Quản lý{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Tài chính
                </span>
                <br />
                <span className="text-3xl md:text-5xl font-normal text-gray-700 dark:text-gray-300">
                  Dễ dàng & Hiệu quả
                </span>
              </h1>
              
              <p className="text-xl mb-12 max-w-2xl mx-auto lg:mx-0 text-gray-600 dark:text-gray-300 leading-relaxed">
                Theo dõi thu chi, lập kế hoạch ngân sách và đạt được các mục tiêu tài chính của bạn với Monexo - 
                công cụ quản lý tài chính cá nhân đơn giản và hiệu quả.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center mb-16">
                <Link
                  to="/transactions"
                  className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>Bắt đầu miễn phí</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  100% Miễn phí
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-blue-500 mr-2" />
                  Bảo mật cao
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  10,000+ người dùng
                </div>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Mock App Interface */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold text-gray-900 dark:text-white">Tổng số dư</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Tài khoản chính</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      15,250,000₫
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-center">
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Thu nhập</div>
                      <div className="font-bold text-green-600 dark:text-green-400">+5,200,000₫</div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-xl text-center">
                      <BarChart3 className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">Chi tiêu</div>
                      <div className="font-bold text-red-600 dark:text-red-400">-3,450,000₫</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mục tiêu tiết kiệm</span>
                      </div>
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">75%</span>
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                      <div className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">7,500,000₫ / 10,000,000₫</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Được tin tưởng bởi hàng ngàn người dùng
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Con số không nói dối về chất lượng dịch vụ của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-600">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-6">
              ⭐ Tính năng nổi bật
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Tất cả trong{' '}
              <span className="text-blue-600 dark:text-blue-400">
                một ứng dụng
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Monexo cung cấp đầy đủ các công cụ bạn cần để quản lý tài chính cá nhân hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = [
                { bg: 'bg-blue-100', icon: 'text-blue-600', hover: 'hover:bg-blue-50' },
                { bg: 'bg-green-100', icon: 'text-green-600', hover: 'hover:bg-green-50' },
                { bg: 'bg-purple-100', icon: 'text-purple-600', hover: 'hover:bg-purple-50' },
                { bg: 'bg-orange-100', icon: 'text-orange-600', hover: 'hover:bg-orange-50' },
                { bg: 'bg-red-100', icon: 'text-red-600', hover: 'hover:bg-red-50' },
                { bg: 'bg-indigo-100', icon: 'text-indigo-600', hover: 'hover:bg-indigo-50' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <div key={index} className="group">
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full ${colorScheme.hover} dark:hover:bg-gray-700`}>
                    <div>
                      {/* Icon */}
                      <div className={`w-16 h-16 ${colorScheme.bg} dark:opacity-80 rounded-xl flex items-center justify-center mb-6`}>
                        <Icon className={`h-8 w-8 ${colorScheme.icon}`} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-6">
              🚀 Dễ dàng bắt đầu
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Chỉ cần{' '}
              <span className="text-green-600 dark:text-green-400">
                3 bước đơn giản
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Bắt đầu hành trình quản lý tài chính hiệu quả ngay hôm nay
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Thêm giao dịch
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ghi lại thu chi nhanh chóng với giao diện trực quan và dễ sử dụng
              </p>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-600 dark:bg-green-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Xem báo cáo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Theo dõi chi tiêu qua biểu đồ và báo cáo trực quan, dễ hiểu
              </p>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-purple-600 dark:bg-purple-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Đạt mục tiêu
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Thiết lập mục tiêu tiết kiệm và theo dõi tiến độ một cách dễ dàng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-semibold mb-6">
              ⭐ Đánh giá từ người dùng
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Khách hàng{' '}
              <span className="text-yellow-600 dark:text-yellow-400">
                hài lòng
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hơn 10,000 người dùng đã tin tưởng Monexo để quản lý tài chính cá nhân
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const avatarColors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500'
              ];
              
              return (
                <div key={index} className="group">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    {/* Quote Mark */}
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
                      <span className="text-white text-2xl font-bold">"</span>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className={`w-14 h-14 ${avatarColors[index]} rounded-xl flex items-center justify-center mr-4`}>
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Tham gia cộng đồng 10,000+ người dùng
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Sẵn sàng bắt đầu{' '}
            <span className="text-yellow-300 dark:text-yellow-200">
              quản lý tài chính
            </span>
            ?
          </h2>
          
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-12 max-w-4xl mx-auto leading-relaxed">
            Hãy bắt đầu hành trình quản lý tài chính hiệu quả với Monexo. 
            <span className="font-bold text-yellow-300 dark:text-yellow-200"> Miễn phí 100% </span>
            và dễ sử dụng.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              to="/transactions"
              className="group inline-flex items-center px-10 py-5 bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 font-bold text-lg rounded-xl hover:bg-gray-100 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg"
            >
              <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
              <span>Bắt đầu miễn phí ngay</span>
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200 dark:text-blue-300 text-sm">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-400 mr-2" />
              Bảo mật cao
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-yellow-300 dark:text-yellow-200 mr-2" />
              Không cần thẻ tín dụng
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-300 dark:text-blue-200 mr-2" />
              Hỗ trợ 24/7
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;