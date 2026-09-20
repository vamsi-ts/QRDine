import { FormEvent, useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, Eye, MoreVertical, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { categoryApi, menuApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Category, MenuItem } from '../types';

interface CustomMenuItemForm {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  available: boolean;
  yieldAmount: string;
  nutrition: string;
  isPopular: boolean;
}

const defaultForm: CustomMenuItemForm = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  categoryId: 0,
  available: true,
  yieldAmount: '350 ml',
  nutrition: '450 kcal',
  isPopular: false,
};

export function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<CustomMenuItemForm>(defaultForm);
  const [subTab, setSubTab] = useState<'Edit' | 'Translate'>('Edit');
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [{ data: menuData }, { data: catData }] = await Promise.all([
        menuApi.list(),
        categoryApi.list(),
      ]);
      setItems(menuData);
      setCategories(catData);

      if (menuData.length > 0 && !selectedItem) {
        selectMenuItem(menuData[0]);
      }
    } catch (err) {
      console.error('Failed loading menu data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectMenuItem = (item: MenuItem) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      imageUrl: item.imageUrl || '',
      categoryId: item.category.id,
      available: item.available,
      yieldAmount: '350 ml',
      nutrition: '687 kcal',
      isPopular: false,
    });
  };

  const handleCreateNew = () => {
    setSelectedItem(null);
    setForm({
      ...defaultForm,
      categoryId: categories[0]?.id || 0,
    });
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      imageUrl: form.imageUrl,
      categoryId: form.categoryId,
      available: form.available,
    };

    if (selectedItem) {
      await menuApi.update(selectedItem.id, payload);
      toast.success(`Updated "${form.name}" successfully!`);
    } else {
      const res = await menuApi.create(payload);
      setSelectedItem(res.data);
      toast.success(`Created "${form.name}" product!`);
    }
    await loadData();
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
      await menuApi.remove(selectedItem.id);
      toast.info(`Deleted "${selectedItem.name}"`);
      setSelectedItem(null);
      await loadData();
    }
  };

  // Group items by category for tree sidebar
  const itemsByCategory = useMemo(() => {
    const map = new Map<number, MenuItem[]>();
    categories.forEach((cat) => map.set(cat.id, []));
    items.forEach((item) => {
      const catItems = map.get(item.category.id) || [];
      if (
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.name.toLowerCase().includes(search.toLowerCase())
      ) {
        catItems.push(item);
      }
      map.set(item.category.id, catItems);
    });
    return map;
  }, [categories, items, search]);

  const activeCategoryName = categories.find((c) => c.id === form.categoryId)?.name || 'Menu';

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Panel 2: Tree Sidebar */}
      <div className="wiz-tree-panel">
        <div className="wiz-tree-header">
          <div className="tree-sub-tabs">
            <button
              className={`tree-sub-tab ${subTab === 'Edit' ? 'active' : ''}`}
              onClick={() => setSubTab('Edit')}
            >
              Edit
            </button>
            <button
              className={`tree-sub-tab ${subTab === 'Translate' ? 'active' : ''}`}
              onClick={() => setSubTab('Translate')}
            >
              Translate
            </button>
          </div>

          <div className="tree-search-wrapper">
            <Search className="tree-search-icon" size={16} />
            <input
              type="text"
              className="tree-search-input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="wiz-tree-content">
          {categories.map((cat) => {
            const catItems = itemsByCategory.get(cat.id) || [];
            return (
              <div key={cat.id} className="wiz-tree-section">
                <div className="wiz-tree-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronDown size={14} />
                    <span>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{catItems.length}</span>
                </div>

                {catItems.map((item) => {
                  const isActive = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`wiz-tree-item ${isActive ? 'active' : ''}`}
                      onClick={() => selectMenuItem(item)}
                    >
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <button className="tree-add-btn" onClick={handleCreateNew}>
            <Plus size={16} /> Add new product
          </button>
        </div>
      </div>

      {/* Panel 3: Detail Workspace */}
      <div className="wiz-detail-workspace">
        <form onSubmit={handleSave} className="wiz-detail-container">
          {/* Breadcrumbs Header */}
          <div className="wiz-breadcrumb-bar">
            <div className="wiz-breadcrumbs">
              <span>{activeCategoryName}</span>
              <span>&gt;</span>
              <span className="active">{form.name || 'New Product'}</span>
            </div>
            <div className="wiz-breadcrumb-actions">
              <button type="button" className="icon-action-btn" title="Preview">
                <Eye size={18} />
              </button>
              <button type="button" className="icon-action-btn" title="More options">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Form Field: Name */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="input-field wiz-input-lg"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Product name"
              required
            />
          </div>

          {/* Form Fields: Price, Yield, Nutrition */}
          <div className="inline-specs-grid">
            <div className="form-group">
              <label className="form-label">Price</label>
              <div className="input-suffix-group">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input-field"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  required
                />
                <span className="input-suffix">RON</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Yield</label>
              <input
                type="text"
                className="input-field"
                value={form.yieldAmount}
                onChange={(e) => setForm({ ...form, yieldAmount: e.target.value })}
                placeholder="e.g. 350 ml"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nutrition</label>
              <input
                type="text"
                className="input-field"
                value={form.nutrition}
                onChange={(e) => setForm({ ...form, nutrition: e.target.value })}
                placeholder="e.g. 687 kcal"
              />
            </div>
          </div>

          {/* Toggle Controls: Mark as Sold Out & Mark as Popular */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 0' }}>
            <div className="toggle-control-card">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={!form.available}
                  onChange={(e) => setForm({ ...form, available: !e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="toggle-label-group">
                <span className="toggle-title">Mark as sold out</span>
                <span className="toggle-description">Indicates that the item is currently unavailable.</span>
              </div>
            </div>

            <div className="toggle-control-card">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="toggle-label-group">
                <span className="toggle-title">Mark as popular</span>
                <span className="toggle-description">Highlight this item and display it in the "Popular" section on the main page.</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-field"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Smooth and creamy milkshake made with real ingredients..."
            />
          </div>

          {/* Image URL & Preview */}
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                className="input-field"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  style={{ width: '56px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              ) : (
                <div style={{ width: '56px', height: '44px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <ImageIcon size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="wiz-action-bar">
            <div>
              {selectedItem && (
                <button type="button" className="btn-danger" onClick={handleDelete}>
                  <Trash2 size={16} /> Delete Product
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={handleCreateNew}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Save size={16} /> {selectedItem ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}