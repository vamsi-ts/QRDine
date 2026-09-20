import { Search, ShoppingBag, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { categoryApi, menuApi } from '../services/api';
import type { Category, MenuItem } from '../types';
import { currency } from '../utils/currency';

export function MenuPage() {
  const [params] = useSearchParams();
  const table = Number(params.get('table'));
  const { setTableNumber, addItem, items } = useCart();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [search, setSearch] = useState('');

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    toast.success(`Added ${item.name} to cart!`);
  };

  useEffect(() => {
    if (table) setTableNumber(table);
    categoryApi.list().then(({ data }) => setCategories(data));
  }, [setTableNumber, table]);

  useEffect(() => {
    menuApi.list(categoryId).then(({ data }) => setMenuItems(data.filter((item) => item.available)));
  }, [categoryId]);

  const filtered = useMemo(
    () =>
      menuItems.filter((item) =>
        `${item.name} ${item.description ?? ''}`.toLowerCase().includes(search.toLowerCase())
      ),
    [menuItems, search]
  );
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="customer-container">
      {/* Customer Banner */}
      <header className="customer-hero">
        <div>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9, marginBottom: '4px' }}>
            Spice & Grill Bistro
          </div>
          <h1>Digital Menu</h1>
          <span className="table-chip">Table {table || 'Not Specified'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {table ? (
            <Link className="btn-secondary" style={{ padding: '0.85rem 1.25rem', borderRadius: '50px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', fontWeight: 800, textDecoration: 'none' }} to={`/table/${table}/orders`}>
              My Orders
            </Link>
          ) : null}
          <Link className="cart-float-btn" to="/cart">
            <ShoppingBag size={20} />
            <span>Cart ({cartCount})</span>
          </Link>
        </div>
      </header>

      {/* Search & Category Filter Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <div className="tree-search-wrapper">
          <Search className="tree-search-icon" size={18} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.5rem', height: '48px', fontSize: '1rem' }}
            placeholder="Search for delicious dishes, frappes, milkshakes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="customer-filter-bar">
          <button
            className={`chip-btn ${!categoryId ? 'active' : ''}`}
            onClick={() => setCategoryId(undefined)}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`chip-btn ${categoryId === category.id ? 'active' : ''}`}
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="customer-menu-grid">
        {filtered.map((item) => (
          <article className="food-card" key={item.id}>
            <img
              src={
                item.imageUrl ||
                'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'
              }
              alt={item.name}
            />
            <div className="food-card-body">
              <h3 className="food-card-title">{item.name}</h3>
              <p className="food-card-desc">{item.description}</p>
              <div className="food-card-footer">
                <span className="food-price">{currency(item.price)}</span>
                <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={() => handleAddToCart(item)}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}