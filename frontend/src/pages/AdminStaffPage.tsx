import { FormEvent, useEffect, useState } from 'react';
import { Users, Plus, Edit3, Trash2, Save, UserCheck, Shield } from 'lucide-react';
import { userApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Role, User } from '../types';

const staffForm = { name: '', email: '', password: '', role: 'WAITER' as Role, active: true };

export function AdminStaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(staffForm);
  const { toast } = useToast();

  const load = () => userApi.list().then(({ data }) => setUsers(data));

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      await userApi.update(editing.id, { ...form, password: form.password || undefined });
      toast.success(`Updated staff member "${form.name}"!`);
    } else {
      await userApi.create(form);
      toast.success(`Created staff member "${form.name}"!`);
    }
    setEditing(null);
    setForm(staffForm);
    load();
  }

  const handleDelete = async (id: number, name: string) => {
    await userApi.remove(id);
    toast.info(`Removed staff member "${name}"`);
    load();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Staff & Team Members</h1>
          <p>Manage access permissions for Waiters, Kitchen staff, and Admins.</p>
        </div>
      </div>

      <form onSubmit={submit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="staff@restaurant.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{editing ? 'Password (Optional)' : 'Password'}</label>
          <input
            type="password"
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required={!editing}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="input-field"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="WAITER">WAITER</option>
            <option value="KITCHEN">KITCHEN</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', gridColumn: '1 / -1', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          {editing && (
            <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm(staffForm); }}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary">
            {editing ? <Save size={16} /> : <Plus size={16} />}
            {editing ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {users.map((user) => (
          <div key={user.id} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="stat-icon">
                {user.role === 'ADMIN' ? <Shield size={20} /> : <UserCheck size={20} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <span className={`status-pill ${user.active ? 'ready' : 'delivered'}`}>
                {user.role} · {user.active ? 'Active' : 'Inactive'}
              </span>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => { setEditing(user); setForm({ name: user.name, email: user.email, password: '', role: user.role, active: user.active }); }}>
                  <Edit3 size={14} />
                </button>
                <button className="btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => handleDelete(user.id, user.name)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}