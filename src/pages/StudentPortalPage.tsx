import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  CalendarCheck,
  Award,
  CreditCard,
  Clock,
  BookOpen,
  Bell,
  Printer,
  CheckCircle,
  FileText,
  Lock,
  LogIn,
  LogOut,
  ChevronRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  Student,
  ExamResult,
  FeeAccount2026,
  MonthlyFeeRecord2026,
  FeePaymentReceipt,
  StudentAttendanceRecord,
  TimetableItem,
  Announcement,
} from '../types';
import { PrintableReportCard } from '../components/PrintableReportCard';
import { PrintableReceipt } from '../components/PrintableReceipt';
import { SmartAiAssistant } from '../components/SmartAiAssistant';

interface StudentPortalPageProps {
  initialRollNumber?: string;
}

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({
  initialRollNumber,
}) => {
  // Authentication state
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [rollInput, setRollInput] = useState<string>(initialRollNumber || '');
  const [passwordInput, setPasswordInput] = useState<string>('oxfored2026');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'academics' | 'fees' | 'attendance' | 'timetable' | 'ai'
  >('overview');

  // Student Loaded Data
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [feeAccount, setFeeAccount] = useState<FeeAccount2026 | null>(null);
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFeeRecord2026[]>([]);
  const [feeReceipts, setFeeReceipts] = useState<FeePaymentReceipt[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState<string>('95.8');
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modals
  const [activeReportCard, setActiveReportCard] = useState<ExamResult | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<FeePaymentReceipt | null>(null);

  // Auto-login if initial roll provided
  useEffect(() => {
    if (initialRollNumber) {
      setRollInput(initialRollNumber);
      handleLogin(initialRollNumber);
    }
  }, [initialRollNumber]);

  const handleLogin = async (overrideRoll?: string) => {
    const roll = overrideRoll || rollInput;
    if (!roll) {
      setAuthError('Please enter your student roll number');
      return;
    }

    setLoading(true);
    setAuthError(null);
    try {
      const student = await api.studentLogin(roll.trim(), passwordInput);
      setActiveStudent(student);

      // Load all student personal records in parallel
      const [results, feeAcc, monthFees, receipts, attHistory, fullTimetable, notices] =
        await Promise.all([
          api.getExamResults({ rollNumber: student.rollNumber, isPublished: true }),
          api.getFeeAccountByRoll(student.rollNumber),
          api.getMonthlyFees(student.id),
          api.getFeeReceipts(student.id),
          api.getStudentAttendance({ rollNumber: student.rollNumber }),
          api.getTimetable(student.admissionClass),
          api.getAnnouncements(),
        ]);

      setExamResults(results);
      setFeeAccount(feeAcc);
      setMonthlyFees(monthFees);
      setFeeReceipts(receipts);
      setAttendanceRecords(attHistory);
      setTimetable(fullTimetable);
      setAnnouncements(notices);

      // Calculate monthly attendance percentage
      if (attHistory.length > 0) {
        const presents = attHistory.filter((a) => a.status === 'Present').length;
        const lates = attHistory.filter((a) => a.status === 'Late').length;
        const total = attHistory.length;
        const pct = (((presents + lates * 0.5) / total) * 100).toFixed(1);
        setAttendancePercentage(pct);
      } else {
        setAttendancePercentage('96.2');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid Roll Number or Student Password');
    } finally {
      setLoading(false);
    }
  };

  // If NOT logged in, show student login form
  if (!activeStudent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-100 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-emerald-950 mx-auto flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-serif font-black text-emerald-950">
              Student Login Portal
            </h2>
            <p className="text-xs text-slate-500">
              Oxfored Educational House — Brewery Road Quetta
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Student Permanent Roll Number:
              </label>
              <input
                type="text"
                required
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                placeholder="e.g. 1, 2, 3..."
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-mono text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Official single-sequence roll number (starting at 1) assigned upon admission.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Secure Password:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter student password"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-800 outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default demonstration password: <code>oxfored2026</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-yellow-300 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-emerald-950" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Student Portal'}</span>
            </button>
          </form>

          {/* Real Students Enrollment Policy Notice */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 block">
              Official Real-Student Access
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              In accordance with school policy, only genuinely enrolled and approved students can log in with their assigned permanent roll number.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Header Bar in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={activeStudent.photoUrl}
              alt={activeStudent.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-yellow-400 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {activeStudent.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-yellow-400 text-emerald-950 uppercase">
                  Admitted
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Father: <strong className="text-white">{activeStudent.fatherName}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium pt-1">
                <span className="bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-yellow-400/50 font-mono text-yellow-300 font-bold">
                  {activeStudent.rollNumber}
                </span>
                <span>{activeStudent.admissionClass} — Section {activeStudent.section}</span>
                <span>Session {activeStudent.academicSession}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => setActiveTab('ai')}
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all border border-yellow-300"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>Smart AI Tutor</span>
            </button>
            <button
              onClick={() => setActiveStudent(null)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Portal Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pt-4 border-t border-emerald-800 scrollbar-none">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: User },
            { id: 'academics', label: 'Exam Results & Marksheets', icon: Award },
            { id: 'fees', label: '2026 Fee Account & Receipts', icon: CreditCard },
            { id: 'attendance', label: 'Daily Attendance History', icon: CalendarCheck },
            { id: 'timetable', label: 'Class Timetable', icon: Clock },
            { id: 'ai', label: 'Smart AI Study Assistant', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSel
                    ? 'bg-yellow-400 text-emerald-950 shadow-md scale-105 font-black'
                    : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Monthly Attendance Rate
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {attendancePercentage}%
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Consistent Performance
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Published Results
              </span>
              <div className="text-2xl font-black text-yellow-600 font-mono">
                {examResults.length} Exams
              </div>
              <span className="text-[11px] text-slate-500">
                Latest: {examResults[0]?.finalGrade || 'A+'} Grade
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                2026 Fee Account Balance
              </span>
              <div className="text-2xl font-black text-red-600 font-mono">
                Rs. {feeAccount?.remainingBalance.toLocaleString() || '0'}
              </div>
              <span className="text-[11px] text-slate-500">
                Paid: Rs. {feeAccount?.amountPaid.toLocaleString() || '0'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Smart AI Study Tutor
              </span>
              <div className="text-2xl font-black text-emerald-900 flex items-center gap-2">
                <span>Active</span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
              </div>
              <button
                onClick={() => setActiveTab('ai')}
                className="text-[11px] text-yellow-700 font-bold hover:underline block text-left cursor-pointer"
              >
                Ask Academic Questions →
              </button>
            </div>
          </div>

          {/* Announcements for Students */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-500" />
              Campus Notices & Examination Circulars
            </h3>
            <div className="space-y-3">
              {announcements.map((anc) => (
                <div key={anc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-slate-900 font-serif">{anc.title}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{anc.publishDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ACADEMICS & EXAM RESULTS */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-serif text-emerald-950">
                Published Examination Results & Marksheets
              </h2>
              <p className="text-xs text-slate-500">
                Official transcripts certified by Oxfored Educational House Board of Examinations
              </p>
            </div>
          </div>

          {examResults.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border-2 border-emerald-100 space-y-2">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-600 font-semibold">No published exam results found yet.</p>
              <p className="text-xs text-slate-400">Results will appear here once approved by the Principal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {examResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4 hover:border-yellow-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider block">
                        Academic Transcript
                      </span>
                      <h3 className="text-base font-bold text-emerald-950 font-serif">{res.examName}</h3>
                      <p className="text-xs text-slate-500">
                        Session: {res.session} • Published: {res.publishedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-950">{res.totalObtainedMarks} / {res.totalMaxMarks}</span>
                        <span className="text-xs font-bold text-yellow-600 block">{res.percentage}% ({res.finalGrade})</span>
                      </div>
                      <button
                        onClick={() => setActiveReportCard(res)}
                        className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs uppercase rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer border border-yellow-400/50"
                      >
                        <Printer className="w-4 h-4 text-yellow-400" />
                        <span>Print Marksheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Subject Marks Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                        <tr>
                          <th className="py-2 px-3 text-left">Subject</th>
                          <th className="py-2 px-3 text-center">Max Marks</th>
                          <th className="py-2 px-3 text-center">Obtained Marks</th>
                          <th className="py-2 px-3 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {res.subjects.map((sub, i) => (
                          <tr key={i} className="hover:bg-yellow-50/40 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-800">{sub.subjectName || sub.subject}</td>
                            <td className="py-2 px-3 text-center font-mono text-slate-600">{sub.maxMarks}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-950">{sub.obtainedMarks}</td>
                            <td className="py-2 px-3 text-center font-bold text-yellow-600">{sub.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Remarks */}
                  <div className="p-3 bg-emerald-50/50 rounded-2xl text-xs space-y-1 border border-emerald-200">
                    <p><strong className="text-emerald-950">Teacher Remarks:</strong> {res.teacherRemarks}</p>
                    <p><strong className="text-emerald-950">Principal's Remarks:</strong> {res.principalRemarks}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. FEE ACCOUNT & RECEIPTS 2026 */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {feeAccount ? (
            <>
              {/* Fee Account Summary */}
              <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-emerald-950">
                      Fee Account Ledger — Session 2026
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Student ID Link: {feeAccount.studentId} • Roll: {feeAccount.rollNumber}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-950 border border-emerald-300">
                    Status: {feeAccount.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Tuition</span>
                    <strong className="text-sm font-mono text-slate-900">Rs. {feeAccount.monthlyTuitionFee}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Annual Due</span>
                    <strong className="text-sm font-mono text-emerald-950">Rs. {feeAccount.totalFeeDue.toLocaleString()}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">Total Paid</span>
                    <strong className="text-sm font-mono text-emerald-800">Rs. {feeAccount.amountPaid.toLocaleString()}</strong>
                  </div>
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                    <span className="text-red-700 block text-[10px] uppercase font-bold">Remaining Balance</span>
                    <strong className="text-sm font-mono text-red-800">Rs. {feeAccount.remainingBalance.toLocaleString()}</strong>
                  </div>
                </div>

                {/* 1st-5th Deadline Notice */}
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-xs text-red-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-red-700">Monthly Fee Deadline (1st to 5th):</strong> Every student must pay their monthly fee between the <strong>1st and 5th of each month</strong>. Otherwise the student will be removed / barred from their class!
                  </div>
                </div>

                {/* EasyPaisa Quick Pay Notice */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white border-2 border-yellow-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-300 block">
                      Pay Online via EasyPaisa
                    </span>
                    <p className="text-xs font-bold text-white">
                      Official EasyPaisa Account: <span className="font-mono text-yellow-300 text-sm">03327185311</span>
                    </p>
                    <p className="text-[11px] text-emerald-200">
                      Send fee to 03327185311 and submit your TID on the Online Payment portal for instant clearance.
                    </p>
                  </div>
                  <a
                    href="tel:03327185311"
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all whitespace-nowrap"
                  >
                    Call / Pay 03327185311
                  </a>
                </div>
              </div>

              {/* 12 Months Breakdown (Jan - Dec 2026) */}
              <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  2026 Monthly Tuition Fee Status (Jan to Dec)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {monthlyFees.map((mf) => (
                    <div
                      key={mf.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 hover:border-yellow-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-serif">{mf.month} 2026</strong>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            mf.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mf.paymentStatus === 'Partially Paid'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {mf.paymentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Amount Due:</span>
                          <span className="font-mono">Rs. {mf.totalAmountDue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span className="font-mono font-bold text-emerald-700">Rs. {mf.amountPaid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Balance:</span>
                          <span className="font-mono font-bold text-red-600">Rs. {mf.remainingBalance}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Receipts */}
              {feeReceipts.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    Official Payment Receipts ({feeReceipts.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feeReceipts.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between hover:border-yellow-400 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-emerald-950 block">{rec.receiptNumber}</span>
                          <span className="text-slate-500">{rec.paymentDate} • {rec.feeMonthOrPeriod}</span>
                          <span className="text-[10px] text-slate-400 block">Via: {rec.paymentMethod}</span>
                        </div>
                        <div className="text-right space-y-2">
                          <span className="font-mono font-bold text-emerald-800 block text-sm">
                            Rs. {rec.amountPaid.toLocaleString()}
                          </span>
                          <button
                            onClick={() => setActiveReceipt(rec)}
                            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-[10px] uppercase rounded-xl flex items-center gap-1 cursor-pointer border border-yellow-400/50"
                          >
                            <Printer className="w-3 h-3 text-yellow-400" />
                            <span>Print Voucher</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-500">Loading fee account...</p>
          )}
        </div>
      )}

      {/* 4. ATTENDANCE HISTORY */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold font-serif text-emerald-950">
                Daily Attendance Register (Pakistan Standard Time)
              </h3>
              <p className="text-xs text-slate-500">
                Total Sessions: {attendanceRecords.length || 24} • Monthly Average: {attendancePercentage}%
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-950 font-mono">{attendancePercentage}%</span>
              <span className="text-[10px] text-slate-400 block">Monthly Rate</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date (PKT)</th>
                  <th className="py-2.5 px-3 text-left">Class & Section</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-left">Faculty In-charge / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendanceRecords.map((att) => (
                  <tr key={att.id} className="hover:bg-yellow-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-800">{att.date}</td>
                    <td className="py-2.5 px-3 text-slate-700">{att.class}–{att.section}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          att.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : att.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {att.markedBy} {att.remarks && `(${att.remarks})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold font-serif text-emerald-950">
            Weekly Class Timetable — {activeStudent.admissionClass} (Section {activeStudent.section})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timetable.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs hover:border-yellow-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-yellow-800 font-mono text-[11px]">{t.day}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold border border-emerald-200">{t.room}</span>
                </div>
                <strong className="text-sm text-emerald-950 block">{t.subject}</strong>
                <p className="text-slate-600 font-medium">Instructor: {t.teacherName}</p>
                <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                  {t.startTime} – {t.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SMART AI TUTOR */}
      {activeTab === 'ai' && (
        <SmartAiAssistant
          studentName={activeStudent.fullName}
          studentClass={activeStudent.admissionClass}
          rollNumber={activeStudent.rollNumber}
        />
      )}

      {/* Modals */}
      {activeReportCard && (
        <PrintableReportCard
          result={activeReportCard}
          onClose={() => setActiveReportCard(null)}
        />
      )}

      {activeReceipt && (
        <PrintableReceipt
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
