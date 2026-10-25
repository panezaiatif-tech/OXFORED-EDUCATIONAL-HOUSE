import {
  Student,
  Teacher,
  EnrollmentApplication,
  StudentAttendanceRecord,
  TeacherAttendanceRecord,
  ExamResult,
  FeeAccount2026,
  MonthlyFeeRecord2026,
  FeePaymentReceipt,
  OnlinePaymentSubmission,
  TimetableItem,
  Announcement,
  AuditLog,
  SchoolSettings,
  FeePaymentStatus,
} from '../types';

export const api = {
  // Settings
  async getSettings(): Promise<SchoolSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },
  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Students
  async getStudents(filters?: {
    class?: string;
    admissionClass?: string;
    section?: string;
    search?: string;
  }): Promise<Student[]> {
    const res = await fetch('/api/students');
    const all: Student[] = await res.json();
    if (!filters) return all;
    const targetClass = filters.admissionClass || filters.class;
    return all.filter((s) => {
      if (targetClass && targetClass !== 'All') {
        const matchesPrimary = s.admissionClass === targetClass;
        const matchesSecond = s.secondClass === targetClass;
        const matchesCourse = s.enrolledCourses && s.enrolledCourses.some(
          (c) => c === targetClass || c.includes(targetClass) || targetClass.includes(c)
        );
        if (!matchesPrimary && !matchesSecond && !matchesCourse) return false;
      }
      if (filters.section && filters.section !== 'All' && s.section !== filters.section) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!s.fullName.toLowerCase().includes(q) && !s.rollNumber.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },
  async getStudentById(id: string): Promise<Student> {
    const res = await fetch(`/api/students/${id}`);
    if (!res.ok) throw new Error('Student not found');
    return res.json();
  },
  async getStudentByRoll(roll: string): Promise<Student> {
    const res = await fetch(`/api/students/roll/${encodeURIComponent(roll.trim())}`);
    if (!res.ok) throw new Error('Student with this roll number not found');
    return res.json();
  },
  async studentLogin(roll: string, _password?: string): Promise<Student> {
    const res = await fetch(`/api/students/roll/${encodeURIComponent(roll.trim())}`);
    if (!res.ok) throw new Error('Invalid Roll Number or Student not found in official admissions');
    return res.json();
  },
  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
  },
  async moveStudentLevel(
    studentId: string,
    newLevelOrClass: string,
    reason?: string,
    authorizedBy?: string
  ): Promise<{ student: Student; feeAccount: FeeAccount2026 }> {
    const res = await fetch(`/api/students/${studentId}/move-level`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newLevelOrClass, reason, authorizedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to move student level');
    }
    return res.json();
  },

  // Enrollment
  async getApplications(): Promise<EnrollmentApplication[]> {
    const res = await fetch('/api/applications');
    return res.json();
  },
  async submitEnrollment(
    data: any,
    autoApprove = false
  ): Promise<{ application: EnrollmentApplication; student?: Student; feeAccount?: FeeAccount2026 }> {
    const res = await fetch('/api/enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, autoApprove }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Enrollment submission failed');
    }
    return res.json();
  },
  async approveApplication(
    id: string,
    adminName?: string
  ): Promise<{ application: EnrollmentApplication; student: Student; feeAccount: FeeAccount2026 }> {
    const res = await fetch(`/api/applications/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Approval failed');
    }
    return res.json();
  },
  async rejectApplication(id: string, reason: string): Promise<EnrollmentApplication> {
    const res = await fetch(`/api/applications/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Rejection failed');
    }
    return res.json();
  },

  // Fee Management 2026
  async getFeeAccounts(filters?: {
    class?: string;
    paymentStatus?: FeePaymentStatus | 'All';
  }): Promise<FeeAccount2026[]> {
    const res = await fetch('/api/fees/accounts');
    const accounts: FeeAccount2026[] = await res.json();
    if (!filters) return accounts;
    return accounts.filter((acc) => {
      if (filters.class && filters.class !== 'All' && acc.class !== filters.class) return false;
      if (filters.paymentStatus && filters.paymentStatus !== 'All' && acc.paymentStatus !== filters.paymentStatus)
        return false;
      return true;
    });
  },
  async getFeeAccountByRoll(rollNumber: string): Promise<FeeAccount2026 | null> {
    const accounts = await this.getFeeAccounts();
    return accounts.find((a) => a.rollNumber.trim() === rollNumber.trim()) || null;
  },
  async getFeeAccountDetails(
    studentId: string
  ): Promise<{ account: FeeAccount2026; monthly: MonthlyFeeRecord2026[]; receipts: FeePaymentReceipt[] }> {
    const res = await fetch(`/api/fees/accounts/${studentId}`);
    if (!res.ok) throw new Error('Fee account not found');
    return res.json();
  },
  async getMonthlyFees(studentId?: string): Promise<MonthlyFeeRecord2026[]> {
    if (studentId) {
      const details = await this.getFeeAccountDetails(studentId);
      return details.monthly;
    }
    const accounts = await this.getFeeAccounts();
    const allMonthly: MonthlyFeeRecord2026[] = [];
    for (const acc of accounts) {
      try {
        const d = await this.getFeeAccountDetails(acc.studentId);
        allMonthly.push(...d.monthly);
      } catch {
        // continue
      }
    }
    return allMonthly;
  },
  async recordFeePayment(paymentData: {
    studentId?: string;
    feeAccountId?: string;
    amount?: number;
    amountPaid?: number;
    feeMonthOrPeriod: string;
    paymentMethod: string;
    authorizedStaff: string;
    notes?: string;
  }): Promise<{ receipt: FeePaymentReceipt; feeAccount: FeeAccount2026 }> {
    let studentId = paymentData.studentId;
    if (!studentId && paymentData.feeAccountId) {
      const accounts = await this.getFeeAccounts();
      const match = accounts.find((a) => a.id === paymentData.feeAccountId);
      if (match) studentId = match.studentId;
    }
    if (!studentId) {
      throw new Error('Student identifier is required for payment');
    }

    const payload = {
      studentId,
      amountPaid: paymentData.amountPaid ?? paymentData.amount ?? 0,
      feeMonthOrPeriod: paymentData.feeMonthOrPeriod,
      paymentMethod: paymentData.paymentMethod,
      authorizedStaff: paymentData.authorizedStaff,
      notes: paymentData.notes,
    };

    const res = await fetch('/api/fees/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Payment failed');
    }
    return res.json();
  },
  async updateFeeConfig(studentIdOrAccId: string, updates: any): Promise<FeeAccount2026> {
    let studentId = studentIdOrAccId;
    if (studentIdOrAccId.startsWith('fee_acc_') || studentIdOrAccId.startsWith('fee_stu_')) {
      const accounts = await this.getFeeAccounts();
      const match = accounts.find((a) => a.id === studentIdOrAccId);
      if (match) studentId = match.studentId;
    }

    const res = await fetch(`/api/fees/accounts/${studentId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update fee configuration');
    }
    return res.json();
  },
  async updateFeeStructure(studentIdOrAccId: string, updates: any): Promise<FeeAccount2026> {
    return this.updateFeeConfig(studentIdOrAccId, updates);
  },
  async getReceipts(studentId?: string): Promise<FeePaymentReceipt[]> {
    const url = studentId ? `/api/fees/receipts?studentId=${studentId}` : '/api/fees/receipts';
    const res = await fetch(url);
    return res.json();
  },
  async getFeeReceipts(studentId?: string): Promise<FeePaymentReceipt[]> {
    return this.getReceipts(studentId);
  },

  // Online Payments (EasyPaisa 03327185311)
  async getOnlinePayments(): Promise<OnlinePaymentSubmission[]> {
    const res = await fetch('/api/fees/online-payments');
    return res.json();
  },
  async submitOnlinePayment(data: Partial<OnlinePaymentSubmission>): Promise<OnlinePaymentSubmission> {
    const res = await fetch('/api/fees/online-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit online payment proof');
    }
    return res.json();
  },
  async verifyOnlinePayment(
    paymentId: string,
    action: 'approve' | 'reject',
    adminNotes: string,
    authorizedBy?: string
  ): Promise<OnlinePaymentSubmission> {
    const res = await fetch(`/api/fees/online-payments/${paymentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNotes, authorizedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to verify online payment');
    }
    return res.json();
  },

  // Student Attendance
  async getStudentAttendance(filters?: {
    class?: string;
    section?: string;
    date?: string;
    studentId?: string;
    rollNumber?: string;
  }): Promise<StudentAttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.class) params.append('class', filters.class);
    if (filters?.section) params.append('section', filters.section);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    const res = await fetch(`/api/attendance/students?${params.toString()}`);
    const list: StudentAttendanceRecord[] = await res.json();
    if (filters?.rollNumber) {
      return list.filter((r) => r.rollNumber.trim() === filters.rollNumber?.trim());
    }
    return list;
  },
  async markStudentAttendance(records: any[]): Promise<StudentAttendanceRecord[]> {
    const res = await fetch('/api/attendance/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save attendance');
    }
    return res.json();
  },
  async markStudentAttendanceBulk(records: any[]): Promise<StudentAttendanceRecord[]> {
    return this.markStudentAttendance(records);
  },

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    const res = await fetch('/api/teachers');
    return res.json();
  },
  async getTeacherAttendance(filters?: { date?: string; teacherId?: string }): Promise<TeacherAttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    const res = await fetch(`/api/attendance/teachers?${params.toString()}`);
    return res.json();
  },
  async markTeacherAttendance(data: any): Promise<TeacherAttendanceRecord> {
    const res = await fetch('/api/attendance/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to mark teacher attendance');
    }
    return res.json();
  },
  async recordTeacherAttendance(data: any): Promise<TeacherAttendanceRecord> {
    return this.markTeacherAttendance(data);
  },

  // Examinations & Results
  async getExamResults(filters?: {
    rollNumber?: string;
    studentId?: string;
    examName?: string;
    class?: string;
    session?: string;
    isPublished?: boolean;
  }): Promise<ExamResult[]> {
    const params = new URLSearchParams();
    if (filters?.rollNumber) params.append('rollNumber', filters.rollNumber.trim());
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.examName) params.append('examName', filters.examName);
    if (filters?.class) params.append('class', filters.class);
    if (filters?.isPublished !== undefined) params.append('isPublished', String(filters.isPublished));
    const res = await fetch(`/api/exams/results?${params.toString()}`);
    const results: ExamResult[] = await res.json();
    if (filters?.session && filters.session !== 'All') {
      return results.filter((r) => r.session === filters.session);
    }
    return results;
  },
  async saveExamResult(data: any): Promise<ExamResult> {
    const res = await fetch('/api/exams/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save result');
    }
    return res.json();
  },
  async togglePublishResult(id: string, isPublished: boolean, authorizedBy?: string): Promise<ExamResult> {
    const res = await fetch(`/api/exams/results/${id}/publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished, authorizedBy }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to toggle publication');
    }
    return res.json();
  },
  async publishExamResult(id: string, isPublished: boolean, authorizedBy?: string): Promise<ExamResult> {
    return this.togglePublishResult(id, isPublished, authorizedBy);
  },

  // Timetable
  async getTimetables(className?: string): Promise<TimetableItem[]> {
    const url = className && className !== 'All' ? `/api/timetables?class=${encodeURIComponent(className)}` : '/api/timetables';
    const res = await fetch(url);
    return res.json();
  },
  async getTimetable(className?: string): Promise<TimetableItem[]> {
    return this.getTimetables(className);
  },
  async addTimetableItem(item: any): Promise<TimetableItem> {
    const res = await fetch('/api/timetables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return res.json();
  },
  async saveTimetableItem(item: any): Promise<TimetableItem> {
    return this.addTimetableItem(item);
  },
  async deleteTimetableItem(id: string): Promise<boolean> {
    const res = await fetch(`/api/timetables/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch('/api/announcements');
    return res.json();
  },
  async createAnnouncement(data: any): Promise<Announcement> {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async saveAnnouncement(data: any): Promise<Announcement> {
    return this.createAnnouncement(data);
  },

  // Dashboard & Audit
  async getDashboardStats() {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  },
  async getAuditLogs(filters?: {
    actionType?: string;
    severity?: string;
    performedBy?: string;
    targetEntity?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filters?.actionType && filters.actionType !== 'All') params.append('actionType', filters.actionType);
    if (filters?.severity && filters.severity !== 'All') params.append('severity', filters.severity);
    if (filters?.performedBy) params.append('performedBy', filters.performedBy);
    if (filters?.targetEntity && filters.targetEntity !== 'All') params.append('targetEntity', filters.targetEntity);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const qs = params.toString();
    const res = await fetch(qs ? `/api/audit-logs?${qs}` : '/api/audit-logs');
    return res.json();
  },
  async getAuditLogStats() {
    const res = await fetch('/api/audit-logs/stats');
    return res.json();
  },

  // AI Support
  async askRegistrationAi(message: string): Promise<string> {
    const res = await fetch('/api/ai/registration-support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data.reply;
  },
  async askRegistrationSupport(message: string): Promise<{ reply: string }> {
    const reply = await this.askRegistrationAi(message);
    return { reply };
  },
  async askStudentAi(question: string, studentClass?: string, subject?: string): Promise<string> {
    const res = await fetch('/api/ai/student-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, studentClass, subject }),
    });
    const data = await res.json();
    return data.answer;
  },
};
