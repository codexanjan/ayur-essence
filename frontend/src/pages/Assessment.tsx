import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { assessmentService, Question } from '../services/assessments.ts';
import { Flower2, ArrowLeft, ArrowRight, CheckCircle2, Save, Sparkles, AlertCircle } from 'lucide-react';

export const Assessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [assessmentId, setAssessmentId] = useState<string | null>(id || null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or resume assessment
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch active questions
        const qData = await assessmentService.getQuestions();
        setQuestions(qData.questions);

        // 2. Determine target assessmentId
        let activeId = id;
        const patientIdParam = searchParams.get('patientId');

        if (!activeId && patientIdParam) {
          // Create new assessment for patient
          const newAsmt = await assessmentService.create(patientIdParam);
          activeId = newAsmt.assessmentId;
          setAssessmentId(activeId ?? null);
        }

        if (activeId) {
          // Load existing assessment details to pre-populate answers if draft
          const asmt = await assessmentService.getById(activeId);
          if (asmt.responses && asmt.responses.length > 0) {
            const initialMap: Record<string, string> = {};
            for (const r of asmt.responses) {
              initialMap[r.questionId] = r.responseValue;
            }
            setAnswers(initialMap);
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize assessment:', err);
        setError(err.response?.data?.error?.message || 'Failed to load questionnaire questions.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-ayur-primary text-amber-300 flex items-center justify-center mx-auto animate-spin">
          <Flower2 className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stone-700">Loading Vedic Prakriti Diagnostic Matrix...</p>
        <p className="text-xs text-stone-500">Retrieving active indicators from clinical database</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error || 'No active questionnaire questions configured.'}
        </div>
        <Link to="/patients" className="inline-block text-xs font-semibold text-ayur-primary hover:underline">
          Return to Patients Directory
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / totalQ) * 100);
  const selectedOption = answers[currentQ.id] || '';

  const handleSelectOption = (opt: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: opt,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Helper to quickly fill all answers for demo evaluation
  const handleQuickFillDemo = () => {
    const demoAnswers: Record<string, string> = {};
    questions.forEach((q, idx) => {
      // Create a nice natural distribution: index % 3
      const optionIndex = idx % q.options.length;
      demoAnswers[q.id] = q.options[optionIndex];
    });
    setAnswers(demoAnswers);
  };

  // Save draft answers to backend
  const handleSaveDraft = async () => {
    if (!assessmentId) return;
    setSaving(true);
    setError(null);
    try {
      const responsesPayload = Object.entries(answers).map(([questionId, responseValue]) => ({
        questionId,
        responseValue,
      }));

      if (responsesPayload.length > 0) {
        await assessmentService.saveResponses(assessmentId, responsesPayload);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save responses.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate and finalize results
  const handleSubmitAndCalculate = async () => {
    if (!assessmentId) return;
    setCalculating(true);
    setError(null);

    try {
      // 1. Save all answers first
      const responsesPayload = Object.entries(answers).map(([questionId, responseValue]) => ({
        questionId,
        responseValue,
      }));

      if (responsesPayload.length < totalQ) {
        setError(`Please answer all ${totalQ} questions before submitting. Currently completed: ${responsesPayload.length}/${totalQ}`);
        setCalculating(false);
        return;
      }

      await assessmentService.saveResponses(assessmentId, responsesPayload);

      // 2. Invoke server-side scoring calculation
      await assessmentService.calculate(assessmentId);

      // 3. Navigate to results page
      navigate(`/results/${assessmentId}`);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Calculation failed. Ensure all required indicators are answered.'
      );
      setCalculating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <Link
            to="/patients"
            className="inline-flex items-center space-x-1 font-semibold text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Exit</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="text-[11px] font-bold text-ayur-primary bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
              title="Automatically select an answer for all questions for rapid evaluation demo"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Quick Demo Fill</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 px-2 py-1 flex items-center space-x-1"
            >
              <Save className="w-3 h-3" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-stone-700">
            <span>Question {currentIndex + 1} of {totalQ}</span>
            <span>{progressPct}% Completed ({answeredCount}/{totalQ})</span>
          </div>
          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-ayur-primary to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-md space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ayur-primary bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            {currentQ.code.replace(/_/g, ' ')}
          </span>

          <h2 className="text-xl sm:text-2xl font-bold font-serif-heading text-stone-900 mt-3 leading-snug">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Radio Option Choices */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                  isSelected
                    ? 'border-ayur-primary bg-emerald-50/80 ring-2 ring-ayur-primary/30 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-ayur-primary bg-ayur-primary text-white'
                        : 'border-stone-300 group-hover:border-emerald-400'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? 'text-stone-900 font-semibold' : 'text-stone-700'
                    }`}
                  >
                    {option}
                  </span>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-ayur-primary shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Question Navigation Footer */}
        <div className="pt-6 border-t border-stone-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentIndex < totalQ - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-ayur-primary hover:bg-ayur-primary-dark text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all"
            >
              <span>Next Indicator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitAndCalculate}
              disabled={calculating}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-ayur-primary to-emerald-700 hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{calculating ? 'Analyzing Constitution...' : 'Calculate Prakriti Result'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
