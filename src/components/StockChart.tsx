import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface StockChartProps {
  symbol: string;
  data: Array<{
    time: string;
    price: number;
    volume: number;
  }>;
  height?: number;
}

const StockChart: React.FC<StockChartProps> = ({ symbol, data, height = 300 }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map(item => item.price),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#7c3aed',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e1b4b',
        bodyColor: '#374151',
        borderColor: '#7c3aed',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            return new Date(context[0].label).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: (context: any) => {
            return `₹${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
          displayFormats: {
            hour: 'HH:mm',
            day: 'dd MMM',
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#8b5cf6',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
        },
      },
      y: {
        position: 'right' as const,
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
            return '₹' + value.toFixed(0);
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div style={{ height, position: 'relative' }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default StockChart; 