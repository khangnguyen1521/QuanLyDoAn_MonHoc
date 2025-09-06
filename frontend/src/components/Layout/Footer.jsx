import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart
} from 'lucide-react';
import Logo from '../UI/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Giao dịch', href: '/transactions' },
      { name: 'Báo cáo', href: '/reports' },
      { name: 'Mục tiêu', href: '/goals' },
      { name: 'Cài đặt', href: '/settings' }
    ],
    company: [
      { name: 'Về chúng tôi', href: '#' },
      { name: 'Tuyển dụng', href: '#' },
      { name: 'Tin tức', href: '#' },
      { name: 'Liên hệ', href: '#' }
    ],
    support: [
      { name: 'Trung tâm hỗ trợ', href: '#' },
      { name: 'Hướng dẫn sử dụng', href: '#' },
      { name: 'Câu hỏi thường gặp', href: '#' },
      { name: 'Bảo mật', href: '#' }
    ],
    legal: [
      { name: 'Chính sách bảo mật', href: '#' },
      { name: 'Điều khoản sử dụng', href: '#' },
      { name: 'Chính sách cookie', href: '#' },
      { name: 'Khiếu nại', href: '#' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo size="normal" showText={true} textColor="text-white" />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Ứng dụng quản lý tài chính cá nhân thông minh, giúp bạn kiểm soát chi tiêu và đạt được mục tiêu tài chính.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">thanhthanthiendia12@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">+84 583496990</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Thành phố Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md">
            <h4 className="text-lg font-semibold mb-4">Đăng ký nhận tin tức</h4>
            <p className="text-gray-300 text-sm mb-4">
              Nhận các cập nhật mới nhất về tính năng và mẹo quản lý tài chính.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-lg transition-colors font-medium">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-300 text-sm">
              <span>© {currentYear} Đây là sản phẩm phục vụ mục đích học tập không kinh doanh</span>
              <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
            </div>
            
            {/* Social links */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
