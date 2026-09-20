import { FormEvent, useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Edit3, Save } from 'lucide-react';
import { categoryApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Category } from '../types';

export function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { toast } = useToast();

  const load = () => categoryApi.list().then(({ data }) => setItems(data));

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      await categoryApi.update(editing.id, form);
      toast.success(`Category "${form.name}" updated!`);
    } else {
      await categoryApi.create(form);
      toast.success(`Category "${form.name}" created!`);
    }
    setEditing(null);
    setForm({ name: '', description: '' });
    load();
  }

  const handleDelete = async (id: number, name: string) => {
    await categoryApi.remove(id);
    toast.info(`Deleted category "${name}"`);
    load();
  };

  const handleEdit = (item: Category) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description ?? '' });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Menu Categories</h1>
          <p>Organize your restaurant menu items into logical groups.</p>
        </div>
      </div>

      <form onSubmit={submit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr auto auto', gap: '1rem', alignItems: 'end' }}>
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Non Alcoholic Drinks"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="input-field"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Refreshing beverages and frappes"
          />
        </div>

        {editing && (
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}

        <button type="submit" className="btn-primary">
          {editing ? <Save size={16} /> : <Plus size={16} />}
          {editing ? 'Update Category' : 'Add Category'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {items.map((item) => (
          <div key={item.id} className="stat-card" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="stat-icon">
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.description || 'No description'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleEdit(item)}>
                <Edit3 size={14} /> Edit
              </button>
              <button className="btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleDelete(item.id, item.name)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}