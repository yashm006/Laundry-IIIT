import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shirt, LayoutDashboard, LogOut, Plus, CheckCircle2, Clock, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WorkerDashboard = ({ user, onLogout }) => {
  const [entries, setEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    items: [{ item_type: '', quantity: 1 }]
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/laundry/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to fetch entries');
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_type: '', quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' ? parseInt(value) : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/laundry/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Laundry entry created successfully!');
      setShowAddForm(false);
      setFormData({
        student_id: '',
        student_name: '',
        items: [{ item_type: '', quantity: 1 }]
      });
      fetchEntries();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create entry');
    }
  };

  const handleComplete = async (entryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/laundry/complete`, { entry_id: entryId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Laundry marked as completed! Email sent to student.');
      fetchEntries();
    } catch (error) {
      toast.error('Failed to mark as completed');
    }
  };

  let filteredEntries = entries;
  if (filter !== 'all') {
    filteredEntries = entries.filter(entry => entry.status === filter);
  }

  const stats = {
    total: entries.length,
    received: entries.filter(e => e.status === 'received').length,
    completed: entries.filter(e => e.status === 'completed').length,
    picked_up: entries.filter(e => e.status === 'picked_up').length
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sidebar">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Laundr.io
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Worker Portal</p>
        </div>

        <nav className="space-y-1 px-3">
          <button
            data-testid="nav-dashboard-btn"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="p-4 bg-secondary rounded-lg mb-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            data-testid="logout-btn"
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      <div className="main-content flex-1">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Laundry Management
            </h2>
            <p className="text-muted-foreground mt-1">Manage all laundry entries</p>
          </div>
          <Button
            data-testid="add-entry-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-11 px-6 bg-primary hover:bg-primary/90"
          >
            <Plus size={18} className="mr-2" />
            New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Shirt className="text-primary" size={32} />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{stats.received}</p>
              </div>
              <Clock className="text-amber-600" size={32} />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="text-emerald-600" size={32} />
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Picked Up</p>
                <p className="text-3xl font-bold mt-1 text-slate-600">{stats.picked_up}</p>
              </div>
              <CheckCircle2 className="text-slate-600" size={32} />
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-card p-6 rounded-xl border shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Entry</h3>
              <Button
                data-testid="close-form-btn"
                onClick={() => setShowAddForm(false)}
                variant="ghost"
                size="sm"
              >
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    data-testid="form-student-id-input"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_name">Student Name</Label>
                  <Input
                    id="student_name"
                    data-testid="form-student-name-input"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Items</Label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="Item type (e.g., Shirt)"
                      data-testid={`item-type-input-${index}`}
                      value={item.item_type}
                      onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      data-testid={`item-quantity-input-${index}`}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      className="w-32"
                      required
                    />
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        data-testid={`remove-item-btn-${index}`}
                        onClick={() => handleRemoveItem(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X size={18} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  data-testid="add-item-btn"
                  onClick={handleAddItem}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>

              <Button
                type="submit"
                data-testid="submit-entry-btn"
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                Create Entry
              </Button>
            </form>
          </div>
        )}

        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex gap-2 mb-6">
            <Button
              data-testid="filter-all-btn"
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All ({stats.total})
            </Button>
            <Button
              data-testid="filter-received-btn"
              onClick={() => setFilter('received')}
              variant={filter === 'received' ? 'default' : 'outline'}
              size="sm"
            >
              Received ({stats.received})
            </Button>
            <Button
              data-testid="filter-completed-btn"
              onClick={() => setFilter('completed')}
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
            >
              Completed ({stats.completed})
            </Button>
            <Button
              data-testid="filter-picked-up-btn"
              onClick={() => setFilter('picked_up')}
              variant={filter === 'picked_up' ? 'default' : 'outline'}
              size="sm"
            >
              Picked Up ({stats.picked_up})
            </Button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Items</th>
                  <th>Total Items</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted-foreground">
                      No entries found
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.entry_id} data-testid={`entry-row-${entry.entry_id}`}>
                      <td className="font-medium">{entry.student_id}</td>
                      <td>{entry.student_name}</td>
                      <td>
                        {entry.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.item_type} x{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td>{entry.total_items}</td>
                      <td>{new Date(entry.submission_date).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            entry.status === 'received'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : entry.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {entry.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {entry.status === 'received' && (
                          <Button
                            data-testid={`complete-btn-${entry.entry_id}`}
                            onClick={() => handleComplete(entry.entry_id)}
                            size="sm"
                            className="bg-accent hover:bg-accent/90"
                          >
                            <CheckCircle2 size={14} className="mr-1" />
                            Complete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;