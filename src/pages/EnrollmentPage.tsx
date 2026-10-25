import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Printer,
  RotateCcw,
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  School,
  Upload,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Users,
  Image as ImageIcon,
  Check,
  Layers,
  CalendarCheck,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  EnrollmentApplication,
  Student,
  LEARNING_LEVELS,
  TUITION_CLASSES,
  EMPTY_STUDENT_MESSAGE,
} from '../types';
import { SchoolLogo } from '../components/SchoolLogo';
import { StudentIdCard } from '../components/StudentIdCard';

interface EnrollmentPageProps {
  onNavigateToFees?: () => void;
  onNavigateToStudentPortal?: (rollNumber?: string) => void;
  onNavigateToAttendance?: () => void;
  isAdmin?: boolean;
}

export const EnrollmentPage: React.FC<EnrollmentPageProps> = ({
  onNavigateToFees,
  onNavigateToStudentPortal,
  onNavigateToAttendance,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'admission-form' | 'public-directory'>('admission-form');

  const initialForm = {
    fullName: '',
    fatherName: '',
    fatherPhone: '',
    dob: '2014-06-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    photoUrl: '', // Mandatory user upload
    phone: '',
    address: 'Brewery Road near SBK University, Quetta',
    previousSchool: '',
    admissionClass: 'Level Kids',
    isDoubleClass: false,
    secondClass: 'Class 5',
    section: 'A',
    academicSession: '2026-2027',
    admissionDate: new Date().toISOString().split('T')[0],
    requiredDocuments: ['B-Form / Birth Certificate', '4 Passport Photos', 'Father / Guardian CNIC Copy'],
    autoApprove: true,
  };

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    application: EnrollmentApplication;
    student?: Student;
  } | null>(null);

  // Real students directory (Public list)
  const [publicStudents, setPublicStudents] = useState<Student[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  useEffect(() => {
    if (activeTab === 'public-directory') {
      loadPublicDirectory();
    }
  }, [activeTab]);

  const loadPublicDirectory = async () => {
    setLoadingPublic(true);
    try {
      const all = await api.getStudents();
      setPublicStudents(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPublic(false);
    }
  };

  const getCourseFee = (courseName: string): number => {
    if (!courseName) return 1500;
    if (courseName.includes('Nazra')) return 600;
    if (courseName.includes('Caligraphy')) return 1000;
    if (courseName.includes('Tuition') || courseName.startsWith('Class ') || courseName === 'Prep' || courseName === 'Nursery') return 1000;
    if (courseName.includes('Level')) return 1500;
    return 1500;
  };

  const handleDocToggle = (doc: string) => {
    setForm((prev) => {
      const exists = prev.requiredDocuments.includes(doc);
      return {
        ...prev,
        requiredDocuments: exists
          ? prev.requiredDocuments.filter((d) => d !== doc)
          : [...prev.requiredDocuments, doc],
      };
    });
  };

  // Mandatory Photograph Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats: JPG, JPEG, PNG, WebP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Unsupported format. Please upload a genuine photograph in JPG, JPEG, PNG, or WebP format.');
      return;
    }

    // Size check: Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size exceeds 5MB limit. Please upload a clear passport photograph under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setForm((prev) => ({ ...prev, photoUrl: base64 }));
        setPhotoFileName(file.name);
      }
    };
    reader.onerror = () => {
      setPhotoError('Failed to read the photograph file. Please try selecting the image again.');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setForm(initialForm);
    setPhotoFileName(null);
    setPhotoError(null);
    setErrorMessage(null);
    setConfirmationData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!form.fullName.trim()) {
      setErrorMessage("Student's full name is required.");
      return;
    }
    if (!form.fatherName.trim()) {
      setErrorMessage("Father's or guardian's full name is required.");
      return;
    }
    if (!form.photoUrl) {
      setErrorMessage(
        "MANDATORY REQUIREMENT: Please upload the student's genuine recent photograph using the 'Upload Your Own Recent Student Photograph' field."
      );
      return;
    }
    if (!form.phone.trim()) {
      setErrorMessage("Parent or guardian phone number is required.");
      return;
    }
    if (!form.address.trim()) {
      setErrorMessage("Residential address is required.");
      return;
    }

    setSubmitting(true);
    try {
      const enrolledCourses = form.isDoubleClass && form.secondClass
        ? [form.admissionClass, form.secondClass]
        : [form.admissionClass];

      const res = await api.submitEnrollment(
        {
          fullName: form.fullName.trim(),
          fatherName: form.fatherName.trim(),
          fatherPhone: form.fatherPhone.trim() || form.phone.trim(),
          dob: form.dob,
          gender: form.gender,
          photoUrl: form.photoUrl,
          phone: form.phone.trim(),
          address: form.address.trim(),
          previousSchool: form.previousSchool.trim(),
          admissionClass: form.admissionClass,
          secondClass: form.isDoubleClass ? form.secondClass : undefined,
          isDoubleClass: form.isDoubleClass,
          enrolledCourses,
          section: form.section,
          academicSession: form.academicSession,
          admissionDate: form.admissionDate,
          requiredDocuments: form.requiredDocuments,
        },
        form.autoApprove
      );

      setConfirmationData({
        application: res.application,
        student: res.student,
      });

      // Reset form fields
      setForm(initialForm);
      setPhotoFileName(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Enrollment submission failed. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div>
          <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block">
            Admissions Office • Session 2026-2027
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-emerald-950">
            Student Enrollment & Official Register
          </h1>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-emerald-100/70 p-1.5 rounded-2xl border border-emerald-200">
          <button
            type="button"
            onClick={() => setActiveTab('admission-form')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admission-form'
                ? 'bg-emerald-900 text-yellow-400 shadow-md font-black'
                : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            Online Admission Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('public-directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'public-directory'
                ? 'bg-emerald-900 text-yellow-400 shadow-md font-black'
                : 'text-emerald-900 hover:text-emerald-950 hover:bg-emerald-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Public Enrolled Directory</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 2: PUBLIC DIRECTORY ===================== */}
      {activeTab === 'public-directory' && (
        <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-black text-emerald-950">
                Official Enrolled Students Directory
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Publicly verified student list organized by permanent roll number. Confidential information (addresses, guardian contacts, CNIC) is strictly protected.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300">
              Total Enrolled: {publicStudents.length}
            </span>
          </div>

          {loadingPublic ? (
            <div className="py-16 text-center text-slate-400">Loading student directory...</div>
          ) : publicStudents.length === 0 ? (
            <div className="py-16 text-center bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 px-6">
              <Users className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-emerald-950 max-w-lg mx-auto">
                {EMPTY_STUDENT_MESSAGE}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-emerald-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-900 text-yellow-300 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Permanent Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Learning Level / Class</th>
                    <th className="p-3.5">Section</th>
                    <th className="p-3.5">Admission Date</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 font-medium">
                  {publicStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-emerald-50/60 transition-colors">
                      <td className="p-3.5 font-mono font-black text-emerald-900 text-sm">
                        {st.rollNumber}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                        <img
                          src={st.photoUrl}
                          alt={st.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-300 shrink-0"
                        />
                        <span>{st.fullName}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-1 rounded-md bg-yellow-100 text-emerald-950 font-bold border border-yellow-300">
                            {st.admissionClass}
                          </span>
                          {st.secondClass && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-black text-[10px] border border-amber-300 flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5 text-amber-700" />
                              <span>Double: {st.secondClass}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono">{st.section}</td>
                      <td className="p-3.5 font-mono text-slate-500">{st.admissionDate}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Admitted</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 1: ADMISSION FORM ===================== */}
      {activeTab === 'admission-form' && (
        <>
          {/* SUCCESS ADMISSION SLIP (IF SUBMITTED) */}
          {confirmationData && (
            <div className="bg-white rounded-3xl border-4 border-yellow-400 p-6 sm:p-10 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-100">
                <SchoolLogo size="lg" />
                <div className="text-right">
                  <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs uppercase tracking-wider inline-block">
                    Official Admission Confirmation
                  </span>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Application ID: {confirmationData.application.id}
                  </p>
                </div>
              </div>

              {/* Confirmation Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-emerald-50/60 p-6 rounded-2xl border-2 border-emerald-200">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Student Information
                  </span>
                  <div>
                    <h3 className="text-xl font-serif font-black text-emerald-950">
                      {confirmationData.application.fullName}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Father: <strong>{confirmationData.application.fatherName}</strong>
                    </p>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      Phone: {confirmationData.application.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Assigned Program & Date
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      Primary Class:{' '}
                      <span className="bg-yellow-300/80 px-2.5 py-0.5 rounded text-emerald-950 font-black">
                        {confirmationData.application.admissionClass}
                      </span>
                    </p>
                    {confirmationData.application.secondClass && (
                      <p className="text-sm font-bold text-emerald-950 mt-1">
                        Double Class:{' '}
                        <span className="bg-amber-400 px-2.5 py-0.5 rounded text-emerald-950 font-black">
                          {confirmationData.application.secondClass}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">
                      Section: {confirmationData.application.section} • Session: {confirmationData.application.academicSession}
                    </p>
                    <p className="text-xs text-slate-600 font-mono mt-1">
                      Admission Date: {confirmationData.application.admissionDate}
                    </p>
                  </div>
                </div>

                {/* Displayed Permanent Roll Number */}
                <div className="space-y-2 bg-emerald-900 text-white p-5 rounded-2xl border-2 border-yellow-400 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest">
                    Permanent Official Roll Number
                  </span>
                  <div className="text-4xl font-mono font-black text-yellow-400 tracking-wider">
                    {confirmationData.student?.rollNumber || confirmationData.application.generatedRollNumber || '1'}
                  </div>
                  <span className="text-[10px] text-emerald-200 font-medium">
                    Permanent identifier started at 1
                  </span>
                </div>
              </div>

              {/* Automatic Attendance Register Enrolled Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white border-2 border-yellow-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-yellow-300">
                      Auto-Enrolled in Student Daily Attendance System!
                    </h4>
                    <p className="text-[11px] text-emerald-100">
                      Roll Number <strong>#{confirmationData.student?.rollNumber || '1'}</strong> is now instantly active in the attendance register for authorized check-in & check-out.
                    </p>
                  </div>
                </div>

                {onNavigateToAttendance && (
                  <button
                    type="button"
                    onClick={onNavigateToAttendance}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer shrink-0"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Open Attendance Register</span>
                  </button>
                )}
              </div>

              {/* Generated Bi-Sided Student ID Card Component */}
              {confirmationData.student && (
                <div className="pt-2">
                  <StudentIdCard student={confirmationData.student} />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-yellow-400" />
                  <span>Print Admission Slip & ID Card</span>
                </button>

                <div className="flex items-center gap-2">
                  {onNavigateToAttendance && (
                    <button
                      type="button"
                      onClick={onNavigateToAttendance}
                      className="px-4 py-2 rounded-xl bg-emerald-950 text-yellow-400 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-yellow-400"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Daily Attendance</span>
                    </button>
                  )}
                  {onNavigateToStudentPortal && confirmationData.student && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToStudentPortal(confirmationData.student?.rollNumber)
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Open Student Portal</span>
                    </button>
                  )}
                  {onNavigateToFees && (
                    <button
                      type="button"
                      onClick={onNavigateToFees}
                      className="px-4 py-2 rounded-xl bg-yellow-400 text-emerald-950 hover:bg-yellow-500 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>View Fee Account</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ADMISSION FORM CONTAINER */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="border-b border-emerald-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-emerald-950">
                New Student Admission Application
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please complete all fields with genuine personal information. The uploaded photograph will be permanently associated with your official student record.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION A: MANDATORY PHOTOGRAPH UPLOAD */}
              <div className="bg-yellow-50/70 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-sm sm:text-base font-serif font-black text-emerald-950 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-yellow-600" />
                      <span>Upload Your Own Recent Student Photograph</span>
                      <span className="text-red-600 font-bold">*</span>
                    </label>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Accepts JPG, JPEG, PNG, or WebP (Max 5MB). AI-generated or stock photos are strictly prohibited by school policy.
                    </p>
                  </div>

                  {form.photoUrl && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300 flex items-center gap-1 self-start sm:self-auto">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Genuine Upload Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  {/* Photo Preview Card */}
                  <div className="w-32 h-36 rounded-2xl border-2 border-dashed border-emerald-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group shadow-sm">
                    {form.photoUrl ? (
                      <>
                        <img
                          src={form.photoUrl}
                          alt="Student Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-emerald-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold text-center p-2">
                          Click below to replace
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <Upload className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">No Photo Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3 w-full">
                    <input
                      type="file"
                      id="student-photo-upload"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    <label
                      htmlFor="student-photo-upload"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 text-yellow-400 font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    >
                      <Upload className="w-4 h-4 text-yellow-400" />
                      <span>
                        {form.photoUrl ? 'Replace Selected Photograph' : 'Select Photograph from Device'}
                      </span>
                    </label>

                    {photoFileName && (
                      <p className="text-xs font-mono text-emerald-900 font-medium">
                        Selected: <strong>{photoFileName}</strong>
                      </p>
                    )}

                    {photoError && (
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{photoError}</span>
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500">
                      Requirement: A clear, front-facing passport photograph with white or light blue background.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION B: STUDENT & GUARDIAN PERSONAL DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Student's Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Hamza Panezai"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Father's or Guardian's Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abdul Qadir Panezai"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent or Guardian's Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +92 333 7812901"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Previous School Name (If Applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quetta Public Model School"
                    value={form.previousSchool}
                    onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Residential Address (Quetta Region) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street address, colony, and landmark..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              {/* SECTION C: LEARNING LEVEL OR TUITION CLASS SELECTION */}
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4">
                <div>
                  <h3 className="text-sm font-serif font-black text-emerald-950">
                    Academic Program: 11 Learning Levels & Tuition Classes
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Faculty mentors: <strong>SIR ABBAS</strong> (English Grammar & Senior Tuitions), <strong>SIR SHARIFULLAH</strong> (Caligraphy & Nazra e Quran), <strong>SIR SHAKIR</strong> (Primary Tuitions Nursery to Class 4), and <strong>SIR ATLAS</strong> (Middle Tuitions Class 5 to 7th Class).
                  </p>
                  <div className="mt-2 p-2.5 rounded-xl bg-yellow-50 border border-yellow-300 text-[11px] text-emerald-950 font-semibold space-y-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>• Grammar (Kids to Advance): <strong>Rs. 1,500/mo</strong></span>
                      <span>• Tuition Classes: <strong>Rs. 1,000/mo per subject</strong></span>
                      <span>• Caligraphy: <strong>Rs. 1,000/mo</strong></span>
                      <span>• Nazra e Quran: <strong>Rs. 600/mo</strong></span>
                    </div>
                    <p className="text-red-700 font-bold">
                      ⚠️ Strict Rule: Every student must pay their monthly fee between the 1st and 5th of each month; otherwise the student will be removed from their class.
                    </p>
                  </div>
                </div>

                {/* Primary Class & Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                      <span>Primary Assigned Level or Tuition Class <span className="text-red-500">*</span></span>
                      <span className="text-[11px] font-mono text-emerald-800 font-black">
                        Rs. {getCourseFee(form.admissionClass).toLocaleString()}/mo
                      </span>
                    </label>
                    <select
                      value={form.admissionClass}
                      onChange={(e) => setForm({ ...form, admissionClass: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 text-sm font-bold text-emerald-950 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none bg-white"
                    >
                      <optgroup label="11 Official Learning Levels (English Grammar & Islamic Studies)">
                        {LEARNING_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level} — Rs. {getCourseFee(level).toLocaleString()}/mo
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Tuition Classes (Nursery to Class 10th)">
                        {TUITION_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            Tuition: {cls} — Rs. {getCourseFee(cls).toLocaleString()}/subject
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Section
                    </label>
                    <select
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 outline-none bg-white"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </div>

                {/* Optional Double Class Choice */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isDoubleClass}
                        onChange={(e) => setForm({ ...form, isDoubleClass: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-2 border-emerald-600 text-emerald-900 focus:ring-yellow-400 accent-emerald-900 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-serif font-black text-emerald-950 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-amber-600" />
                          <span>Enroll in Double Classes / Dual Program (Optional Choice)</span>
                        </span>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          Enables taking both English Grammar AND Tuition Classes (or two different tuition levels) simultaneously under ONE unique roll number.
                        </p>
                      </div>
                    </label>

                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shrink-0 ${
                      form.isDoubleClass ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {form.isDoubleClass ? '⚡ Double Class Active' : 'Single Class'}
                    </span>
                  </div>

                  {form.isDoubleClass && (
                    <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center justify-between">
                          <span>Select Second Class / Additional Offering</span>
                          <span className="text-[11px] font-mono text-amber-900 font-black">
                            Rs. {getCourseFee(form.secondClass).toLocaleString()}/mo
                          </span>
                        </label>
                        <select
                          value={form.secondClass}
                          onChange={(e) => setForm({ ...form, secondClass: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-amber-400 text-sm font-bold text-emerald-950 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none bg-amber-50/40"
                        >
                          <optgroup label="Tuition Classes (Nursery to Class 10th)">
                            {TUITION_CLASSES.map((cls) => (
                              <option key={cls} value={cls}>
                                Tuition: {cls} — Rs. {getCourseFee(cls).toLocaleString()}/subject
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="11 Official Learning Levels (English Grammar & Quranic Studies)">
                            {LEARNING_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level} — Rs. {getCourseFee(level).toLocaleString()}/mo
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Live Combined Fee Breakdown Box */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white border-2 border-yellow-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                        <div className="space-y-1">
                          <span className="text-[10px] text-yellow-300 uppercase tracking-widest font-black block">
                            Combined Dual-Class Monthly Fee Calculation
                          </span>
                          <p className="text-emerald-100 text-xs">
                            Primary ({form.admissionClass}): <strong>Rs. {getCourseFee(form.admissionClass).toLocaleString()}</strong> + Second ({form.secondClass}): <strong>Rs. {getCourseFee(form.secondClass).toLocaleString()}</strong>
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-yellow-300 font-semibold block uppercase">Total Monthly Tuition</span>
                          <span className="text-2xl font-black font-mono text-yellow-400">
                            Rs. {(getCourseFee(form.admissionClass) + getCourseFee(form.secondClass)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-950 space-y-0.5">
                        <div className="font-bold flex items-center gap-1 text-emerald-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Single Roll Number & Dual Attendance Session Tracking:</span>
                        </div>
                        <p className="text-slate-600">
                          Both classes will be assigned to <strong>one unique roll number</strong> without duplicate records. Your ID card will feature both courses, and attendance can be scanned separately for each session.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Form</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl bg-yellow-400 text-emerald-950 text-xs font-black uppercase tracking-wider hover:bg-yellow-500 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>{submitting ? 'Processing Enrollment...' : 'Submit Student Enrollment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
