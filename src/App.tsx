import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AiRegistrationBot } from './components/AiRegistrationBot';

// Pages
import { HomePage } from './pages/HomePage';
import { EnrollmentPage } from './pages/EnrollmentPage';
import { StudentPortalPage } from './pages/StudentPortalPage';
import { TeacherPortalPage } from './pages/TeacherPortalPage';
import { ResultsPortalPage } from './pages/ResultsPortalPage';
import { StudentAttendancePage } from './pages/StudentAttendancePage';
import { TeacherAttendancePage } from './pages/TeacherAttendancePage';
import { FeeManagementPage } from './pages/FeeManagementPage';
import { ExamManagementPage } from './pages/ExamManagementPage';
import { TimetablePage } from './pages/TimetablePage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { OnlinePaymentPage } from './pages/OnlinePaymentPage';
import { UserRole } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentRole, setCurrentRole] = useState<UserRole | 'guest'>('guest');
  const [targetStudentRoll, setTargetStudentRoll] = useState<string | undefined>(undefined);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const handleSelectRole = (role: UserRole | 'guest') => {
    setCurrentRole(role);
    if (role === 'admin') setCurrentTab('admin-dashboard');
    else if (role === 'teacher') setCurrentTab('teacher-portal');
    else if (role === 'student') setCurrentTab('student-portal');
    else if (role === 'fee_staff') setCurrentTab('fee-management');
    else setCurrentTab('home');
  };

  const handleNavigateToStudentPortal = (rollNumber?: string) => {
    if (rollNumber) setTargetStudentRoll(rollNumber);
    setCurrentTab('student-portal');
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'home':
        return <HomePage onSelectTab={setCurrentTab} />;
      case 'enrollment':
        return (
          <EnrollmentPage
            onNavigateToFees={() => setCurrentTab('fee-management')}
            onNavigateToStudentPortal={handleNavigateToStudentPortal}
            onNavigateToAttendance={() => setCurrentTab('student-attendance')}
            isAdmin={currentRole === 'admin'}
            initialTab="admission-form"
          />
        );
      case 'enrolled-students':
        return (
          <EnrollmentPage
            onNavigateToFees={() => setCurrentTab('fee-management')}
            onNavigateToStudentPortal={handleNavigateToStudentPortal}
            onNavigateToAttendance={() => setCurrentTab('student-attendance')}
            isAdmin={currentRole === 'admin'}
            initialTab="public-directory"
          />
        );
      case 'student-portal':
        return <StudentPortalPage initialRollNumber={targetStudentRoll} />;
      case 'teacher-portal':
        return (
          <TeacherPortalPage
            onNavigateToStudentAttendance={() => setCurrentTab('student-attendance')}
            onNavigateToExamManagement={() => setCurrentTab('exam-management')}
          />
        );
      case 'results-portal':
        return <ResultsPortalPage isAdmin={currentRole === 'admin' || currentRole === 'teacher'} />;
      case 'student-attendance':
        return <StudentAttendancePage />;
      case 'teacher-attendance':
        return <TeacherAttendancePage />;
      case 'fee-management':
        return <FeeManagementPage />;
      case 'exam-management':
        return <ExamManagementPage />;
      case 'timetable':
        return <TimetablePage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage onNavigateToTab={setCurrentTab} />;
      case 'contact':
        return <ContactUsPage />;
      case 'online-payment':
        return <OnlinePaymentPage onNavigateToTab={setCurrentTab} />;
      default:
        return <HomePage onSelectTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50/20 text-slate-800 antialiased selection:bg-yellow-400 selection:text-emerald-950">
      {/* Top Banner with Developer Credit & Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Floating 24/7 AI Registration Support Bot */}
      <AiRegistrationBot
        onNavigateToEnrollment={() => setCurrentTab('enrollment')}
        onNavigateToFees={() => setCurrentTab('fee-management')}
      />

      {/* Mandatory Location & Academic Footer */}
      <Footer
        onSelectTab={setCurrentTab}
        phone="03327185311"
        email="info@oxfored.edu.pk"
      />
    </div>
  );
}
