import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, Share2, Users, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export const SafetyCenterPage: React.FC = () => {
  const [contacts, setContacts] = useState([
    { name: 'Pooja Sharma', phone: '+91 98765 00001', rel: 'Spouse' },
    { name: 'Dr. Ramesh Sharma', phone: '+91 98765 00002', rel: 'Father' }
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family');
  const [showAddContact, setShowAddContact] = useState(false);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    setContacts((prev) => [...prev, { name: newContactName, phone: newContactPhone, rel: newContactRel }]);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
    alert('Emergency contact added successfully.');
  };

  const handleTriggerSOS = () => {
    if (confirm('Activate Emergency SOS? This locks your live coordinates and sends critical alerts to safety operators and your emergency contacts.')) {
      alert('EMERGENCY SOS BROADCASTED. Safety operators and emergency contacts alerted.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">FAIRRIDE SAFETY CENTER</h1>
          <p className="text-xs text-slate-500 font-medium">24x7 Safety Watchdog, Route Guardian, and Emergency Assistance</p>
        </div>
      </div>

      {/* Prominent SOS Card */}
      <div className="rounded-3xl p-8 border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-white to-rose-50 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md animate-pulse">
          <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-rose-950">EMERGENCY SOS DISPATCH</h2>
          <p className="text-xs text-rose-800 font-medium max-w-md mx-auto mt-1">
            Tap the button below if you feel unsafe or require emergency assistance. We instantly transmit your live coordinates, vehicle license, and driver details to emergency services.
          </p>
        </div>

        <button
          onClick={handleTriggerSOS}
          className="py-4 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base shadow-lg transition-all transform hover:scale-105 cursor-pointer"
        >
          TRIGGER EMERGENCY SOS
        </button>
      </div>

      {/* Safety Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Emergency Contacts */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Emergency Contacts</span>
            </h3>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{c.name} ({c.rel})</p>
                  <p className="text-slate-500 font-mono text-[11px]">{c.phone}</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Verified Contact
                </span>
              </div>
            ))}
          </div>

          {showAddContact && (
            <form onSubmit={handleAddContact} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Contact Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number (+91 ...)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Save Emergency Contact
              </button>
            </form>
          )}
        </div>

        {/* Live Trip Sharing & 24x7 Safety Hotline */}
        <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" />
              <span>Share Live Trip Trajectory</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Family members can track your vehicle's live GPS coordinates, route corridor, driver details, and ETA in real time without needing to install the app.
            </p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText('https://fairride.local/track/FR-LIVE-8821');
                alert('Live tracking link copied to clipboard!');
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 w-full transition-colors cursor-pointer"
            >
              Copy Live Trip Sharing Link 📋
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block">Official Emergency Services:</span>
            <div className="flex gap-2">
              <a
                href="tel:112"
                className="flex-1 py-2 text-center bg-rose-50 border border-rose-200 rounded-xl font-bold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                🚨 Dial 112 (National)
              </a>
              <a
                href="tel:1091"
                className="flex-1 py-2 text-center bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                🛡️ Dial 1091 (Women Helpline)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
