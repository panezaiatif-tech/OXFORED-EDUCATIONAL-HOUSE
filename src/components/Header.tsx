import React, { useState } from 'react';
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../types';
import { SchoolLogo } from './SchoolLogo';

export interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole | 'guest';
  onSelectRole: (role: UserRole | 'guest') => void;
  activeStudentRoll?: string;
  onSelectStudentRoll?: (roll: string) => void;
}

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'enrollment', label: 'Student Enrollment' },
  { id: 'student-portal', label: 'Student Portal' },
  { id: 'teacher-portal', label: 'Teacher Portal' },
  { id: 'results-portal', label: 'Results Portal' },
  { id: 'student-attendance', label: 'Student Attendance' },
  { id: 'teacher-attendance', label: 'Teacher Attendance' },
  { id: 'fee-management', label: 'Fee Management 2026' },
  { id: 'online-payment', label: 'Online Payment (EasyPaisa)' },
  { id: 'exam-management', label: 'Examination Management' },
  { id: 'timetable', label: 'Class Timetable' },
  { id: 'announcements', label: 'Notices & Announcements' },
  { id: 'admin-dashboard', label: 'Admin Dashboard' },
  { id: 'contact', label: 'Contact Us' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onSelectRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-emerald-800 shadow-sm">
      {/* 1. MANDATORY DEVELOPER CREDIT BANNER (YELLOW & GREEN PALETTE) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white py-2 px-4 border-b-2 border-yellow-400">
        <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left relative z-10">
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-black tracking-wider text-yellow-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-emerald-100">
            <span className="hidden md:inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              Brewery Road, Quetta
            </span>
            <a href="tel:03327185311" className="hidden lg:inline-flex items-center gap-1 text-yellow-300 hover:text-white font-bold transition-colors">
              <Phone className="w-3.5 h-3.5 text-yellow-400" />
              03327185311
            </a>
            {/* Quick Demo Persona Switcher */}
            <div className="flex items-center gap-1.5 bg-emerald-950 px-2.5 py-1 rounded-full border border-yellow-400/50 text-xs shadow-inner">
              <span className="text-emerald-300 font-bold">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onSelectRole(e.target.value as any)}
                className="bg-transparent text-yellow-300 font-black focus:outline-none cursor-pointer"
                title="Switch active session role"
              >
                <option value="guest" className="bg-emerald-950 text-white">Public / Guest</option>
                <option value="admin" className="bg-emerald-950 text-white">Administrator / Principal</option>
                <option value="teacher" className="bg-emerald-950 text-white">Teacher / Faculty</option>
                <option value="student" className="bg-emerald-950 text-white">Student Portal</option>
                <option value="fee_staff" className="bg-emerald-950 text-white">Fee Accounts Officer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO & BRANDING BAR WITH PROFESSIONAL STYLISH LOGO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 bg-gradient-to-r from-emerald-50/50 via-white to-yellow-50/40">
        <div className="flex items-center justify-between">
          {/* Professional Stylish Logo */}
          <div
            onClick={() => onSelectTab('home')}
            className="cursor-pointer group select-none"
          >
            <SchoolLogo size="md" showText={true} variant="dark" />
          </div>

          {/* Quick Header CTAs in Yellow & Green */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={() => onSelectTab('online-payment')}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-green-800 hover:from-emerald-700 hover:to-green-700 text-yellow-300 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all cursor-pointer border-2 border-yellow-400"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              EasyPaisa: 03327185311
            </button>
            <button
              onClick={() => onSelectTab('enrollment')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-yellow-400 text-emerald-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer border border-yellow-500/50"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              Enrollment 2026
            </button>
            <button
              onClick={() => onSelectTab('fee-management')}
              className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all cursor-pointer border-2 border-yellow-400"
            >
              <Award className="w-4 h-4 text-yellow-400" />
              Fee Records 2026
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-emerald-950 hover:bg-emerald-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. NAVIGATION MENU (ALL 13 PAGES IN DEEP EMERALD GREEN & GOLDEN YELLOW) */}
      <nav className="bg-emerald-950 border-t-2 border-emerald-900 shadow-inner hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all rounded-md relative cursor-pointer ${
                    isActive
                      ? 'text-yellow-300 bg-emerald-900 shadow-sm font-black'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-1 bg-yellow-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-900 px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-emerald-900 text-yellow-300 border-l-4 border-yellow-400'
                    : 'text-emerald-100 hover:bg-emerald-900/50'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="text-xs text-yellow-300 font-mono">Active</span>}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
