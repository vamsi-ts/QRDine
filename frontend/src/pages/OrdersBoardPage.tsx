import { useCallback, useEffect, useState, useMemo } from 'react';
import { OrderCard } from '../components/OrderCard';
import { BillModal } from '../components/BillModal';
import { useOrdersSocket } from '../hooks/useOrdersSocket';
import { apiErrorMessage, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Order, OrderStatus, PaymentMethod } from '../types';
import { Printer, CreditCard } from 'lucide-react';

const titles: Record<OrderStatus, string> = {
  NEW: 'New Orders',
  ACCEPTED: 'Accepted Orders',
  PREPARING: 'Kitchen Preparing',
  READY: 'Ready for Pickup',
  DELIVERED: 'Delivered',
  PAID: 'Paid & Settled',
  CANCELLED: 'Cancelled',
};

interface OrdersBoardProps {
  status?: OrderStatus | OrderStatus[];
  title?: string;
  actionLabel?: string;
  nextStatus?: OrderStatus;
  actions?: Partial<Record<OrderStatus, { label: string; nextStatus: OrderStatus }>>;
}

export function OrdersBoardPage({ status, title, actionLabel, nextStatus, actions }: OrdersBoardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTableBilling, setSelectedTableBilling] = useState<{ tableNumber: number; orders: Order[] } | null>(null);
  const [error, setError] = useState('');
  const { role } = useAuth();
  const { toast } = useToast();
  const statusKey = Array.isArray(status) ? status.join('|') : status ?? '';

  const load = useCallback(async () => {
    setError('');
    if (!status) {
      const { data } = await orderApi.list();
      setOrders(data);
      return;
    }
    const statuses = Array.isArray(status) ? status : [status];
    const responses = await Promise.all(statuses.map((value) => orderApi.list(value)));
    setOrders(
      responses
        .flatMap(({ data }) => data)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    );
  }, [statusKey]);

  useEffect(() => {
    load();
  }, [load]);

  useOrdersSocket(
    useCallback((event) => {
      load();
      if (event.type === 'NEW_ORDER' || event.type === 'ORDER_CREATED') {
        toast.info(`🔔 New order #${event.order?.orderNumber} received for Table ${event.order?.tableNumber}!`);
      }
    }, [load, toast])
  );

  const heading = title ?? (Array.isArray(status) ? 'Orders Board' : status ? titles[status] : 'All Orders');

  async function update(id: number, next: OrderStatus, paymentMethod?: PaymentMethod) {
    setError('');
    try {
      await orderApi.updateStatus(id, next, paymentMethod);
      toast.success(`Order status updated to ${next}!`);
      load();
    } catch (exception) {
      const msg = apiErrorMessage(exception, 'This order cannot be moved to that status. Refresh and try again.');
      setError(msg);
      toast.error(msg);
      load();
    }
  }

  // Handle consolidated table bill generation (Admin only)
  const openTableBill = (tableNum: number) => {
    const activeTableOrders = orders.filter(
      (o) => o.tableNumber === tableNum && o.status !== 'PAID' && o.status !== 'CANCELLED'
    );
    if (activeTableOrders.length === 0) {
      toast.info(`No active unpaid orders for Table ${tableNum}.`);
      return;
    }
    setSelectedTableBilling({ tableNumber: tableNum, orders: activeTableOrders });
  };

  const handleSettleTablePayment = async (tableNum: number, paymentMethod: PaymentMethod) => {
    await orderApi.settleTablePayment(tableNum, paymentMethod);
    await load();
  };

  // Group active orders by table for Admin session summary
  const tableSummary = useMemo(() => {
    const map = new Map<number, Order[]>();
    orders.forEach((o) => {
      if (o.status !== 'PAID' && o.status !== 'CANCELLED') {
        const list = map.get(o.tableNumber) || [];
        list.push(o);
        map.set(o.tableNumber, list);
      }
    });
    return Array.from(map.entries());
  }, [orders]);

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div className="page-title-group">
          <h1>{heading}</h1>
          <p>Real-time order management queue with consolidated table billing & session settlement.</p>
        </div>
      </div>

      {/* Admin Consolidated Table Billing Bar */}
      {role === 'ADMIN' && tableSummary.length > 0 && (
        <div className="no-print" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} className="text-emerald" /> Active Table Billing Sessions
          </h3>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            {tableSummary.map(([tblNum, tblOrders]) => (
              <button
                key={tblNum}
                className="btn-secondary"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', borderColor: '#10b981', color: '#065f46' }}
                onClick={() => openTableBill(tblNum)}
              >
                <Printer size={16} /> Table {tblNum} Bill ({tblOrders.length} orders)
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="no-print" style={{ padding: '0.85rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {orders.map((order) => {
          const action = actions?.[order.status] ?? (actionLabel && nextStatus ? { label: actionLabel, nextStatus } : undefined);
          return (
            <OrderCard
              key={order.id}
              order={order}
              actionLabel={action?.label}
              nextStatus={action?.nextStatus}
              onUpdate={update}
              onPrintBill={role === 'ADMIN' ? (ord) => openTableBill(ord.tableNumber) : undefined}
              userRole={role}
            />
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="no-print" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No active orders in this queue.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>New orders will appear automatically via live updates.</p>
        </div>
      )}

      {/* Table Consolidated Bill Modal (Admin Only) */}
      {role === 'ADMIN' && selectedTableBilling && (
        <BillModal
          tableNumber={selectedTableBilling.tableNumber}
          orders={selectedTableBilling.orders}
          onClose={() => setSelectedTableBilling(null)}
          onSettlePayment={(paymentMethod) => handleSettleTablePayment(selectedTableBilling.tableNumber, paymentMethod)}
        />
      )}
    </div>
  );
}