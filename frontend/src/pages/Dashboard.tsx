import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { patientService, Patient } from '../services/patients.ts';
import { Users, FileSpreadsheet, Activity, Sparkles, UserPlus, ArrowRight, Clock, Award } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await patientService.list({ page: 1, limit: 5 });
        setPatients(data.patients);
      } catch (err) {
        console.error('Failed to load dashboard patients:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-ayur-primary via-emerald-800 to-teal-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Activity className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Clinical Workspace • {user?.role} Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-heading tracking-tight">
            Namaste, {user?.fullName}
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Welcome to the Ayur Essence clinical terminal. Evaluate constitutional Prakriti, record
            diagnostic observations, and compute standardized Dosha distributions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/patients"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-ayur-primary font-semibold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Manage Patients</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Roster
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-ayur-primary">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 font-serif-heading">
            {patients.length} Registered
          </p>
          <p className="text-xs text-stone-500 mt-1">Active patient profiles</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Diagnostic Method
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 font-serif-heading">
            baseline-v1
          </p>
          <p className="text-xs text-stone-500 mt-1">16 Diagnostic Indicators</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Scoring Engine
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 font-serif-heading">
            Dynamic JSONB
          </p>
          <p className="text-xs text-stone-500 mt-1">Snapshot reproducibility</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              RBAC Guard
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 font-serif-heading">
            {user?.role}
          </p>
          <p className="text-xs text-stone-500 mt-1">Role-based privileges</p>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif-heading">
              Recent Patient Profiles
            </h2>
            <p className="text-xs text-stone-500">Quick access to initiate or inspect evaluations</p>
          </div>
          <Link
            to="/patients"
            className="text-xs font-semibold text-ayur-primary hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>View all patients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-stone-500 animate-pulse">
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Users className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-sm font-semibold text-stone-700">No patient records found</p>
            <Link
              to="/patients"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-ayur-primary text-white rounded-xl text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register First Patient</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3.5">Patient Name</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Assessments</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      <Link to={`/patients/${p.id}`} className="hover:text-ayur-primary">
                        {p.fullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600 capitalize">
                      {p.gender.toLowerCase()}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600">
                      {p.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                        {p._count?.assessments || 0} evaluations
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/patients/${p.id}`}
                        className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-white"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/assessment/new?patientId=${p.id}`}
                        className="text-xs font-semibold bg-emerald-50 text-ayur-primary hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Start Assessment</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
