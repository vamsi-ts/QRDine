import { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Clock, CheckCircle2, TrendingUp, DollarSign, Medal } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart 
} from 'recharts';
import { orderApi } from '../services/api';
import type { DashboardStats } from '../types';
import { currency } from '../utils/currency';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  useEffect(() => {
    orderApi.stats().then(({ data }) => setStats(data));
  }, []);

  const chartData = useMemo(() => {
    if (!stats) return [];
    if (timeRange === 'weekly') return stats.revenueChartWeekly;
    if (timeRange === 'monthly') return stats.revenueChartMonthly;
    return stats.revenueChartYearly;
  }, [stats, timeRange]);

  const cards = stats
    ? [
        { label: 'Total Revenue', value: currency(stats.totalSales), icon: DollarSign, color: '#059669' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#3b82f6' },
        { label: "Today's Orders", value: stats.todaysOrders, icon: Clock, color: '#f59e0b' },
        { label: 'Active Orders', value: stats.activeOrders, icon: TrendingUp, color: '#10b981' },
        { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle2, color: '#6366f1' },
      ]
    : [];

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Analytics & Stats</h1>
          <p>Real-time performance overview of your restaurant orders and revenue.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-header">
              <span>{label}</span>
              <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={20} />
              </div>
            </div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          {/* Revenue Chart */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>
                Income Trend
              </h3>
              <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '0.25rem', borderRadius: '0.5rem' }}>
                {(['weekly', 'monthly', 'yearly'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '0.375rem',
                      border: 'none',
                      backgroundColor: timeRange === range ? '#ffffff' : 'transparent',
                      color: timeRange === range ? '#059669' : '#6b7280',
                      boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.2s'
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dy={10} minTickGap={30} />
                  <YAxis yAxisId="left" tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `₹${value}`} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} dx={-10} width={60} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number, name: string) => [currency(value), 'Revenue']}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Medal size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>Top Selling Items</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.topItems.map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #f3f4f6' }}>
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    backgroundColor: index === 0 ? '#fef3c7' : index === 1 ? '#f3f4f6' : index === 2 ? '#ffedd5' : '#f8fafc',
                    color: index === 0 ? '#d97706' : index === 1 ? '#4b5563' : index === 2 ? '#c2410c' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.quantitySold} units sold</div>
                  </div>
                </div>
              ))}
              
              {stats.topItems.length === 0 && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
                  No sales data available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}