import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  return (
    <div className="customer-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={40} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Order Confirmed!</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Your order has reached the kitchen and staff in real time.
        </p>
        <Link className="btn-primary" style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', fontSize: '1rem' }} to={`/order-tracking/${orderId}`}>
          Track Order Progress <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}