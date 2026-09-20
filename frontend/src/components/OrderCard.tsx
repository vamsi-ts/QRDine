import { useState } from 'react';
import type { Order, OrderStatus, PaymentMethod } from '../types';
import { currency } from '../utils/currency';
import { Clock, ArrowRight, Printer, CheckCircle2, CreditCard, Banknote, Smartphone } from 'lucide-react';

const paymentMethodDetails: Record<PaymentMethod, { label: string; icon: typeof Banknote; color: string }> = {
  CASH: { label: 'Cash', icon: Banknote, color: '#059669' },
  CARD: { label: 'Card', icon: CreditCard, color: '#3b82f6' },
  UPI: { label: 'UPI', icon: Smartphone, color: '#8b5cf6' },
};

export function OrderCard({
  order,
  actionLabel,
  nextStatus,
  onUpdate,
  onPrintBill,
  userRole,
}: {
  order: Order;
  actionLabel?: string;
  nextStatus?: OrderStatus;
  onUpdate?: (id: number, status: OrderStatus, paymentMethod?: PaymentMethod) => void;
  onPrintBill?: (order: Order) => void;
  userRole?: string;
}) {
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);
  const statusClass = order.status.toLowerCase();
  const isPaid = order.status === 'PAID';

  const handleMarkPaid = (method: PaymentMethod) => {
    onUpdate?.(order.id, 'PAID', method);
    setShowPaymentSelect(false);
  };

  return (
    <div className="order-card-wiz">
      <div className="order-card-header">
        <div>
          <span className="order-table-tag">Table {order.tableNumber}</span>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> #{order.orderNumber}
          </div>
        </div>
        <span className={`status-pill ${statusClass}`}>{order.status}</span>
      </div>

      <ul className="order-items-list">
        {order.items.map((item) => (
          <li key={item.id} className="order-item-row">
            <span>
              <strong>{item.quantity}x</strong> {item.menuItemName}
            </span>
            <span style={{ color: '#64748b' }}>{currency(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{currency(order.totalAmount)}</div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isPaid ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} /> Paid & Settled
              </span>
              {order.paymentMethod && (() => {
                const details = paymentMethodDetails[order.paymentMethod];
                const Icon = details.icon;
                return (
                  <span
                    className="payment-badge"
                    style={{ backgroundColor: `${details.color}12`, color: details.color, border: `1px solid ${details.color}30` }}
                  >
                    <Icon size={12} /> {details.label}
                  </span>
                );
              })()}
            </div>
          ) : (
            <>
              {onPrintBill && (
                <button
                  className="btn-secondary"
                  style={{ padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                  onClick={() => onPrintBill(order)}
                  title="Generate Table Bill & Settle"
                >
                  <Printer size={16} /> Bill
                </button>
              )}

              {actionLabel && nextStatus && onUpdate && (
                <button
                  className="btn-primary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => onUpdate(order.id, nextStatus)}
                >
                  {actionLabel} <ArrowRight size={14} />
                </button>
              )}

              {order.status === 'DELIVERED' && onUpdate && !actionLabel && userRole === 'ADMIN' && (
                <>
                  {!showPaymentSelect ? (
                    <button
                      className="btn-primary"
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', backgroundColor: '#059669' }}
                      onClick={() => setShowPaymentSelect(true)}
                    >
                      <CreditCard size={14} /> Mark Paid
                    </button>
                  ) : (
                    <div className="inline-payment-select">
                      {(['CASH', 'CARD', 'UPI'] as PaymentMethod[]).map((method) => {
                        const details = paymentMethodDetails[method];
                        const Icon = details.icon;
                        return (
                          <button
                            key={method}
                            className="payment-method-btn-sm"
                            style={{ color: details.color, borderColor: details.color }}
                            onClick={() => handleMarkPaid(method)}
                            title={`Mark paid via ${details.label}`}
                          >
                            <Icon size={14} /> {details.label}
                          </button>
                        );
                      })}
                      <button
                        className="payment-method-btn-sm cancel"
                        onClick={() => setShowPaymentSelect(false)}
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}