import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { db } from '../lib/db';
import { formatDistanceToNow } from 'date-fns';

export default function ActiveAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await db.getMissingPersons();
      setAlerts(data.filter((p: any) => p.status === 'missing'));
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkFound = async (personId: string, name: string) => {
    if (!confirm(`Are you sure you want to mark ${name} as found? This will notify all users.`)) return;
    
    try {
      await db.markFound(personId);
      // Trigger broadcast on server
      await fetch('/api/mark-found-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, name }),
      });
      alert(`${name} marked as found! Notifications sent.`);
      fetchAlerts();
    } catch (error) {
      console.error(error);
      alert("Error marking as found.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        <p className="text-slate-500 font-medium">Loading active alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Active Emergency Alerts</h1>
          <p className="text-slate-600">Help us find these missing persons. Every sighting matters.</p>
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          {alerts.length} Active Alerts
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No active alerts</h2>
          <p className="text-slate-500">All missing persons have been found safely.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((person) => (
            <div key={person.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-64">
                <img src={person.photo} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Missing
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{person.name}</h3>
                    <p className="text-slate-500 text-sm">{person.age} years • {person.gender}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{person.lastSeen}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span>Reported {formatDistanceToNow(new Date(person.createdAt))} ago</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm line-clamp-2 italic">
                  "{person.description}"
                </p>

                <div className="pt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a 
                      href={`tel:${person.contactPhone}`}
                      className="flex-grow bg-slate-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Contact
                    </a>
                    <button className="px-4 bg-blue-50 text-blue-600 py-2 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors underline">
                      Details
                    </button>
                  </div>
                  <button 
                    className="w-full bg-green-50 text-green-700 py-2 rounded-lg font-bold text-sm hover:bg-green-100 transition-colors flex items-center justify-center gap-2 border border-green-200"
                    onClick={() => handleMarkFound(person.id, person.name)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Found
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
