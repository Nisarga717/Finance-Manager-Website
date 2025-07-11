import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Bell, 
  Bot, 
  CreditCard, 
  PieChart, 
  ArrowRight,
  Star,
  Users,
  TrendingDown,
  Sparkles,
  Zap,
  Target,
  Activity,
  Shield
} from 'lucide-react';
import { fetchUserCount, formatUserCount } from '../lib/statsService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadUserCount = async () => {
      try {
        setIsLoadingStats(true);
        const count = await fetchUserCount();
        setUserCount(count);
      } catch (error) {
        console.error('Failed to load user count:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadUserCount();
  }, []);

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Smart Dashboard",
      description: "Real-time insights into your spending patterns and financial health with interactive charts.",
      gradient: "from-blue-500 to-purple-600",
      path: "/dashboard"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Transaction Tracking", 
      description: "Automatically categorize and track all your transactions with AI-powered tagging.",
      gradient: "from-purple-500 to-pink-600",
      path: "/transactions"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Investment Portfolio",
      description: "Monitor your stocks and investments with live market data and performance analytics.",
      gradient: "from-green-500 to-teal-600",
      path: "/investments"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Reminders",
      description: "Never miss a bill payment with intelligent reminders and subscription tracking.",
      gradient: "from-orange-500 to-red-600",
      path: "/bills"
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI Financial Assistant",
      description: "Get personalized financial advice and insights from our advanced AI chatbot.",
      gradient: "from-indigo-500 to-purple-600",
      path: "/dashboard"
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: "Budget Planning",
      description: "Create and track budgets with visual breakdowns and spending forecasts.",
      gradient: "from-pink-500 to-rose-600",
      path: "/dashboard"
    }
  ];

  const stats = [
    { 
      icon: Users, 
      value: isLoadingStats ? "..." : formatUserCount(userCount), 
      label: "Active Users" 
    },
    { icon: TrendingUp, value: "₹50M+", label: "Money Managed" },
    { icon: Star, value: "99.9%", label: "Uptime" },
  ];

  return (
    <Layout>
      <div className="space-y-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="animate-fadeInScale">
                <Badge variant="secondary" className="mb-6 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                  🚀 The Future of Finance is Here
                </Badge>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight gradient-text-purple mb-8 animate-slideInUp">
                  Master Your Finances
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-slideInUp animation-delay-2000">
                  Experience the future of financial management with AI-powered insights, real-time tracking, 
                  and intelligent automation. Take control of your financial destiny.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideInUp animation-delay-4000">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group btn-pulse px-8 py-6 text-lg"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/investments')}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-6 text-lg btn-pulse"
                  >
                    View Investments
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SmartSplit Product Launch Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="absolute top-4 right-4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 left-4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="animate-fadeInScale">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-400/30 backdrop-blur-sm px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Product Launch
                  </Badge>
                  <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/30 backdrop-blur-sm px-4 py-2 animate-pulse">
                    <Activity className="h-4 w-4 mr-2" />
                    Now Available
                  </Badge>
                </div>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10">
                    <Sparkles className="h-12 w-12 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      SmartSplit
                    </h2>
                    <p className="text-blue-400 text-lg font-medium">Professional Expense Management</p>
                  </div>
                </div>

                <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Revolutionary expense splitting platform with AI-powered optimization and real-time settlement tracking. 
                  Split bills intelligently, settle debts efficiently.
                </p>

                <div className="flex items-center justify-center gap-8 mb-12">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <Zap className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">AI-Powered Splitting</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <span className="text-sm font-medium">Minimal Settlements</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <Shield className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Real-time Tracking</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/split-expenses')}
                    className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 group px-10 py-6 text-lg font-semibold rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                      Try SmartSplit Now
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Trusted by</div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="w-8 h-8 bg-green-500/20 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <Star className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-purple-400" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">1000+ early users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature highlights for SmartSplit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Group Management</h3>
                <p className="text-gray-400 leading-relaxed">Create and manage multiple expense groups with intelligent member coordination</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                  <BarChart3 className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
                <p className="text-gray-400 leading-relaxed">Advanced balance calculations with settlement optimization algorithms</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Updates</h3>
                <p className="text-gray-400 leading-relaxed">Live expense tracking and instant balance updates across all devices</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-purple-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to manage, track, and grow your wealth in one intelligent platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group hover-lift card-hover glass-card border-0 overflow-hidden cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => navigate(feature.path)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 p-0 h-auto font-medium"
                    >
                      Learn More <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="group animate-float"
                  style={{ animationDelay: `${index * 500}ms` }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2 gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-purple-200 text-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
            </div>
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 animate-slideInUp">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto animate-slideInUp animation-delay-2000">
              Join thousands of users who have already taken control of their finances with FinWise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInUp animation-delay-4000">
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg btn-pulse"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/transactions')}
                className="border-white/30 text-purple-600 hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg btn-pulse"
              >
                View Transactions
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;