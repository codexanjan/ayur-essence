import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentService } from '../services/assessments.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DoshaChart } from '../components/DoshaChart.tsx';
import {
  Flower2,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  User,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reopen modal / action state
  const [reopenReason, setReopenReason] = useState('Revision requested during practitioner review');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Observation form state
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const loadReport = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await assessmentService.getReport(id);
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load assessment report:', err);
      setError(err.response?.data?.error?.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleFinalize = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await assessmentService.finalize(id);
      await loadReport();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to finalize assessment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionLoading(true);
    try {
      await assessmentService.reopen(id, reopenReason);
      setShowReopenModal(false);
      await loadReport();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reopen assessment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    setNoteLoading(true);
    try {
      await assessmentService.addObservation(id, newNote);
      setNewNote('');
      await loadReport();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save observation note.');
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-ayur-primary text-amber-300 flex items-center justify-center mx-auto animate-spin">
          <Flower2 className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stone-700">Synthesizing Constitutional Prakriti Analytics...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error || 'Assessment report not found.'}
        </div>
        <Link to="/patients" className="text-xs font-semibold text-ayur-primary hover:underline">
          Return to Patients Directory
        </Link>
      </div>
    );
  }

  const { patient, assessment, prakritiConstitution, observations } = report;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Link
          to={`/patients/${patient.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {patient.fullName}'s Profile</span>
        </Link>

        {/* Doctor Actions */}
        {user?.role === 'DOCTOR' && (
          <div className="flex items-center space-x-3">
            {assessment.status === 'SUBMITTED' && (
              <button
                onClick={handleFinalize}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{actionLoading ? 'Finalizing...' : 'Finalize & Lock Report'}</span>
              </button>
            )}

            {assessment.status === 'FINALIZED' && (
              <button
                onClick={() => setShowReopenModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen for Revision</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hero Dominant Dosha Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  assessment.status === 'FINALIZED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                Status: {assessment.status}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                Method: {assessment.methodVersion} • Rev #{assessment.revisionNo}
              </span>
            </div>

            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-1">
              Patient Assessment Dossier
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-heading text-stone-900">
              {patient.fullName}
            </h1>

            <p className="text-xs text-stone-500 mt-2">
              Evaluated on {new Date(assessment.createdAt).toLocaleDateString()} by{' '}
              <span className="font-semibold text-stone-700">{assessment.assessedBy}</span>
              {assessment.finalizedBy && ` • Finalized by ${assessment.finalizedBy}`}
            </p>
          </div>

          {/* Dominant Dosha Badge */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-emerald-950 text-white shadow-xl text-center min-w-[200px] border border-emerald-900/50">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-widest block">
              Dominant Constitution
            </span>
            <div className="text-3xl font-extrabold font-serif-heading text-white mt-1">
              {prakritiConstitution.dominantDosha}
            </div>
            <span className="text-[11px] text-emerald-200 mt-1 block">
              Prakriti Assessment Result
            </span>
          </div>
        </div>
      </div>

      {/* Dosha Breakdown Component */}
      <DoshaChart
        vataPct={prakritiConstitution.vataPct}
        pittaPct={prakritiConstitution.pittaPct}
        kaphaPct={prakritiConstitution.kaphaPct}
        dominantDosha={prakritiConstitution.dominantDosha}
      />

      {/* Clinical Practitioner Observations Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold font-serif-heading text-stone-900">
              Practitioner Clinical Notes
            </h2>
            <p className="text-xs text-stone-500">
              Nadi Pariksha (pulse), tongue examination, and behavioral observations
            </p>
          </div>
        </div>

        {/* Existing Observations List */}
        <div className="space-y-3">
          {observations.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No clinical notes recorded yet.</p>
          ) : (
            observations.map((obs: any) => (
              <div
                key={obs.id}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5"
              >
                <div className="flex justify-between text-stone-500 font-medium">
                  <span className="font-semibold text-stone-700">
                    {obs.author} ({obs.role})
                  </span>
                  <span>{new Date(obs.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-stone-800 text-sm leading-relaxed">{obs.notes}</p>
              </div>
            ))
          )}
        </div>

        {/* Add note form (if staff) */}
        {(user?.role === 'DOCTOR' || user?.role === 'STUDENT') && (
          <form onSubmit={handleAddObservation} className="pt-3 border-t border-stone-100 space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Add Diagnostic Observation
            </label>
            <textarea
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record Nadi findings, physical signs, or dietary recommendations..."
              className="w-full p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-xs"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={noteLoading || !newNote.trim()}
                className="px-4 py-2 bg-ayur-primary hover:bg-ayur-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40 flex items-center space-x-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{noteLoading ? 'Saving Note...' : 'Save Observation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mandatory Official Medical Disclaimer Banner */}
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900 leading-relaxed shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950 mb-0.5">Clinical Disclaimer:</p>
          <p>{report.disclaimer}</p>
        </div>
      </div>

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold font-serif-heading text-stone-900 mb-2">
              Reopen Assessment
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Reopening allows new questionnaire answers and changes the status back to DRAFT under Revision #{assessment.revisionNo + 1}.
            </p>

            <form onSubmit={handleReopen} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Reason for Revision *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-ayur-primary/50 text-stone-900 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
