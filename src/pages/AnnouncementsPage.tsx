import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Plus,
  Calendar,
  AlertTriangle,
  FileText,
  X,
  Filter,
} from 'lucide-react';
import { api } from '../utils/api';
import { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('Notices');
  const [newContent, setNewContent] = useState('');
  const [newTarget, setNewTarget] = useState<'all' | 'students' | 'teachers'>('all');
  const [newUrgent, setNewUrgent] = useState(false);

  const categories = ['All', 'Admissions', 'Exams', 'Fee Reminder', 'Holidays', 'Notices'];

  const loadData = async () => {
    try {
      const res = await api.getAnnouncements();
      setAnnouncements(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveAnnouncement({
        title: newTitle,
        category: newCategory,
        content: newContent,
        targetAudience: newTarget,
        isUrgent: newUrgent,
        author: 'Principal Desk (Atif Panezai)',
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = announcements.filter(
    (a) => selectedCategory === 'All' || a.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Official Campus Circulars & Public Notice Board</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — NOTICES & ANNOUNCEMENTS
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Stay updated with important announcements regarding examination schedules, holiday circulars, 2026 admission deadlines, and fee reminders for Quetta students and faculty.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-950 text-yellow-300 shadow-sm font-black'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-yellow-300"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice (Admin)</span>
        </button>
      </div>

      {/* Notices Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((anc) => (
          <div
            key={anc.id}
            className={`p-6 rounded-3xl border-2 shadow-sm space-y-3 bg-white transition-all ${
              anc.isUrgent ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-emerald-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase border border-emerald-200">
                  {anc.category}
                </span>
                {anc.isUrgent && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 uppercase flex items-center gap-1 border border-red-300">
                    <AlertTriangle className="w-3 h-3 text-red-600" /> Urgent Notice
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono font-bold">{anc.publishDate}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 font-serif">{anc.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Authorized by: <strong className="text-emerald-900">{anc.author}</strong></span>
              <span className="capitalize font-medium">Target: {anc.targetAudience}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD NOTICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-yellow-400 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold font-serif text-emerald-950">
                Publish School Notice / Circular
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule for Second Periodic Tests 2026"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="Notices">Notices</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Exams">Exams</option>
                    <option value="Fee Reminder">Fee Reminder</option>
                    <option value="Holidays">Holidays</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audience:</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="all">Entire School (All)</option>
                    <option value="students">Students & Parents</option>
                    <option value="teachers">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Content:</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter official circular text..."
                  className="w-full border border-slate-300 rounded-xl p-3 resize-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={newUrgent}
                  onChange={(e) => setNewUrgent(e.target.checked)}
                  className="w-4 h-4 text-emerald-800 rounded"
                />
                <label htmlFor="urgentNotice" className="font-bold text-slate-700">
                  Mark as High Priority / Urgent Alert
                </label>
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
