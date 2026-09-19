import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Flower2, LogOut, Users, PlusCircle, LayoutDashboard, Stethoscope } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ayur-primary to-emerald-800 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform">
              <Flower2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif-heading text-stone-900 tracking-tight block">
                Ayur Essence
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-700 tracking-widest block -mt-1">
                Prakriti Assessment
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 sm:space-x-6">
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-ayur-primary hover:bg-emerald-50 transition-colors flex items-center space-x-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/patients"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-ayur-primary hover:bg-emerald-50 transition-colors flex items-center space-x-1"
                >
                  <Users className="w-4 h-4" />
                  <span>Patients</span>
                </Link>
              </nav>

              {/* User badge */}
              <div className="flex items-center space-x-3 pl-4 border-l border-stone-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-stone-900 leading-none">{user?.fullName}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user?.role === 'DOCTOR'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : user?.role === 'STUDENT'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-ayur-primary hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold bg-ayur-primary hover:bg-ayur-primary-dark text-white rounded-lg shadow-sm transition-all"
              >
                Register Staff
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
