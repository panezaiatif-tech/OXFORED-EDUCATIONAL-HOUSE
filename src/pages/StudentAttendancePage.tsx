import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Users,
  AlertCircle,
  Save,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Shield,
  Eye,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  Student,
  StudentAttendanceRecord,
  AttendanceStatus,
  LEARNING_LEVELS,
  TUITION_CLASSES,
  EMPTY_STUDENT_MESSAGE,
} from '../types';

interface StudentAttendancePageProps {
  initialStaffMode?: boolean;
}

export const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({
  initialStaffMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'public-lookup' | 'staff-register'>(
    initialStaffMode ? 'staff-register' : 'public-lookup'
  );

  // Staff Authentication State
  const [staffAuthorized, setStaffAuthorized] = useState(initialStaffMode);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Register Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<'levels' | 'tuition'>('levels');
  const [selectedProgram, setSelectedProgram] = useState<string>('Level Kids');
  const [selectedSection, setSelectedSection] = useState<string>('A');

  // Enrolled real students in this selected program
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string; isSavedInDb: boolean }>
  >({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Public Lookup Form
  const [lookupRoll, setLookupRoll] = useState('');
  const [lookupDate, setLookupDate] = useState(new Date().toISOString().split('T')[0]);
  const [lookupResult, setLookupResult] = useState<StudentAttendanceRecord | null>(null);
  const [lookupStudent, setLookupStudent] = useState<Student | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Load Real Enrolled Students for Staff Register
  const loadRegisterStudents = async () => {
    setLoading(true);
    setSaveSuccessMsg(null);
    try {
      const [allStudents, dayRecords] = await Promise.all([
        api.getStudents({
          admissionClass: selectedProgram,
          section: selectedSection,
        }),
        api.getStudentAttendance({
          date: selectedDate,
          class: selectedProgram,
          section: selectedSection,
        }),
      ]);

      // Sort strictly by permanent numeric roll number ascending (1, 2, 3...)
      const sorted = [...allStudents].sort((a, b) => {
        const numA = parseInt(a.rollNumber, 10);
        const numB = parseInt(b.rollNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.rollNumber.localeCompare(b.rollNumber);
      });

      setStudents(sorted);

      const map: Record<string, { status: AttendanceStatus; remarks: string; isSavedInDb: boolean }> =
        {};
      sorted.forEach((st) => {
        const existing = dayRecords.find((r) => r.studentId === st.id);
        if (existing) {
          map[st.id] = {
            status: existing.status,
            remarks: existing.remarks || '',
            isSavedInDb: true,
          };
        } else {
          map[st.id] = {
            status: 'Present',
            remarks: '',
            isSavedInDb: false,
          };
        }
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffAuthorized && activeTab === 'staff-register') {
      loadRegisterStudents();
    }
  }, [selectedDate, selectedProgram, selectedSection, staffAuthorized, activeTab]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        isSavedInDb: false,
      },
    }));
  };

  const handleBulkMark = (status: AttendanceStatus) => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = {
          ...updated[s.id],
          status,
          isSavedInDb: false,
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const recordsToSave = students.map((s) => ({
        studentId: s.id,
        date: selectedDate,
        status: attendanceMap[s.id]?.status || 'Present',
        remarks: attendanceMap[s.id]?.remarks || '',
        markedBy: 'Faculty Officer (Authorized)',
      }));

      await api.markStudentAttendance(recordsToSave);

      // Mark all as saved in DB
      setAttendanceMap((prev) => {
        const next = { ...prev };
        students.forEach((s) => {
          if (next[s.id]) next[s.id].isSavedInDb = true;
        });
        return next;
      });

      setSaveSuccessMsg(
        `Daily attendance successfully saved to database for ${selectedProgram} (Section ${selectedSection}) on ${selectedDate}. Recorded with permanent roll numbers and logged in AuditLogManager.`
      );
      setTimeout(() => setSaveSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance records');
    } finally {
      setSaving(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123' || pinInput === 'staff123' || pinInput === 'atif123') {
      setStaffAuthorized(true);
      setPinError(null);
    } else {
      setPinError('Invalid Staff PIN. Please enter authorized staff credentials.');
    }
  };

  const handlePublicLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRoll.trim()) return;

    setLookupLoading(true);
    setLookupSearched(true);
    setLookupResult(null);
    setLookupStudent(null);

    try {
      // 1. Get real student by roll number
      const st = await api.getStudentByRoll(lookupRoll.trim());
      setLookupStudent(st);

      // 2. Lookup attendance for this student and date
      const records = await api.getStudentAttendance({
        date: lookupDate,
        studentId: st.id,
      });

      if (records.length > 0) {
        setLookupResult(records[0]);
      }
    } catch (err) {
      setLookupStudent(null);
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div>
          <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
            Official Academic Registers • Roll-Number-Wise Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-emerald-950">
            Student Daily Attendance System
          </h1>
        </div>

        {/* Tab Switcher */}
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
            <span>Public Attendance Lookup</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('staff-register')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'staff-register'
                ? 'bg-emerald-900 text-yellow-400 shadow-md font-black'
                : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-yellow-500" />
            <span>Protected Staff Register</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: PUBLIC ATTENDANCE LOOKUP ==================== */}
      {activeTab === 'public-lookup' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-serif font-black text-emerald-950">
              Student Attendance Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Parents and students can verify daily attendance status by entering the student's permanent numeric roll number and date. In accordance with school policy, confidential records are restricted to authorized staff.
            </p>
          </div>

          <form
            onSubmit={handlePublicLookup}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Permanent Numeric Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1, 2, 3..."
                value={lookupRoll}
                onChange={(e) => setLookupRoll(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-emerald-950 focus:border-emerald-600 outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attendance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={lookupDate}
                onChange={(e) => setLookupDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-600 outline-none bg-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-yellow-400 text-emerald-950 text-xs font-black uppercase tracking-wider hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Search className="w-4 h-4 text-emerald-950" />
                <span>{lookupLoading ? 'Checking...' : 'Check Attendance'}</span>
              </button>
            </div>
          </form>

          {/* Lookup Result Card */}
          {lookupSearched && !lookupLoading && (
            <div className="pt-4">
              {lookupStudent ? (
                <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-300 p-6 space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={lookupStudent.photoUrl}
                        alt={lookupStudent.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          Verified Enrolled Student
                        </span>
                        <h3 className="text-lg font-serif font-black text-emerald-950">
                          {lookupStudent.fullName}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Permanent Roll No:{' '}
                          <span className="font-mono font-black text-emerald-900 bg-yellow-200 px-2 py-0.5 rounded">
                            {lookupStudent.rollNumber}
                          </span>{' '}
                          • Level / Class: <strong>{lookupStudent.admissionClass}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 block">Date</span>
                      <span className="text-sm font-mono font-bold text-emerald-950">{lookupDate}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Daily Attendance Status:</span>
                    {lookupResult ? (
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          lookupResult.status === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : lookupResult.status === 'Absent'
                            ? 'bg-red-600 text-white'
                            : lookupResult.status === 'Late'
                            ? 'bg-yellow-400 text-emerald-950 font-black'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lookupResult.status}</span>
                      </span>
                    ) : (
                      <span className="px-3.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                        Not Marked For This Date
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-red-50 rounded-2xl border border-red-200 text-red-900 text-xs font-bold">
                  No student found with Permanent Roll Number "{lookupRoll}". Please check the number or verify with the admissions office.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: PROTECTED STAFF REGISTER ==================== */}
      {activeTab === 'staff-register' && (
        <>
          {!staffAuthorized ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-8 sm:p-12 shadow-sm max-w-md mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>

              <div>
                <h2 className="text-xl font-serif font-black text-emerald-950">
                  Authorized Faculty Register Access
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Full student attendance management and bulk marking are restricted to authorized school staff.
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
                  placeholder="Enter Staff Access PIN (e.g. admin123)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-sm font-mono tracking-widest focus:border-emerald-600 outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors cursor-pointer"
                >
                  Authenticate Staff Access
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Register Controls Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('levels');
                        setSelectedProgram(LEARNING_LEVELS[0]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === 'levels'
                          ? 'bg-emerald-900 text-yellow-400 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      11 Learning Levels
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('tuition');
                        setSelectedProgram(TUITION_CLASSES[0]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === 'tuition'
                          ? 'bg-emerald-900 text-yellow-400 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tuition Classes (Prep-10th)
                    </button>
                  </div>

                  {/* Program Selector */}
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="px-4 py-2 rounded-xl border-2 border-emerald-300 text-xs font-bold text-emerald-950 outline-none bg-white"
                  >
                    {selectedCategory === 'levels'
                      ? LEARNING_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))
                      : TUITION_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            Tuition: {cls}
                          </option>
                        ))}
                  </select>

                  {/* Section */}
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 outline-none bg-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>

                  {/* Date */}
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 outline-none"
                  />
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkMark('Present')}
                    className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkMark('Absent')}
                    className="px-3 py-2 rounded-xl bg-red-100 text-red-900 text-xs font-bold hover:bg-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5 text-red-700" />
                    <span>All Absent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffAuthorized(false)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-slate-500 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Lock Register
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Attendance Table */}
              {loading ? (
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
                        <th className="p-3.5">Photograph</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Level / Class</th>
                        <th className="p-3.5 text-center">Attendance Status</th>
                        <th className="p-3.5">Remarks / Reason</th>
                        <th className="p-3.5 text-center">Save Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 font-medium">
                      {students.map((st) => {
                        const att = attendanceMap[st.id] || {
                          status: 'Present',
                          remarks: '',
                          isSavedInDb: false,
                        };
                        return (
                          <tr key={st.id} className="hover:bg-emerald-50/50 transition-colors">
                            {/* Permanent Roll Number */}
                            <td className="p-3.5 font-mono font-black text-emerald-900 text-base">
                              {st.rollNumber}
                            </td>

                            {/* Photograph */}
                            <td className="p-3.5">
                              <img
                                src={st.photoUrl}
                                alt={st.fullName}
                                className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-xs"
                              />
                            </td>

                            {/* Student Name */}
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 block">{st.fullName}</span>
                              <span className="text-[10px] text-slate-500">Father: {st.fatherName}</span>
                            </td>

                            {/* Level / Class */}
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-yellow-100 text-emerald-950 font-bold text-[11px] border border-yellow-300">
                                {st.admissionClass}
                              </span>
                            </td>

                            {/* Attendance Status Buttons */}
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {(
                                  [
                                    'Present',
                                    'Absent',
                                    'Late',
                                    'Leave Approved',
                                  ] as AttendanceStatus[]
                                ).map((stKey) => {
                                  const isSelected = att.status === stKey;
                                  return (
                                    <button
                                      key={stKey}
                                      type="button"
                                      onClick={() => handleStatusChange(st.id, stKey)}
                                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        isSelected
                                          ? stKey === 'Present'
                                            ? 'bg-emerald-600 text-white shadow-sm font-black scale-105'
                                            : stKey === 'Absent'
                                            ? 'bg-red-600 text-white shadow-sm font-black scale-105'
                                            : stKey === 'Late'
                                            ? 'bg-yellow-400 text-emerald-950 shadow-sm font-black scale-105'
                                            : 'bg-blue-600 text-white shadow-sm font-black scale-105'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      {stKey === 'Leave Approved' ? 'Leave' : stKey}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Remarks */}
                            <td className="p-3.5">
                              <input
                                type="text"
                                placeholder="Optional note..."
                                value={att.remarks}
                                onChange={(e) =>
                                  setAttendanceMap((prev) => ({
                                    ...prev,
                                    [st.id]: {
                                      ...prev[st.id],
                                      remarks: e.target.value,
                                      isSavedInDb: false,
                                    },
                                  }))
                                }
                                className="w-full px-2 py-1 rounded border border-slate-200 text-xs outline-none focus:border-emerald-500 bg-white"
                              />
                            </td>

                            {/* Save Status */}
                            <td className="p-3.5 text-center">
                              {att.isSavedInDb ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Saved in DB</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-600">
                                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                                  <span>Unsaved changes</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Action Bar */}
              {students.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-100">
                  <span className="text-xs text-slate-500 font-mono">
                    Session 2026-2027 • Total Registered in Level: <strong>{students.length}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={saving}
                    className="px-8 py-3 rounded-xl bg-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider hover:bg-yellow-500 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-emerald-950" />
                    <span>{saving ? 'Saving to Database...' : 'Save Attendance to Database'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
