import { useState } from 'react';
import { Printer, X, CheckCircle2, UtensilsCrossed, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import type { Order, OrderItem, PaymentMethod } from '../types';
import { currency } from '../utils/currency';
import { useToast } from '../context/ToastContext';
import { apiErrorMessage } from '../services/api';

interface BillModalProps {
  tableNumber: number;
  orders: Order[];
  onClose: () => void;
  onSettlePayment?: (paymentMethod: PaymentMethod) => Promise<void>;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Banknote; color: string }[] = [
  { value: 'CASH', label: 'Cash', icon: Banknote, color: '#059669' },
  { value: 'CARD', label: 'Card', icon: CreditCard, color: '#3b82f6' },
  { value: 'UPI', label: 'UPI', icon: Smartphone, color: '#8b5cf6' },
];

export function BillModal({ tableNumber, orders, onClose, onSettlePayment }: BillModalProps) {
  const { toast } = useToast();
  const [isSettling, setIsSettling] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  if (!orders || orders.length === 0) return null;

  // Aggregate all items across all active orders for this table
  const allItems: OrderItem[] = orders.flatMap((ord) => ord.items);
  const subtotal = orders.reduce((sum, ord) => sum + Number(ord.totalAmount), 0);
  const taxAmount = subtotal * 0.05; // 5% GST/Tax
  const grandTotal = subtotal + taxAmount;

  const handlePrint = () => {
    toast.info(`Printing Bill for Table ${tableNumber}...`);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleSettle = async () => {
    if (!onSettlePayment || !selectedMethod) return;
    setIsSettling(true);
    try {
      await onSettlePayment(selectedMethod);
      toast.success(`Payment settled via ${selectedMethod} for Table ${tableNumber}! Table is ready for next bill.`);
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to settle payment. Please try again.'));
    } finally {
      setIsSettling(false);
    }
  };

  const latestOrderDate = orders[orders.length - 1]?.createdAt || new Date().toISOString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Modal Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={20} className="text-emerald" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Table {tableNumber} Consolidated Bill</h2>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="receipt-container">
          <div className="receipt-header">
            <div className="receipt-logo">
              <UtensilsCrossed size={28} />
            </div>
            <h2 className="receipt-title">SPICE & GRILL BISTRO</h2>
            <p className="receipt-subtitle">123 Culinary Avenue, Food District</p>
            <p className="receipt-subtitle">Tel: +1 (555) 987-6543 | GSTIN: 29ABCDE1234F1ZH</p>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-meta">
            <div>
              <span>Table Session:</span> <strong>Table {tableNumber}</strong>
            </div>
            <div>
              <span>Orders Count:</span> <strong>{orders.length} order(s)</strong>
            </div>
            <div>
              <span>Date:</span> <strong>{new Date(latestOrderDate).toLocaleDateString()}</strong>
            </div>
            <div>
              <span>Time:</span> <strong>{new Date(latestOrderDate).toLocaleTimeString()}</strong>
            </div>
            <div>
              <span>Billing Status:</span> <strong style={{ color: '#10b981' }}>UNPAID / ACTIVE SESSION</strong>
            </div>
            {selectedMethod && (
              <div>
                <span>Payment Method:</span> <strong style={{ color: '#059669' }}>{selectedMethod}</strong>
              </div>
            )}
          </div>

          <div className="receipt-divider"></div>

          {/* Items Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Item Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((item, idx) => (
                <tr key={`${item.id}-${idx}`}>
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600 }}>{item.menuItemName}</div>
                    {item.specialInstruction && (
                      <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        Note: {item.specialInstruction}
                      </small>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{currency(item.price)}</td>
                  <td style={{ textAlign: 'right' }}>{currency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-divider"></div>

          {/* Financial Calculation */}
          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Subtotal ({allItems.length} items)</span>
              <span>{currency(subtotal)}</span>
            </div>
            <div className="receipt-total-row">
              <span>GST / Restaurant Tax (5%)</span>
              <span>{currency(taxAmount)}</span>
            </div>
            <div className="receipt-total-row grand-total">
              <span>Grand Total</span>
              <span>{currency(grandTotal)}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>
              <CheckCircle2 size={16} /> Verified Table Session Invoice
            </div>
            <p>Thank you for dining with Spice & Grill Bistro!</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Once payment is completed, next orders start a new bill.</p>
          </div>
        </div>

        {/* Payment Method Selector (Admin Only) */}
        {onSettlePayment && (
          <div className="payment-method-selector no-print">
            <label className="payment-method-label">
              <Wallet size={16} /> Select Payment Method
            </label>
            <div className="payment-method-options">
              {paymentMethods.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  className={`payment-method-btn ${selectedMethod === value ? 'selected' : ''}`}
                  style={selectedMethod === value ? { borderColor: color, backgroundColor: `${color}10`, color } : {}}
                  onClick={() => setSelectedMethod(value)}
                  type="button"
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="modal-footer no-print">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Bill
          </button>
          {onSettlePayment && (
            <button
              className="btn-primary"
              onClick={handleSettle}
              disabled={isSettling || !selectedMethod}
              style={{ opacity: !selectedMethod ? 0.5 : 1 }}
              title={!selectedMethod ? 'Please select a payment method first' : ''}
            >
              <CreditCard size={16} /> {isSettling ? 'Settling...' : 'Settle & Mark Paid'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
