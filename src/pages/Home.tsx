import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Search, Bell, Shield, MapPin, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
            Every Second <span className="text-red-600">Counts</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            AI-powered rapid response system to find missing children and women. 
            Instant alerts to everyone within a 10km radius.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/report"
            className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Report Missing Person</span>
          </Link>
          <Link
            to="/sighting"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Report a Sighting</span>
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Bell}
          title="Instant Alerts"
          description="SMS, WhatsApp, and Web notifications sent instantly to everyone nearby."
          color="red"
        />
        <FeatureCard
          icon={MapPin}
          title="Geo-Fencing"
          description="Smart location tracking and 10km radius targeting for maximum impact."
          color="blue"
        />
        <FeatureCard
          icon={Shield}
          title="AI Recognition"
          description="Advanced image comparison to verify sightings and match missing persons."
          color="indigo"
        />
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 rounded-3xl p-12 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold">10km</div>
            <div className="text-slate-400 uppercase tracking-widest text-xs">Alert Radius</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold">Real-time</div>
            <div className="text-slate-400 uppercase tracking-widest text-xs">Response Speed</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold">AI Verified</div>
            <div className="text-slate-400 uppercase tracking-widest text-xs">Sighting Match</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-red-600/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full" />
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  const colors: any = {
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
