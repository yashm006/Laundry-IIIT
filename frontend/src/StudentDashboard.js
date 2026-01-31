import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shirt, Clock, CheckCircle2, LogOut, History } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentDashboard = ({ user, onLogout }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('student_token');
      const response = await axios.get(`${API}/laundry/student/${user.student_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to fetch laundry entries');
    }
  };

  const handlePickup = async (entryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/laundry/pickup`, { entry_id: entryId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Marked as picked up!');
      fetchEntries();
    } catch (error) {
      toast.error('Failed to mark as picked up');
    }
  };

  let activeEntry = null;
  const historyEntries = [];
  
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].status === 'completed' && !activeEntry) {
      activeEntry = entries[i];
    } else if (entries[i].status !== 'completed') {
      historyEntries.push(entries[i]);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Laundr.io
            </h1>
            <p className="text-sm text-muted-foreground">Student Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">ID: {user.student_id}</p>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={onLogout}
              variant="outline"
              size="sm"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeEntry && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready for Pickup!
            </h2>
            <div
              data-testid="active-laundry-card"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl border-2 border-emerald-200 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-600 rounded-lg">
                      <Shirt className="text-white" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-900">Your laundry is ready!</h3>
                      <p className="text-emerald-700">Please collect from the laundry counter</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-sm text-emerald-700 mb-1">Total Items</p>
                      <p className="text-2xl font-bold text-emerald-900">{activeEntry.total_items}</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-lg">
                      <p className="text-sm text-emerald-700 mb-1">Completed On</p>
                      <p className="text-lg font-semibold text-emerald-900">
                        {new Date(activeEntry.completion_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 p-4 rounded-lg mb-6">
                    <p className="text-sm font-semibold text-emerald-700 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {activeEntry.items.map(function(item, idx) {
                        return (
                          <span
                            key={idx}
                            className="bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {item.item_type} x{item.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                data-testid="pickup-btn"
                onClick={() => handlePickup(activeEntry.entry_id)}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold"
              >
                <CheckCircle2 size={20} className="mr-2" />
                Mark as Picked Up
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <History size={24} className="text-primary" />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Laundry History
            </h2>
          </div>

          {historyEntries.length === 0 ? (
            <div className="bg-card p-12 rounded-xl border text-center">
              <Shirt size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No laundry history found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyEntries.map(function(entry) {
                const statusClass = entry.status === 'received'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';
                const statusText = entry.status === 'received' ? 'In Progress' : 'Picked Up';
                const showCompleted = entry.status === 'picked_up';

                return (
                  <div
                    key={entry.entry_id}
                    data-testid={`history-card-${entry.entry_id}`}
                    className="bg-card p-6 rounded-xl border shadow-sm laundry-card"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Shirt size={20} className="text-primary" />
                        <span className="font-semibold">{entry.total_items} Items</span>
                      </div>
                      <span className={`status-badge ${statusClass}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Items</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.items.map(function(item, idx) {
                            return (
                              <span
                                key={idx}
                                className="text-xs bg-secondary px-2 py-1 rounded"
                              >
                                {item.item_type} x{item.quantity}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock size={14} />
                          {new Date(entry.submission_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>

                      {showCompleted && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 size={14} />
                            <span className="text-xs font-medium">Completed & Picked Up</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;