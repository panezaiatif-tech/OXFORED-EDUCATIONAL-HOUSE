import React from 'react';
import { Printer, X, Award, CheckCircle, ShieldAlert } from 'lucide-react';
import { ExamResult } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface PrintableReportCardProps {
  result: ExamResult;
  onClose: () => void;
}

export const PrintableReportCard: React.FC<PrintableReportCardProps> = ({ result, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const isPass = result.passFailStatus === 'Pass';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 border-2 border-yellow-400 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-500" />
            Official Examination Transcript
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-yellow-300 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm cursor-pointer border border-yellow-400/50"
            >
              <Printer className="w-4 h-4 text-yellow-400" />
              Print Marksheet
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE TRANSCRIPT */}
        <div className="border-4 border-double border-emerald-950 p-8 rounded-2xl bg-emerald-50/20 relative">
          {/* Header */}
          <div className="text-center pb-5 border-b-2 border-emerald-950 space-y-1">
            <div className="flex justify-center mb-2">
              <SchoolLogo size="sm" showText={false} variant="dark" />
            </div>
            <h1 className="text-2xl font-black font-serif text-emerald-950 tracking-wider uppercase">
              OXFORED EDUCATIONAL HOUSE
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Location: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Affiliated with Board of Intermediate & Secondary Education Quetta / Federal Board
            </p>
            <div className="inline-block mt-2 px-4 py-1 bg-gradient-to-r from-emerald-950 to-green-950 text-yellow-300 font-black text-xs rounded-full uppercase tracking-widest border border-yellow-400">
              {result.examName} — Statement of Marks (Session {result.session})
            </div>
          </div>

          {/* Student Biodata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 text-xs border-b border-slate-200 bg-white/70 p-4 rounded-xl my-4">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
              <strong className="text-slate-900 text-sm font-bold">{result.studentName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Father's Name</span>
              <span className="font-semibold text-slate-800 text-sm">{result.fatherName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Roll Number</span>
              <strong className="font-mono text-emerald-950 text-sm">{result.rollNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Class & Section</span>
              <span className="font-semibold text-slate-800">{result.class} — Sec {result.section}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Result</span>
              <span className="font-semibold text-slate-800">{result.publishedAt || 'Published 2026'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Exam Status</span>
              <span className={`font-black uppercase ${isPass ? 'text-emerald-800' : 'text-red-600'}`}>
                {result.passFailStatus}
              </span>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="py-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-emerald-950 text-white font-bold border-b border-yellow-400">
                  <th className="py-2.5 px-3 text-left">Subject</th>
                  <th className="py-2.5 px-3 text-center">Max Marks</th>
                  <th className="py-2.5 px-3 text-center">Obtained Marks</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-center">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {result.subjects.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50/20'}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{sub.subjectName || sub.subject}</td>
                    <td className="py-2 px-3 text-center font-mono text-slate-600">{sub.maxMarks}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-950">
                      {sub.obtainedMarks}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-yellow-600">{sub.grade}</td>
                    <td className="py-2 px-3 text-center text-[11px] text-slate-600">
                      {sub.obtainedMarks >= sub.maxMarks * 0.8 ? 'Excellent' : sub.obtainedMarks >= sub.maxMarks * 0.6 ? 'Good' : 'Satisfactory'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Grand Total Footer */}
              <tfoot>
                <tr className="bg-emerald-900 text-white font-bold text-xs border-t-2 border-yellow-400">
                  <td className="py-2.5 px-3">Grand Total</td>
                  <td className="py-2.5 px-3 text-center font-mono">{result.totalMaxMarks}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-yellow-300 text-sm font-black">
                    {result.totalObtainedMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center text-yellow-300 text-sm font-black">{result.finalGrade}</td>
                  <td className="py-2.5 px-3 text-center uppercase tracking-wider">
                    {result.passFailStatus}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Badges */}
          <div className="grid grid-cols-3 gap-3 my-4 text-center">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-900 uppercase block">Percentage</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{result.percentage}%</span>
            </div>
            <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-300">
              <span className="text-[10px] font-bold text-yellow-800 uppercase block">Final Grade</span>
              <span className="text-xl font-black text-yellow-600 font-mono">{result.finalGrade}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <span className="text-[10px] font-bold uppercase block text-slate-700">Result Decision</span>
              <span className={`text-xl font-black ${isPass ? 'text-emerald-800' : 'text-red-700'}`}>
                {result.passFailStatus}
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2 text-xs bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <strong className="text-emerald-950">Teacher Remarks:</strong>{' '}
              <span className="text-slate-700">{result.teacherRemarks || 'Satisfactory academic consistency.'}</span>
            </div>
            <div>
              <strong className="text-emerald-950">Principal's Remarks:</strong>{' '}
              <span className="text-slate-700">{result.principalRemarks || 'Promoted with commendable performance.'}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-slate-400 pt-1">
              <p className="font-semibold text-slate-800">Class In-charge</p>
              <p className="text-[10px] text-slate-500">Subject Faculty</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-semibold text-slate-800">Controller of Exams</p>
              <p className="text-[10px] text-slate-500">Board of Examinations</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-semibold text-slate-800">Principal</p>
              <p className="text-[10px] text-slate-500">Oxfored Educational House</p>
            </div>
          </div>

          <div className="text-center pt-6 text-[10px] text-slate-400 border-t border-slate-200 mt-6">
            Official Academic Record • Verified at Oxfored Educational House, Brewery Road Quetta
          </div>
        </div>
      </div>
    </div>
  );
};
