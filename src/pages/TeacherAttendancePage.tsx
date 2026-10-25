import React, { useState, useEffect } from 'react';
import {
  Clock,
  Printer,
  Sparkles,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  Search,
  LogIn,
  LogOut,
  UserCheck,
  History,
  Calendar,
  X,
  BookOpen,
} from 'lucide-react';
import { api } from '../utils/api';
import { Teacher, TeacherAttendanceRecord, AttendanceStatus } from '../types';

export const TeacherAttendancePage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [allMonthlyRecords, setAllMonthlyRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  // Time customizer state
  const [checkInTimeCustom, setCheckInTimeCustom] = useState('07:45 AM');
  const [checkOutTimeCustom, setCheckOutTimeCustom] = useState('02:00 PM');

  // Modal for teacher's monthly attendance history
  const [selectedTeacherForHistory, setSelectedTeacherForHistory] = useState<Teacher | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, dayAtt, allAtt] = await Promise.all([
        api.getTeachers(),
        api.getTeacherAttendance({ date: selectedDate }),
        api.getTeacherAttendance(),
      ]);
      setTeachers(tList);
      setAttendanceRecords(dayAtt);
      setAllMonthlyRecords(allAtt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleRecordAttendance = async (
    teacher: Teacher,
    status: AttendanceStatus,
    customCheckIn?: string,
    customCheckOut?: string
  ) => {
    try {
      await api.recordTeacherAttendance({
        teacherId: teacher.id,
        staffId: teacher.staffId,
        teacherName: teacher.fullName,
        department: teacher.department,
        date: selectedDate,
        checkInTime:
          status === 'Present' || status === 'Late'
            ? customCheckIn || checkInTimeCustom
            : 'N/A',
        checkOutTime: status === 'Present' ? customCheckOut || checkOutTimeCustom : undefined,
        status,
        markedBy: 'Principal / Admin (Authorized Entry)',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update teacher attendance.');
    }
  };

  const getAttendanceForTeacher = (teacherId: string) => {
    return attendanceRecords.find((a) => a.teacherId === teacherId);
  };

  const presentCount = attendanceRecords.filter((a) => a.status === 'Present').length;
  const lateCount = attendanceRecords.filter((a) => a.status === 'Late').length;
  const absentCount = attendanceRecords.filter(
    (a) => a.status === 'Absent' || a.status === 'Leave Approved'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Faculty & Staff Attendance System</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — TEACHER ATTENDANCE REGISTER
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Daily attendance, authorized check-in, check-out, and monthly history for institutional faculty members <strong>SIR ABBAS</strong> and <strong>SIR SHARIFULLAH</strong>.
        </p>
      </div>

      {/* Controls & Summary Bar */}
      <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">Date (PKT):</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">Check-in Time:</label>
            <input
              type="text"
              value={checkInTimeCustom}
              onChange={(e) => setCheckInTimeCustom(e.target.value)}
              className="border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs w-24 text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">Check-out Time:</label>
            <input
              type="text"
              value={checkOutTimeCustom}
              onChange={(e) => setCheckOutTimeCustom(e.target.value)}
              className="border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs w-24 text-center"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
              Present: {presentCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 font-bold border border-yellow-300">
              Late: {lateCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-900 font-bold border border-red-300">
              Absent: {absentCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-yellow-400" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* Official Faculty Cards (SIR ABBAS & SIR SHARIFULLAH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teachers.map((teacher) => {
          const att = getAttendanceForTeacher(teacher.id);
          const teacherHistory = allMonthlyRecords.filter((a) => a.teacherId === teacher.id);
          const totalPresent = teacherHistory.filter((a) => a.status === 'Present').length;
          const monthlyPct =
            teacherHistory.length > 0
              ? ((totalPresent / teacherHistory.length) * 100).toFixed(1)
              : '100.0';

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6 hover:border-yellow-400 transition-colors"
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-yellow-400 text-emerald-950 font-mono font-black text-xs">
                      {teacher.staffId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      {teacher.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-black text-emerald-950">
                    {teacher.fullName}
                  </h2>
                  <p className="text-xs font-bold text-emerald-800">{teacher.designation}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTeacherForHistory(teacher)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                >
                  <History className="w-3.5 h-3.5 text-yellow-600" />
                  <span>Monthly History</span>
                </button>
              </div>

              {/* Assigned Responsibilities */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Assigned Teaching Responsibilities
                </span>
                <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                  {teacher.subject}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {teacher.assignedSubjects?.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-[10px] font-bold text-emerald-900"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attendance Status For Selected Date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Attendance on {selectedDate}:</span>
                  {att ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        att.status === 'Present'
                          ? 'bg-emerald-600 text-white'
                          : att.status === 'Late'
                          ? 'bg-yellow-400 text-emerald-950'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{att.status}</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      Not Recorded Today
                    </span>
                  )}
                </div>

                {att && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Check-in:</span>
                      <strong className="text-emerald-900">{att.checkInTime || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Check-out:</span>
                      <strong className="text-emerald-900">{att.checkOutTime || 'In Session'}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons to Record Attendance */}
              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Mark Faculty Status ({selectedDate})
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecordAttendance(teacher, 'Present')}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordAttendance(teacher, 'Late')}
                    className="py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Late</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordAttendance(teacher, 'Leave Approved')}
                    className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <CalendarCheck className="w-3 h-3" />
                    <span>Leave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecordAttendance(teacher, 'Absent')}
                    className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly History Modal */}
      {selectedTeacherForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-emerald-300 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-4">
              <div>
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
                  Faculty Monthly Attendance History
                </span>
                <h3 className="text-2xl font-serif font-black text-emerald-950">
                  {selectedTeacherForHistory.fullName} ({selectedTeacherForHistory.staffId})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned: {selectedTeacherForHistory.subject}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeacherForHistory(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Records List */}
            {allMonthlyRecords.filter((a) => a.teacherId === selectedTeacherForHistory.id).length ===
            0 ? (
              <div className="py-12 text-center text-slate-400 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
                No attendance records have been registered for this faculty member yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-emerald-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-900 text-yellow-300 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Check-in</th>
                      <th className="p-3">Check-out</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 font-mono">
                    {allMonthlyRecords
                      .filter((a) => a.teacherId === selectedTeacherForHistory.id)
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-emerald-50/50">
                          <td className="p-3 font-bold text-emerald-950">{rec.date}</td>
                          <td className="p-3 text-slate-600">{rec.checkInTime || '-'}</td>
                          <td className="p-3 text-slate-600">{rec.checkOutTime || '-'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                rec.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'Late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px] font-sans">
                            {rec.markedBy}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTeacherForHistory(null)}
                className="px-6 py-2.5 rounded-xl bg-emerald-900 text-yellow-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
