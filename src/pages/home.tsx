import React from 'react';
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
  TrendingDown
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

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
    { icon: Users, value: "10K+", label: "Active Users" },
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
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg btn-pulse"
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