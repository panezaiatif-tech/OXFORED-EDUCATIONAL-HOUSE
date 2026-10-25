import React, { useState, useEffect } from 'react';
import {
  Clock,
  Printer,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  X,
} from 'lucide-react';
import { api } from '../utils/api';
import { TimetableItem, Teacher } from '../types';

export const TimetablePage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('Class 9');
  const [timetables, setTimetables] = useState<TimetableItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form
  const [slotDay, setSlotDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [slotSubject, setSlotSubject] = useState('Physics (Theory & Practical)');
  const [slotTeacher, setSlotTeacher] = useState('SIR ABBAS');
  const [slotStart, setSlotStart] = useState('08:00 AM');
  const [slotEnd, setSlotEnd] = useState('08:45 AM');
  const [slotRoom, setSlotRoom] = useState('Science Lab 1');

  const classes = [
    'Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3',
    'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10'
  ];

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const loadData = async () => {
    try {
      const [table, tList] = await Promise.all([
        api.getTimetable(selectedClass),
        api.getTeachers(),
      ]);
      setTimetables(table);
      setTeachers(tList);
      if (tList.length > 0 && !slotTeacher) {
        setSlotTeacher(tList[0].fullName);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveTimetableItem({
        class: selectedClass,
        section: 'A',
        day: slotDay,
        subject: slotSubject,
        teacherName: slotTeacher,
        startTime: slotStart,
        endTime: slotEnd,
        room: slotRoom,
      });
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      alert('Failed to save lecture slot');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Remove this lecture slot from the timetable?')) return;
    try {
      await api.deleteTimetableItem(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Academic Schedules & Laboratory Sessions</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — CLASS TIMETABLES
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Class-wise master schedules covering Science, Computer labs, Languages, and Mathematics. Coordinated with faculty teaching assignments on Brewery Road Quetta.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          <label className="font-bold text-slate-700">Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-emerald-950 text-xs focus:ring-2 focus:ring-emerald-800"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls} (Section A & B)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-yellow-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture Slot</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 cursor-pointer"
            title="Print Class Timetable"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day-by-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const daySlots = timetables.filter((t) => t.day === day);
          return (
            <div
              key={day}
              className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm overflow-hidden flex flex-col hover:border-yellow-400 transition-colors"
            >
              <div className="bg-emerald-950 text-yellow-300 px-4 py-3 font-bold font-serif text-sm flex items-center justify-between border-b-2 border-yellow-400">
                <span>{day}</span>
                <span className="text-xs text-emerald-200 font-sans font-normal">
                  {daySlots.length} Lectures
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    No scheduled periods on {day}.
                  </p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-slate-50 hover:bg-yellow-50/50 rounded-xl border border-slate-200 text-xs space-y-1 relative group transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{slot.subject}</strong>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          {slot.room}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{slot.teacherName}</p>
                      <div className="flex items-center justify-between text-[10px] text-yellow-800 font-mono font-bold pt-1 border-t border-slate-200/60">
                        <span>{slot.startTime} – {slot.endTime}</span>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity p-0.5"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD SLOT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-yellow-400 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold font-serif text-emerald-950">
                Add Timetable Slot — {selectedClass}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Day of Week:</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher / Instructor:</label>
                <select
                  value={slotTeacher}
                  onChange={(e) => setSlotTeacher(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.fullName}>
                      {t.fullName} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time:</label>
                  <input
                    type="text"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time:</label>
                  <input
                    type="text"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Classroom / Lab:</label>
                <input
                  type="text"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black rounded-xl shadow-md cursor-pointer border border-yellow-400/50 uppercase text-xs tracking-wider"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
