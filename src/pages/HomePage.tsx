import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Award,
  Users,
  CalendarCheck,
  CreditCard,
  ClipboardList,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Building2,
  Atom,
  Cpu,
  ChevronRight,
  Check,
  AlertTriangle,
  DollarSign,
  AlertCircle,
  Search,
  Eye,
  X,
  Layers,
  Printer,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo';
import { StudentIdCard } from '../components/StudentIdCard';
import { LEARNING_LEVELS, TUITION_CLASSES, Student, EMPTY_STUDENT_MESSAGE } from '../types';
import { api } from '../utils/api';

interface HomePageProps {
  onSelectTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab }) => {
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  useEffect(() => {
    api.getStudents()
      .then((data) => setEnrolledStudents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingStudents(false));
  }, []);

  const filteredStudents = enrolledStudents.filter((st) => {
    if (studentSearch.trim()) {
      const q = studentSearch.trim().toLowerCase();
      const matchName = st.fullName.toLowerCase().includes(q);
      const matchRoll = st.rollNumber.toLowerCase().includes(q);
      const matchFather = st.fatherName.toLowerCase().includes(q);
      const matchClass = st.admissionClass.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchFather && !matchClass) return false;
    }
    return true;
  });
  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION IN EMERALD GREEN & GOLDEN YELLOW */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white border-b-4 border-yellow-400 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-black tracking-widest uppercase border border-yellow-400/40 backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Session 2026-2027 Admissions Active • Quetta</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white leading-tight">
                  OXFORED <span className="text-yellow-400">EDUCATIONAL</span> HOUSE
                </h1>
                <p className="text-sm sm:text-base text-yellow-200/90 font-mono font-bold tracking-wider uppercase">
                  Digital School Management System • Brewery Road Quetta
                </p>
              </div>

              <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed font-normal">
                Welcome to <strong>OXFORED EDUCATIONAL HOUSE</strong>. A modern institutional portal featuring <strong>11 specialized learning levels</strong>, tuition classes from Prep to Class 10th, permanent numeric roll numbers starting at 1, roll-number-wise daily attendance, verified examination results, and the synchronized 2026 fee management system.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectTab('enrollment')}
                  className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 border-2 border-yellow-300"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>Student Enrollment 2026</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('student-portal')}
                  className="px-6 py-3.5 bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl backdrop-blur-xs transition-all border border-emerald-600/70 cursor-pointer flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span>Student Portal Sign-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('fee-management')}
                  className="px-6 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-yellow-400/50 cursor-pointer flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <span>Fee Management 2026</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('enrolled-students')}
                  className="px-6 py-3.5 bg-yellow-400/90 hover:bg-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-yellow-300 cursor-pointer flex items-center gap-2 shadow-lg"
                >
                  <Users className="w-4 h-4 text-emerald-950" />
                  <span>Public Enrolled Directory ({enrolledStudents.length})</span>
                </button>
              </div>

              {/* Developer Attribution Tag */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-yellow-400/40 text-[11px] text-yellow-300 font-bold tracking-wide">
                  <span>MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN</span>
                </div>
              </div>
            </div>

            {/* Right Card / Shield Crest Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-b from-emerald-900/90 to-green-950/90 rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-2xl space-y-6 backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-emerald-700/60">
                  <div className="flex items-center gap-3">
                    <SchoolLogo size="md" showText={false} variant="light" />
                    <div>
                      <h3 className="font-serif font-black text-white text-base tracking-wide">
                        OXFORED PORTAL
                      </h3>
                      <p className="text-[11px] text-yellow-300">Session 2026-2027 Active</p>
                    </div>
                  </div>
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-950/90 p-3 rounded-xl border border-yellow-500/30">
                    <span className="text-emerald-300 block text-[10px] uppercase font-bold">Permanent Rolls</span>
                    <span className="text-yellow-300 font-mono font-bold text-sm">Starts at 1</span>
                    <p className="text-[10px] text-emerald-200 mt-1">Single Sequence: 1, 2, 3...</p>
                  </div>
                  <div className="bg-emerald-950/90 p-3 rounded-xl border border-yellow-500/30">
                    <span className="text-emerald-300 block text-[10px] uppercase font-bold">Fee 2026 Sync</span>
                    <span className="text-yellow-400 font-bold text-sm">Directly Linked</span>
                    <p className="text-[10px] text-emerald-200 mt-1">Zero Duplicate Entry</p>
                  </div>
                  <div className="bg-emerald-950/90 p-3 rounded-xl border border-yellow-500/30">
                    <span className="text-emerald-300 block text-[10px] uppercase font-bold">Programs</span>
                    <span className="text-white font-bold text-sm">11 Levels + Tuitions</span>
                    <p className="text-[10px] text-emerald-200 mt-1">Level Kids to Advance</p>
                  </div>
                  <div className="bg-emerald-950/90 p-3 rounded-xl border border-yellow-500/30">
                    <span className="text-emerald-300 block text-[10px] uppercase font-bold">Faculty Staff</span>
                    <span className="text-yellow-400 font-bold text-sm">4 Dedicated Mentors</span>
                    <p className="text-[10px] text-emerald-200 mt-1">Sir Abbas, Sharifullah, Shakir & Atlas</p>
                  </div>
                </div>

                <div className="bg-yellow-400/20 border border-yellow-400/60 p-3.5 rounded-2xl text-center">
                  <p className="text-xs text-yellow-300 font-bold tracking-wide">
                    MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 11 LEARNING LEVELS & TUITION PROGRAMS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
            Academic Offerings • Oxfored Educational House
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-emerald-950">
            11 Learning Levels & Tuition Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Comprehensive skill-based learning levels and board preparation tuition classes managed under individual faculty responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 11 Learning Levels Box */}
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <h3 className="font-serif font-black text-lg text-emerald-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-600" />
                <span>The 11 Official Learning Levels</span>
              </h3>
              <span className="text-xs font-mono font-bold bg-yellow-100 text-emerald-900 px-2.5 py-1 rounded-full border border-yellow-300">
                Levels 1 - 11
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {LEARNING_LEVELS.map((lvl, idx) => (
                <div
                  key={lvl}
                  className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center gap-2 hover:border-yellow-400 hover:bg-yellow-50/50 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-900 text-yellow-300 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-emerald-950">{lvl}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
              Note: Students may progress between levels at the discretion of the administration without alteration to their permanent roll number.
            </p>
          </div>

          {/* Tuition Academy Box (Nursery to 10th) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-3xl border-2 border-yellow-400 p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700">
              <h3 className="font-serif font-black text-lg text-yellow-300 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-yellow-400" />
                <span>Tuition Classes (Nursery to 10th)</span>
              </h3>
              <span className="text-xs font-mono font-bold bg-yellow-400 text-emerald-950 px-2.5 py-1 rounded-full">
                Nursery – 10th
              </span>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed">
              Dedicated coaching for school and board examinations managed across three sections: Primary (Nursery to Class 4) under <strong>SIR SHAKIR</strong>, Middle School (Class 5 to 7th Class) under <strong>SIR ATLAS</strong>, and Senior & Board (Class 8 to 10th) under <strong>SIR ABBAS</strong>. Tuition fee: <strong>Rs. 1,000 per subject</strong>.
            </p>

            <div className="flex flex-wrap gap-2">
              {TUITION_CLASSES.map((cls) => (
                <span
                  key={cls}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 text-yellow-300 font-mono font-bold text-xs border border-yellow-500/40"
                >
                  {cls}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-emerald-800 text-[11px] text-emerald-200">
              Separate class registers maintained by permanent numeric roll numbers.
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFIED FACULTY PROFILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
            Institutional Faculty • Oxfored Educational House
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-emerald-950">
            Dedicated Teaching Faculty
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Subject-wise responsibilities are strictly allocated to our verified institutional educators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Teacher 1: SIR ABBAS */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-sm space-y-4 hover:border-yellow-400 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-yellow-400 text-emerald-950 font-mono font-black text-xs">
                    Staff ID: OX-TCH-001
                  </span>
                  <h3 className="text-xl font-serif font-black text-emerald-950 mt-1">
                    SIR ABBAS
                  </h3>
                  <p className="text-xs font-bold text-emerald-800">
                    Senior Faculty & Head of English Department
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Assigned Responsibilities
                </span>
                <ul className="text-xs font-bold text-emerald-950 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>English Grammar (Level Kids to Level Advance)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Senior Board Tuitions (Class 8th to 10th)</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
              Staff ID verified in Faculty Attendance Register.
            </p>
          </div>

          {/* Teacher 2: SIR SHARIFULLAH */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-sm space-y-4 hover:border-yellow-400 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-yellow-400 text-emerald-950 font-mono font-black text-xs">
                    Staff ID: OX-TCH-002
                  </span>
                  <h3 className="text-xl font-serif font-black text-emerald-950 mt-1">
                    SIR SHARIFULLAH
                  </h3>
                  <p className="text-xs font-bold text-emerald-800">
                    Master Instructor of Quranic Sciences & Islamic Calligraphy
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Assigned Responsibilities
                </span>
                <ul className="text-xs font-bold text-emerald-950 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Caligraphy (Nastaliq & English Script)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Nazra e Quran (Tajweed & Recitation)</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
              Staff ID verified in Faculty Attendance Register.
            </p>
          </div>

          {/* Teacher 3: SIR SHAKIR */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-sm space-y-4 hover:border-yellow-400 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-yellow-400 text-emerald-950 font-mono font-black text-xs">
                    Staff ID: OX-TCH-003
                  </span>
                  <h3 className="text-xl font-serif font-black text-emerald-950 mt-1">
                    SIR SHAKIR
                  </h3>
                  <p className="text-xs font-bold text-emerald-800">
                    Primary Tuition Specialist & Junior Faculty
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Assigned Responsibilities
                </span>
                <ul className="text-xs font-bold text-emerald-950 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tuition Classes: Nursery to Class 4</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>All Primary Subjects (Math, Urdu, Eng, Sci)</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
              Coaching from Nursery to 4th • Rs. 1,000 / subject.
            </p>
          </div>

          {/* Teacher 4: SIR ATLAS */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-sm space-y-4 hover:border-yellow-400 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-yellow-400 text-emerald-950 font-mono font-black text-xs">
                    Staff ID: OX-TCH-004
                  </span>
                  <h3 className="text-xl font-serif font-black text-emerald-950 mt-1">
                    SIR ATLAS
                  </h3>
                  <p className="text-xs font-bold text-emerald-800">
                    Middle School Tuition Specialist & Mentor
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Assigned Responsibilities
                </span>
                <ul className="text-xs font-bold text-emerald-950 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Tuition Classes: Class 5 to 7th Class</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Maths, Science, English & Social Studies</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
              Coaching Class 5 to 7th • Rs. 1,000 / subject.
            </p>
          </div>
        </div>
      </section>

      {/* 3.4 LIVE PUBLIC DIRECTORY OF ENROLLED STUDENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Institutional Admissions Roster</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-emerald-950">
                Officially Enrolled Students Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Every student who enrolls online or through this website is immediately recorded in our official admissions database and is publicly visible here with verified permanent roll numbers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-mono font-bold text-xs border border-emerald-300">
                Total Enrolled: {enrolledStudents.length}
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('enrolled-students')}
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Full Public Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Search on Homepage */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search enrolled student by name, roll no, father..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none font-medium"
              />
              {studentSearch && (
                <button
                  type="button"
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('enrollment')}
              className="px-4 py-2 rounded-xl bg-emerald-950 text-yellow-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Enroll New Student</span>
            </button>
          </div>

          {loadingStudents ? (
            <div className="py-12 text-center text-slate-400">Loading enrolled students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 px-6">
              <Users className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-950">
                {studentSearch ? 'No enrolled student matched your search query.' : EMPTY_STUDENT_MESSAGE}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.slice(0, 6).map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 hover:border-yellow-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.photoUrl}
                      alt={st.fullName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-yellow-400 shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-black text-emerald-900 text-sm">
                          Roll #{st.rollNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase border border-emerald-300 shrink-0">
                          Enrolled
                        </span>
                      </div>
                      <h4 className="font-serif font-black text-emerald-950 text-sm truncate">
                        {st.fullName}
                      </h4>
                      <p className="text-slate-500 text-[11px] truncate">
                        Father: {st.fatherName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-emerald-100 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-yellow-100 text-emerald-950 font-bold text-[10px] border border-yellow-300">
                        {st.admissionClass}
                      </span>
                      {st.secondClass && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-black text-[9px] border border-amber-300 flex items-center gap-0.5">
                          <Layers className="w-2.5 h-2.5 text-amber-700" />
                          <span>Double: {st.secondClass}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Joined: {st.admissionDate} • Section {st.section || 'A'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStudentForModal(st)}
                    className="w-full py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-98"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>View Public Profile & ID</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {filteredStudents.length > 6 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onSelectTab('enrolled-students')}
                className="px-6 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-bold text-xs rounded-xl uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow"
              >
                <span>View All {enrolledStudents.length} Enrolled Students in Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3.5 OFFICIAL 2026 FEE STRUCTURE & STRICT PAYMENT POLICY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 rounded-3xl p-6 sm:p-10 border-2 border-yellow-400 shadow-2xl text-white space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Session 2026-2027 Schedule</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
                Official Fee Structure & Tuition Rates
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
                Approved standard monthly fee rates across all grammar levels, tuition classes, calligraphy, and Quranic recitation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectTab('online-payment')}
                className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Pay Online (EasyPaisa)</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('fee-management')}
                className="px-5 py-3 bg-emerald-800/80 hover:bg-emerald-700 text-yellow-300 font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer border border-yellow-400/50"
              >
                <span>Fee Ledger 2026</span>
              </button>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Grammar */}
            <div className="bg-emerald-900/70 rounded-2xl p-5 border border-yellow-400/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold bg-yellow-400 text-emerald-950 px-2 py-0.5 rounded uppercase">
                  Level Kids to Level Advance
                </span>
                <h3 className="text-lg font-black font-serif text-white">
                  English Grammar
                </h3>
                <p className="text-xs text-emerald-200">
                  Comprehensive 9 levels of spoken, structural, and academic English grammar.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-emerald-800">
                <div>
                  <span className="text-[11px] text-yellow-300 font-semibold block">Monthly Fee</span>
                  <span className="text-3xl font-black font-mono text-white">Rs. 1,500</span>
                  <span className="text-[10px] text-emerald-300 block mt-0.5">per student / month</span>
                </div>
                <div className="text-[10px] text-emerald-200 bg-emerald-950/60 p-2 rounded-lg font-medium">
                  Instructor: <strong>SIR ABBAS</strong>
                </div>
              </div>
            </div>

            {/* Card 2: Tuition Classes */}
            <div className="bg-emerald-900/70 rounded-2xl p-5 border border-yellow-400/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold bg-yellow-400 text-emerald-950 px-2 py-0.5 rounded uppercase">
                  Per Subject Rate
                </span>
                <h3 className="text-lg font-black font-serif text-white">
                  Tuition Classes
                </h3>
                <p className="text-xs text-emerald-200">
                  Nursery, Prep to Class 10th (all compulsory school & board subjects).
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-emerald-800">
                <div>
                  <span className="text-[11px] text-yellow-300 font-semibold block">Tuition Fee</span>
                  <span className="text-3xl font-black font-mono text-white">Rs. 1,000</span>
                  <span className="text-[10px] text-emerald-300 block mt-0.5">per subject / month</span>
                </div>
                <div className="text-[10px] text-emerald-200 bg-emerald-950/60 p-2 rounded-lg space-y-0.5 font-medium">
                  <div>• Nursery–4th: <strong>SIR SHAKIR</strong></div>
                  <div>• 5th–7th: <strong>SIR ATLAS</strong></div>
                  <div>• 8th–10th: <strong>SIR ABBAS</strong></div>
                </div>
              </div>
            </div>

            {/* Card 3: Caligraphy */}
            <div className="bg-emerald-900/70 rounded-2xl p-5 border border-yellow-400/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold bg-yellow-400 text-emerald-950 px-2 py-0.5 rounded uppercase">
                  Art & Penmanship
                </span>
                <h3 className="text-lg font-black font-serif text-white">
                  Caligraphy
                </h3>
                <p className="text-xs text-emerald-200">
                  Traditional Khat-e-Nastaliq & English Cursive Calligraphy with certified master penmanship.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-emerald-800">
                <div>
                  <span className="text-[11px] text-yellow-300 font-semibold block">Monthly Fee</span>
                  <span className="text-3xl font-black font-mono text-white">Rs. 1,000</span>
                  <span className="text-[10px] text-emerald-300 block mt-0.5">per student / month</span>
                </div>
                <div className="text-[10px] text-emerald-200 bg-emerald-950/60 p-2 rounded-lg font-medium">
                  Instructor: <strong>SIR SHARIFULLAH</strong>
                </div>
              </div>
            </div>

            {/* Card 4: Nazra e Quran */}
            <div className="bg-emerald-900/70 rounded-2xl p-5 border border-yellow-400/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold bg-yellow-400 text-emerald-950 px-2 py-0.5 rounded uppercase">
                  Tajweed-ul-Quran
                </span>
                <h3 className="text-lg font-black font-serif text-white">
                  Nazra e Quran
                </h3>
                <p className="text-xs text-emerald-200">
                  Accurate Quranic recitation, Tajweed rules, and spiritual education under certified Hafiz-e-Quran.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-emerald-800">
                <div>
                  <span className="text-[11px] text-yellow-300 font-semibold block">Monthly Fee</span>
                  <span className="text-3xl font-black font-mono text-white">Rs. 600</span>
                  <span className="text-[10px] text-emerald-300 block mt-0.5">per student / month</span>
                </div>
                <div className="text-[10px] text-emerald-200 bg-emerald-950/60 p-2 rounded-lg font-medium">
                  Instructor: <strong>SIR SHARIFULLAH</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL STRICT DEADLINE WARNING BANNER */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-2 border-red-500 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 text-yellow-300 font-black text-sm uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />
              <span>Strict Payment Policy & Mandatory Deadline Notice</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                Every student should pay their fee at the start of the month from the <span className="text-yellow-300 underline font-black">1st to 5th date</span>.
              </p>
              <p className="text-xs sm:text-sm text-red-200 font-semibold leading-relaxed">
                ⚠️ <strong className="text-white">Mandatory Disciplinary Rule:</strong> Otherwise, the student will be get out / removed from their class! Class attendance, desk admission, and exam privileges are strictly revoked after the 5th date without fee clearance.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-red-800 text-red-100 font-mono">
              <span>Official EasyPaisa Account: <strong className="text-yellow-300 font-bold">03327185311</strong></span>
              <span>Account Title: <strong className="text-white">OXFORED EDUCATIONAL HOUSE / ATIF PANEZAI</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK ACCESS DASHBOARD CARDS (ALL MODULES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-emerald-950">
            Digital Campus Navigation & Portals
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Access every department, academic record, attendance register, and financial system from one connected dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Enrollment */}
          <div
            onClick={() => onSelectTab('enrollment')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Student Enrollment 2026
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Mandatory genuine photograph upload, permanent roll numbers from 1, and 2026 fee synchronization.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Open Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Student Portal */}
          <div
            onClick={() => onSelectTab('student-portal')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Student Login Portal
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Log in with permanent roll number for personal profile, daily attendance, verified marks, and fee history.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Student Sign-in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Fee Management 2026 */}
          <div
            onClick={() => onSelectTab('fee-management')}
            className="group p-5 bg-gradient-to-br from-emerald-950 to-green-900 text-white rounded-2xl border-2 border-yellow-400 shadow-md hover:shadow-xl transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">Fee Management 2026</h3>
                <span className="text-[9px] bg-yellow-400 text-emerald-950 font-black px-1.5 py-0.5 rounded uppercase">
                  Live
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                15-column student fee register, Jan–Dec 2026 monthly billing, instant receipts, and formula balance calculations.
              </p>
            </div>
            <div className="text-xs font-bold text-yellow-300 flex items-center gap-1">
              <span>View 2026 Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Examination Results */}
          <div
            onClick={() => onSelectTab('results-portal')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Results Portal
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Search verified, published report cards by roll number across periodic, midterm, and final examinations.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Search Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Student Daily Attendance */}
          <div
            onClick={() => onSelectTab('student-attendance')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Student Daily Attendance
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Roll-number-wise daily registers, public verification lookup, and audited corrections in PKT.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Open Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Teacher Attendance */}
          <div
            onClick={() => onSelectTab('teacher-attendance')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Teacher Attendance & Staff ID
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check-in, check-out, and Staff ID verification for Sir Abbas, Sir Sharifullah, Sir Shakir, and Sir Atlas.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Faculty Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 7: Teacher Portal */}
          <div
            onClick={() => onSelectTab('teacher-portal')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Teacher Portal
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Faculty workspace for Sir Abbas, Sir Sharifullah, Sir Shakir, and Sir Atlas: attendance, exam marks, and timetable.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Teacher Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 8: Admin Dashboard */}
          <div
            onClick={() => onSelectTab('admin-dashboard')}
            className="group p-5 bg-white rounded-2xl border-2 border-emerald-100 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 group-hover:bg-yellow-400 group-hover:text-emerald-950 transition-colors flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                Principal & Admin Office
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pending admission approvals, student level progression, results publishing, and the AuditLogManager compliance tab.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1 group-hover:text-yellow-600">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRINCIPAL'S ADDRESS & CAMPUS INFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 sm:p-12 border-2 border-yellow-400 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Message from the Principal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                "Nurturing Leaders of Character, Knowledge, and Faith in Quetta"
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                At Oxfored Educational House, we offer 11 distinct learning levels and specialized tuition classes under dedicated faculty mentors. With permanent roll numbers starting at 1, real student validation, and full synchronization with the 2026 fee management system, our institution ensures excellence and complete accountability.
              </p>
              <div className="pt-2 text-xs text-yellow-300 font-bold">
                — Principal Office, Oxfored Educational House Quetta
              </div>
            </div>

            <div className="lg:col-span-4 bg-emerald-900/80 p-6 rounded-2xl border border-yellow-400/50 space-y-3 text-xs">
              <h4 className="font-bold text-yellow-300 uppercase tracking-wider">Campus Details</h4>
              <div className="space-y-2 text-emerald-100">
                <p>
                  <strong className="text-yellow-300">Address:</strong> BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
                </p>
                <p>
                  <strong className="text-yellow-300">Office Hours:</strong> Monday – Saturday, 08:00 AM – 02:00 PM (PKT)
                </p>
                <p>
                  <strong className="text-yellow-300">Official Mobile / EasyPaisa:</strong>{' '}
                  <a href="tel:03327185311" className="text-yellow-300 font-bold hover:underline">
                    03327185311
                  </a>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('online-payment')}
                  className="py-2.5 bg-gradient-to-r from-emerald-800 to-green-800 hover:from-emerald-700 text-yellow-300 font-black rounded-xl text-center transition-all cursor-pointer uppercase text-[11px] tracking-wider shadow-md border border-yellow-400"
                >
                  Pay via EasyPaisa
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('contact')}
                  className="py-2.5 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black rounded-xl text-center transition-colors cursor-pointer uppercase text-[11px] tracking-wider shadow-md"
                >
                  Map & Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC STUDENT PROFILE MODAL ON HOMEPAGE */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-4 border-yellow-400 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-emerald-100 pb-4">
              <div>
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
                  Official Enrolled Student Record
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-emerald-950">
                  {selectedStudentForModal.fullName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Permanent Roll Number:{' '}
                  <strong className="text-emerald-900 bg-yellow-200 px-2 py-0.5 rounded font-black">
                    #{selectedStudentForModal.rollNumber}
                  </strong>{' '}
                  • Status: <span className="text-emerald-700 font-bold">Enrolled & Verified</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Bi-Sided Student ID Card */}
            <div>
              <StudentIdCard student={selectedStudentForModal} />
            </div>

            {/* Academic Details */}
            <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div>
                <span className="text-slate-500 block">Father / Guardian:</span>
                <strong className="text-emerald-950">{selectedStudentForModal.fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Admission Date:</span>
                <strong className="text-emerald-950 font-mono">{selectedStudentForModal.admissionDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Program:</span>
                <strong className="text-emerald-950">{selectedStudentForModal.admissionClass}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Campus Location:</span>
                <strong className="text-emerald-950">Brewery Road, Quetta</strong>
              </div>
              {selectedStudentForModal.secondClass && (
                <div className="col-span-2 pt-2 border-t border-emerald-200 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[11px] border border-amber-300">
                    Dual Enrollment
                  </span>
                  <span className="text-slate-700">
                    Also enrolled in: <strong>{selectedStudentForModal.secondClass}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-900 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-yellow-400" />
                <span>Print Card</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentForModal(null);
                    onSelectTab('student-attendance');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-yellow-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-900"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const roll = selectedStudentForModal.rollNumber;
                    setSelectedStudentForModal(null);
                    onSelectTab('student-portal');
                  }}
                  className="px-4 py-2 rounded-xl bg-yellow-400 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer hover:bg-yellow-500 shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
