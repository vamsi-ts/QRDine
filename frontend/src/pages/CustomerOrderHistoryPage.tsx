import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { useOrdersSocket } from '../hooks/useOrdersSocket';
import { orderApi } from '../services/api';
import type { Order } from '../types';
import { currency } from '../utils/currency';

export function CustomerOrderHistoryPage() {
  const { tableNumber } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (tableNumber) {
      try {
        const { data } = await orderApi.tableOrders(Number(tableNumber));
        // Sort newest first
        setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.error('Failed to load table orders', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [tableNumber]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useOrdersSocket(
    useCallback(
      (event) => {
        if (event.order && event.order.tableNumber === Number(tableNumber)) {
          // If order became PAID or CANCELLED, remove it from the list.
          if (event.order.status === 'PAID' || event.order.status === 'CANCELLED') {
            setOrders((prev) => prev.filter((o) => o.id !== event.order.id));
          } else {
            // Otherwise add or update it
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === event.order.id);
              if (exists) {
                return prev.map((o) => (o.id === event.order.id ? event.order : o));
              }
              return [event.order, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
          }
        }
      },
      [tableNumber]
    )
  );

  const totalSessionAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  return (
    <div className="customer-container" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/menu?table=${tableNumber}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to menu
        </Link>
      </div>

      <header className="customer-hero" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '4px' }}>
            Table {tableNumber}
          </div>
          <h1>My Active Orders</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Track the status of your dishes for this dining session.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '4px' }}>
            Session Total
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {currency(totalSessionAmount)}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px', color: '#64748b' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>No Active Orders</h2>
          <p style={{ fontSize: '0.95rem' }}>Your table currently has no active orders. They will disappear from here once you pay!</p>
          <Link to={`/menu?table=${tableNumber}`} className="btn-primary" style={{ display: 'inline-flex', margin: '1.5rem auto 0' }}>
            Browse Menu
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                    <Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Order #{order.orderNumber}</h3>
                </div>
                <Link to={`/order-tracking/${order.id}`} style={{ textDecoration: 'none' }}>
                  <span className={`status-pill ${order.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                    {order.status}
                  </span>
                </Link>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>
                      <strong style={{ color: '#0f172a' }}>{item.quantity}x</strong> {item.menuItemName}
                      {item.specialInstruction && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>Note: {item.specialInstruction}</div>
                      )}
                    </span>
                    <span style={{ fontWeight: 600, color: '#475569' }}>
                      {currency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
