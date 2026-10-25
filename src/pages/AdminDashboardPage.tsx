import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  CreditCard,
  DollarSign,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  CalendarCheck,
  FileText,
  AlertCircle,
  Activity,
  ArrowRight,
  Filter,
  Search,
  Download,
  Eye,
  AlertTriangle,
  History,
  Lock,
  Layers,
  ChevronRight,
  X,
  BookOpen,
  ArrowLeftRight,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  EnrollmentApplication,
  AuditLog,
  AuditSeverity,
  AuditActionType,
  Student,
  Teacher,
  LEARNING_LEVELS,
  TUITION_CLASSES,
  EMPTY_STUDENT_MESSAGE,
} from '../types';
import { SchoolLogo } from '../components/SchoolLogo';

interface AdminDashboardPageProps {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateToTab }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'audit-logs'>('overview');

  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 2,
    studentsPresent: 0,
    studentsAbsent: 0,
    teachersPresent: 0,
    teachersAbsent: 0,
    pendingApplications: 0,
    resultsPublished: 0,
    totalFeesDue: 0,
    totalFeesCollected: 0,
    outstandingFeeBalance: 0,
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [applications, setApplications] = useState<EnrollmentApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<any>({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    feeChanges: 0,
    attendanceCorrections: 0,
    enrollmentUpdates: 0,
  });

  const [loading, setLoading] = useState(true);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  // Student Level Transition Modal State
  const [selectedStudentForMove, setSelectedStudentForMove] = useState<Student | null>(null);
  const [targetLevel, setTargetLevel] = useState<string>(LEARNING_LEVELS[0]);
  const [moveReason, setMoveReason] = useState<string>('Academic Progression & Performance Review');
  const [isMovingLevel, setIsMovingLevel] = useState(false);

  // Audit Filter States
  const [auditActionFilter, setAuditActionFilter] = useState<string>('All');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('All');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [st, apps, logs, aStats, stList, tList] = await Promise.all([
        api.getDashboardStats(),
        api.getApplications(),
        api.getAuditLogs({
          actionType: auditActionFilter !== 'All' ? auditActionFilter : undefined,
          severity: auditSeverityFilter !== 'All' ? auditSeverityFilter : undefined,
          search: auditSearchQuery.trim() ? auditSearchQuery.trim() : undefined,
        }),
        api.getAuditLogStats().catch(() => null),
        api.getStudents(),
        api.getTeachers(),
      ]);
      setStats(st);
      setApplications(apps);
      setAuditLogs(logs);
      if (aStats) setAuditStats(aStats);
      setStudents(stList);
      setTeachers(tList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [auditActionFilter, auditSeverityFilter]);

  const handleApplyAuditSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleApprove = async (appId: string) => {
    try {
      const res = await api.approveApplication(appId, 'Principal Atif Panezai');
      setApprovalMessage(
        `Application officially approved for ${res.application.fullName}! Assigned Permanent Roll Number: ${res.student.rollNumber}. Fee Account auto-created in 2026 system. Action recorded in AuditLogManager.`
      );
      await loadData();
      setTimeout(() => setApprovalMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (appId: string) => {
    const reason = prompt('Please provide reason for rejection:');
    if (!reason) return;
    try {
      await api.rejectApplication(appId, reason);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleOpenMoveLevelModal = (student: Student) => {
    setSelectedStudentForMove(student);
    setTargetLevel(student.admissionClass);
    setMoveReason('Promotion following academic evaluation');
  };

  const handleExecuteMoveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForMove) return;

    setIsMovingLevel(true);
    try {
      await api.moveStudentLevel(
        selectedStudentForMove.id,
        targetLevel,
        moveReason,
        'Principal Atif Panezai'
      );
      setApprovalMessage(
        `Student ${selectedStudentForMove.fullName} successfully moved to "${targetLevel}". Permanent Roll Number ${selectedStudentForMove.rollNumber} preserved. Historical records maintained.`
      );
      setSelectedStudentForMove(null);
      await loadData();
      setTimeout(() => setApprovalMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to move student level');
    } finally {
      setIsMovingLevel(false);
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Timestamp,Action Type,Action,Severity,Performed By,Target Entity,Target Name,Details']
        .concat(
          auditLogs.map(
            (l) =>
              `${l.id},${l.timestamp},${l.actionType},"${(l.action || '').replace(/"/g, '""')}",${l.severity},"${(
                l.performedBy || ''
              ).replace(/"/g, '""')}",${l.targetEntity || ''},"${(l.targetName || '').replace(
                /"/g,
                '""'
              )}","${(l.details || '').replace(/"/g, '""')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oxfored_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingApps = applications.filter((a) => a.status === 'Pending');

  const severityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] bg-red-100 text-red-800 border border-red-300 uppercase flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-yellow-100 text-yellow-900 border border-yellow-300 uppercase flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-yellow-700" />
            Warning
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>Principal & Executive Governance Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
              OXFORED EDUCATIONAL HOUSE — ADMIN DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
              Real-time oversight over 11 learning levels, permanent roll numbers from 1, faculty responsibilities for <strong>SIR ABBAS</strong> and <strong>SIR SHARIFULLAH</strong>, 2026 fee synchronization, and the <strong>AuditLogManager</strong> service.
            </p>
          </div>

          <SchoolLogo size="md" showText={false} variant="light" className="hidden lg:flex" />
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-3 pt-4 border-t border-emerald-800/80">
          <button
            type="button"
            onClick={() => setActiveAdminTab('overview')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'overview'
                ? 'bg-yellow-400 text-emerald-950 shadow-md font-black scale-105'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800 hover:text-white border border-emerald-700/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Campus Overview & Level Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('audit-logs')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer relative ${
              activeAdminTab === 'audit-logs'
                ? 'bg-yellow-400 text-emerald-950 shadow-md font-black scale-105'
                : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-800 hover:text-white border border-emerald-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span>AuditLogManager & Compliance</span>
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping absolute -top-1 -right-1" />
          </button>

          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('online-payment')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-900/80 hover:bg-emerald-800 text-yellow-300 border border-yellow-400/80 transition-all flex items-center gap-2 cursor-pointer ml-auto"
            >
              <CreditCard className="w-4 h-4 text-yellow-400" />
              <span>EasyPaisa Pay: 03327185311</span>
            </button>
          )}
        </div>
      </div>

      {approvalMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-900 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{approvalMessage}</span>
        </div>
      )}

      {/* ==================== TAB 1: OVERVIEW & APPROVALS ==================== */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* ALL 12 MANDATORY SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* 1. Total Admitted Students */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm space-y-1 hover:border-yellow-400 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                1. Total Admitted Students
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {stats.totalStudents}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">Permanent Rolls 1+</span>
            </div>

            {/* 2. Total Teachers */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm space-y-1 hover:border-yellow-400 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                2. Faculty Staff
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {teachers.length}
              </div>
              <span className="text-[10px] text-slate-500 block">SIR ABBAS & SIR SHARIFULLAH</span>
            </div>

            {/* 3. Students Present Today */}
            <div className="bg-emerald-50/80 p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                3. Students Present Today
              </span>
              <div className="text-2xl font-black text-emerald-800 font-mono">
                {stats.studentsPresent}
              </div>
              <span className="text-[10px] text-emerald-700 block">PKT Campus Attendance</span>
            </div>

            {/* 4. Students Absent Today */}
            <div className="bg-red-50/70 p-5 rounded-2xl border-2 border-red-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                4. Students Absent Today
              </span>
              <div className="text-2xl font-black text-red-800 font-mono">
                {stats.studentsAbsent}
              </div>
              <span className="text-[10px] text-red-700 block">Monitored in register</span>
            </div>

            {/* 5. Teachers Present Today */}
            <div className="bg-emerald-50/80 p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                5. Teachers Present Today
              </span>
              <div className="text-2xl font-black text-emerald-800 font-mono">
                {stats.teachersPresent}
              </div>
              <span className="text-[10px] text-emerald-700 block">Checked In at Brewery Rd</span>
            </div>

            {/* 6. Teachers Absent Today */}
            <div className="bg-yellow-50/80 p-5 rounded-2xl border-2 border-yellow-300 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-yellow-900 uppercase tracking-wider block">
                6. Teachers Absent / Leave
              </span>
              <div className="text-2xl font-black text-yellow-800 font-mono">
                {stats.teachersAbsent}
              </div>
              <span className="text-[10px] text-yellow-700 block">Authorized Leave</span>
            </div>

            {/* 7. Pending Applications */}
            <div className="bg-yellow-50/90 p-5 rounded-2xl border-2 border-yellow-400 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-yellow-900 uppercase tracking-wider block">
                7. Pending Enrollments
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {pendingApps.length}
              </div>
              <span className="text-[10px] text-yellow-800 font-bold block">Awaiting review below</span>
            </div>

            {/* 8. Results Published */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm space-y-1 hover:border-yellow-400 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                8. Results Published
              </span>
              <div className="text-2xl font-black text-yellow-600 font-mono">
                {stats.resultsPublished}
              </div>
              <span className="text-[10px] text-slate-500 block">Verified Official Records</span>
            </div>

            {/* 9. Total Fees Due 2026 */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm space-y-1 hover:border-yellow-400 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                9. Total Fees Due (2026)
              </span>
              <div className="text-xl font-black text-emerald-950 font-mono">
                Rs. {Number(stats.totalFeesDue).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block">Session 2026 Projected</span>
            </div>

            {/* 10. Total Fees Collected 2026 */}
            <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                10. Total Fees Collected
              </span>
              <div className="text-xl font-black text-emerald-800 font-mono">
                Rs. {Number(stats.totalFeesCollected).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">Collected in 2026</span>
            </div>

            {/* 11. Outstanding Fee Balance */}
            <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                11. Outstanding Balance
              </span>
              <div className="text-xl font-black text-red-800 font-mono">
                Rs. {Number(stats.outstandingFeeBalance).toLocaleString()}
              </div>
              <span className="text-[10px] text-red-700 block">Total Due − Amount Paid</span>
            </div>

            {/* 12. Learning Levels Count */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm space-y-1 hover:border-yellow-400 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                12. Learning Programs
              </span>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                11 Levels + 11 Tuitions
              </div>
              <span className="text-[10px] text-yellow-600 font-bold block">Configured in DB</span>
            </div>
          </div>

          {/* FACULTY PROFILES (SIR ABBAS & SIR SHARIFULLAH) */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <h3 className="text-lg font-serif font-black text-emerald-950">
                  Institutional Faculty Profiles
                </h3>
                <p className="text-xs text-slate-500">
                  Teaching assignments are strictly limited to the two verified faculty members.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((tch) => (
                <div
                  key={tch.id}
                  className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-black text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">
                        {tch.staffId}
                      </span>
                      <h4 className="text-lg font-serif font-black text-emerald-950 mt-1">
                        {tch.fullName}
                      </h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {tch.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-emerald-900">{tch.designation}</p>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Assigned Responsibilities:</strong> {tch.subject}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      Phone: {tch.phone} • Email: {tch.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: ENROLLED STUDENTS & LEVEL PROGRESSION */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100">
              <div>
                <h3 className="text-lg font-serif font-black text-emerald-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-600" />
                  <span>Officially Admitted Students & Level Progression</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Move a student to another learning level or tuition class. The permanent roll number is strictly preserved.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300">
                Total Admitted: {students.length}
              </span>
            </div>

            {students.length === 0 ? (
              <div className="py-12 text-center bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 px-6">
                <Users className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
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
                      <th className="p-3.5">Student Photograph</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Father Name</th>
                      <th className="p-3.5">Current Level / Class</th>
                      <th className="p-3.5">Admission Date</th>
                      <th className="p-3.5 text-center">Level Transition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 font-medium">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="p-3.5 font-mono font-black text-emerald-900 text-base">
                          {st.rollNumber}
                        </td>
                        <td className="p-3.5">
                          <img
                            src={st.photoUrl}
                            alt={st.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-xs"
                          />
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{st.fullName}</td>
                        <td className="p-3.5 text-slate-600">{st.fatherName}</td>
                        <td className="p-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-1 rounded-md bg-yellow-100 text-emerald-950 font-bold border border-yellow-300">
                              {st.admissionClass}
                            </span>
                            {st.secondClass && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[10px] border border-amber-300 flex items-center gap-1">
                                <Layers className="w-2.5 h-2.5 text-amber-700" />
                                <span>Double: {st.secondClass}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{st.admissionDate}</td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenMoveLevelModal(st)}
                            className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs active:scale-95"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-950" />
                            <span>Move Level / Class</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PENDING ENROLLMENT APPLICATIONS WITH 1-CLICK APPROVE */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-serif font-black text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Pending Enrollment Applications ({pendingApps.length})</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Review applicant photographs and information. Approving assigns the permanent roll number (1, 2, 3...) and syncs the 2026 fee account.
                </p>
              </div>
            </div>

            {pendingApps.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No pending enrollment applications requiring review.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {pendingApps.map((app) => (
                  <div
                    key={app.id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={app.photoUrl}
                        alt={app.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-400 shadow-sm shrink-0"
                      />
                      <div className="space-y-1">
                        <strong className="text-sm font-bold text-emerald-950 block">
                          {app.fullName}
                        </strong>
                        <span className="text-slate-700 block">
                          Father: {app.fatherName} • Program: <strong>{app.admissionClass}</strong> (Sec {app.section})
                        </span>
                        <span className="text-[11px] text-slate-500 block font-mono">
                          Phone: {app.phone} • Address: {app.address} • Submitted: {app.createdAt.split('T')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(app.id)}
                        className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-yellow-400/50"
                      >
                        <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                        <span>Approve & Assign Permanent Roll</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(app.id)}
                        className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: AUDIT LOG MANAGER & COMPLIANCE ==================== */}
      {activeAdminTab === 'audit-logs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* AuditLogManager Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-green-950 text-white p-6 rounded-3xl border-2 border-yellow-400 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold font-serif text-white">
                    AuditLogManager Service — Security & Administrative Transparency
                  </h2>
                </div>
                <p className="text-xs text-emerald-200 mt-1 max-w-2xl leading-relaxed">
                  Cryptographically structured audit trail capturing critical administrative actions: fee structure modifications, level transitions, enrollment status updates, manual attendance corrections, and result publishing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV Log</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 bg-emerald-800 hover:bg-emerald-700 text-yellow-300 rounded-xl cursor-pointer"
                  title="Print Compliance Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audit KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs pt-2">
              <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 text-center">
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Total Logs</span>
                <strong className="text-lg text-white font-mono">{auditStats.total || auditLogs.length}</strong>
              </div>
              <div className="bg-red-950/80 p-3 rounded-xl border border-red-700 text-center">
                <span className="text-[10px] text-red-300 block uppercase font-bold">Critical Events</span>
                <strong className="text-lg text-red-400 font-mono">{auditStats.critical}</strong>
              </div>
              <div className="bg-yellow-950/80 p-3 rounded-xl border border-yellow-600 text-center">
                <span className="text-[10px] text-yellow-300 block uppercase font-bold">Fee Changes</span>
                <strong className="text-lg text-yellow-400 font-mono">{auditStats.feeChanges}</strong>
              </div>
              <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 text-center">
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Attendance Fixes</span>
                <strong className="text-lg text-yellow-300 font-mono">{auditStats.attendanceCorrections}</strong>
              </div>
              <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 text-center">
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Enrollment Events</span>
                <strong className="text-lg text-emerald-300 font-mono">{auditStats.enrollmentUpdates}</strong>
              </div>
              <div className="bg-emerald-950/80 p-3 rounded-xl border border-emerald-700 text-center">
                <span className="text-[10px] text-emerald-300 block uppercase font-bold">Audit Service</span>
                <strong className="text-xs text-yellow-400 font-mono block mt-1">ENFORCED</strong>
              </div>
            </div>
          </div>

          {/* Audit Filter & Search */}
          <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleApplyAuditSearch} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search logs by action, administrator, roll number, or reason..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-900 text-yellow-300 text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-800"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2 text-xs w-full md:w-auto">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none"
              >
                <option value="All">All Actions</option>
                <option value="FEE_CONFIG_UPDATED">Fee Structure Changes</option>
                <option value="FEE_PAYMENT_RECORDED">Fee Payments</option>
                <option value="STUDENT_LEVEL_CHANGED">Level Transitions</option>
                <option value="APPLICATION_APPROVED">Admissions Approved</option>
                <option value="APPLICATION_REJECTED">Admissions Rejected</option>
                <option value="MANUAL_ATTENDANCE_CORRECTION">Attendance Corrections</option>
                <option value="EXAM_RESULT_PUBLISHED">Results Published</option>
              </select>

              <select
                value={auditSeverityFilter}
                onChange={(e) => setAuditSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none"
              >
                <option value="All">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-900 text-yellow-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Timestamp (PKT)</th>
                    <th className="p-3.5">Action Type</th>
                    <th className="p-3.5">Administrative Detail</th>
                    <th className="p-3.5">Authorized By</th>
                    <th className="p-3.5 text-center">Audit Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="p-3.5">{severityBadge(log.severity)}</td>
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp.replace('T', ' ').split('.')[0]}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-950">
                        {log.actionType}
                      </td>
                      <td className="p-3.5 text-slate-800 max-w-md leading-relaxed">
                        {log.details}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-bold text-slate-700">
                        {log.performedBy}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectLog(log)}
                          className="px-3 py-1 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-emerald-950 font-bold text-[11px] transition-colors cursor-pointer border border-yellow-300"
                        >
                          Diff / State
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOVE STUDENT LEVEL MODAL */}
      {selectedStudentForMove && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-yellow-400 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-4">
              <div>
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
                  Student Learning Level Progression
                </span>
                <h3 className="text-xl font-serif font-black text-emerald-950">
                  {selectedStudentForMove.fullName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Permanent Roll Number:{' '}
                  <strong className="text-emerald-900 bg-yellow-200 px-2 py-0.5 rounded">
                    {selectedStudentForMove.rollNumber}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForMove(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <strong>Institutional Policy Notice:</strong> When moving a student from Level Kids to Level One, or between any learning levels or tuition classes, the student's <strong>Permanent Roll Number ({selectedStudentForMove.rollNumber})</strong> will NOT change. Complete historical attendance, examination results, and 2026 fee records are preserved.
            </div>

            <form onSubmit={handleExecuteMoveLevel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Program
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedStudentForMove.admissionClass}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Select New Learning Level or Tuition Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-400 font-bold text-xs text-emerald-950 focus:border-yellow-400 outline-none bg-white"
                >
                  <optgroup label="11 Official Learning Levels">
                    {LEARNING_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tuition Classes (Prep to Class 10th)">
                    {TUITION_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Tuition: {cls}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Administrative Reason for Move
                </label>
                <textarea
                  rows={2}
                  required
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForMove(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMovingLevel}
                  className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isMovingLevel ? 'Processing Move...' : 'Confirm Level Move'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT LOG MODAL */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border-2 border-emerald-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-yellow-600 uppercase">
                  {inspectLog.id}
                </span>
                <h3 className="text-lg font-serif font-black text-emerald-950">
                  {inspectLog.actionType}
                </h3>
                <span className="text-xs font-mono text-slate-500">{inspectLog.timestamp}</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {inspectLog.details}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="font-bold text-slate-600 block">Previous State:</span>
                <pre className="p-3 rounded-xl bg-slate-100 text-[11px] overflow-x-auto max-h-40">
                  {inspectLog.previousState
                    ? JSON.stringify(inspectLog.previousState, null, 2)
                    : 'None (New Record)'}
                </pre>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-600 block">New State:</span>
                <pre className="p-3 rounded-xl bg-emerald-50 text-[11px] overflow-x-auto max-h-40 text-emerald-900 font-bold">
                  {inspectLog.newState
                    ? JSON.stringify(inspectLog.newState, null, 2)
                    : 'State Altered'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="px-5 py-2 bg-emerald-900 text-yellow-300 font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
