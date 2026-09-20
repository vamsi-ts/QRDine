import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  BookOpen, 
  Grid, 
  Users, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function StaffLayout() {
  const { role, name, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  const handlePublish = () => {
    toast.success('All menu changes published live to customer app!');
  };

  const links = role === 'ADMIN'
    ? [
        { to: '/admin/menu', label: 'Menu', icon: BookOpen },
        { to: '/admin/categories', label: 'Categories', icon: Layers },
        { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { to: '/admin/tables', label: 'Tables', icon: Grid },
        { to: '/admin/staff', label: 'Team', icon: Users },
        { to: '/admin/dashboard', label: 'Stats', icon: LayoutDashboard },
      ]
    : role === 'WAITER'
      ? [
          { to: '/waiter/orders', label: 'New', icon: ShoppingBag },
          { to: '/waiter/ready-orders', label: 'Ready', icon: BookOpen },
          { to: '/waiter/order-history', label: 'History', icon: Layers },
        ]
      : [
          { to: '/kitchen/orders', label: 'Accepted', icon: ShoppingBag },
          { to: '/kitchen/preparing', label: 'Preparing', icon: Layers },
          { to: '/kitchen/ready', label: 'Ready', icon: BookOpen },
        ];

  // Derive page title for top bar
  const currentPath = location.pathname;
  let pageTitle = 'Menu';
  if (currentPath.includes('categories')) pageTitle = 'Categories';
  else if (currentPath.includes('orders')) pageTitle = 'Orders';
  else if (currentPath.includes('tables')) pageTitle = 'Tables';
  else if (currentPath.includes('staff')) pageTitle = 'Team';
  else if (currentPath.includes('dashboard')) pageTitle = 'Dashboard';

  return (
    <div className="staff-shell">
      {/* Panel 1: Far Left Icon Rail */}
      <aside className="icon-rail">
        <Link className="brand-badge" to={role === 'ADMIN' ? '/admin/dashboard' : role === 'WAITER' ? '/waiter/orders' : '/kitchen/orders'} title="QR Kitchen">
          <UtensilsCrossed size={22} />
        </Link>

        <nav className="rail-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink 
              key={to} 
              to={to} 
              className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`} 
              title={label}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rail-footer">
          <button className="logout-icon-btn" onClick={handleLogout} title={`Logout (${name})`}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Staff Workspace Main Area */}
      <div className="staff-workspace">
        {/* Wiz Topbar Header */}
        <header className="wiz-topbar">
          <div className="wiz-topbar-left">
            <h1 className="wiz-page-title">{pageTitle}</h1>
            <div className="wiz-subtabs">
              <button className="wiz-tab-btn active">Content</button>
              <button className="wiz-tab-btn">Preview</button>
              <button className="wiz-tab-btn">Settings</button>
            </div>
          </div>

          <div className="wiz-topbar-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>You have unpublished changes</span>
            </div>
            <button className="publish-btn" onClick={handlePublish}>
              Publish
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="wizmenu-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}