import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Printer,
  Sparkles,
  BookOpen,
  CheckCircle,
  FileText,
  Plus,
  Eye,
  Lock,
  Unlock,
  X,
  Shield,
  Users,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  ExamResult,
  ExamType,
  Student,
  LEARNING_LEVELS,
  TUITION_CLASSES,
  EMPTY_STUDENT_MESSAGE,
} from '../types';
import { SchoolLogo } from '../components/SchoolLogo';

interface ResultsPortalPageProps {
  isAdmin?: boolean;
}

export const ResultsPortalPage: React.FC<ResultsPortalPageProps> = ({
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'public-lookup' | 'staff-gradebook'>(
    isAdmin ? 'staff-gradebook' : 'public-lookup'
  );

  // Staff Authentication State
  const [staffAuthorized, setStaffAuthorized] = useState(isAdmin);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Public search filters
  const [searchRoll, setSearchRoll] = useState('');
  const [searchExam, setSearchExam] = useState<ExamType | 'All'>('All');
  const [searchClass, setSearchClass] = useState('All');
  const [searched, setSearched] = useState(false);
  const [publicResults, setPublicResults] = useState<ExamResult[]>([]);
  const [selectedResultForModal, setSelectedResultForModal] = useState<ExamResult | null>(null);

  // Gradebook / Staff entry state
  const [students, setStudents] = useState<Student[]>([]);
  const [gradebookClass, setGradebookClass] = useState<string>(LEARNING_LEVELS[0]);
  const [gradebookExam, setGradebookExam] = useState<ExamType>('Midterm Examination');
  const [loadingGradebook, setLoadingGradebook] = useState(false);
  const [existingResults, setExistingResults] = useState<ExamResult[]>([]);

  // Marks Entry Modal
  const [studentForMarksEntry, setStudentForMarksEntry] = useState<Student | null>(null);
  const [marksForm, setMarksForm] = useState<{
    subjects: Array<{ subject: string; maxMarks: number; obtainedMarks: number; grade: string }>;
    teacherRemarks: string;
    principalRemarks: string;
    isPublished: boolean;
  }>({
    subjects: [
      { subject: 'English Grammar & Vocabulary', maxMarks: 100, obtainedMarks: 85, grade: 'A' },
      { subject: 'Oral Recitation & Comprehension', maxMarks: 50, obtainedMarks: 44, grade: 'A+' },
      { subject: 'Written Composition', maxMarks: 50, obtainedMarks: 40, grade: 'A' },
    ],
    teacherRemarks: 'Excellent analytical comprehension and diligent participation.',
    principalRemarks: 'Promoted with high academic commendation.',
    isPublished: true,
  });

  const examTypes: ExamType[] = [
    'First Periodic Test',
    'Second Periodic Test',
    'Midterm Examination',
    'Final Examination',
  ];

  // Perform public lookup for verified published results
  const handlePublicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRoll.trim()) return;

    setSearched(true);
    try {
      const results = await api.getExamResults({
        rollNumber: searchRoll.trim(),
        examName: searchExam !== 'All' ? searchExam : undefined,
        class: searchClass !== 'All' ? searchClass : undefined,
        isPublished: true, // ONLY published verified results
      });
      setPublicResults(results);
    } catch (err) {
      console.error(err);
      setPublicResults([]);
    }
  };

  // Load Gradebook
  const loadGradebook = async () => {
    setLoadingGradebook(true);
    try {
      const [allStudents, allResults] = await Promise.all([
        api.getStudents({ admissionClass: gradebookClass }),
        api.getExamResults({ class: gradebookClass, examName: gradebookExam }),
      ]);

      // Sort students strictly by permanent numeric roll number ascending
      const sorted = [...allStudents].sort((a, b) => {
        const numA = parseInt(a.rollNumber, 10);
        const numB = parseInt(b.rollNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.rollNumber.localeCompare(b.rollNumber);
      });

      setStudents(sorted);
      setExistingResults(allResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGradebook(false);
    }
  };

  useEffect(() => {
    if (staffAuthorized && activeTab === 'staff-gradebook') {
      loadGradebook();
    }
  }, [gradebookClass, gradebookExam, staffAuthorized, activeTab]);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123' || pinInput === 'teacher123' || pinInput === 'atif123') {
      setStaffAuthorized(true);
      setPinError(null);
    } else {
      setPinError('Invalid Faculty PIN. Authorized faculty access only.');
    }
  };

  const handleOpenMarksEntry = (st: Student) => {
    setStudentForMarksEntry(st);
    const existing = existingResults.find((r) => r.studentId === st.id);
    if (existing) {
      setMarksForm({
        subjects: existing.subjects,
        teacherRemarks: existing.teacherRemarks,
        principalRemarks: existing.principalRemarks,
        isPublished: existing.isPublished,
      });
    } else {
      setMarksForm({
        subjects: [
          { subject: 'Core Coursework', maxMarks: 100, obtainedMarks: 80, grade: 'A' },
          { subject: 'Class Exercises & Assignments', maxMarks: 50, obtainedMarks: 45, grade: 'A+' },
        ],
        teacherRemarks: 'Consistent effort and good subject understanding.',
        principalRemarks: 'Satisfactory performance.',
        isPublished: false,
      });
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForMarksEntry) return;

    try {
      await api.saveExamResult({
        examName: gradebookExam,
        studentId: studentForMarksEntry.id,
        session: '2026-2027',
        subjects: marksForm.subjects,
        teacherRemarks: marksForm.teacherRemarks,
        principalRemarks: marksForm.principalRemarks,
        isPublished: marksForm.isPublished,
      });

      setStudentForMarksEntry(null);
      await loadGradebook();
    } catch (err: any) {
      alert(err.message || 'Failed to save marks');
    }
  };

  const handleTogglePublish = async (resId: string, currentStatus: boolean) => {
    try {
      await api.publishExamResult(resId, !currentStatus, 'Principal Atif Panezai');
      await loadGradebook();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Examinations & Report Cards</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — EXAMINATION RESULTS PORTAL
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Search verified, officially published examination report cards using permanent student roll numbers. First periodic test, second periodic test, midterm, and final examination results.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
        <div className="flex items-center gap-2 bg-emerald-100/70 p-1.5 rounded-2xl border border-emerald-200">
          <button
            type="button"
            onClick={() => setActiveTab('public-lookup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'public-lookup'
                ? 'bg-emerald-900 text-yellow-400 shadow-md font-black'
                : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Public Results Lookup</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff-gradebook')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'staff-gradebook'
                ? 'bg-emerald-900 text-yellow-400 shadow-md font-black'
                : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-yellow-500" />
            <span>Authorized Faculty Gradebook</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: PUBLIC RESULTS LOOKUP ==================== */}
      {activeTab === 'public-lookup' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-serif font-black text-emerald-950">
              Student Report Card Lookup
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Search official published examination records by entering the student's permanent numeric roll number. Draft or unpublished marks are strictly hidden.
            </p>
          </div>

          <form
            onSubmit={handlePublicSearch}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Permanent Numeric Roll No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1, 2, 3..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-emerald-950 focus:border-emerald-600 outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Examination Type
              </label>
              <select
                value={searchExam}
                onChange={(e) => setSearchExam(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 outline-none bg-white"
              >
                <option value="All">All Examinations</option>
                {examTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Level / Class (Optional)
              </label>
              <select
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 outline-none bg-white"
              >
                <option value="All">All Levels / Classes</option>
                {LEARNING_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
                {TUITION_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-yellow-400 text-emerald-950 text-xs font-black uppercase tracking-wider hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Search className="w-4 h-4 text-emerald-950" />
                <span>Search Report Card</span>
              </button>
            </div>
          </form>

          {/* Results Output */}
          {searched && (
            <div className="space-y-6 pt-4">
              {publicResults.length === 0 ? (
                <div className="py-16 text-center bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 px-6">
                  <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-emerald-950 max-w-lg mx-auto">
                    No verified published results found for Permanent Roll Number "{searchRoll}".
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Results are published by the administration following formal verification.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {publicResults.map((res) => (
                    <div
                      key={res.id}
                      className="bg-white rounded-3xl border-2 border-emerald-300 p-6 shadow-sm space-y-4 hover:border-yellow-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest block">
                            {res.examName}
                          </span>
                          <h3 className="text-lg font-serif font-black text-emerald-950">
                            {res.studentName}
                          </h3>
                          <p className="text-xs text-slate-600">
                            Permanent Roll:{' '}
                            <strong className="font-mono text-emerald-900 bg-yellow-200 px-2 py-0.5 rounded">
                              {res.rollNumber}
                            </strong>{' '}
                            • {res.class}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            res.passFailStatus === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {res.passFailStatus}
                        </span>
                      </div>

                      {/* Marks Summary */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Total Marks</span>
                          <strong className="text-xs text-emerald-950">
                            {res.totalObtainedMarks} / {res.totalMaxMarks}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Percentage</span>
                          <strong className="text-xs text-emerald-950">{res.percentage}%</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Grade</span>
                          <strong className="text-xs text-yellow-600 font-black">
                            {res.finalGrade}
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedResultForModal(res)}
                        className="w-full py-2.5 rounded-xl bg-emerald-900 text-yellow-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Official Report Card</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: FACULTY GRADEBOOK (PROTECTED) ==================== */}
      {activeTab === 'staff-gradebook' && (
        <>
          {!staffAuthorized ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-8 sm:p-12 shadow-sm max-w-md mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-black text-emerald-950">
                  Authorized Faculty Gradebook
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Marks entry and result publication are restricted to authorized teachers and school administrators.
                </p>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                  {pinError}
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter Faculty PIN (e.g. admin123)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-sm font-mono tracking-widest focus:border-emerald-600 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors cursor-pointer"
                >
                  Unlock Gradebook
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Gradebook Header Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={gradebookClass}
                    onChange={(e) => setGradebookClass(e.target.value)}
                    className="px-4 py-2 rounded-xl border-2 border-emerald-300 text-xs font-bold text-emerald-950 outline-none bg-white"
                  >
                    <optgroup label="11 Learning Levels">
                      {LEARNING_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tuition Classes (Prep-10th)">
                      {TUITION_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          Tuition: {cls}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <select
                    value={gradebookExam}
                    onChange={(e) => setGradebookExam(e.target.value as any)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none bg-white"
                  >
                    {examTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStaffAuthorized(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Lock Gradebook
                </button>
              </div>

              {/* Real Students Table */}
              {loadingGradebook ? (
                <div className="py-16 text-center text-slate-400">Loading enrolled students...</div>
              ) : students.length === 0 ? (
                <div className="py-16 text-center bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 px-6">
                  <Users className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-emerald-950 max-w-lg mx-auto">
                    {EMPTY_STUDENT_MESSAGE}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-emerald-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-emerald-900 text-yellow-300 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Roll No</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Level / Class</th>
                        <th className="p-3.5">Marks Record</th>
                        <th className="p-3.5">Percentage / Grade</th>
                        <th className="p-3.5">Published Status</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 font-medium">
                      {students.map((st) => {
                        const res = existingResults.find((r) => r.studentId === st.id);
                        return (
                          <tr key={st.id} className="hover:bg-emerald-50/50 transition-colors">
                            <td className="p-3.5 font-mono font-black text-emerald-900 text-sm">
                              {st.rollNumber}
                            </td>
                            <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                              <img
                                src={st.photoUrl}
                                alt={st.fullName}
                                className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                              />
                              <span>{st.fullName}</span>
                            </td>
                            <td className="p-3.5">{st.admissionClass}</td>
                            <td className="p-3.5 font-mono">
                              {res ? (
                                `${res.totalObtainedMarks} / ${res.totalMaxMarks}`
                              ) : (
                                <span className="text-slate-400 italic">No marks entered</span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono font-bold">
                              {res ? (
                                <span className="text-emerald-900">
                                  {res.percentage}% ({res.finalGrade})
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="p-3.5">
                              {res ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(res.id, res.isPublished)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer ${
                                    res.isPublished
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {res.isPublished ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      <span>Published</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3" />
                                      <span>Draft (Unpublished)</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenMarksEntry(st)}
                                className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                {res ? 'Edit Marks' : 'Enter Marks'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Marks Entry Modal */}
      {studentForMarksEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-emerald-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-4">
              <div>
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
                  Gradebook Marks Entry • {gradebookExam}
                </span>
                <h3 className="text-xl font-serif font-black text-emerald-950">
                  {studentForMarksEntry.fullName} (Permanent Roll No: {studentForMarksEntry.rollNumber})
                </h3>
                <p className="text-xs text-slate-500">Program: {studentForMarksEntry.admissionClass}</p>
              </div>
              <button
                type="button"
                onClick={() => setStudentForMarksEntry(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4">
              {/* Subjects */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Subject-wise Marks
                </span>
                {marksForm.subjects.map((sub, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <input
                      type="text"
                      value={sub.subject}
                      onChange={(e) => {
                        const copy = [...marksForm.subjects];
                        copy[idx].subject = e.target.value;
                        setMarksForm({ ...marksForm, subjects: copy });
                      }}
                      className="col-span-6 px-3 py-2 rounded-lg border border-slate-300 font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Obt"
                      value={sub.obtainedMarks}
                      onChange={(e) => {
                        const copy = [...marksForm.subjects];
                        copy[idx].obtainedMarks = Number(e.target.value);
                        setMarksForm({ ...marksForm, subjects: copy });
                      }}
                      className="col-span-3 px-3 py-2 rounded-lg border border-slate-300 text-center font-mono font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={sub.maxMarks}
                      onChange={(e) => {
                        const copy = [...marksForm.subjects];
                        copy[idx].maxMarks = Number(e.target.value);
                        setMarksForm({ ...marksForm, subjects: copy });
                      }}
                      className="col-span-3 px-3 py-2 rounded-lg border border-slate-300 text-center font-mono text-slate-500"
                    />
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Teacher's Remarks
                </label>
                <input
                  type="text"
                  value={marksForm.teacherRemarks}
                  onChange={(e) => setMarksForm({ ...marksForm, teacherRemarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Principal's Commendation
                </label>
                <input
                  type="text"
                  value={marksForm.principalRemarks}
                  onChange={(e) => setMarksForm({ ...marksForm, principalRemarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Publication Switch */}
              <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Publish Immediately</span>
                  <span className="text-[10px] text-slate-500">
                    If checked, report card becomes visible in public search.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={marksForm.isPublished}
                  onChange={(e) => setMarksForm({ ...marksForm, isPublished: e.target.checked })}
                  className="w-4 h-4 text-emerald-800 rounded accent-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setStudentForMarksEntry(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs uppercase tracking-wider"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Modal */}
      {selectedResultForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl border-4 border-yellow-400 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-4">
              <SchoolLogo size="md" />
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  Verified Official Report Card
                </span>
                <p className="text-xs font-mono text-slate-500 mt-1">{selectedResultForModal.session}</p>
              </div>
            </div>

            {/* Student Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Student Name</span>
                <strong className="text-emerald-950">{selectedResultForModal.studentName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Permanent Roll No</span>
                <strong className="text-emerald-950 font-mono text-sm">
                  {selectedResultForModal.rollNumber}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Program</span>
                <strong className="text-emerald-950">{selectedResultForModal.class}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Examination</span>
                <strong className="text-yellow-700 font-bold">{selectedResultForModal.examName}</strong>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto rounded-xl border border-emerald-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-emerald-900 text-yellow-300 font-bold uppercase">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">Max Marks</th>
                    <th className="p-3 text-center">Obtained Marks</th>
                    <th className="p-3 text-center">Subject Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {selectedResultForModal.subjects.map((sub, i) => (
                    <tr key={i} className="hover:bg-emerald-50/50">
                      <td className="p-3 font-sans font-bold text-slate-800">{sub.subject}</td>
                      <td className="p-3 text-center">{sub.maxMarks}</td>
                      <td className="p-3 text-center font-bold text-emerald-900">{sub.obtainedMarks}</td>
                      <td className="p-3 text-center font-bold text-yellow-600">{sub.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total / Overall Percentage / Final Grade */}
            <div className="grid grid-cols-4 gap-3 p-4 rounded-2xl bg-emerald-900 text-white text-center font-mono border-2 border-yellow-400">
              <div>
                <span className="text-[10px] text-emerald-200 block uppercase">Total Max</span>
                <span className="text-base font-bold">{selectedResultForModal.totalMaxMarks}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 block uppercase">Total Obt</span>
                <span className="text-base font-bold text-yellow-400">
                  {selectedResultForModal.totalObtainedMarks}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 block uppercase">Percentage</span>
                <span className="text-base font-bold">{selectedResultForModal.percentage}%</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 block uppercase">Final Grade</span>
                <span className="text-xl font-black text-yellow-400">
                  {selectedResultForModal.finalGrade}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p>
                <strong>Teacher's Remarks:</strong> {selectedResultForModal.teacherRemarks}
              </p>
              <p>
                <strong>Principal's Remarks:</strong> {selectedResultForModal.principalRemarks}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-slate-900"
              >
                <Printer className="w-4 h-4 text-yellow-400" />
                <span>Print Report Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedResultForModal(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-900 text-yellow-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-emerald-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
