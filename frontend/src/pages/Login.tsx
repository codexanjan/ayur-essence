import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { authService } from '../services/auth.ts';
import { Flower2, LogIn, Stethoscope, GraduationCap, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ayur-primary to-emerald-800 flex items-center justify-center text-amber-300 shadow-md mx-auto mb-3">
            <Flower2 className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 font-serif-heading">
            Sign In to Ayur Essence
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Access clinical patient records and Prakriti scoring engines
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2.5 flex items-center space-x-1.5">
            <span>⚡ Instant Demo Credentials</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor@example.com')}
              className="px-3 py-2 bg-white hover:bg-emerald-100/50 text-stone-800 border border-emerald-300 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5 text-ayur-primary" />
              <span>Doctor Role</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('student@example.com')}
              className="px-3 py-2 bg-white hover:bg-emerald-100/50 text-stone-800 border border-emerald-300 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Student Role</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
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
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
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
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-ayur-primary hover:bg-ayur-primary-dark text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
            Need a practitioner account?{' '}
            <Link to="/register" className="font-semibold text-ayur-primary hover:underline">
              Register with staff code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
