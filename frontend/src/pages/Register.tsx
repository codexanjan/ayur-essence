import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { authService } from '../services/auth.ts';
import { Flower2, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'DOCTOR' | 'STUDENT'>('DOCTOR');
  const [registrationCode, setRegistrationCode] = useState('AYUR-2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.register({
        fullName,
        email,
        password,
        role,
        registrationCode,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Registration failed. Ensure password meets security requirements.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ayur-primary to-emerald-800 flex items-center justify-center text-amber-300 shadow-md mx-auto mb-3">
            <Flower2 className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 font-serif-heading">
            Register Clinical Staff
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Join the digital Ayurvedic diagnostic network
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Rajesh Vaidya"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password@123 (Min 8 chars, 1 Upper, 1 Special)"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Practitioner Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    role === 'DOCTOR'
                      ? 'bg-emerald-50 border-ayur-primary text-ayur-primary shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>Physician / Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    role === 'STUDENT'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>Student / Scholar</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Staff Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                  placeholder="AYUR-2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
                />
                <ShieldCheck className="w-5 h-5 text-emerald-600 absolute right-3 top-2.5" />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Default code: AYUR-2026</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-ayur-primary hover:bg-ayur-primary-dark text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Registering...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-ayur-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
