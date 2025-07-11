import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import FinancialChatbot from './FinancialChatbot';
import {
  Zap,
  Shield,
  BarChart3,
  Home,
  DollarSign,
  Receipt,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Custom cursor effect
  React.useEffect(() => {
    const cursor = document.querySelector('.cursor-glow') as HTMLElement;

    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const onMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    const onMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/transactions', label: 'Transactions', icon: DollarSign },
    { path: '/bills', label: 'Bills', icon: Receipt },
    { path: '/investments', label: 'Investments', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-lg bg-white/10 border-b border-white/20 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl transform transition duration-500 group-hover:scale-110">
                  <Zap className="h-8 w-8 text-white" />
                </Card>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  FinWize
                </h1>
                <p className="text-sm text-muted-foreground">Smart Financial Management</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`relative overflow-hidden group btn-pulse ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                          : 'hover:bg-white/20 hover:text-purple-600'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                      {isActive(item.path) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="hidden md:flex items-center space-x-4">
              {auth?.user && (
                <Badge variant="secondary" className="bg-white/20 text-purple-600 border-purple-200 animate-float">
                  {auth.user.fullName || auth.user.email}
                </Badge>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-purple-600 hover:bg-white/20 hover:border-purple-300 transition-all duration-300 btn-pulse"
              >
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'hover:bg-white/20'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <Separator className="my-2" />
                <div className="px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {auth?.user?.fullName || auth?.user?.email}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start bg-white/10 border-white/20"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-slate-900 to-purple-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </Card>
                <span className="text-xl font-bold">FinWise</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Empowering individuals to make smarter financial decisions through cutting-edge technology and AI-driven insights.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Bank-level security • End-to-end encryption</span>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">API</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-700" />

          <div className="text-center text-gray-400">
            <p>© 2025 FinWise. All rights reserved. Built with ❤️ for financial freedom.</p>
          </div>
        </div>
      </footer>

      {/* Custom Cursor Effect */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="cursor-glow opacity-0"></div>
      </div>

      {/* Global Financial Chatbot - Available on all pages */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <div className="pointer-events-auto">
          <FinancialChatbot />
        </div>
      </div>
    </div>
  );
};

export default Layout;
