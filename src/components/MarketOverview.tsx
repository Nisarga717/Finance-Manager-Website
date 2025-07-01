import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MarketData {
  indices: Array<{
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
  sectors: Array<{
    name: string;
    change: number;
    color: string;
  }>;
  marketSentiment: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
}

interface MarketOverviewProps {
  data: MarketData;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
  const sectorChartData = {
    labels: data.sectors.map(sector => sector.name),
    datasets: [
      {
        label: 'Sector Performance (%)',
        data: data.sectors.map(sector => sector.change),
        backgroundColor: data.sectors.map(sector => 
          sector.change >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: data.sectors.map(sector => 
          sector.change >= 0 ? '#10b981' : '#ef4444'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const sentimentData = {
    labels: ['Bullish', 'Bearish', 'Neutral'],
    datasets: [
      {
        data: [data.marketSentiment.bullish, data.marketSentiment.bearish, data.marketSentiment.neutral],
        backgroundColor: ['#10b981', '#ef4444', '#8b5cf6'],
        borderColor: ['#059669', '#dc2626', '#7c3aed'],
        borderWidth: 2,
      },
    ],
  };

  const sectorOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e1b4b',
        bodyColor: '#374151',
        borderColor: '#7c3aed',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y > 0 ? '+' : ''}${context.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8b5cf6',
          font: {
            size: 10,
            weight: 'normal' as const,
          },
          maxRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(124, 58, 237, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#8b5cf6',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const sentimentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e1b4b',
        bodyColor: '#374151',
        borderColor: '#7c3aed',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
    cutout: '60%',
  };

  const containerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    height: '100%',
  };

  const cardStyles: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(124, 58, 237, 0.1)',
    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.1)',
    padding: '24px',
  };

  const headerStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e1b4b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const indicesStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  };

  const indexCardStyles: React.CSSProperties = {
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(168, 85, 247, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(124, 58, 237, 0.1)',
  };

  return (
    <div style={containerStyles}>
      {/* Sector Performance */}
      <div style={cardStyles}>
        <h3 style={headerStyles}>
          📊 Sector Performance
        </h3>
        <div style={{ height: '300px' }}>
          <Bar data={sectorChartData} options={sectorOptions} />
        </div>
      </div>

      {/* Market Sentiment */}
      <div style={cardStyles}>
        <h3 style={headerStyles}>
          💭 Market Sentiment
        </h3>
        <div style={{ height: '200px', marginBottom: '20px' }}>
          <Doughnut data={sentimentData} options={sentimentOptions} />
        </div>
        
        {/* Indian Market Indices */}
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e1b4b', marginBottom: '16px' }}>
          🇮🇳 Indian Indices
        </h4>
        <div style={indicesStyles}>
          {data.indices.map((index, i) => (
            <div key={i} style={indexCardStyles}>
              <h5 style={{ fontSize: '12px', color: '#8b5cf6', margin: '0 0 4px', fontWeight: '600' }}>
                {index.name}
              </h5>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#1e1b4b', margin: '0 0 2px' }}>
                {index.value.toLocaleString('en-IN')}
              </p>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600',
                color: index.change >= 0 ? '#10b981' : '#ef4444',
                margin: 0
              }}>
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(0)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketOverview; 