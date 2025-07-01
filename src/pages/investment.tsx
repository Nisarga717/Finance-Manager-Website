import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/authContext';
import StockChart from '../components/StockChart';
import MarketOverview from '../components/MarketOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Plus, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Star,
  Activity,
  Target,
  Wallet,
  ExternalLink
} from 'lucide-react';

interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
}

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  datetime: number;
  image?: string;
}

interface Portfolio {
  totalValue: number;
  totalInvested: number;
  totalGain: number;
  gainPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

const Investments: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [watchlist] = useState<string[]>([
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 
    'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS'
  ]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState('RELIANCE.NS');
  const [chartData, setChartData] = useState<Array<{ time: string; price: number; volume: number }>>([]);
  
  const [marketData] = useState({
    indices: [
      { name: 'NIFTY 50', value: 19674.25, change: 145.30, changePercent: 0.74 },
      { name: 'SENSEX', value: 65995.63, change: 498.58, changePercent: 0.76 },
      { name: 'BANK NIFTY', value: 44821.45, change: 312.85, changePercent: 0.70 },
      { name: 'NIFTY IT', value: 29156.80, change: -85.45, changePercent: -0.29 }
    ],
    sectors: [
      { name: 'Banking', change: 1.2, color: '#10b981' },
      { name: 'IT', change: -0.8, color: '#ef4444' },
      { name: 'Pharma', change: 2.1, color: '#10b981' },
      { name: 'Auto', change: 0.5, color: '#10b981' },
      { name: 'FMCG', change: -0.3, color: '#ef4444' },
      { name: 'Oil & Gas', change: 1.8, color: '#10b981' },
      { name: 'Metals', change: -1.2, color: '#ef4444' },
      { name: 'Real Estate', change: 0.9, color: '#10b981' }
    ],
    marketSentiment: {
      bullish: 58,
      bearish: 25,
      neutral: 17
    }
  });
  
  const [portfolio] = useState<Portfolio>({
    totalValue: 2875000,
    totalInvested: 2340000,
    totalGain: 535000,
    gainPercentage: 22.86,
    dayChange: 23750,
    dayChangePercentage: 0.84
  });

  useEffect(() => {
    fetchStockData();
    fetchMarketNews();
    fetchChartData(selectedStock);
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchChartData(selectedStock);
    }
  }, [selectedStock]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setStockData([
        { symbol: 'RELIANCE.NS', companyName: 'Reliance Industries Ltd.', currentPrice: 2456.80, change: 32.45, changePercent: 1.34, high: 2478.90, low: 2445.20, volume: 8547382 },
        { symbol: 'TCS.NS', companyName: 'Tata Consultancy Services', currentPrice: 3567.25, change: -15.80, changePercent: -0.44, high: 3598.40, low: 3556.70, volume: 2894751 },
        { symbol: 'HDFCBANK.NS', companyName: 'HDFC Bank Limited', currentPrice: 1678.90, change: 21.35, changePercent: 1.29, high: 1689.50, low: 1665.30, volume: 5847562 },
        { symbol: 'INFY.NS', companyName: 'Infosys Limited', currentPrice: 1456.70, change: -8.45, changePercent: -0.58, high: 1475.20, low: 1448.90, volume: 4821947 },
        { symbol: 'HINDUNILVR.NS', companyName: 'Hindustan Unilever Ltd.', currentPrice: 2789.45, change: 18.90, changePercent: 0.68, high: 2795.60, low: 2776.30, volume: 1294857 },
        { symbol: 'ITC.NS', companyName: 'ITC Limited', currentPrice: 456.30, change: 5.60, changePercent: 1.24, high: 459.80, low: 452.10, volume: 9547823 },
        { symbol: 'SBIN.NS', companyName: 'State Bank of India', currentPrice: 598.75, change: -3.25, changePercent: -0.54, high: 605.40, low: 595.20, volume: 7821456 },
        { symbol: 'BHARTIARTL.NS', companyName: 'Bharti Airtel Limited', currentPrice: 945.60, change: 12.80, changePercent: 1.37, high: 952.30, low: 938.90, volume: 3654789 },
        { symbol: 'KOTAKBANK.NS', companyName: 'Kotak Mahindra Bank', currentPrice: 1789.25, change: -7.90, changePercent: -0.44, high: 1798.70, low: 1782.50, volume: 2147896 },
        { symbol: 'LT.NS', companyName: 'Larsen & Toubro Ltd.', currentPrice: 3245.80, change: 45.60, changePercent: 1.43, high: 3267.40, low: 3234.20, volume: 1589473 }
      ]);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketNews = async () => {
    try {
      setNews([
        {
          id: '1',
          headline: 'Tech Stocks Rally as AI Innovation Drives Market Optimism',
          summary: 'Major technology companies see significant gains as artificial intelligence developments continue to reshape the industry landscape.',
          url: '#',
          source: 'Financial Times',
          datetime: Date.now() / 1000,
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop'
        },
        {
          id: '2',
          headline: 'Federal Reserve Maintains Interest Rates Amid Economic Uncertainty',
          summary: 'The central bank holds rates steady while monitoring inflation trends and employment data.',
          url: '#',
          source: 'Reuters',
          datetime: Date.now() / 1000 - 3600,
        },
        {
          id: '3',
          headline: 'Green Energy Investments Surge to Record Highs',
          summary: 'Renewable energy sector attracts unprecedented capital as governments push for carbon neutrality.',
          url: '#',
          source: 'Bloomberg',
          datetime: Date.now() / 1000 - 7200,
        }
      ]);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchChartData = async (symbol: string) => {
    try {
      const mockData = [];
      const basePrice = stockData.find(s => s.symbol === symbol)?.currentPrice || 2500;
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const priceVariation = (Math.random() - 0.5) * 100;
        const price = basePrice + priceVariation;
        const volume = Math.floor(Math.random() * 1000000) + 500000;
        
        mockData.push({
          time: time.toISOString(),
          price: Math.max(price, basePrice * 0.95),
          volume
        });
      }
      
      setChartData(mockData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData([]);
    }
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatChange = (change: number, isPercent = false) => {
    const prefix = change >= 0 ? '+' : '';
    return isPercent ? `${prefix}${change.toFixed(2)}%` : `${prefix}${formatPrice(change)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeInScale">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-purple">
            Investment Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time market insights and portfolio tracking powered by advanced analytics
          </p>
        </div>

        {/* Portfolio Summary */}
        <Card className="glass-card border-0 shadow-xl overflow-hidden animate-slideInUp">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-6 w-6" />
              <span>Portfolio Overview</span>
            </CardTitle>
            <CardDescription className="text-purple-100">
              Track your investment performance and growth
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-purple-600">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">TOTAL PORTFOLIO</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{(portfolio.totalValue / 100000).toFixed(1)}L
                </div>
                <div className="flex items-center space-x-1">
                  {portfolio.dayChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    portfolio.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatChange(portfolio.dayChange)} ({formatChange(portfolio.dayChangePercentage, true)})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-purple-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">TOTAL INVESTED</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{(portfolio.totalInvested / 100000).toFixed(1)}L
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">TOTAL GAINS</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{(portfolio.totalGain / 100000).toFixed(1)}L
                </div>
                <div className="text-sm text-green-600 font-medium">
                  +{portfolio.gainPercentage}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-purple-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">PERFORMANCE</span>
                </div>
                <Progress value={Math.min(portfolio.gainPercentage * 2, 100)} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  {Math.round(portfolio.gainPercentage * 2)}% of target
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:grid-cols-4 glass">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="overview">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="stocks">
              <TrendingUp className="h-4 w-4 mr-2" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="news">
              <Star className="h-4 w-4 mr-2" />
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="animate-slideInUp">
              <MarketOverview data={marketData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stock Watchlist */}
              <Card className="lg:col-span-2 glass-card border-0 shadow-lg hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span>Market Watchlist</span>
                  </CardTitle>
                  <CardDescription>Track your favorite stocks in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="loading-spin w-8 h-8"></div>
                      <span className="ml-3 text-muted-foreground">Loading market data...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stockData.map((stock) => (
                        <div 
                          key={stock.symbol} 
                          className="flex items-center justify-between p-4 rounded-lg hover:bg-purple-50/50 transition-colors card-hover"
                        >
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">{stock.companyName}</div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>H: {formatPrice(stock.high)}</span>
                              <span>L: {formatPrice(stock.low)}</span>
                              <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <div className="text-xl font-bold text-gray-900">
                              {formatPrice(stock.currentPrice)}
                            </div>
                            <div className={`flex items-center space-x-1 text-sm font-medium ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3" />
                              )}
                              <span>{formatChange(stock.change)} ({formatChange(stock.changePercent, true)})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="glass-card border-0 shadow-lg hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg">Market Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {marketData.indices.map((index, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{index.name}</span>
                        <Badge variant={index.change >= 0 ? "default" : "destructive"} className="text-xs">
                          {formatChange(index.changePercent, true)}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 shadow-lg hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stockData.length > 0 && (() => {
                      const topMover = stockData.reduce((prev, current) => 
                        Math.abs(current.changePercent) > Math.abs(prev.changePercent) ? current : prev
                      );
                      return (
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900">{topMover.symbol}</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(topMover.currentPrice)}
                          </div>
                          <div className={`text-sm font-medium ${
                            topMover.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatChange(topMover.change)} ({formatChange(topMover.changePercent, true)})
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="overview">
            <div className="animate-slideInUp">
              <MarketOverview data={marketData} />
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-6">
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <span>Stock Analysis</span>
                    </CardTitle>
                    <CardDescription>Detailed chart analysis and insights</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 btn-pulse">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stock Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Stock for Analysis
                  </label>
                  <select 
                    value={selectedStock} 
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {watchlist.map(symbol => (
                      <option key={symbol} value={symbol}>
                        {stockData.find(s => s.symbol === symbol)?.companyName || symbol}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Chart */}
                <Card className="glass border-purple-100">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {stockData.find(s => s.symbol === selectedStock)?.companyName || selectedStock} - Price Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockChart symbol={selectedStock} data={chartData} height={350} />
                  </CardContent>
                </Card>

                {/* Stock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stockData.slice(0, 4).map((stock) => (
                    <Card key={stock.symbol} className="glass-card border-0 hover-lift">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900">{stock.symbol}</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(stock.currentPrice)}
                          </div>
                          <Badge variant={stock.change >= 0 ? "default" : "destructive"}>
                            {formatChange(stock.changePercent, true)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span>Market News</span>
                </CardTitle>
                <CardDescription>Stay updated with the latest financial news</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {news.map((article) => (
                    <Card key={article.id} className="glass border-purple-100 hover-lift card-hover">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          {article.image && (
                            <div 
                              className="w-24 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                              style={{ backgroundImage: `url(${article.image})` }}
                            />
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {article.source}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(article.datetime)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors">
                              {article.headline}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-purple-600">
                              Read more
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Investments; 