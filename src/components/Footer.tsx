import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  phone?: string;
  email?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  phone = '03327185311',
  email = 'info@oxfored.edu.pk',
}) => {
  const [showPolicyModal, setShowPolicyModal] = useState<string | null>(null);

  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t-4 border-yellow-400">
      {/* Upper Footer in Green & Yellow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Identity & Mandatory School Location */}
          <div className="space-y-4 lg:col-span-1">
            <SchoolLogo size="sm" showText={true} variant="light" />

            {/* MANDATORY EXACT LOCATION SPECIFICATION */}
            <div className="bg-emerald-900/60 p-4 rounded-2xl border-2 border-yellow-400/60 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-yellow-300">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span className="font-bold tracking-wide">
                  Location: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 leading-relaxed pl-6">
                Premier institutional campus providing secondary and matriculation education, advanced science laboratories, and digital student management.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-100">
                <Phone className="w-4 h-4 text-yellow-400" />
                <a href="tel:03327185311" className="text-yellow-300 font-bold hover:underline tracking-wider">
                  03327185311
                </a>
                <span className="text-[10px] text-emerald-300">(Call & WhatsApp)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Mail className="w-4 h-4 text-yellow-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>Office Hours: Mon–Sat, 8:00 AM – 2:00 PM (PKT)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-4 border-b border-emerald-800 pb-2">
              Academic Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('home')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('enrollment')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Student Online Enrollment 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('student-portal')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Student Login Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('teacher-portal')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Teacher Portal & Check-in
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('results-portal')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Examination Results & Marksheets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('timetable')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Class Schedules & Timetable
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Administration & 2026 Management */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-4 border-b border-emerald-800 pb-2">
              School Management
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('fee-management')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer text-yellow-300 font-bold"
                >
                  Fee Management System 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('online-payment')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer text-emerald-300 font-bold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                  EasyPaisa Fee Payment (03327185311)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('student-attendance')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Daily Student Attendance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('teacher-attendance')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Teacher Attendance & Biometric
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('admin-dashboard')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Admin & Audit Log Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('exam-management')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Examination Setup & Moderation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('announcements')}
                  className="hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Notices & School Circulars
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Developer Credit & Accreditation */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-4 border-b border-emerald-800 pb-2">
              System Developer
            </h4>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-green-950 border-2 border-yellow-400/60 text-xs space-y-3">
              <div className="flex items-center gap-2 text-yellow-400 font-black">
                <Sparkles className="w-4 h-4" />
                <span>Lead Architect</span>
              </div>
              <p className="font-bold text-yellow-300 text-sm leading-snug">
                MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN
              </p>
              <p className="text-[11px] text-emerald-200">
                Specialized in custom educational ERPs, high-concurrency student records, automated roll number engines, and AI integration.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs">
              <button
                onClick={() => setShowPolicyModal('privacy')}
                className="text-emerald-300 hover:text-yellow-300 underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setShowPolicyModal('terms')}
                className="text-emerald-300 hover:text-yellow-300 underline cursor-pointer"
              >
                Terms & Conditions
              </button>
              <span>•</span>
              <button
                onClick={() => onSelectTab('contact')}
                className="text-emerald-300 hover:text-yellow-300 underline cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-900 bg-emerald-950/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300 gap-2">
          <p>© 2026 OXFORED EDUCATIONAL HOUSE. All rights reserved. Academic Session 2026-2027.</p>
          <p className="text-yellow-400 font-mono text-[11px] font-bold">
            Engineered by Atif Panezai • Quetta, Pakistan
          </p>
        </div>
      </div>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-emerald-950 text-white rounded-2xl max-w-lg w-full p-6 border-2 border-yellow-400 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {showPolicyModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
              </h3>
              <button
                onClick={() => setShowPolicyModal(null)}
                className="text-emerald-300 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-emerald-100 space-y-3 leading-relaxed max-h-80 overflow-y-auto pr-2">
              {showPolicyModal === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Student Data Protection:</strong> Oxfored Educational House strictly protects all student academic records, admission details, CNIC/B-Forms, and financial transaction histories.
                  </p>
                  <p>
                    <strong>2. Access Control & Audit Trails:</strong> Every critical administrative change is tracked by the internal AuditLogManager to ensure complete accountability.
                  </p>
                  <p>
                    <strong>3. Location Verification:</strong> All campus records are governed by the institution located at Brewery Road Quetta near SBK University opposite Micro Coloni.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Admission & Roll Numbers:</strong> Admitted students receive an official, non-transferable roll number (e.g. OX-2026-CLASSX-XXXX) linked to the 2026 fee system.
                  </p>
                  <p>
                    <strong>2. Fee Policy:</strong> Monthly tuition fees must be cleared by the 10th of each academic calendar month in 2026.
                  </p>
                  <p>
                    <strong>3. Examination Integrity:</strong> Results published on this portal represent the official marks verified by the Board of Examination of Oxfored Educational House.
                  </p>
                </>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPolicyModal(null)}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
