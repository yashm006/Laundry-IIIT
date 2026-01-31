import React from 'react';
import { Shirt, Clock, CheckCircle2 } from 'lucide-react';

export function WorkerStats({ stats }) {
  return (
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
  );
}