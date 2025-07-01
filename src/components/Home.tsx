import React from 'react';
import { BarChart3, TrendingUp, Bell, Bot, CreditCard, PieChart, Shield, Zap } from 'lucide-react';

const FinWiseHome = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Dashboard",
      description: "Real-time insights into your spending patterns and financial health with interactive charts."
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Transaction Tracking",
      description: "Automatically categorize and track all your transactions with AI-powered tagging."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Investment Portfolio",
      description: "Monitor your stocks and investments with live market data and performance analytics."
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Reminders",
      description: "Never miss a bill payment with intelligent reminders and subscription tracking."
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Financial Assistant",
      description: "Get personalized financial advice and insights from our advanced AI chatbot."
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Budget Planning",
      description: "Create and track budgets with visual breakdowns and spending forecasts."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">FinWise</h1>
                <p className="text-purple-200 text-sm">Smart Financial Management</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Dashboard</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Investments</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors font-medium">Analytics</a>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-all font-medium border border-white/20">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Master Your Finances
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of financial management with AI-powered insights, real-time tracking, 
              and intelligent automation. Take control of your financial destiny.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Your Journey
              </button>
              <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-600 hover:text-white transition-all">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-800 mb-4">Powerful Features</h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage, track, and grow your wealth in one intelligent platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-purple-200 group-hover:-translate-y-2">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <div className="text-purple-600">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-purple-200">Active Users</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">₹50M+</div>
              <div className="text-purple-200">Money Managed</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-purple-200">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-600 rounded-xl p-2">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">FinWise</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Empowering individuals to make smarter financial decisions through cutting-edge technology and AI-driven insights.
              </p>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Shield className="w-4 h-4" />
                <span>Bank-level security • End-to-end encryption</span>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold mb-4">Product</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold mb-4">Support</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-400">
            <p>&copy; 2025 FinWise. All rights reserved. Built with ❤️ for financial freedom.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FinWiseHome;