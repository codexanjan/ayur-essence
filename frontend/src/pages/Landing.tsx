import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Activity, BookOpen, Stethoscope } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ayurvedic Clinical Precision Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 font-serif-heading tracking-tight leading-tight">
              Decode Human Constitution with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ayur-primary to-emerald-700">
                Prakriti Analytics
              </span>
            </h1>

            <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              A standardized, reproducible diagnostic assessment system for Ayurvedic physicians
              and clinical scholars. Calculate normalized Vata, Pitta, and Kapha distributions
              grounded in classical Vedic diagnostic taxonomy.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-ayur-primary hover:bg-ayur-primary-dark text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Launch Practitioner Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold border border-stone-300 shadow-sm transition-all"
              >
                Staff Registration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Dosha Pillar Highlights */}
      <section className="py-12 bg-white/70 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
              The Three Biological Energetic Principles (Doshas)
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Every individual possesses a unique bio-genetic equilibrium determined at conception
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-sky-500 text-white flex items-center justify-center mb-4 font-bold font-serif-heading">
                V
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">Vata Dosha</h3>
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-2">
                Air & Space Elements
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Governs all physiological movement, nervous system impulses, circulation, respiration, and cognitive agility. Characterized as dry, light, and cool.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center mb-4 font-bold font-serif-heading">
                P
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">Pitta Dosha</h3>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
                Fire & Water Elements
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Governs cellular metabolism, digestive fire (Agni), biochemical transformations, visual acuity, and intellect. Characterized as hot, sharp, and intense.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-4 font-bold font-serif-heading">
                K
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">Kapha Dosha</h3>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                Earth & Water Elements
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Governs musculoskeletal structure, joint lubrication, fluid balance, immunological resilience, and stamina. Characterized as heavy, steady, and cool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Disclaimer Footer */}
      <footer className="py-8 text-center text-xs text-stone-500 border-t border-stone-200 bg-stone-50/50">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-semibold text-stone-700 mb-1">Educational & Clinical Notice:</p>
          <p>
            This Prakriti assessment result is based on the configured questionnaire scoring method
            and is not a standalone medical diagnosis. Built for academic evaluation and clinical pair-programming demonstrations.
          </p>
        </div>
      </footer>
    </div>
  );
};
