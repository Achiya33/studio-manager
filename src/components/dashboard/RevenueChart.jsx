import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { demoStore } from '../../lib/demoStore';
import { format, subMonths } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RevenueChart() {
  const chartData = useMemo(() => {
    const payments = demoStore.getAll('payments');
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const monthKey = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');

      let received = 0;
      let outstanding = 0;

      payments.forEach(p => {
        p.transactions?.forEach(t => {
          if (format(new Date(t.date), 'yyyy-MM') === monthKey) {
            received += t.amount;
          }
        });
        if (format(new Date(p.createdAt), 'yyyy-MM') === monthKey) {
          outstanding += p.balance;
        }
      });

      months.push({ label, received, outstanding });
    }

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Received',
          data: months.map(m => m.received),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Outstanding',
          data: months.map(m => m.outstanding),
          backgroundColor: 'rgba(245, 158, 11, 0.5)',
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#9ca3b4',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 12, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: '#252836',
        titleColor: '#f0f0f5',
        bodyColor: '#9ca3b4',
        borderColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: Rs. ${ctx.raw?.toLocaleString() || 0}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 12, family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#6b7280',
          font: { size: 12, family: 'Inter' },
          callback: (v) => `${(v / 1000)}K`,
        },
      },
    },
  };

  return (
    <div className="revenue-chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}
