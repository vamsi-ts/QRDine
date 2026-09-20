import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StaffLayout } from './components/StaffLayout';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminMenuPage } from './pages/AdminMenuPage';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminTablesPage } from './pages/AdminTablesPage';
import { CartPage } from './pages/CartPage';
import { MenuPage } from './pages/MenuPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrdersBoardPage } from './pages/OrdersBoardPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerOrderHistoryPage } from './pages/CustomerOrderHistoryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
      <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
      <Route path="/table/:tableNumber/orders" element={<CustomerOrderHistoryPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute roles={['ADMIN']}><StaffLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<OrdersBoardPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/tables" element={<AdminTablesPage />} />
        <Route path="/admin/staff" element={<AdminStaffPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['WAITER']}><StaffLayout /></ProtectedRoute>}>
        <Route path="/waiter/orders" element={<OrdersBoardPage status={['NEW', 'ACCEPTED']} title="Waiter orders" actions={{ NEW: { label: 'Accept order', nextStatus: 'ACCEPTED' } }} />} />
        <Route path="/waiter/ready-orders" element={<OrdersBoardPage status="READY" actionLabel="Delivered" nextStatus="DELIVERED" />} />
        <Route path="/waiter/order-history" element={<OrdersBoardPage status={['DELIVERED', 'PAID']} title="Delivered & Paid Orders" />} />
      </Route>
      <Route element={<ProtectedRoute roles={['KITCHEN']}><StaffLayout /></ProtectedRoute>}>
        <Route path="/kitchen/orders" element={<OrdersBoardPage status="ACCEPTED" actionLabel="Start preparing" nextStatus="PREPARING" />} />
        <Route path="/kitchen/preparing" element={<OrdersBoardPage status="PREPARING" actionLabel="Mark ready" nextStatus="READY" />} />
        <Route path="/kitchen/ready" element={<OrdersBoardPage status="READY" />} />
      </Route>
    </Routes>
  );
}