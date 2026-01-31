import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LayoutDashboard, LogOut, Plus, CheckCircle2 } from 'lucide-react';
import { WorkerStats } from './components/WorkerStats';
import { WorkerEntryForm } from './components/WorkerEntryForm';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function WorkerDashboard({ user, onLogout }) {
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

  async function fetchEntries() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/laundry/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to fetch entries');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/laundry/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Laundry entry created!');
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
  }

  async function handleComplete(entryId) {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/laundry/complete`, { entry_id: entryId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Laundry completed! Email sent.');
      fetchEntries();
    } catch (error) {
      toast.error('Failed to complete');
    }
  }

  const filteredEntries = [];
  for (let entry of entries) {
    if (filter === 'all' || entry.status === filter) {
      filteredEntries.push(entry);
    }
  }

  const stats = {
    total: entries.length,
    received: 0,
    completed: 0,
    picked_up: 0
  };
  
  for (let entry of entries) {
    if (entry.status === 'received') stats.received++;
    if (entry.status === 'completed') stats.completed++;
    if (entry.status === 'picked_up') stats.picked_up++;
  }

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

        <WorkerStats stats={stats} />

        {showAddForm && (
          <WorkerEntryForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={() => setShowAddForm(false)}
          />
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
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted-foreground">
                      No entries
                    </td>
                  </tr>
                )}
                {filteredEntries.length > 0 && filteredEntries.map(function(entry) {
                  let statusClass = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (entry.status === 'received') {
                    statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
                  } else if (entry.status === 'completed') {
                    statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  }

                  const itemsDisplay = entry.items.map(function(item, idx) {
                    return <div key={idx} className="text-xs">{item.item_type} x{item.quantity}</div>;
                  });

                  return (
                    <tr key={entry.entry_id} data-testid={`entry-row-${entry.entry_id}`}>
                      <td className="font-medium">{entry.student_id}</td>
                      <td>{entry.student_name}</td>
                      <td>{itemsDisplay}</td>
                      <td>{entry.total_items}</td>
                      <td>{new Date(entry.submission_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;