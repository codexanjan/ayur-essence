import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientService, Patient } from '../services/patients.ts';
import { assessmentService } from '../services/assessments.ts';
import { Users, Calendar, Phone, MapPin, PlusCircle, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [patData, histData] = await Promise.all([
          patientService.getById(id),
          patientService.getHistory(id),
        ]);
        setPatient(patData);
        setHistory(histData.assessments || []);
      } catch (err) {
        console.error('Failed to load patient profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStartAssessment = async () => {
    if (!id) return;
    setCreating(true);
    try {
      const data = await assessmentService.create(id);
      navigate(`/assessment/${data.assessmentId}`);
    } catch (err) {
      console.error('Failed to create assessment:', err);
      alert('Error initiating assessment. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-500 animate-pulse text-sm">
        Loading patient dossier and longitudinal assessment record...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-stone-800">Patient Profile Not Found</h2>
        <Link to="/patients" className="text-xs font-semibold text-ayur-primary hover:underline">
          Return to Patients Directory
        </Link>
      </div>
    );
  }

  const birthYear = new Date(patient.dateOfBirth).getFullYear();
  const age = new Date().getFullYear() - birthYear;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/patients"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Patients Directory</span>
      </Link>

      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Users className="w-3 h-3 text-emerald-600" />
            <span>Patient ID: {patient.id.slice(0, 8)}...</span>
          </div>

          <h1 className="text-3xl font-extrabold font-serif-heading text-stone-900">
            {patient.fullName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-600">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{new Date(patient.dateOfBirth).toLocaleDateString()} ({age} yrs, {patient.gender.toLowerCase()})</span>
            </span>

            {patient.phone && (
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{patient.phone}</span>
              </span>
            )}

            {patient.address && (
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{patient.address}</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleStartAssessment}
          disabled={creating}
          className="px-6 py-3 bg-ayur-primary hover:bg-ayur-primary-dark text-white rounded-2xl font-semibold text-xs shadow-lg transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{creating ? 'Starting...' : 'Start Prakriti Assessment'}</span>
        </button>
      </div>

      {/* Longitudinal Assessment History */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h2 className="text-xl font-bold font-serif-heading text-stone-900">
            Prakriti Assessment Timeline
          </h2>
          <span className="text-xs text-stone-500">{history.length} evaluations recorded</span>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-sm font-semibold text-stone-800">No Assessments Completed Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Initiate the standardized 16-indicator Prakriti questionnaire to diagnose this patient's constitutional Dosha.
            </p>
            <button
              onClick={handleStartAssessment}
              className="px-4 py-2 bg-ayur-primary text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              Start First Evaluation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((asmt) => (
              <div
                key={asmt.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        asmt.status === 'FINALIZED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : asmt.status === 'SUBMITTED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {asmt.status}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      Revision #{asmt.revisionNo}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500">
                      {new Date(asmt.date).toLocaleDateString()}
                    </span>
                  </div>

                  {asmt.dominantDosha ? (
                    <div className="flex items-center space-x-3 pt-1">
                      <span className="text-sm font-black text-stone-900 font-serif-heading">
                        Dominant: {asmt.dominantDosha}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        (V: {asmt.vataPct}% • P: {asmt.pittaPct}% • K: {asmt.kaphaPct}%)
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 pt-1">Assessment in progress (draft)</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  {asmt.status === 'DRAFT' ? (
                    <Link
                      to={`/assessment/${asmt.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <span>Resume Questionnaire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/results/${asmt.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-ayur-primary hover:bg-emerald-100 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <span>View Dossier & Chart</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
