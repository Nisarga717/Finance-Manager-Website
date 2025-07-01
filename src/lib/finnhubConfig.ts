// Finnhub API Configuration
// Get your free API key from: https://finnhub.io/register

export const FINNHUB_CONFIG = {
  API_KEY: process.env.REACT_APP_FINNHUB_API_KEY || 'your_finnhub_api_key_here',
  BASE_URL: 'https://finnhub.io/api/v1',
  WEBSOCKET_URL: 'wss://ws.finnhub.io'
};

// API Endpoints
export const ENDPOINTS = {
  QUOTE: '/quote',
  PROFILE: '/stock/profile2',
  NEWS: '/news',
  CANDLES: '/stock/candle',
  EARNINGS: '/stock/earnings',
  METRICS: '/stock/metric',
  COMPANY_NEWS: '/company-news'
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params: Record<string, string | number>) => {
  const url = new URL(FINNHUB_CONFIG.BASE_URL + endpoint);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  url.searchParams.append('token', FINNHUB_CONFIG.API_KEY);
  return url.toString();
};

// Fetch stock quote
export const fetchStockQuote = async (symbol: string) => {
  const url = buildApiUrl(ENDPOINTS.QUOTE, { symbol });
  const response = await fetch(url);
  return response.json();
};

// Fetch company profile
export const fetchCompanyProfile = async (symbol: string) => {
  const url = buildApiUrl(ENDPOINTS.PROFILE, { symbol });
  const response = await fetch(url);
  return response.json();
};

// Fetch market news
export const fetchMarketNews = async (category = 'general') => {
  const url = buildApiUrl(ENDPOINTS.NEWS, { category });
  const response = await fetch(url);
  return response.json();
};

// Fetch company-specific news
export const fetchCompanyNews = async (symbol: string, from: string, to: string) => {
  const url = buildApiUrl(ENDPOINTS.COMPANY_NEWS, { symbol, from, to });
  const response = await fetch(url);
  return response.json();
};

// Fetch candlestick data for charts
export const fetchCandlestickData = async (
  symbol: string, 
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
  from: number,
  to: number
) => {
  const url = buildApiUrl(ENDPOINTS.CANDLES, { 
    symbol, 
    resolution, 
    from: from.toString(),
    to: to.toString()
  });
  const response = await fetch(url);
  return response.json();
};

// Popular stock symbols for demo
export const POPULAR_STOCKS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX', 'UBER', 'AMD'
];

// Market indices
export const MARKET_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^DJI', name: 'DOW JONES' },
  { symbol: '^VIX', name: 'VIX' }
];

// Currency pairs for forex (if needed)
export const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'AUD/USD'
];

/*
SETUP INSTRUCTIONS:

1. Get your FREE API key:
   - Visit https://finnhub.io/register
   - Sign up for a free account
   - Copy your API key

2. Add to environment variables:
   - Create a .env file in your frontend directory
   - Add: REACT_APP_FINNHUB_API_KEY=your_actual_api_key_here

3. Free tier limits:
   - 60 API calls per minute
   - Real-time data for US stocks
   - Company profiles and financials
   - Market news

4. For enhanced charts, consider integrating:
   - TradingView lightweight charts: https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/
   - Chart.js with financial plugin
   - Recharts with custom candlestick components

5. WebSocket for real-time data:
   - Use WEBSOCKET_URL for live price updates
   - Subscribe to specific symbols for real-time streaming
*/ 