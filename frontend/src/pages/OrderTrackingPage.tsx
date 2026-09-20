import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useOrdersSocket } from '../hooks/useOrdersSocket';
import { orderApi } from '../services/api';
import type { Order, OrderStatus } from '../types';

const steps: OrderStatus[] = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'];

export function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) orderApi.get(Number(orderId)).then(({ data }) => setOrder(data));
  }, [orderId]);

  useOrdersSocket(
    useCallback(
      (event) => {
        if (event.order.id === Number(orderId)) setOrder(event.order);
      },
      [orderId]
    )
  );

  if (!order) {
    return (
      <div className="customer-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Loading order status...</p>
      </div>
    );
  }

  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="customer-container" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/menu?table=${order.tableNumber}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to menu
        </Link>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '2rem', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Order Number</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>#{order.orderNumber}</h1>
          </div>
          <span className="table-chip" style={{ color: '#0f172a' }}>Table {order.tableNumber}</span>
        </div>

        {/* Progress Step Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                style={{
                  padding: '0.75rem 0.35rem',
                  textAlign: 'center',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  transition: 'all 0.2s ease',
                  backgroundColor: isDone ? '#10b981' : '#f1f5f9',
                  color: isDone ? '#ffffff' : '#64748b',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none',
                }}
              >
                {step}
              </div>
            );
          })}
        </div>

        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#065f46' }}>
          <Clock size={20} />
          <div>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Current Status</span>
            <strong style={{ fontSize: '1.1rem' }}>{order.status}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}