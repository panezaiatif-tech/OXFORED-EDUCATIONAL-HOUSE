export type UserRole = 'admin' | 'principal' | 'teacher' | 'student' | 'fee_staff';

export interface UserSession {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  studentId?: string;
  teacherId?: string;
  rollNumber?: string;
}

// 11 Exact Learning Levels
export const LEARNING_LEVELS = [
  'Level Kids',
  'Level Biggener',
  'Level One',
  'Level Two',
  'Level Three',
  'Level Four',
  'Level Five',
  'Level Six',
  'Level Advance',
  'Nazra e Quran',
  'Caligraphy',
] as const;

export type LearningLevel = (typeof LEARNING_LEVELS)[number];

// Tuition Classes from Nursery / Prep to Class 10th
export const TUITION_CLASSES = [
  'Nursery',
  'Prep',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
] as const;

export type TuitionClass = (typeof TUITION_CLASSES)[number];

// Combined list for selection
export const ALL_OFFERINGS = [...LEARNING_LEVELS, ...TUITION_CLASSES] as const;
export type AcademicOffering = (typeof ALL_OFFERINGS)[number];

export const EMPTY_STUDENT_MESSAGE =
  'No officially enrolled students are available in this section yet. Students will appear here after successful enrollment and approval.';

export interface Student {
  id: string;
  rollNumber: string; // Permanent simple numeric value (e.g., "1", "2", "3")
  fullName: string;
  fatherName: string;
  fatherPhone?: string; // Father's mobile phone number
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  photoUrl: string; // Mandatory genuine student photograph
  phone: string;
  address: string;
  previousSchool: string;
  admissionClass: string; // Primary Learning Level or Tuition Class
  secondClass?: string; // Optional second class for double-class enrollment
  isDoubleClass?: boolean; // True if enrolled in dual programs / double classes
  enrolledCourses: string[]; // Supports multiple: English Grammar + Tuition classes + Caligraphy + Nazra
  section: string;
  academicSession: string;
  admissionDate: string;
  enrollmentDate?: string;
  status: 'Active' | 'Withdrawn' | 'Admitted' | 'Pending Approval' | 'Inactive';
  qrCodeToken: string; // Unique secure verification signature for attendance scanning
  qrCodeActive: boolean; // Deactivated when card lost/replaced
  requiredDocuments: string[];
  createdAt: string;
  photoVerified?: boolean;
  verificationNotes?: string;
  notes?: string;
}

export interface Teacher {
  id: string;
  staffId: string;
  fullName: string;
  designation: string;
  department: string;
  subject: string;
  assignedSubjects: string[];
  assignedLevelsOrClasses: string[];
  phone: string;
  email: string;
  joiningDate: string;
  status: 'Active' | 'On Leave';
  qualification: string;
}

