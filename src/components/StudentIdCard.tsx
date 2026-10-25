import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface StudentIdCardProps {
  student: Student;
  onClose?: () => void;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({ student, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('both');

  useEffect(() => {
    const token = student.qrCodeToken || `OX-QR-${student.id}-${student.rollNumber}`;
    QRCode.toDataURL(token, {
      width: 250,
      margin: 1,
      color: {
        dark: '#064e3b', // emerald-900
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR Code:', err));
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  const formattedRoll = student.rollNumber.padStart(2, '0');

  return (
    <div className="space-y-6">
      {/* Top Controls & Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-950/80 p-4 rounded-2xl border border-yellow-400/40 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <div>
            <h3 className="font-serif font-black text-sm text-yellow-300">
              Official Bi-Sided Digital Student Identity Card
            </h3>
            <p className="text-[11px] text-emerald-200">
              Session 2026-2027 • Standard CR-80 High Resolution Print Layout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-900 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSide('both')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSide === 'both' ? 'bg-yellow-400 text-emerald-950 font-black' : 'text-emerald-200'
              }`}
            >
              Both Sides
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('front')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSide === 'front' ? 'bg-yellow-400 text-emerald-950 font-black' : 'text-emerald-200'
              }`}
            >
              Front Only
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSide === 'back' ? 'bg-yellow-400 text-emerald-950 font-black' : 'text-emerald-200'
              }`}
            >
              Back Only
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer uppercase tracking-wider"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Cards Display Grid (Printable Area) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-start print:grid-cols-2 print:gap-4">
        {/* ===================== FRONT SIDE ===================== */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-900 bg-yellow-200/80 px-3 py-0.5 rounded-full border border-yellow-400">
              Front Side of ID Card
            </span>

            <div className="w-[340px] h-[520px] bg-gradient-to-b from-yellow-400 via-amber-300 to-white rounded-3xl shadow-2xl border-4 border-emerald-900 relative overflow-hidden flex flex-col justify-between text-slate-900 p-5">
              {/* Header Ribbon */}
              <div className="text-center space-y-1 relative z-10">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-white flex items-center justify-center text-yellow-400 font-serif font-black text-xs shadow-md">
                    OEH
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-serif font-black text-emerald-950 leading-tight tracking-wide">
                      OXFORED EDUCATIONAL HOUSE
                    </h2>
                    <p className="text-[9px] font-bold text-emerald-900 uppercase tracking-widest">
                      Brewery Road, Quetta • Session 2026
                    </p>
                  </div>
                </div>

                <div className="h-0.5 bg-emerald-950/20 w-full mt-2" />
                <span className="inline-block bg-emerald-950 text-yellow-300 font-black font-mono text-[9px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Official Student Identity Card
                </span>
              </div>

              {/* Central Section: Photo + Large Roll Number */}
              <div className="flex flex-col items-center space-y-3 relative z-10 my-auto">
                <div className="relative">
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-28 h-32 rounded-2xl object-cover border-4 border-emerald-900 shadow-xl bg-white"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-950 text-yellow-400 rounded-full p-1 border-2 border-white shadow">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="bg-emerald-950 text-white px-4 py-1 rounded-xl shadow-md border border-yellow-400 inline-block">
                    <span className="text-[9px] text-yellow-300 uppercase tracking-widest block font-bold">
                      Roll Number
                    </span>
                    <span className="text-2xl font-black font-mono text-yellow-400 tracking-wider">
                      {formattedRoll}
                    </span>
                  </div>

                  <h3 className="text-base font-black font-serif text-emerald-950 tracking-wide mt-1">
                    {student.fullName}
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-900">
                    S/D of: <strong className="text-emerald-950">{student.fatherName}</strong>
                  </p>
                </div>

                {/* Enrolled Courses / Double Class Badges */}
                <div className="w-full space-y-1 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border-2 border-emerald-800/40 shadow-xs text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    Enrolled Programs / Courses
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-900 text-yellow-300 font-black text-[11px]">
                      {student.admissionClass}
                    </span>
                    {student.secondClass && (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[11px] shadow-xs flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{student.secondClass}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-emerald-900 block font-semibold">
                    Section {student.section} • Session {student.academicSession}
                  </span>
                </div>
              </div>

              {/* Bottom Bar: QR Code for Attendance & Developer Watermark */}
              <div className="pt-2 border-t-2 border-emerald-900/30 flex items-center justify-between relative z-10">
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-bold text-emerald-950 uppercase tracking-widest block">
                    Scan for Attendance
                  </span>
                  <p className="text-[8px] text-slate-600 font-mono">
                    Token: {student.qrCodeToken.substring(0, 14)}...
                  </p>
                  <span className="text-[7.5px] font-black text-emerald-950 block">
                    Authorized CR-80 Card
                  </span>
                </div>

                {qrDataUrl && (
                  <div className="bg-white p-1 rounded-xl border-2 border-emerald-900 shadow-sm shrink-0">
                    <img src={qrDataUrl} alt="Student QR Code" className="w-14 h-14" />
                  </div>
                )}
              </div>

              {/* Developer Credit watermark */}
              <div className="text-[7px] text-center font-bold text-emerald-950 tracking-tight pt-1">
                DEV: ATIF PANEZAI • OXFORED EDUCATIONAL HOUSE
              </div>
            </div>
          </div>
        )}

        {/* ===================== BACK SIDE ===================== */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-900 bg-yellow-200/80 px-3 py-0.5 rounded-full border border-yellow-400">
              Back Side of ID Card
            </span>

            <div className="w-[340px] h-[520px] bg-gradient-to-b from-white via-emerald-50/50 to-yellow-50 rounded-3xl shadow-2xl border-4 border-emerald-900 relative overflow-hidden flex flex-col justify-between text-slate-900 p-5">
              {/* Top Institutional Header */}
              <div className="border-b-2 border-emerald-800 pb-2.5 text-center space-y-1">
                <span className="text-[10px] font-serif font-black text-emerald-950 uppercase tracking-wider block">
                  OXFORED EDUCATIONAL HOUSE
                </span>
                <p className="text-[9px] text-emerald-900 font-bold">
                  Official Student Verification & Academy Rules
                </p>
              </div>

              {/* Student Verified Record Details */}
              <div className="space-y-2.5 my-auto text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Roll Number</span>
                    <strong className="text-emerald-950 font-mono text-sm">{formattedRoll}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Enrollment Status</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                      <span>{student.status || 'Active'}</span>
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Father / Guardian Phone</span>
                    <strong className="text-slate-800 font-mono text-xs">{student.fatherPhone || student.phone}</strong>
                  </div>
                </div>

                {/* Complete Courses List */}
                <div className="p-3 rounded-2xl bg-yellow-100/70 border border-yellow-300 space-y-1.5">
                  <span className="text-[9px] font-bold text-emerald-950 uppercase tracking-wider block">
                    Registered Courses & Classes:
                  </span>
                  <ul className="text-[10px] font-bold text-emerald-900 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 shrink-0" />
                      <span>Primary: {student.admissionClass}</span>
                    </li>
                    {student.secondClass && (
                      <li className="flex items-center gap-1.5 text-amber-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        <span>Double Class: {student.secondClass}</span>
                      </li>
                    )}
                    {student.enrolledCourses?.filter(c => c !== student.admissionClass && c !== student.secondClass).map((c, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 shrink-0" />
                        <span>Course: {c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Academy Rules & Fee Notice */}
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-[9px] text-red-950 space-y-1 font-medium leading-relaxed">
                  <strong className="text-red-700 block font-bold uppercase">
                    Mandatory Academy Rules:
                  </strong>
                  <div>
                    1. Card must be presented at the attendance scanner upon arrival.
                  </div>
                  <div>
                    2. Monthly fee must be paid from <strong>1st to 5th date</strong> of each month. Otherwise, entry to class is strictly barred.
                  </div>
                </div>
              </div>

              {/* Bottom: Small QR + Principal Signature & Developer Credit */}
              <div className="pt-2 border-t-2 border-emerald-800/30 flex items-center justify-between text-xs">
                {qrDataUrl && (
                  <div className="bg-white p-1 rounded-lg border border-slate-300 shrink-0">
                    <img src={qrDataUrl} alt="Quick QR" className="w-10 h-10" />
                  </div>
                )}

                <div className="text-right space-y-1">
                  <div className="font-serif italic text-emerald-900 font-bold text-xs border-b border-emerald-900/40 pb-0.5">
                    Principal & Registrar
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest block">
                    Authorized Stamp & Signature
                  </span>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="text-[8px] text-center text-slate-500 font-mono pt-1">
                Helpline: 03327185311 • Brewery Road near SBK University, Quetta
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
