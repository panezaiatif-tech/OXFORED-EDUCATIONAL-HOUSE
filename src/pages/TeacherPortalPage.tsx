import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Clock,
  CalendarCheck,
  Award,
  BookOpen,
  Printer,
  CheckCircle,
  LogIn,
  LogOut,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { api } from '../utils/api';
import { Teacher, TeacherAttendanceRecord, TimetableItem } from '../types';

interface TeacherPortalPageProps {
  onNavigateToStudentAttendance?: () => void;
  onNavigateToExamManagement?: () => void;
}

export const TeacherPortalPage: React.FC<TeacherPortalPageProps> = ({
  onNavigateToStudentAttendance,
  onNavigateToExamManagement,
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('OX-TCH-001');
  const [attendanceHistory, setAttendanceHistory] = useState<TeacherAttendanceRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const list = await api.getTeachers();
        setTeachers(list);
        if (list.length > 0) {
          const target = list.find((t) => t.staffId === selectedStaffId) || list[0];
          setActiveTeacher(target);
          setSelectedStaffId(target.staffId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, []);

  // When activeTeacher changes, load their records
  useEffect(() => {
    if (!activeTeacher) return;
    const fetchTeacherData = async () => {
      try {
        const [att, sched] = await Promise.all([
          api.getTeacherAttendance({ teacherId: activeTeacher.id }),
          api.getTimetable(),
        ]);
        setAttendanceHistory(att);
        setTimetable(sched.filter((s) => s.teacherName.toLowerCase().includes(activeTeacher.fullName.toLowerCase()) || s.teacherName.includes(activeTeacher.subject)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeacherData();
  }, [activeTeacher]);

  const handleSelectTeacher = (teacher: Teacher) => {
    setActiveTeacher(teacher);
    setSelectedStaffId(teacher.staffId);
  };

  const handleCheckIn = async () => {
    if (!activeTeacher) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await api.recordTeacherAttendance({
        teacherId: activeTeacher.id,
        staffId: activeTeacher.staffId,
        teacherName: activeTeacher.fullName,
        department: activeTeacher.department,
        date: now.toISOString().split('T')[0],
        checkInTime: timeStr,
        status: 'Present',
        recordedBy: `${activeTeacher.fullName} (Self Check-in)`,
      });
      alert(`Check-in recorded at ${timeStr} (Pakistan Standard Time)`);
      const updated = await api.getTeacherAttendance({ teacherId: activeTeacher.id });
      setAttendanceHistory(updated);
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    if (!activeTeacher) return;
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await api.recordTeacherAttendance({
        teacherId: activeTeacher.id,
        staffId: activeTeacher.staffId,
        teacherName: activeTeacher.fullName,
        department: activeTeacher.department,
        date: now.toISOString().split('T')[0],
        checkOutTime: timeStr,
        status: 'Present',
        recordedBy: `${activeTeacher.fullName} (Self Check-out)`,
      });
      alert(`Check-out recorded at ${timeStr} (Pakistan Standard Time)`);
      const updated = await api.getTeacherAttendance({ teacherId: activeTeacher.id });
      setAttendanceHistory(updated);
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    }
  };

  // Metrics
  const totalDays = attendanceHistory.length || 24;
  const presentDays = attendanceHistory.filter((a) => a.status === 'Present').length || 22;
  const lateDays = attendanceHistory.filter((a) => a.status === 'Late').length || 1;
  const absentDays = attendanceHistory.filter((a) => a.status === 'Absent' || a.status === 'Leave Approved').length || 1;
  const attPct = (((presentDays + lateDays * 0.5) / (totalDays || 1)) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Teacher Account Bar in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Teacher & Faculty Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-white">
              {activeTeacher?.fullName || 'Teacher Workspace'}
            </h1>
            <p className="text-xs text-emerald-200">
              {activeTeacher?.designation} • Department of {activeTeacher?.department}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium pt-1">
              <span className="font-mono bg-emerald-900 px-2.5 py-1 rounded-md border border-yellow-400/50 text-yellow-300 font-bold">
                Staff ID: {activeTeacher?.staffId}
              </span>
              <span>Subject: {activeTeacher?.subject}</span>
              <span>{activeTeacher?.qualification}</span>
            </div>
          </div>

          {/* Persona Switcher for demonstration */}
          <div className="bg-emerald-900/80 p-3 rounded-2xl border border-yellow-400/40 text-xs space-y-2 self-stretch md:self-auto">
            <span className="text-yellow-300 font-bold block uppercase text-[10px]">
              Switch Authorized Teacher:
            </span>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                const found = teachers.find((t) => t.staffId === e.target.value);
                if (found) handleSelectTeacher(found);
              }}
              className="w-full bg-emerald-950 text-yellow-300 font-bold text-xs p-2 rounded-xl border border-emerald-700 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.staffId} value={t.staffId}>
                  {t.fullName} ({t.staffId} - {t.subject})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance & Duty Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Check-in / Check-out Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4 hover:border-yellow-400 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Daily Check-in & Check-out
            </h3>
            <span className="text-[10px] text-emerald-800 font-mono font-bold">
              {new Date().toISOString().split('T')[0]} (PKT)
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <span className="text-3xl font-black font-mono text-emerald-950">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <p className="text-[11px] text-slate-500">Official Campus Time • Brewery Road Quetta</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCheckIn}
              className="py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-yellow-400/50"
            >
              <LogIn className="w-4 h-4 text-yellow-400" />
              <span>Check-in</span>
            </button>
            <button
              onClick={handleCheckOut}
              className="py-2.5 px-3 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-yellow-300"
            >
              <LogOut className="w-4 h-4 text-emerald-950" />
              <span>Check-out</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Automatic recording of date, arrival time, and staff identification in database.
          </p>
        </div>

        {/* Quick Academic Actions */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4 hover:border-yellow-400 transition-colors">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-200">
            <Award className="w-4 h-4 text-yellow-500" />
            Classroom & Academic Tools
          </h3>

          <div className="space-y-3">
            {onNavigateToStudentAttendance && (
              <button
                onClick={onNavigateToStudentAttendance}
                className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-emerald-950 block">Mark Student Daily Attendance</strong>
                  <span className="text-[11px] text-slate-500">Class 9 & 10 registers in PKT</span>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-900" />
              </button>
            )}

            {onNavigateToExamManagement && (
              <button
                onClick={onNavigateToExamManagement}
                className="w-full p-3 rounded-2xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-emerald-950 block">Enter Examination Marks</strong>
                  <span className="text-[11px] text-slate-500">Midterm, Periodic & Board test grading</span>
                </div>
                <ChevronRight className="w-4 h-4 text-yellow-700" />
              </button>
            )}
          </div>
        </div>

        {/* Monthly Attendance Stats */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4 hover:border-yellow-400 transition-colors">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-200">
            <CalendarCheck className="w-4 h-4 text-yellow-500" />
            Teacher Attendance Summary
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Working Days</span>
              <strong className="text-slate-900 text-base font-mono">{totalDays}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 block text-[10px] uppercase font-bold">Days Present</span>
              <strong className="text-emerald-800 text-base font-mono">{presentDays}</strong>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <span className="text-yellow-800 block text-[10px] uppercase font-bold">Late Arrivals</span>
              <strong className="text-yellow-800 text-base font-mono">{lateDays}</strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 block text-[10px] uppercase font-bold">Attendance %</span>
              <strong className="text-emerald-950 text-base font-mono font-bold">{attPct}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Assigned Timetable & Attendance Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Timetable for Teacher */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4 hover:border-yellow-400 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-yellow-500" />
              Assigned Weekly Classes & Labs
            </h3>
            <span className="text-xs text-slate-500 font-medium">{timetable.length} Slots</span>
          </div>

          <div className="space-y-2.5">
            {timetable.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between hover:bg-yellow-50/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{item.subject}</strong>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-semibold text-[10px] border border-emerald-200">
                      {item.class}–{item.section}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] block">{item.day} • {item.room}</span>
                </div>
                <div className="text-right font-mono font-bold text-yellow-800 text-xs">
                  {item.startTime} – {item.endTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Daily Attendance History */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-4 hover:border-yellow-400 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-yellow-500" />
              Personal Attendance Log
            </h3>
            <button
              onClick={() => window.print()}
              className="text-xs text-emerald-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-emerald-200">
                <tr>
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-center">In Time</th>
                  <th className="py-2.5 px-3 text-center">Out Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendanceHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-yellow-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-800">{rec.date}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">{rec.checkInTime || '—'}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">{rec.checkOutTime || '—'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : rec.status === 'Late'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
