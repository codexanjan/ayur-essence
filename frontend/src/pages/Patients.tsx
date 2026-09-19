import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientService, Patient } from '../services/patients.ts';
import { Users, UserPlus, Search, ArrowRight, X, AlertCircle } from 'lucide-react';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New patient modal state
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.list({ search });
      setPatients(data.patients);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      await patientService.create({
        fullName,
        dateOfBirth,
        gender,
        phone: phone || undefined,
        address: address || undefined,
      });

      // Reset and close modal
      setFullName('');
      setDateOfBirth('');
      setPhone('');
      setAddress('');
      setShowModal(false);

      // Refresh roster
      await loadPatients();
    } catch (err: any) {
      setModalError(
        err.response?.data?.error?.message ||
        'Failed to create patient profile. Check input.'
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & New Patient Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900">
            Patient Profiles
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Browse directory of clinical patients and historical constitutional evaluations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-ayur-primary hover:bg-ayur-primary-dark text-white rounded-xl font-semibold text-xs shadow-md transition-all flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-stone-400 pl-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, phone, or city..."
          className="w-full text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
            Loading patient database...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-sm font-semibold text-stone-700">No patients matched your query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">DOB / Age</th>
                  <th className="px-6 py-3.5">Gender</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {patients.map((p) => {
                  const birthYear = new Date(p.dateOfBirth).getFullYear();
                  const age = new Date().getFullYear() - birthYear;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-stone-900">
                        <Link to={`/patients/${p.id}`} className="hover:text-ayur-primary">
                          {p.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-600">
                        {p.dateOfBirth ? `${new Date(p.dateOfBirth).toLocaleDateString()} (${age} yrs)` : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-600 capitalize">
                        {p.gender.toLowerCase()}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-600">
                        {p.phone || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-stone-600">
                        {p.address || '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/patients/${p.id}`}
                          className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-white"
                        >
                          History
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register New Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold font-serif-heading text-stone-900 mb-1">
              Create Patient Profile
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Enter demographic details to initialize a Prakriti assessment dossier
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Rao"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm bg-white"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mysuru, Karnataka"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 bg-ayur-primary hover:bg-ayur-primary-dark text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Save Patient Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