export interface EnrollmentApplication {
  id: string;
  fullName: string;
  fatherName: string;
  fatherPhone?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  photoUrl: string; // Mandatory photograph data URL
  phone: string;
  address: string;
  previousSchool: string;
  admissionClass: string; // Primary class or level
  secondClass?: string; // Optional second class for double-class enrollment
  isDoubleClass?: boolean; // Optional dual course flag
  enrolledCourses?: string[]; // Multiple course selection (e.g. Grammar + Tuition)
  section: string;
  academicSession: string;
  admissionDate: string;
  requiredDocuments: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  generatedRollNumber?: string;
  studentId?: string;
  reviewRemarks?: string;
  photoVerificationStatus?: 'Genuine User Upload' | 'Needs Review';
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave Approved';

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  rollNumber: string; // Permanent roll number
  studentName: string;
  photoUrl?: string;
  class: string; // Learning level or tuition class
  course?: string; // Specific course session (e.g., "English Grammar", "Tuition Class 6")
  section: string;
  date: string; // YYYY-MM-DD
  scanTime?: string; // Exact time of scan (e.g. 08:35:10 AM)
  scanMethod?: 'QR_CAMERA' | 'MANUAL_TEACHER';
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface QrScanResult {
  success: boolean;
  message: string;
  duplicate?: boolean;
  invalid?: boolean;
  student?: Student;
  attendanceRecord?: StudentAttendanceRecord;
  course?: string;
  scanTime?: string;
}

export interface CourseAttendanceSummary {
  course: string;
  totalSessions: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  staffId: string;
  teacherName: string;
  assignedSubjects: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  leaveDetails?: string;
  markedBy: string;
}

export type ExamType =
  | 'First Periodic Test'
  | 'Second Periodic Test'
  | 'Midterm Examination'
  | 'Final Examination';

export interface ExamSubjectMark {
  subject: string;
  subjectName?: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks?: string;
}

export interface ExamResult {
  id: string;
  examName: ExamType;
  studentId: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  class: string;
  section: string;
  session: string;
  isPublished: boolean;
  subjects: ExamSubjectMark[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  finalGrade: string;
  passFailStatus: 'Pass' | 'Fail';
  teacherRemarks: string;
  principalRemarks: string;
  publishedAt?: string;
  updatedBy: string;
}

export type FeePaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Fee Waived';

export interface FeeAccount2026 {
  id: string;
  studentId: string; // Permanent foreign key to Student.id
  rollNumber: string; // Permanent simple numeric roll number
  studentName: string;
  fatherName: string;
  class: string; // Learning Level or Tuition Class
  section: string;
  admissionDate: string;
  guardianPhone: string;
  academicSession: string;
  monthlyTuitionFee: number;
  admissionFee: number;
  otherApprovedCharges: number;
  discountsOrWaivers: number;
  totalFeeDue: number;
  amountPaid: number;
  remainingBalance: number; // formula: totalFeeDue - amountPaid
  paymentStatus: FeePaymentStatus;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type Month2026 =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

export interface MonthlyFeeRecord2026 {
  id: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  class: string;
  month: Month2026;
  monthlyTuitionFee: number;
  otherApplicableCharges: number;
  discounts: number;
  totalAmountDue: number;
  amountPaid: number;
  remainingBalance: number;
  paymentDueDate: string;
  paymentStatus: FeePaymentStatus;
  paymentDate?: string;
  receiptNumber?: string;
  paymentMethod?: string;
}

export interface FeePaymentReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  rollNumber: string;
  class: string;
  section: string;
  feeMonthOrPeriod: string;
  totalDue: number;
  amountPaid: number;
  remainingBalance: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer / EasyPaisa / JazzCash' | 'Online' | 'Cheque';
  authorizedStaff: string;
  notes?: string;
}

export interface TimetableItem {
  id: string;
  class: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Exams' | 'Holidays' | 'Notices' | 'Fee Reminder' | 'Admissions';
  content: string;
  targetAudience: 'all' | 'students' | 'teachers';
  publishDate: string;
  isUrgent?: boolean;
  author: string;
}

export type AuditActionType =
  | 'FEE_STRUCTURE_CHANGED'
  | 'FEE_CONFIG_UPDATED'
  | 'FEE_PAYMENT_RECORDED'
  | 'ENROLLMENT_STATUS_UPDATED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'MANUAL_ATTENDANCE_CORRECTION'
  | 'STUDENT_ATTENDANCE_MARKED'
  | 'TEACHER_ATTENDANCE_RECORDED'
  | 'EXAM_RESULT_PUBLISHED'
  | 'EXAM_RESULT_SAVED'
  | 'STUDENT_RECORD_MODIFIED'
  | 'STUDENT_LEVEL_CHANGED'
  | 'ONLINE_PAYMENT_SUBMITTED'
  | 'ONLINE_PAYMENT_VERIFIED'
  | 'SETTINGS_UPDATED'
  | 'SYSTEM_INITIALIZATION';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  action: string;
  actionType: AuditActionType;
  performedBy: string;
  role?: string;
  targetEntity?: string;
  targetId?: string;
  targetName?: string;
  details: string;
  previousState?: Record<string, any> | string;
  newState?: Record<string, any> | string;
  severity: AuditSeverity;
  ipAddress?: string;
  timestamp: string;
}

export interface OnlinePaymentSubmission {
  id: string;
  trackingNumber: string;
  studentId?: string;
  rollNumber: string;
  studentName: string;
  fatherName?: string;
  class: string;
  paymentMethod: 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';
  easypaisaNumber: string; // 03327185311
  senderMobile: string;
  senderName: string;
  transactionId: string; // EasyPaisa TID
  amountPaid: number;
  month: Month2026;
  feeType: 'Tuition Fee' | 'Admission Fee' | 'Examination Fee' | 'Full Package';
  screenshotUrl?: string;
  status: 'Pending Verification' | 'Approved & Verified' | 'Rejected';
  submissionDate: string;
  adminNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  developerCredit: string;
  location: string;
  phone: string;
  easypaisaNumber?: string;
  email: string;
  admissionOpen: boolean;
  academicYear: string;
  admissionFeeDefault: number;
  monthlyFeeDefault: Record<string, number>;
}

