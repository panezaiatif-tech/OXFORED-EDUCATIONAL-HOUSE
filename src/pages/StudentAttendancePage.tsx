import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Users,
  AlertCircle,
  UserCheck,
  UserX,
  Eye,
  Camera,
  Layers,
  Calendar,
  X,
  CreditCard,
  QrCode,
  Check,
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
import { StudentIdCard } from '../components/StudentIdCard';

interface StudentAttendancePageProps {
  initialStaffMode?: boolean;
}

export const StudentAttendancePage: React.FC<StudentAttendancePageProps> = () => {
  const [activeTab, setActiveTab] = useState<'daily-register' | 'public-lookup'>('daily-register');

  // Filters & State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Default times matching Teacher Attendance register
  const [checkInTimeCustom, setCheckInTimeCustom] = useState('08:00 AM');
  const [checkOutTimeCustom, setCheckOutTimeCustom] = useState('01:30 PM');

  // Data
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [allMonthlyRecords, setAllMonthlyRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modals
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);
  const [showQrScannerModal, setShowQrScannerModal] = useState<boolean>(false);

  // QR Scanner State
  const [manualQrToken, setManualQrToken] = useState('');
  const [scannerSelectedCourse, setScannerSelectedCourse] = useState('English Grammar');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    duplicate?: boolean;
    invalid?: boolean;
    message: string;
    student?: Student;
  } | null>(null);
  const [scanning, setScanning] = useState(false);

  // Public Lookup State
  const [lookupRoll, setLookupRoll] = useState('');
  const [lookupDate, setLookupDate] = useState(new Date().toISOString().split('T')[0]);
  const [lookupResult, setLookupResult] = useState<StudentAttendanceRecord | null>(null);
  const [lookupStudent, setLookupStudent] = useState<Student | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Load All Enrolled Students & Attendance Records
  const loadData = async () => {
    setLoading(true);
    setSaveSuccessMsg(null);
    try {
      const [allStudents, dayRecords, allAtt] = await Promise.all([
        api.getStudents({
          class: selectedClass !== 'All' ? selectedClass : undefined,
          section: selectedSection !== 'All' ? selectedSection : undefined,
          includeWithdrawn: false,
        }),
        api.getStudentAttendance({
          date: selectedDate,
          class: selectedClass !== 'All' ? selectedClass : undefined,
          section: selectedSection !== 'All' ? selectedSection : undefined,
        }),
        api.getStudentAttendance(),
      ]);

      // Sort strictly by permanent numeric roll number ascending (1, 2, 3...)
      const sorted = [...allStudents].sort((a, b) => {
        const numA = parseInt(a.rollNumber, 10);
        const numB = parseInt(b.rollNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.rollNumber.localeCompare(b.rollNumber);
      });

      setStudents(sorted);
      setAttendanceRecords(dayRecords);
      setAllMonthlyRecords(allAtt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedClass, selectedSection]);

  // Instant Single Student Attendance Update (Matches Teacher Attendance Page)
  const handleMarkAttendance = async (
    student: Student,
    status: AttendanceStatus,
    customTime?: string
  ) => {
    try {
      const timeStr = customTime || checkInTimeCustom;
      await api.markStudentAttendance([
        {
          studentId: student.id,
          date: selectedDate,
          course: student.admissionClass,
          status,
          remarks: `${status} recorded at ${timeStr} (PKT)`,
          markedBy: 'Faculty Officer (Daily Register)',
        },
      ]);

      // Refresh current day records smoothly
      const updatedDayRecords = await api.getStudentAttendance({
        date: selectedDate,
        class: selectedClass !== 'All' ? selectedClass : undefined,
        section: selectedSection !== 'All' ? selectedSection : undefined,
      });
      setAttendanceRecords(updatedDayRecords);

      setSaveSuccessMsg(`Attendance for ${student.fullName} (Roll #${student.rollNumber}) updated to "${status}".`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update student attendance.');
    }
  };

  // Bulk Actions
  const handleBulkMark = async (status: AttendanceStatus) => {
    if (students.length === 0) return;
    try {
      const recordsToSave = students.map((s) => ({
        studentId: s.id,
        date: selectedDate,
        course: s.admissionClass,
        status,
        remarks: `Bulk ${status} by Faculty Officer on ${selectedDate}`,
        markedBy: 'Faculty Officer (Daily Register)',
      }));

      await api.markStudentAttendance(recordsToSave);
      const updatedDayRecords = await api.getStudentAttendance({
        date: selectedDate,
        class: selectedClass !== 'All' ? selectedClass : undefined,
        section: selectedSection !== 'All' ? selectedSection : undefined,
      });
      setAttendanceRecords(updatedDayRecords);

      setSaveSuccessMsg(`All ${students.length} students marked as "${status}" for ${selectedDate}.`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to bulk mark attendance');
    }
  };

  // QR Attendance Scan Execution
  const handleExecuteScan = async (token: string) => {
    if (!token.trim()) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/students/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: token.trim(),
          course: scannerSelectedCourse,
          markedBy: 'Authorized QR Scanner Operator',
        }),
      });
      const data = await res.json();
      setScanResult(data);
      if (data.success) {
        await loadData();
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        invalid: true,
        message: err.message || 'QR Scan verification failed',
      });
    } finally {
      setScanning(false);
    }
  };

  // Public Roll Number Lookup
  const handlePublicLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRoll.trim()) return;

    setLookupLoading(true);
    setLookupSearched(true);
    setLookupResult(null);
    setLookupStudent(null);

    try {
      const st = await api.getStudentByRoll(lookupRoll.trim());
      setLookupStudent(st);

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

  // Filtered Students via Search
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.admissionClass.toLowerCase().includes(q) ||
      (s.secondClass && s.secondClass.toLowerCase().includes(q))
    );
  });

  // Helper: Find current day attendance record for student
  const getAttendanceForStudent = (studentId: string) => {
    return attendanceRecords.find((a) => a.studentId === studentId);
  };

  // Metrics
  const presentCount = attendanceRecords.filter((a) => a.status === 'Present').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'Late').length;
  const absentCount = attendanceRecords.filter((a) => a.status === 'Absent').length;
  const leaveCount = attendanceRecords.filter((a) => a.status === 'Leave Approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Institutional Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Student Attendance Roster & Smart Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              OXFORED EDUCATIONAL HOUSE — STUDENT DAILY ATTENDANCE REGISTER
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
              Every student enrolled through the admission portal is automatically active in this daily register. Permanent roll numbers, genuine uploaded photographs, and dual-class registrations are synchronized in real-time.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex items-center gap-1.5 bg-emerald-900/80 p-1.5 rounded-2xl border border-yellow-400/40 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('daily-register')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'daily-register'
                  ? 'bg-yellow-400 text-emerald-950 shadow-md font-black'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Daily Student Register</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('public-lookup')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'public-lookup'
                  ? 'bg-yellow-400 text-emerald-950 shadow-md font-black'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Roll Number Lookup</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== TAB 1: DAILY STUDENT REGISTER (Matches Teacher Register) ===================== */}
      {activeTab === 'daily-register' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Left Filters */}
              <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
                {/* Date Picker */}
                <div className="flex items-center gap-1.5">
                  <label className="font-bold text-slate-700">Date (PKT):</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none bg-white"
                  />
                </div>

                {/* Class / Offering Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="font-bold text-slate-700">Class / Program:</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="border-2 border-emerald-300 rounded-xl px-3 py-2 font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none bg-white text-xs"
                  >
                    <option value="All">All Classes & Dual Programs ({students.length})</option>
                    <optgroup label="11 Official Learning Levels">
                      {LEARNING_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tuition Classes (Nursery to 10th)">
                      {TUITION_CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          Tuition: {cls}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Section Filter */}
                <div className="flex items-center gap-1.5">
                  <label className="font-bold text-slate-700">Section:</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-800 outline-none bg-white text-xs"
                  >
                    <option value="All">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                {/* Time Setting */}
                <div className="flex items-center gap-1.5">
                  <label className="font-bold text-slate-700">Check-in Time:</label>
                  <input
                    type="text"
                    value={checkInTimeCustom}
                    onChange={(e) => setCheckInTimeCustom(e.target.value)}
                    className="border border-slate-300 rounded-xl px-2 py-1.5 font-mono text-xs w-20 text-center"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQrScannerModal(true)}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer transition-all border border-yellow-300"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkMark('Present')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>All Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkMark('Absent')}
                  className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <UserX className="w-3.5 h-3.5 text-red-700" />
                  <span>All Absent</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </div>

            {/* Metrics & Search Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, roll number, or father..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-800 outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Status Counters */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 font-bold border border-emerald-300">
                  Total Enrolled: {students.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-400">
                  Present: {presentCount}
                </span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 font-bold border border-yellow-300">
                  Late: {lateCount}
                </span>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-900 font-bold border border-red-300">
                  Absent: {absentCount}
                </span>
                {leaveCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-300">
                    Leave: {leaveCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toast Notice */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Student Cards Grid (Matches Teacher Attendance Page Layout) */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-medium">Loading enrolled students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-emerald-200 px-6 space-y-3">
              <Users className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-emerald-950">No Enrolled Students In This Section</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {EMPTY_STUDENT_MESSAGE}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStudents.map((student) => {
                const att = getAttendanceForStudent(student.id);
                const currentStatus = att?.status;
                const studentHistory = allMonthlyRecords.filter((a) => a.studentId === student.id);
                const totalPresent = studentHistory.filter((a) => a.status === 'Present').length;
                const monthlyPct =
                  studentHistory.length > 0
                    ? ((totalPresent / studentHistory.length) * 100).toFixed(1)
                    : '100.0';

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-3xl border-2 border-emerald-100 p-6 shadow-sm space-y-5 hover:border-yellow-400 transition-all flex flex-col justify-between"
                  >
                    {/* Student Info Bar */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-100">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={student.photoUrl}
                          alt={student.fullName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-300 shadow-sm shrink-0 bg-emerald-50"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-yellow-400 text-emerald-950 font-mono font-black text-xs shadow-2xs">
                              Roll #{student.rollNumber}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Sec {student.section}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black font-serif text-emerald-950 leading-tight">
                            {student.fullName}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            Father: <strong className="text-emerald-950">{student.fatherName}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Current Status Badge */}
                      <div className="text-right shrink-0">
                        {currentStatus ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-xs ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : currentStatus === 'Late'
                                ? 'bg-yellow-400 text-emerald-950'
                                : currentStatus === 'Absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{currentStatus}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                            Not Marked Yet
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                          {att?.scanTime || (currentStatus ? 'Recorded' : 'Pending')}
                        </span>
                      </div>
                    </div>

                    {/* Enrolled Courses / Double Class Badges */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>Enrolled Courses</span>
                        <span>Monthly Attendance: <strong className="text-emerald-950 font-mono font-bold">{monthlyPct}%</strong></span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-900 text-yellow-300 font-bold text-xs">
                          {student.admissionClass}
                        </span>
                        {student.secondClass && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950 font-black text-xs flex items-center gap-1 shadow-2xs">
                            <Layers className="w-3 h-3" />
                            <span>Double Class: {student.secondClass}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Instant Status Action Buttons (Matches Teacher Attendance Page) */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                        Record Attendance for {selectedDate}:
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(student, 'Present')}
                          className={`py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-md scale-105'
                              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(student, 'Late')}
                          className={`py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            currentStatus === 'Late'
                              ? 'bg-yellow-400 text-emerald-950 shadow-md scale-105'
                              : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(student, 'Absent')}
                          className={`py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            currentStatus === 'Absent'
                              ? 'bg-red-600 text-white shadow-md scale-105'
                              : 'bg-red-100 text-red-900 hover:bg-red-200'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5 shrink-0" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(student, 'Leave Approved')}
                          className={`py-2 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            currentStatus === 'Leave Approved'
                              ? 'bg-blue-600 text-white shadow-md scale-105'
                              : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                          }`}
                        >
                          <span>Leave</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer Utility Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForHistory(student)}
                        className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Monthly Sheet ({studentHistory.length} Days)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStudentForIdCard(student)}
                        className="font-bold text-yellow-700 hover:text-yellow-900 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View ID Card</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: PUBLIC ROLL NUMBER LOOKUP ===================== */}
      {activeTab === 'public-lookup' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-serif font-black text-emerald-950">
              Student Attendance Verification Lookup
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Parents and guardians can enter the student's assigned permanent roll number to verify their daily attendance record and check-in time.
            </p>
          </div>

          <form onSubmit={handlePublicLookup} className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Permanent Roll Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1, 2, 3..."
                value={lookupRoll}
                onChange={(e) => setLookupRoll(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-emerald-950 focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Date (PKT)
              </label>
              <input
                type="date"
                value={lookupDate}
                onChange={(e) => setLookupDate(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={lookupLoading}
              className="px-6 py-2.5 rounded-xl bg-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-xs cursor-pointer"
            >
              {lookupLoading ? 'Checking...' : 'Check Attendance'}
            </button>
          </form>

          {lookupSearched && (
            <div className="pt-4 border-t border-slate-100 max-w-xl">
              {lookupStudent ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={lookupStudent.photoUrl}
                        alt={lookupStudent.fullName}
                        className="w-14 h-14 rounded-xl object-cover border border-emerald-400 shrink-0"
                      />
                      <div>
                        <h4 className="font-serif font-black text-emerald-950 text-base">
                          {lookupStudent.fullName}
                        </h4>
                        <p className="text-xs text-slate-600">
                          Roll #{lookupStudent.rollNumber} • {lookupStudent.admissionClass}
                          {lookupStudent.secondClass && ` + ${lookupStudent.secondClass}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Status on {lookupDate}:</span>
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
                <div className="p-4 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs font-bold">
                  No enrolled student found with permanent roll number "{lookupRoll}".
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== MODAL 1: SMART QR ATTENDANCE SCANNER ===================== */}
      {showQrScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-yellow-400">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-emerald-950">
                    Smart QR Attendance Scanner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scan student ID card QR token for instant session attendance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQrScannerModal(false);
                  setScanResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Course Session Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Attendance Session / Course
              </label>
              <select
                value={scannerSelectedCourse}
                onChange={(e) => setScannerSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-emerald-950 outline-none"
              >
                <optgroup label="11 Learning Levels">
                  {LEARNING_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tuition Classes">
                  {TUITION_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Tuition: {cls}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* QR Token Input / Simulated Camera Scan */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Present Student ID Card or Input QR Token:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualQrToken}
                  onChange={(e) => setManualQrToken(e.target.value)}
                  placeholder="e.g. OX-QR-stu_... or scan with card reader"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-emerald-300 font-mono text-xs outline-none focus:border-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => handleExecuteScan(manualQrToken)}
                  disabled={scanning || !manualQrToken.trim()}
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {scanning ? 'Verifying...' : 'Record'}
                </button>
              </div>

              {/* Quick Preset Buttons for enrolled students */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Quick Scan Enrolled Student Card:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {students.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setManualQrToken(st.qrCodeToken);
                        handleExecuteScan(st.qrCodeToken);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Roll #{st.rollNumber} - {st.fullName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scan Feedback Result Banner */}
            {scanResult && (
              <div
                className={`p-4 rounded-2xl border-2 space-y-2 animate-in fade-in ${
                  scanResult.success
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : scanResult.duplicate
                    ? 'bg-amber-50 border-amber-400 text-amber-950'
                    : 'bg-red-50 border-red-500 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm uppercase">
                  {scanResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span>
                    {scanResult.success
                      ? 'ATTENDANCE MARKED SUCCESSFULLY'
                      : scanResult.duplicate
                      ? 'DUPLICATE SCAN DETECTED'
                      : 'INVALID ID CARD — ATTENDANCE NOT RECORDED'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{scanResult.message}</p>
                {scanResult.student && (
                  <div className="flex items-center gap-3 pt-2 border-t border-emerald-200">
                    <img
                      src={scanResult.student.photoUrl}
                      alt={scanResult.student.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                    />
                    <div className="text-xs">
                      <strong>{scanResult.student.fullName}</strong> • Roll #{scanResult.student.rollNumber}
                      <span className="block text-[11px] text-slate-600">
                        Class: {scanResult.student.admissionClass}
                        {scanResult.student.secondClass && ` + ${scanResult.student.secondClass}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: MONTHLY ATTENDANCE HISTORY ===================== */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-emerald-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStudentForHistory.photoUrl}
                  alt={selectedStudentForHistory.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs"
                />
                <div>
                  <h3 className="font-serif font-black text-lg text-emerald-950">
                    {selectedStudentForHistory.fullName} — Monthly Attendance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Permanent Roll #{selectedStudentForHistory.rollNumber} • {selectedStudentForHistory.admissionClass}
                    {selectedStudentForHistory.secondClass && ` (Double Class: ${selectedStudentForHistory.secondClass})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForHistory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance Record Summary */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Present</span>
                <strong className="text-emerald-900 font-mono text-base">
                  {allMonthlyRecords.filter(a => a.studentId === selectedStudentForHistory.id && a.status === 'Present').length}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Late</span>
                <strong className="text-yellow-900 font-mono text-base">
                  {allMonthlyRecords.filter(a => a.studentId === selectedStudentForHistory.id && a.status === 'Late').length}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Absent</span>
                <strong className="text-red-900 font-mono text-base">
                  {allMonthlyRecords.filter(a => a.studentId === selectedStudentForHistory.id && a.status === 'Absent').length}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Rate</span>
                <strong className="text-blue-900 font-mono text-base">
                  {(() => {
                    const list = allMonthlyRecords.filter(a => a.studentId === selectedStudentForHistory.id);
                    const p = list.filter(a => a.status === 'Present').length;
                    return list.length > 0 ? `${((p / list.length) * 100).toFixed(1)}%` : '100%';
                  })()}
                </strong>
              </div>
            </div>

            {/* Daily History Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Session Log Records:
              </span>
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Course / Session</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Remarks / Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allMonthlyRecords
                      .filter(a => a.studentId === selectedStudentForHistory.id)
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono">{rec.date}</td>
                          <td className="p-2.5 font-bold">{rec.course || rec.class}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-900'
                                : rec.status === 'Late'
                                ? 'bg-yellow-100 text-yellow-900'
                                : rec.status === 'Absent'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{rec.remarks || rec.scanTime || 'N/A'}</td>
                        </tr>
                      ))}
                    {allMonthlyRecords.filter(a => a.studentId === selectedStudentForHistory.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          No previous attendance entries logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-yellow-400" />
                <span>Print Student Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: STUDENT ID CARD PREVIEW ===================== */}
      {selectedStudentForIdCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-yellow-400 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-emerald-950">
                    Official Student Identity Card Generator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Preview & Print Front and Back of ID Card for {selectedStudentForIdCard.fullName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForIdCard(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <StudentIdCard student={selectedStudentForIdCard} />
          </div>
        </div>
      )}
    </div>
  );
};
