import { FormEvent, useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Grid, Plus, Download, Edit3, Trash2, Save } from 'lucide-react';
import { tableApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { RestaurantTable } from '../types';

export function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [form, setForm] = useState({ tableNumber: 1, active: true });
  const qrRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const { toast } = useToast();

  const load = () => tableApi.list().then(({ data }) => setTables(data));

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      await tableApi.update(editing.id, form);
      toast.success(`Table ${form.tableNumber} updated!`);
    } else {
      await tableApi.create(form);
      toast.success(`Table ${form.tableNumber} created!`);
    }
    setEditing(null);
    setForm({ tableNumber: form.tableNumber + 1, active: true });
    load();
  }

  function download(table: RestaurantTable) {
    const canvas = qrRefs.current[table.id];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `table-${table.tableNumber}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.info(`Downloaded QR Code for Table ${table.tableNumber}`);
  }

  const handleDelete = async (id: number, tableNumber: number) => {
    await tableApi.remove(id);
    toast.info(`Deleted Table ${tableNumber}`);
    load();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Tables & QR Codes</h1>
          <p>Generate QR codes for customer table ordering.</p>
        </div>
      </div>

      <form onSubmit={submit} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <div className="form-group" style={{ width: '180px' }}>
          <label className="form-label">Table Number</label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={form.tableNumber}
            onChange={(e) => setForm({ ...form, tableNumber: Number(e.target.value) })}
            required
          />
        </div>

        <div className="toggle-control-card" style={{ marginTop: '1.25rem' }}>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-title" style={{ fontSize: '0.9rem' }}>Active for Ordering</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          {editing && (
            <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm({ tableNumber: 1, active: true }); }}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary">
            {editing ? <Save size={16} /> : <Plus size={16} />}
            {editing ? 'Update Table' : 'Add Table'}
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {tables.map((table) => (
          <div key={table.id} className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <QRCodeCanvas
                value={table.qrCodeUrl}
                size={140}
                ref={(node) => {
                  qrRefs.current[table.id] = node;
                }}
              />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Table {table.tableNumber}</h3>
              <span className={`status-pill ${table.active ? 'ready' : 'delivered'}`} style={{ marginTop: '0.35rem', display: 'inline-block' }}>
                {table.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => download(table)}>
                <Download size={14} /> QR
              </button>
              <button className="btn-secondary" style={{ padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => { setEditing(table); setForm({ tableNumber: table.tableNumber, active: table.active }); }}>
                <Edit3 size={14} />
              </button>
              <button className="btn-danger" style={{ padding: '0.45rem', fontSize: '0.8rem' }} onClick={() => handleDelete(table.id, table.tableNumber)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}