import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  Plus,
} from 'lucide-react';
import { api } from '../utils/api';
import { ExamResult, ExamType } from '../types';
import { PrintableReportCard } from '../components/PrintableReportCard';

export const ExamManagementPage: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeReport, setActiveReport] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(false);

  const exams: { type: ExamType; name: string; date: string; status: string; totalStudents: number }[] = [
    { type: 'First Periodic Test', name: 'First Periodic Test 2026', date: 'March 15 – March 22, 2026', status: 'Completed', totalStudents: 6 },
    { type: 'Second Periodic Test', name: 'Second Periodic Test 2026', date: 'May 10 – May 18, 2026', status: 'Active / Entry Open', totalStudents: 6 },
    { type: 'Midterm Examination', name: 'Midterm Examination 2026', date: 'August 20 – September 02, 2026', status: 'Upcoming', totalStudents: 6 },
    { type: 'Final Examination', name: 'Final Annual Examination 2026', date: 'November 25 – December 10, 2026', status: 'Scheduled', totalStudents: 6 },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getExamResults();
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (result: ExamResult) => {
    try {
      const updated = await api.publishExamResult(result.id, !result.isPublished, 'Admin Office (Atif Panezai)');
      setResults((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Academic Year 2026–2027 Examination Controller</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — EXAMINATION MANAGEMENT
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Configure exam schedules, moderate grading policies (A+, A, B, C, D, F), verify subject marks, and control official result publication for student access.
        </p>
      </div>

      {/* 4 Supported Exam Sessions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {exams.map((ex, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm space-y-3 hover:border-yellow-400 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{ex.name}</h3>
              <p className="text-xs text-slate-500">{ex.date}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800">{ex.status}</span>
              <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded text-emerald-900 font-mono font-bold">
                {ex.totalStudents} enrolled
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Master Results Moderation Table */}
      <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-emerald-950 text-sm">
            Student Examination Records & Verification ({results.length})
          </h3>
          <span className="text-xs text-slate-500">Only published marks appear in Student Portal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-emerald-950 text-white font-bold border-b-2 border-yellow-400">
              <tr>
                <th className="py-3 px-3.5">Student Name</th>
                <th className="py-3 px-3.5 font-mono">Roll Number</th>
                <th className="py-3 px-3.5">Class</th>
                <th className="py-3 px-3.5">Examination</th>
                <th className="py-3 px-3.5 text-center">Total Marks</th>
                <th className="py-3 px-3.5 text-center">Percentage</th>
                <th className="py-3 px-3.5 text-center">Grade</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Publication</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((res) => (
                <tr key={res.id} className="hover:bg-yellow-50/40 transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-slate-900">{res.studentName}</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-950">{res.rollNumber}</td>
                  <td className="py-2.5 px-3.5 text-slate-700">{res.class}</td>
                  <td className="py-2.5 px-3.5 text-slate-700">{res.examName}</td>
                  <td className="py-2.5 px-3.5 text-center font-mono font-bold">
                    {res.totalObtainedMarks} / {res.totalMaxMarks}
                  </td>
                  <td className="py-2.5 px-3.5 text-center font-black text-yellow-600">
                    {res.percentage}%
                  </td>
                  <td className="py-2.5 px-3.5 text-center font-black">{res.finalGrade}</td>
                  <td className="py-2.5 px-3.5 text-center font-semibold text-emerald-800">
                    {res.passFailStatus}
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      onClick={() => handleTogglePublish(res)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors ${
                        res.isPublished
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
                      }`}
                    >
                      {res.isPublished ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-yellow-600" />}
                      <span>{res.isPublished ? 'Published' : 'Draft (Hidden)'}</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      onClick={() => setActiveReport(res)}
                      className="px-3 py-1 bg-emerald-800 text-yellow-300 font-bold text-[10px] rounded-lg hover:bg-emerald-900 cursor-pointer border border-yellow-400/50"
                    >
                      Transcript
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeReport && (
        <PrintableReportCard
          result={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
};
