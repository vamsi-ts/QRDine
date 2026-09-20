import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderApi } from '../services/api';
import { currency } from '../utils/currency';

export function CartPage() {
  const { tableNumber, items, total, updateQuantity, updateInstruction, removeItem, clear } = useCart();
  const { toast } = useToast();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function placeOrder() {
    if (!tableNumber || items.length === 0) return;
    try {
      const payload = {
        tableNumber,
        items: items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          specialInstruction: item.specialInstruction,
        })),
      };
      const { data } = await orderApi.create(payload);
      clear();
      toast.success('Order placed successfully! Sending to kitchen...');
      navigate(`/order-confirmation/${data.id}`);
    } catch {
      setError('Unable to place order. Please ask staff for help.');
      toast.error('Failed to place order. Please try again.');
    }
  }

  const handleRemove = (id: number, name: string) => {
    removeItem(id);
    toast.info(`Removed ${name} from cart`);
  };

  return (
    <div className="customer-container" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <Link to={`/menu?table=${tableNumber ?? 1}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to menu
        </Link>
        <span className="table-chip" style={{ color: '#0f172a' }}>Table {tableNumber || '1'}</span>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Your Cart</h1>

      {items.length === 0 && (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your cart is empty</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Add items from the menu to get started.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {items.map((item) => (
          <div key={item.menuItem.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.menuItem.name}</h3>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>{currency(item.menuItem.price)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                <button className="btn-secondary" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }} onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}>
                  -
                </button>
                <span style={{ fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button className="btn-secondary" style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }} onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <textarea
              className="input-field"
              rows={2}
              placeholder="Special instructions (e.g., extra ice, no onions)"
              value={item.specialInstruction}
              onChange={(e) => updateInstruction(item.menuItem.id, e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => handleRemove(item.menuItem.id, item.menuItem.name)}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Price</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{currency(total)}</div>
          </div>

          <button className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }} disabled={!items.length || !tableNumber} onClick={placeOrder}>
            Place Order <ArrowRight size={18} />
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '10px', marginTop: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
    </div>
  );
}