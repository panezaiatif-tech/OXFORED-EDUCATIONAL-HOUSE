import fs from 'fs';
import path from 'path';
import type {
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
  Month2026,
  AuditActionType,
  AuditSeverity,
  QrScanResult,
  CourseAttendanceSummary,
} from '../src/types.ts';
import {
  LEARNING_LEVELS,
  TUITION_CLASSES,
} from '../src/types.ts';
import { auditLogManager } from './AuditLogManager.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'school_database.json');

export interface DatabaseSchema {
  settings: SchoolSettings;
  students: Student[];
  teachers: Teacher[];
  applications: EnrollmentApplication[];
  studentAttendance: StudentAttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  examResults: ExamResult[];
  feeAccounts2026: FeeAccount2026[];
  monthlyFees2026: MonthlyFeeRecord2026[];
  feeReceipts: FeePaymentReceipt[];
  onlinePayments?: OnlinePaymentSubmission[];
  timetables: TimetableItem[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  nextPermanentRollNumber: number;
  vacatedRollNumbers?: string[];
}

const MONTHS_2026: Month2026[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'OXFORED EDUCATIONAL HOUSE',
  tagline: 'Excellence in Education, Character Building & Modern Learning',
  developerCredit: 'MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN',
  location: 'BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI',
  phone: '03327185311',
  easypaisaNumber: '03327185311',
  email: 'info@oxfored.edu.pk',
  admissionOpen: true,
  academicYear: '2026-2027',
  admissionFeeDefault: 5000,
  monthlyFeeDefault: {
    // English Grammar from Level Kids to Level Advance is 1500
    'Level Kids': 1500,
    'Level Biggener': 1500,
    'Level One': 1500,
    'Level Two': 1500,
    'Level Three': 1500,
    'Level Four': 1500,
    'Level Five': 1500,
    'Level Six': 1500,
    'Level Advance': 1500,
    // Nazra e Quran is 600 per student per month
    'Nazra e Quran': 600,
    // Caligraphy is 1000 per student
    'Caligraphy': 1000,
    // Every tuition classes fee is 1000 per subject
    'Nursery': 1000,
    'Prep': 1000,
    'Class 1': 1000,
    'Class 2': 1000,
    'Class 3': 1000,
    'Class 4': 1000,
    'Class 5': 1000,
    'Class 6': 1000,
    'Class 7': 1000,
    'Class 8': 1000,
    'Class 9': 1000,
    'Class 10': 1000,
  },
};

function seedInitialData(): DatabaseSchema {
  // STRICT REAL-STUDENT-ONLY POLICY: No fake or sample students
  const students: Student[] = [];
  const applications: EnrollmentApplication[] = [];
  const studentAttendance: StudentAttendanceRecord[] = [];
  const examResults: ExamResult[] = [];
  const feeAccounts2026: FeeAccount2026[] = [];
  const monthlyFees2026: MonthlyFeeRecord2026[] = [];
  const feeReceipts: FeePaymentReceipt[] = [];

  // FOUR OFFICIAL INSTITUTIONAL TEACHERS
  const teachers: Teacher[] = [
    {
      id: 'tch_01',
      staffId: 'OX-TCH-001',
      fullName: 'SIR ABBAS',
      designation: 'Senior Faculty & Head of English Department',
      department: 'English Language & Board Tuition Academy',
      subject: 'English Grammar (Kids to Advance) & Board Tuitions (8th to 10th)',
      assignedSubjects: [
        'English Grammar',
        'Senior Board Tuitions (Class 8th to 10th)',
      ],
      assignedLevelsOrClasses: [
        'Level Kids',
        'Level Biggener',
        'Level One',
        'Level Two',
        'Level Three',
        'Level Four',
        'Level Five',
        'Level Six',
        'Level Advance',
        'Class 8',
        'Class 9',
        'Class 10',
      ],
      phone: '03327185311',
      email: 'sir.abbas@oxfored.edu.pk',
      joiningDate: '2022-01-10',
      status: 'Active',
      qualification: 'M.A. English Linguistics & Advanced Grammar Specialist',
    },
    {
      id: 'tch_02',
      staffId: 'OX-TCH-002',
      fullName: 'SIR SHARIFULLAH',
      designation: 'Master Instructor of Quranic Sciences & Islamic Calligraphy',
      department: 'Quranic Studies & Calligraphic Arts',
      subject: 'Caligraphy & Nazra e Quran',
      assignedSubjects: ['Caligraphy', 'Nazra e Quran'],
      assignedLevelsOrClasses: ['Caligraphy', 'Nazra e Quran'],
      phone: '03327185311',
      email: 'sir.sharifullah@oxfored.edu.pk',
      joiningDate: '2022-01-15',
      status: 'Active',
      qualification: 'Sanad-e-Faraghat, Hafiz-e-Quran & Certified Khatat',
    },
    {
      id: 'tch_03',
      staffId: 'OX-TCH-003',
      fullName: 'SIR SHAKIR',
      designation: 'Primary Tuition Specialist & Junior Faculty',
      department: 'Junior Primary Tuition Academy',
      subject: 'Tuition Classes (Nursery to Class 4th)',
      assignedSubjects: [
        'Primary Tuitions (Nursery to Class 4)',
        'English, Urdu, Mathematics, General Science',
      ],
      assignedLevelsOrClasses: [
        'Nursery',
        'Prep',
        'Class 1',
        'Class 2',
        'Class 3',
        'Class 4',
      ],
      phone: '03327185311',
      email: 'sir.shakir@oxfored.edu.pk',
      joiningDate: '2023-02-01',
      status: 'Active',
      qualification: 'B.A. Primary Education & Foundational Coaching Expert',
    },
    {
      id: 'tch_04',
      staffId: 'OX-TCH-004',
      fullName: 'SIR ATLAS',
      designation: 'Middle School Tuition Specialist & Faculty Mentor',
      department: 'Middle School Tuition Academy',
      subject: 'Tuition Classes (Class 5th to 7th Class)',
      assignedSubjects: [
        'Middle School Tuitions (Class 5 to 7th Class)',
        'Mathematics, Science, English, Urdu & Social Studies',
      ],
      assignedLevelsOrClasses: ['Class 5', 'Class 6', 'Class 7'],
      phone: '03327185311',
      email: 'sir.atlas@oxfored.edu.pk',
      joiningDate: '2023-02-01',
      status: 'Active',
      qualification: 'B.Sc. Mathematics & Middle School Pedagogy Specialist',
    },
  ];

  // No fake teacher attendance - must be recorded on real check-in
  const teacherAttendance: TeacherAttendanceRecord[] = [];

  const timetables: TimetableItem[] = [
    {
      id: 'tt_01',
      class: 'Level Kids',
      section: 'A',
      day: 'Monday',
      subject: 'English Grammar & Phonics',
      teacherName: 'SIR ABBAS',
      startTime: '08:30 AM',
      endTime: '09:30 AM',
      room: 'Hall 1 (English Wing)',
    },
    {
      id: 'tt_02',
      class: 'Level Biggener',
      section: 'A',
      day: 'Monday',
      subject: 'English Grammar',
      teacherName: 'SIR ABBAS',
      startTime: '09:35 AM',
      endTime: '10:35 AM',
      room: 'Hall 1 (English Wing)',
    },
    {
      id: 'tt_03',
      class: 'Nazra e Quran',
      section: 'A',
      day: 'Monday',
      subject: 'Nazra e Quran (Tajweed)',
      teacherName: 'SIR SHARIFULLAH',
      startTime: '10:45 AM',
      endTime: '11:45 AM',
      room: 'Quranic Sciences Studio',
    },
    {
      id: 'tt_04',
      class: 'Caligraphy',
      section: 'A',
      day: 'Monday',
      subject: 'Caligraphy (Khat-e-Nastaliq & English Script)',
      teacherName: 'SIR SHARIFULLAH',
      startTime: '11:50 AM',
      endTime: '12:50 PM',
      room: 'Art & Calligraphy Studio',
    },
    {
      id: 'tt_05',
      class: 'Class 9',
      section: 'A',
      day: 'Monday',
      subject: 'Tuition Class: English & Science Revision',
      teacherName: 'SIR ABBAS',
      startTime: '03:00 PM',
      endTime: '04:30 PM',
      room: 'Academy Tuition Hall A',
    },
    {
      id: 'tt_06',
      class: 'Class 10',
      section: 'A',
      day: 'Monday',
      subject: 'Tuition Class: Board Exam Prep',
      teacherName: 'SIR ABBAS',
      startTime: '04:35 PM',
      endTime: '06:00 PM',
      room: 'Academy Tuition Hall B',
    },
    {
      id: 'tt_07',
      class: 'Class 2',
      section: 'A',
      day: 'Monday',
      subject: 'Primary Tuition: Math & English (Nursery to 4th)',
      teacherName: 'SIR SHAKIR',
      startTime: '03:00 PM',
      endTime: '04:15 PM',
      room: 'Primary Coaching Wing A',
    },
    {
      id: 'tt_08',
      class: 'Class 4',
      section: 'A',
      day: 'Monday',
      subject: 'Primary Tuition: General Science & Urdu',
      teacherName: 'SIR SHAKIR',
      startTime: '04:20 PM',
      endTime: '05:30 PM',
      room: 'Primary Coaching Wing A',
    },
    {
      id: 'tt_09',
      class: 'Class 6',
      section: 'A',
      day: 'Monday',
      subject: 'Middle School Tuition: Mathematics & Science',
      teacherName: 'SIR ATLAS',
      startTime: '03:15 PM',
      endTime: '04:30 PM',
      room: 'Middle Wing Hall C',
    },
    {
      id: 'tt_10',
      class: 'Class 7',
      section: 'A',
      day: 'Monday',
      subject: 'Middle School Tuition: English & Social Studies',
      teacherName: 'SIR ATLAS',
      startTime: '04:35 PM',
      endTime: '05:50 PM',
      room: 'Middle Wing Hall C',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'anc_fee_policy',
      title: 'CRITICAL NOTICE: Fee Payment Due From 1st to 5th of Each Month',
      category: 'Fee Reminder',
      content:
        'All students must pay their tuition and course fees between the 1st and 5th of every month. Fees: Grammar (Level Kids to Advance) Rs. 1,500/month, Tuition Classes Rs. 1,000/subject per month, Caligraphy Rs. 1,000/month, Nazra e Quran Rs. 600/month. STRICT RULE: Students who fail to pay by the 5th date will be removed from class registers immediately.',
      targetAudience: 'all',
      publishDate: '2026-02-01',
      isUrgent: true,
      author: 'Principal & Accounts Office',
    },
    {
      id: 'anc_faculty_shakir_atlas',
      title: 'New Faculty Appointments: SIR SHAKIR & SIR ATLAS',
      category: 'Notices',
      content:
        'We welcome SIR SHAKIR (in charge of Primary Tuitions from Nursery to Class 4) and SIR ATLAS (in charge of Middle School Tuitions from Class 5 to 7th Class) to our dedicated faculty.',
      targetAudience: 'all',
      publishDate: '2026-02-01',
      isUrgent: false,
      author: 'Principal Office',
    },
    {
      id: 'anc_01',
      title: 'Admissions Open for Session 2026-2027',
      category: 'Admissions',
      content:
        'Online admissions are now open for 11 Learning Levels (Level Kids to Level Advance, Nazra e Quran, Caligraphy) and Tuition Classes from Nursery to Class 10th. All applicants must upload their own recent genuine student photograph.',
      targetAudience: 'all',
      publishDate: '2026-01-01',
      isUrgent: true,
      author: 'Principal Office',
    },
    {
      id: 'anc_02',
      title: 'Permanent Roll Number System Activation',
      category: 'Notices',
      content:
        'OXFORED EDUCATIONAL HOUSE has implemented a single permanent numeric roll number sequence starting at 1. Roll numbers are permanently preserved across level transitions and fee records.',
      targetAudience: 'all',
      publishDate: '2026-01-05',
      isUrgent: false,
      author: 'Administration Office',
    },
    {
      id: 'anc_03',
      title: 'Specialized Courses: Caligraphy & Nazra e Quran by SIR SHARIFULLAH',
      category: 'Notices',
      content:
        'Dedicated batches for Master Calligraphy (Rs. 1,000/mo) and Tajweed-ul-Quran (Rs. 600/mo) are conducted by SIR SHARIFULLAH. Registration open through the online enrollment portal.',
      targetAudience: 'students',
      publishDate: '2026-01-10',
      isUrgent: false,
      author: 'Academic Coordinator',
    },
    {
      id: 'anc_04',
      title: 'English Grammar & Board Tuitions by SIR ABBAS',
      category: 'Notices',
      content:
        'Comprehensive English Grammar levels (Rs. 1,500/mo) and Board Preparation tuition classes are led by SIR ABBAS. Class registers are organized by permanent roll number.',
      targetAudience: 'students',
      publishDate: '2026-01-15',
      isUrgent: false,
      author: 'Academic Coordinator',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'audit_init_01',
      action: 'SYSTEM_INITIALIZATION',
      actionType: 'SYSTEM_INITIALIZATION',
      performedBy: 'Lead Developer Atif Panezai',
      role: 'Super Administrator',
      targetEntity: 'System',
      targetName: 'OXFORED EDUCATIONAL HOUSE Core Database',
      details:
        'Initialized secure institutional database with 11 Learning Levels, Tuition Classes (Prep-10th), Faculty profiles for SIR ABBAS and SIR SHARIFULLAH, and permanent numeric roll number counter starting at 1.',
      severity: 'info',
      ipAddress: '192.168.10.1 (Campus Server - Brewery Rd Quetta)',
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    settings: INITIAL_SETTINGS,
    students,
    teachers,
    applications,
    studentAttendance,
    teacherAttendance,
    examResults,
    feeAccounts2026,
    monthlyFees2026,
    feeReceipts,
    timetables,
    announcements,
    auditLogs,
    nextPermanentRollNumber: 1,
    vacatedRollNumbers: [],
  };
}

class SchoolDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
    auditLogManager.setInitialLogs(this.data.auditLogs);
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Sanitize: ensure all 4 official teachers exist
        const officialTeachers = [
          {
            id: 'tch_01',
            staffId: 'OX-TCH-001',
            fullName: 'SIR ABBAS',
            designation: 'Senior Faculty & Head of English Department',
            department: 'English Language & Board Tuition Academy',
            subject: 'English Grammar (Kids to Advance) & Board Tuitions (8th to 10th)',
            assignedSubjects: ['English Grammar', 'Senior Board Tuitions (Class 8th to 10th)'],
            assignedLevelsOrClasses: [
              ...LEARNING_LEVELS.filter((l) => l !== 'Caligraphy' && l !== 'Nazra e Quran'),
              'Class 8',
              'Class 9',
              'Class 10',
            ],
            phone: '03327185311',
            email: 'sir.abbas@oxfored.edu.pk',
            joiningDate: '2022-01-10',
            status: 'Active' as const,
            qualification: 'M.A. English Linguistics & Advanced Grammar Specialist',
          },
          {
            id: 'tch_02',
            staffId: 'OX-TCH-002',
            fullName: 'SIR SHARIFULLAH',
            designation: 'Master Instructor of Quranic Sciences & Islamic Calligraphy',
            department: 'Quranic Studies & Calligraphic Arts',
            subject: 'Caligraphy & Nazra e Quran',
            assignedSubjects: ['Caligraphy', 'Nazra e Quran'],
            assignedLevelsOrClasses: ['Caligraphy', 'Nazra e Quran'],
            phone: '03327185311',
            email: 'sir.sharifullah@oxfored.edu.pk',
            joiningDate: '2022-01-15',
            status: 'Active' as const,
            qualification: 'Sanad-e-Faraghat, Hafiz-e-Quran & Certified Khatat',
          },
          {
            id: 'tch_03',
            staffId: 'OX-TCH-003',
            fullName: 'SIR SHAKIR',
            designation: 'Primary Tuition Specialist & Junior Faculty',
            department: 'Junior Primary Tuition Academy',
            subject: 'Tuition Classes (Nursery to Class 4th)',
            assignedSubjects: [
              'Primary Tuitions (Nursery to Class 4)',
              'English, Urdu, Mathematics, General Science',
            ],
            assignedLevelsOrClasses: [
              'Nursery',
              'Prep',
              'Class 1',
              'Class 2',
              'Class 3',
              'Class 4',
            ],
            phone: '03327185311',
            email: 'sir.shakir@oxfored.edu.pk',
            joiningDate: '2023-02-01',
            status: 'Active' as const,
            qualification: 'B.A. Primary Education & Foundational Coaching Expert',
          },
          {
            id: 'tch_04',
            staffId: 'OX-TCH-004',
            fullName: 'SIR ATLAS',
            designation: 'Middle School Tuition Specialist & Faculty Mentor',
            department: 'Middle School Tuition Academy',
            subject: 'Tuition Classes (Class 5th to 7th Class)',
            assignedSubjects: [
              'Middle School Tuitions (Class 5 to 7th Class)',
              'Mathematics, Science, English, Urdu & Social Studies',
            ],
            assignedLevelsOrClasses: ['Class 5', 'Class 6', 'Class 7'],
            phone: '03327185311',
            email: 'sir.atlas@oxfored.edu.pk',
            joiningDate: '2023-02-01',
            status: 'Active' as const,
            qualification: 'B.Sc. Mathematics & Middle School Pedagogy Specialist',
          },
        ];

        // Ensure nextPermanentRollNumber exists
        // Strictly real students only: filter out old legacy mock students
        const validStudents = (Array.isArray(parsed.students) ? parsed.students : [])
          .filter((s: any) => s.rollNumber && !s.rollNumber.startsWith('OX-2026-'))
          .map((s: any) => ({
            ...s,
            fatherPhone: s.fatherPhone || s.phone || '03327185311',
            enrolledCourses: Array.isArray(s.enrolledCourses) && s.enrolledCourses.length > 0
              ? s.enrolledCourses
              : [s.admissionClass || 'Level Kids'],
            status: s.status || 'Active',
            qrCodeToken: s.qrCodeToken || `OX-QR-${s.id || 'stu'}-${s.rollNumber}-${Date.now().toString(36)}`,
            qrCodeActive: typeof s.qrCodeActive === 'boolean' ? s.qrCodeActive : true,
            enrollmentDate: s.enrollmentDate || s.admissionDate || new Date().toISOString().split('T')[0],
          }));

        let nextRoll = parsed.nextPermanentRollNumber || 1;
        if (validStudents.length > 0) {
          for (const s of validStudents) {
            const num = parseInt(s.rollNumber, 10);
            if (!isNaN(num) && num >= nextRoll) {
              nextRoll = num + 1;
            }
          }
        }

        const sanitized: DatabaseSchema = {
          settings: {
            ...INITIAL_SETTINGS,
            ...(parsed.settings || {}),
            phone: '03327185311',
            easypaisaNumber: '03327185311',
            monthlyFeeDefault: {
              ...INITIAL_SETTINGS.monthlyFeeDefault,
              ...(parsed.settings?.monthlyFeeDefault || {}),
              // Enforce official fees
              'Level Kids': 1500,
              'Level Biggener': 1500,
              'Level One': 1500,
              'Level Two': 1500,
              'Level Three': 1500,
              'Level Four': 1500,
              'Level Five': 1500,
              'Level Six': 1500,
              'Level Advance': 1500,
              'Nazra e Quran': 600,
              'Caligraphy': 1000,
              'Nursery': 1000,
              'Prep': 1000,
              'Class 1': 1000,
              'Class 2': 1000,
              'Class 3': 1000,
              'Class 4': 1000,
              'Class 5': 1000,
              'Class 6': 1000,
              'Class 7': 1000,
              'Class 8': 1000,
              'Class 9': 1000,
              'Class 10': 1000,
            },
          },
          students: validStudents,
          teachers: officialTeachers,
          applications: Array.isArray(parsed.applications) ? parsed.applications : [],
          studentAttendance: Array.isArray(parsed.studentAttendance) ? parsed.studentAttendance : [],
          teacherAttendance: Array.isArray(parsed.teacherAttendance) ? parsed.teacherAttendance : [],
          examResults: Array.isArray(parsed.examResults) ? parsed.examResults : [],
          feeAccounts2026: Array.isArray(parsed.feeAccounts2026) ? parsed.feeAccounts2026 : [],
          monthlyFees2026: Array.isArray(parsed.monthlyFees2026) ? parsed.monthlyFees2026 : [],
          feeReceipts: Array.isArray(parsed.feeReceipts) ? parsed.feeReceipts : [],
          onlinePayments: Array.isArray(parsed.onlinePayments) ? parsed.onlinePayments : [],
          timetables: Array.isArray(parsed.timetables) ? parsed.timetables : [],
          announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
          auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
          nextPermanentRollNumber: nextRoll,
          vacatedRollNumbers: Array.isArray(parsed.vacatedRollNumbers) ? parsed.vacatedRollNumbers : [],
        };

        this.saveData(sanitized);
        return sanitized;
      } catch (err) {
        console.error('Error reading database file, reseeding...', err);
        const seeded = seedInitialData();
        this.saveData(seeded);
        return seeded;
      }
    } else {
      const seeded = seedInitialData();
      this.saveData(seeded);
      return seeded;
    }
  }

  public saveData(dataToSave?: DatabaseSchema) {
    const toWrite = dataToSave || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toWrite, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // --- Settings ---
  public getSettings(): SchoolSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<SchoolSettings>, authorizedBy = 'Admin'): SchoolSettings {
    const prev = { ...this.data.settings };
    this.data.settings = { ...this.data.settings, ...settings };
    this.addAuditLog(
      'SETTINGS_UPDATED',
      authorizedBy,
      'Updated school administrative configuration',
      'SETTINGS_UPDATED',
      {
        severity: 'warning',
        targetEntity: 'SchoolSettings',
        previousState: prev,
        newState: settings,
      }
    );
    this.saveData();
    return this.data.settings;
  }

  // --- Dynamic Roll Number Generation (Prioritizes Vacated/Recycled Numbers, then Ascending 1, 2, 3...) ---
  public generateNextPermanentRollNumber(): string {
    if (!this.data.vacatedRollNumbers) {
      this.data.vacatedRollNumbers = [];
    }

    // 1. Prioritize reusing vacated roll numbers (gap-filling when students leave)
    while (this.data.vacatedRollNumbers.length > 0) {
      this.data.vacatedRollNumbers.sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });

      const reusedRoll = this.data.vacatedRollNumbers.shift()!.trim();
      const activeHolder = this.data.students.find(
        (s) => s.status === 'Active' && s.rollNumber.trim().toLowerCase() === reusedRoll.toLowerCase()
      );
      if (!activeHolder) {
        this.saveData();
        return reusedRoll;
      }
    }

    // 2. Otherwise generate next ascending number not held by any active student
    const activeRolls = new Set(
      this.data.students
        .filter((s) => s.status === 'Active')
        .map((s) => s.rollNumber.trim().toLowerCase())
    );

    let nextNum = 1;
    while (activeRolls.has(String(nextNum))) {
      nextNum++;
    }

    this.data.nextPermanentRollNumber = Math.max(
      this.data.nextPermanentRollNumber || 1,
      nextNum + 1
    );
    this.saveData();
    return String(nextNum);
  }

  public getVacatedRollNumbers(): string[] {
    if (!this.data.vacatedRollNumbers) {
      this.data.vacatedRollNumbers = [];
    }
    return [...this.data.vacatedRollNumbers].sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }

  public reassignStudentRollNumber(
    studentId: string,
    newRollNumber: string,
    reason: string,
    authorizedBy = 'Principal'
  ): Student {
    const student = this.data.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const cleanNewRoll = newRollNumber.trim();
    if (!cleanNewRoll) throw new Error('New roll number is required');

    // Check if another active student currently uses this roll number
    const activeConflict = this.data.students.find(
      (s) =>
        s.id !== studentId &&
        s.status === 'Active' &&
        s.rollNumber.trim().toLowerCase() === cleanNewRoll.toLowerCase()
    );
    if (activeConflict) {
      throw new Error(
        `Roll number "${cleanNewRoll}" is currently assigned to active student ${activeConflict.fullName}`
      );
    }

    const oldRollNumber = student.rollNumber;
    student.previousRollNumber = oldRollNumber;
    student.rollNumber = cleanNewRoll;

    // If new roll was in vacated pool, remove it
    if (this.data.vacatedRollNumbers) {
      this.data.vacatedRollNumbers = this.data.vacatedRollNumbers.filter(
        (r) => r.trim().toLowerCase() !== cleanNewRoll.toLowerCase()
      );
      // Place old roll number into vacated pool if numeric and not already there
      const cleanOld = oldRollNumber.replace('WITHDRAWN-', '').trim();
      if (cleanOld && !isNaN(parseInt(cleanOld, 10)) && !this.data.vacatedRollNumbers.includes(cleanOld)) {
        this.data.vacatedRollNumbers.push(cleanOld);
      }
    }

    // Regenerate QR Code Token
    student.qrCodeToken = `OX-QR-${student.id}-${cleanNewRoll}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Cascade update to Fee Account
    const feeAcc = this.data.feeAccounts2026.find((f) => f.studentId === student.id);
    if (feeAcc) {
      feeAcc.rollNumber = cleanNewRoll;
      feeAcc.updatedAt = new Date().toISOString();
    }

    // Cascade update to Monthly Fees
    this.data.monthlyFees2026.forEach((mf) => {
      if (mf.studentId === student.id) {
        mf.rollNumber = cleanNewRoll;
      }
    });

    // Cascade update to Student Attendance
    this.data.studentAttendance.forEach((att) => {
      if (att.studentId === student.id) {
        att.rollNumber = cleanNewRoll;
      }
    });

    // Cascade update to Exam Results
    this.data.examResults.forEach((ex) => {
      if (ex.studentId === student.id) {
        ex.rollNumber = cleanNewRoll;
      }
    });

    this.addAuditLog(
      'ROLL_NUMBER_REASSIGNED',
      authorizedBy,
      `Reassigned roll number for ${student.fullName}: Changed from #${oldRollNumber} to #${cleanNewRoll}. Reason: ${reason}. Historical fee, exam, and attendance records synchronized.`,
      'STUDENT_RECORD_MODIFIED',
      {
        severity: 'critical',
        targetEntity: 'Student',
        targetId: student.id,
        targetName: student.fullName,
        previousState: { rollNumber: oldRollNumber },
        newState: { rollNumber: cleanNewRoll, reason },
      }
    );

    this.saveData();
    return student;
  }

  public processStudentDeparture(
    studentId: string,
    data: {
      reason: 'Voluntary Departure' | 'Fee Non-Payment Removal' | 'Relocation' | 'Disciplinary Expulsion' | 'Course Completed';
      notes?: string;
      releaseRollNumber?: boolean;
      authorizedBy?: string;
    }
  ): { student: Student; releasedRollNumber?: string } {
    const student = this.data.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const authorizedBy = data.authorizedBy || 'Principal';
    const oldRoll = student.rollNumber;
    student.status = 'Withdrawn';
    student.qrCodeActive = false;
    student.departureReason = data.reason;
    student.departureDate = new Date().toISOString().split('T')[0];
    student.departureNotes = data.notes || '';

    let releasedRoll: string | undefined = undefined;

    if (data.releaseRollNumber !== false) {
      if (!this.data.vacatedRollNumbers) {
        this.data.vacatedRollNumbers = [];
      }
      const rawNum = oldRoll.replace('WITHDRAWN-', '').trim();
      if (rawNum && !isNaN(parseInt(rawNum, 10)) && !this.data.vacatedRollNumbers.includes(rawNum)) {
        this.data.vacatedRollNumbers.push(rawNum);
        releasedRoll = rawNum;
      }
      student.previousRollNumber = oldRoll;
      student.rollNumber = `WITHDRAWN-${rawNum || oldRoll}`;
    }

    this.addAuditLog(
      'STUDENT_DEPARTURE_PROCESSED',
      authorizedBy,
      `Student departure processed for ${student.fullName} (Original Roll #${oldRoll}): Status updated to Withdrawn. Reason: ${data.reason}. ${releasedRoll ? `Roll #${releasedRoll} released to vacated pool for reallocation.` : ''} Deactivated ID card and removed from active class registers.`,
      'STUDENT_DEPARTURE_PROCESSED',
      {
        severity: 'critical',
        targetEntity: 'Student',
        targetId: student.id,
        targetName: student.fullName,
        previousState: { status: 'Active', rollNumber: oldRoll },
        newState: {
          status: 'Withdrawn',
          departureReason: data.reason,
          departureDate: student.departureDate,
          releasedRollNumber: releasedRoll,
        },
      }
    );

    this.saveData();
    return { student, releasedRollNumber: releasedRoll };
  }

  // --- Students & Enrollment Integration ---
  public getStudents(filters?: {
    admissionClass?: string;
    class?: string;
    section?: string;
    status?: string;
    includeWithdrawn?: boolean;
    search?: string;
  }): Student[] {
    let list = this.data.students;

    if (filters?.status && filters.status !== 'All') {
      list = list.filter((s) => s.status === filters.status);
    } else if (filters?.includeWithdrawn === false) {
      list = list.filter((s) => s.status === 'Active' || s.status === 'Admitted');
    }

    const targetClass = filters?.admissionClass || filters?.class;
    if (targetClass && targetClass !== 'All') {
      list = list.filter((s) => {
        const matchesPrimary = s.admissionClass === targetClass;
        const matchesSecond = s.secondClass === targetClass;
        const matchesCourse = s.enrolledCourses && s.enrolledCourses.some(
          (c) => c === targetClass || c.includes(targetClass) || targetClass.includes(c)
        );
        return matchesPrimary || matchesSecond || matchesCourse;
      });
    }

    if (filters?.section && filters.section !== 'All') {
      list = list.filter((s) => s.section === filters.section);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.fatherName.toLowerCase().includes(q)
      );
    }

    // Sort strictly by roll number ascending (active numeric first, then withdrawn)
    return [...list].sort((a, b) => {
      const isAWithdrawn = a.rollNumber.startsWith('WITHDRAWN-') || a.status === 'Withdrawn';
      const isBWithdrawn = b.rollNumber.startsWith('WITHDRAWN-') || b.status === 'Withdrawn';
      if (isAWithdrawn && !isBWithdrawn) return 1;
      if (!isAWithdrawn && isBWithdrawn) return -1;

      const numA = parseInt(a.rollNumber.replace('WITHDRAWN-', ''), 10);
      const numB = parseInt(b.rollNumber.replace('WITHDRAWN-', ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });
  }

  public getStudentById(id: string): Student | undefined {
    return this.data.students.find((s) => s.id === id);
  }

  public getStudentByRoll(rollNumber: string): Student | undefined {
    const clean = rollNumber.trim().toLowerCase();
    return this.data.students.find(
      (s) =>
        s.rollNumber.trim().toLowerCase() === clean ||
        s.previousRollNumber?.trim().toLowerCase() === clean ||
        (s.rollNumber.startsWith('WITHDRAWN-') && s.rollNumber.replace('WITHDRAWN-', '').trim().toLowerCase() === clean)
    );
  }

  public getApplications(): EnrollmentApplication[] {
    return this.data.applications;
  }

  // Mandatory Photograph Upload & Strict Real-Student Validation
  public submitEnrollment(
    appData: Omit<EnrollmentApplication, 'id' | 'createdAt' | 'status'>,
    autoApprove = true
  ): { application: EnrollmentApplication; student?: Student; feeAccount?: FeeAccount2026 } {
    // Validate required student photograph
    if (!appData.photoUrl || appData.photoUrl.trim() === '') {
      throw new Error(
        'Upload Your Own Recent Student Photograph is mandatory. Every applicant must provide their genuine photo before submission.'
      );
    }

    // Check duplicate student by name + fatherName + level/class
    const existing = this.data.students.find(
      (s) =>
        s.fullName.trim().toLowerCase() === appData.fullName.trim().toLowerCase() &&
        s.fatherName.trim().toLowerCase() === appData.fatherName.trim().toLowerCase() &&
        s.admissionClass === appData.admissionClass
    );
    if (existing) {
      throw new Error(
        `Student ${appData.fullName} son/daughter of ${appData.fatherName} is already officially enrolled with Roll No: ${existing.rollNumber}`
      );
    }

    const appId = `app_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const courses = (appData.enrolledCourses && appData.enrolledCourses.length > 0)
      ? appData.enrolledCourses
      : appData.secondClass
        ? [appData.admissionClass, appData.secondClass]
        : [appData.admissionClass];

    const newApp: EnrollmentApplication = {
      ...appData,
      enrolledCourses: courses,
      isDoubleClass: Boolean(appData.isDoubleClass || appData.secondClass),
      id: appId,
      status: 'Pending',
      photoVerificationStatus: 'Genuine User Upload',
      createdAt: new Date().toISOString(),
    };

    this.data.applications.unshift(newApp);

    this.addAuditLog(
      'SUBMIT_ENROLLMENT',
      'Online Applicant',
      `Submitted admission application for ${newApp.fullName} in ${newApp.admissionClass}. Photograph uploaded and verified.`,
      'ENROLLMENT_STATUS_UPDATED',
      {
        severity: 'info',
        targetEntity: 'EnrollmentApplication',
        targetId: appId,
        targetName: newApp.fullName,
        newState: {
          fullName: newApp.fullName,
          class: newApp.admissionClass,
          photoUploaded: Boolean(newApp.photoUrl),
        },
      }
    );

    this.saveData();

    if (autoApprove) {
      return this.approveApplication(appId, 'System Auto-Approval Policy');
    }

    return { application: newApp };
  }

  public approveApplication(
    appId: string,
    adminName = 'Principal'
  ): { application: EnrollmentApplication; student: Student; feeAccount: FeeAccount2026 } {
    const app = this.data.applications.find((a) => a.id === appId);
    if (!app) {
      throw new Error('Application not found');
    }

    if (!app.photoUrl || app.photoUrl.trim() === '') {
      throw new Error('Cannot approve admission: Mandatory student photograph is missing.');
    }

    if (app.status === 'Approved' && app.studentId) {
      const student = this.getStudentById(app.studentId)!;
      const feeAccount = this.getFeeAccountByStudentId(app.studentId)!;
      return { application: app, student, feeAccount };
    }

    const { student, feeAccount } = this.admitStudentFromApplication(app, adminName);
    app.status = 'Approved';
    app.generatedRollNumber = student.rollNumber;
    app.studentId = student.id;
    app.reviewRemarks = `Approved by ${adminName} on ${new Date().toISOString().split('T')[0]}`;
    this.saveData();

    return { application: app, student, feeAccount };
  }

  public rejectApplication(appId: string, reason: string, adminName = 'Principal') {
    const app = this.data.applications.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');
    app.status = 'Rejected';
    app.reviewRemarks = reason;
    this.addAuditLog(
      'APPLICATION_REJECTED',
      adminName,
      `Rejected admission application for ${app.fullName} (${app.admissionClass}): ${reason}`,
      'APPLICATION_REJECTED',
      {
        severity: 'critical',
        targetEntity: 'EnrollmentApplication',
        targetId: app.id,
        targetName: app.fullName,
        previousState: { status: 'Pending' },
        newState: { status: 'Rejected', reason },
      }
    );
    this.saveData();
    return app;
  }

  private admitStudentFromApplication(
    app: EnrollmentApplication,
    authorizedBy: string
  ): { student: Student; feeAccount: FeeAccount2026 } {
    const studentId = `stu_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // MANDATORY PERMANENT NUMERIC ROLL NUMBER (1, 2, 3...)
    const permanentRollNumber = this.generateNextPermanentRollNumber();

    const courses = (app.enrolledCourses && app.enrolledCourses.length > 0)
      ? app.enrolledCourses
      : app.secondClass
        ? [app.admissionClass, app.secondClass]
        : [app.admissionClass];

    const qrToken = `OX-QR-${studentId}-${permanentRollNumber}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const student: Student = {
      id: studentId,
      rollNumber: permanentRollNumber,
      fullName: app.fullName,
      fatherName: app.fatherName,
      fatherPhone: app.fatherPhone || app.phone,
      dob: app.dob,
      gender: app.gender,
      photoUrl: app.photoUrl,
      phone: app.phone,
      address: app.address,
      previousSchool: app.previousSchool || 'N/A',
      admissionClass: app.admissionClass,
      secondClass: app.secondClass,
      isDoubleClass: Boolean(app.isDoubleClass || app.secondClass),
      enrolledCourses: courses,
      section: app.section || 'A',
      academicSession: app.academicSession || '2026-2027',
      admissionDate: app.admissionDate || new Date().toISOString().split('T')[0],
      enrollmentDate: app.admissionDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      qrCodeToken: qrToken,
      qrCodeActive: true,
      requiredDocuments: app.requiredDocuments || [],
      photoVerified: true,
      verificationNotes: 'Genuine photograph uploaded during admission',
      createdAt: new Date().toISOString(),
    };

    this.data.students.push(student);

    // --- CRITICAL: AUTOMATIC 2026 FEE ACCOUNT SYNCHRONIZATION ---
    // Support multi-course fee calculation (e.g. Grammar Rs. 1500 + Tuition Rs. 1000 = Rs. 2500)
    let monthlyRate = 0;
    courses.forEach((c) => {
      if (this.data.settings.monthlyFeeDefault[c]) {
        monthlyRate += this.data.settings.monthlyFeeDefault[c];
      } else if (c.toLowerCase().includes('grammar')) {
        monthlyRate += 1500;
      } else if (c.toLowerCase().includes('tuition') || c.startsWith('Class ') || c === 'Prep' || c === 'Nursery') {
        monthlyRate += 1000;
      } else if (c.toLowerCase().includes('caligraphy')) {
        monthlyRate += 1000;
      } else if (c.toLowerCase().includes('nazra')) {
        monthlyRate += 600;
      } else {
        monthlyRate += (this.data.settings.monthlyFeeDefault[student.admissionClass] || 1500);
      }
    });
    if (monthlyRate === 0) {
      monthlyRate = this.data.settings.monthlyFeeDefault[student.admissionClass] || 1500;
    }

    const admissionFee = this.data.settings.admissionFeeDefault || 5000;
    const otherCharges = 1200;
    const totalDue = monthlyRate * 12 + admissionFee + otherCharges;

    const feeAccount: FeeAccount2026 = {
      id: `fee_${studentId}`,
      studentId: studentId, // Permanent DB link
      rollNumber: permanentRollNumber,
      studentName: student.fullName,
      fatherName: student.fatherName,
      class: student.admissionClass,
      section: student.section,
      admissionDate: student.admissionDate,
      guardianPhone: student.phone,
      academicSession: student.academicSession,
      monthlyTuitionFee: monthlyRate,
      admissionFee: admissionFee,
      otherApprovedCharges: otherCharges,
      discountsOrWaivers: 0,
      totalFeeDue: totalDue,
      amountPaid: 0,
      remainingBalance: totalDue,
      paymentStatus: 'Unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.feeAccounts2026.push(feeAccount);

    // Generate 12 months for 2026
    MONTHS_2026.forEach((month, idx) => {
      const monthNum = (idx + 1).toString().padStart(2, '0');
      const rec: MonthlyFeeRecord2026 = {
        id: `mf_${studentId}_${month}_2026`,
        studentId: studentId,
        rollNumber: permanentRollNumber,
        studentName: student.fullName,
        class: student.admissionClass,
        month,
        monthlyTuitionFee: monthlyRate,
        otherApplicableCharges: idx === 0 ? otherCharges + admissionFee : 0,
        discounts: 0,
        totalAmountDue: monthlyRate + (idx === 0 ? otherCharges + admissionFee : 0),
        amountPaid: 0,
        remainingBalance: monthlyRate + (idx === 0 ? otherCharges + admissionFee : 0),
        paymentDueDate: `2026-${monthNum}-10`,
        paymentStatus: 'Unpaid',
      };
      this.data.monthlyFees2026.push(rec);
    });

    this.addAuditLog(
      'APPLICATION_APPROVED',
      authorizedBy,
      `Officially admitted ${student.fullName} with Permanent Roll Number ${student.rollNumber} in ${student.admissionClass}. 2026 Fee Account synced.`,
      'APPLICATION_APPROVED',
      {
        severity: 'warning',
        targetEntity: 'Student',
        targetId: studentId,
        targetName: student.fullName,
        newState: {
          rollNumber: permanentRollNumber,
          admissionClass: student.admissionClass,
          feeAccountId: feeAccount.id,
          totalDue,
        },
      }
    );

    this.saveData();
    return { student, feeAccount };
  }

  // --- MOVE STUDENT TO ANOTHER LEARNING LEVEL OR TUITION CLASS ---
  // Mandatory: Roll number is PERMANENT and NEVER changes!
  // Preserves complete attendance, exam, and fee history!
  public moveStudentLevelOrClass(
    studentId: string,
    newLevelOrClass: string,
    reason = 'Academic Progression',
    authorizedBy = 'Principal'
  ): { student: Student; feeAccount: FeeAccount2026 } {
    const student = this.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const oldLevel = student.admissionClass;
    if (oldLevel === newLevelOrClass) {
      throw new Error(`Student is already enrolled in ${newLevelOrClass}`);
    }

    // 1. Update student level
    student.admissionClass = newLevelOrClass;

    // 2. Synchronize Fee Account class (Permanent rollNumber and studentId remain intact)
    const feeAcc = this.getFeeAccountByStudentId(studentId);
    if (feeAcc) {
      feeAcc.class = newLevelOrClass;
      feeAcc.updatedAt = new Date().toISOString();

      // Recalculate monthly tuition rate if level standard changed
      const newMonthlyRate = this.data.settings.monthlyFeeDefault[newLevelOrClass];
      if (newMonthlyRate && newMonthlyRate !== feeAcc.monthlyTuitionFee) {
        feeAcc.monthlyTuitionFee = newMonthlyRate;
      }
    }

    // 3. Log in AuditLogManager
    this.addAuditLog(
      'STUDENT_LEVEL_CHANGED',
      authorizedBy,
      `Level transition for ${student.fullName} (Permanent Roll Number: ${student.rollNumber}): Moved from "${oldLevel}" to "${newLevelOrClass}". Reason: ${reason}. Historical records preserved.`,
      'STUDENT_LEVEL_CHANGED',
      {
        severity: 'warning',
        targetEntity: 'Student',
        targetId: studentId,
        targetName: student.fullName,
        previousState: { class: oldLevel, rollNumber: student.rollNumber },
        newState: { class: newLevelOrClass, rollNumber: student.rollNumber, reason },
      }
    );

    this.saveData();
    return { student, feeAccount: feeAcc! };
  }

  public updateStudent(id: string, updates: Partial<Student>, authorizedBy = 'Admin'): Student {
    const student = this.data.students.find((s) => s.id === id);
    if (!student) throw new Error('Student not found');

    const oldName = student.fullName;
    const oldRoll = student.rollNumber;
    const oldClass = student.admissionClass;

    // Disallow altering roll number arbitrarily (must remain permanent)
    if (updates.rollNumber && updates.rollNumber !== student.rollNumber) {
      updates.rollNumber = student.rollNumber;
    }

    Object.assign(student, updates);

    // Synchronize to fee account
    const feeAcc = this.data.feeAccounts2026.find((f) => f.studentId === id);
    if (feeAcc) {
      if (updates.fullName) feeAcc.studentName = updates.fullName;
      if (updates.fatherName) feeAcc.fatherName = updates.fatherName;
      if (updates.admissionClass) feeAcc.class = updates.admissionClass;
      if (updates.section) feeAcc.section = updates.section;
    }

    this.addAuditLog(
      'STUDENT_RECORD_MODIFIED',
      authorizedBy,
      `Updated student record for ${oldName} (Permanent Roll: ${student.rollNumber}, Level/Class: ${student.admissionClass}-${student.section})`,
      'STUDENT_RECORD_MODIFIED',
      {
        severity: 'warning',
        targetEntity: 'Student',
        targetId: id,
        targetName: oldName,
        previousState: { name: oldName, roll: oldRoll, class: oldClass },
        newState: updates,
      }
    );
    this.saveData();
    return student;
  }

  // --- Fee Management 2026 ---
  public getFeeAccounts(): FeeAccount2026[] {
    return [...this.data.feeAccounts2026].sort((a, b) => {
      const numA = parseInt(a.rollNumber, 10);
      const numB = parseInt(b.rollNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });
  }

  public getFeeAccountByStudentId(studentId: string): FeeAccount2026 | undefined {
    return this.data.feeAccounts2026.find((f) => f.studentId === studentId);
  }

  public getMonthlyFeesByStudentId(studentId: string): MonthlyFeeRecord2026[] {
    return this.data.monthlyFees2026.filter((m) => m.studentId === studentId);
  }

  public recordFeePayment(paymentData: {
    studentId: string;
    amountPaid: number;
    feeMonthOrPeriod: string;
    paymentMethod: string;
    authorizedStaff: string;
    notes?: string;
  }): { receipt: FeePaymentReceipt; feeAccount: FeeAccount2026 } {
    const feeAcc = this.data.feeAccounts2026.find((f) => f.studentId === paymentData.studentId);
    if (!feeAcc) {
      throw new Error('Fee account not found for this student');
    }

    const paymentDate = new Date().toISOString().split('T')[0];
    const receiptNumber = `REC-2026-${Date.now().toString().slice(-6)}`;

    // Update fee account
    feeAcc.amountPaid += paymentData.amountPaid;
    feeAcc.remainingBalance = Math.max(0, feeAcc.totalFeeDue - feeAcc.amountPaid);
    if (feeAcc.remainingBalance === 0) {
      feeAcc.paymentStatus = 'Paid';
    } else if (feeAcc.amountPaid > 0) {
      feeAcc.paymentStatus = 'Partially Paid';
    }
    feeAcc.lastPaymentDate = paymentDate;
    feeAcc.updatedAt = new Date().toISOString();

    const receipt: FeePaymentReceipt = {
      id: `rec_${Date.now()}`,
      receiptNumber,
      studentId: feeAcc.studentId,
      studentName: feeAcc.studentName,
      fatherName: feeAcc.fatherName,
      rollNumber: feeAcc.rollNumber,
      class: feeAcc.class,
      section: feeAcc.section,
      feeMonthOrPeriod: paymentData.feeMonthOrPeriod,
      totalDue: feeAcc.totalFeeDue,
      amountPaid: paymentData.amountPaid,
      remainingBalance: feeAcc.remainingBalance,
      paymentDate,
      paymentMethod: (paymentData.paymentMethod as any) || 'Cash',
      authorizedStaff: paymentData.authorizedStaff || 'Finance Cashier',
      notes: paymentData.notes,
    };

    this.data.feeReceipts.unshift(receipt);

    // Update monthly breakdown if applicable
    const targetMonth = MONTHS_2026.find((m) =>
      paymentData.feeMonthOrPeriod.toLowerCase().includes(m.toLowerCase())
    );
    if (targetMonth) {
      const mf = this.data.monthlyFees2026.find(
        (m) => m.studentId === paymentData.studentId && m.month === targetMonth
      );
      if (mf) {
        mf.amountPaid += paymentData.amountPaid;
        mf.remainingBalance = Math.max(0, mf.totalAmountDue - mf.amountPaid);
        mf.paymentStatus = mf.remainingBalance === 0 ? 'Paid' : 'Partially Paid';
        mf.paymentDate = paymentDate;
        mf.receiptNumber = receiptNumber;
        mf.paymentMethod = paymentData.paymentMethod;
      }
    }

    this.addAuditLog(
      'FEE_PAYMENT_RECORDED',
      paymentData.authorizedStaff,
      `Received fee payment of Rs. ${paymentData.amountPaid.toLocaleString()} from ${feeAcc.studentName} (Roll: ${feeAcc.rollNumber}). Receipt: ${receiptNumber}.`,
      'FEE_PAYMENT_RECORDED',
      {
        severity: 'info',
        targetEntity: 'FeeAccount',
        targetId: feeAcc.studentId,
        targetName: feeAcc.studentName,
        newState: {
          amountPaid: paymentData.amountPaid,
          receiptNumber,
          remainingBalance: feeAcc.remainingBalance,
        },
      }
    );

    this.saveData();
    return { receipt, feeAccount: feeAcc };
  }

  public updateFeeAccountConfig(
    studentId: string,
    updates: Partial<{
      monthlyTuitionFee: number;
      admissionFee: number;
      otherApprovedCharges: number;
      discountsOrWaivers: number;
    }>,
    authorizedBy = 'Finance Head'
  ): FeeAccount2026 {
    const feeAcc = this.data.feeAccounts2026.find((f) => f.studentId === studentId);
    if (!feeAcc) throw new Error('Fee account not found');

    const previousState = { ...feeAcc };

    if (updates.monthlyTuitionFee !== undefined) feeAcc.monthlyTuitionFee = Number(updates.monthlyTuitionFee);
    if (updates.admissionFee !== undefined) feeAcc.admissionFee = Number(updates.admissionFee);
    if (updates.otherApprovedCharges !== undefined)
      feeAcc.otherApprovedCharges = Number(updates.otherApprovedCharges);
    if (updates.discountsOrWaivers !== undefined)
      feeAcc.discountsOrWaivers = Number(updates.discountsOrWaivers);

    feeAcc.totalFeeDue = Math.max(
      0,
      feeAcc.monthlyTuitionFee * 12 +
        feeAcc.admissionFee +
        feeAcc.otherApprovedCharges -
        feeAcc.discountsOrWaivers
    );
    feeAcc.remainingBalance = Math.max(0, feeAcc.totalFeeDue - feeAcc.amountPaid);
    feeAcc.paymentStatus =
      feeAcc.remainingBalance === 0
        ? 'Paid'
        : feeAcc.amountPaid > 0
        ? 'Partially Paid'
        : 'Unpaid';
    feeAcc.updatedAt = new Date().toISOString();

    this.addAuditLog(
      'FEE_CONFIG_UPDATED',
      authorizedBy,
      `Critical Fee Structure Change for ${feeAcc.studentName} (Roll: ${feeAcc.rollNumber}): New Total Due=Rs.${feeAcc.totalFeeDue}`,
      'FEE_CONFIG_UPDATED',
      {
        severity: 'critical',
        targetEntity: 'FeeAccount',
        targetId: studentId,
        targetName: feeAcc.studentName,
        previousState,
        newState: feeAcc,
      }
    );
    this.saveData();
    return feeAcc;
  }

  public getFeeReceipts(studentId?: string): FeePaymentReceipt[] {
    if (studentId) {
      return this.data.feeReceipts.filter((r) => r.studentId === studentId);
    }
    return this.data.feeReceipts;
  }

  // --- Student Daily Attendance ---
  public getStudentAttendance(filters?: {
    class?: string;
    section?: string;
    date?: string;
    studentId?: string;
  }): StudentAttendanceRecord[] {
    let result = this.data.studentAttendance;
    if (filters?.class && filters.class !== 'All') {
      result = result.filter((r) => r.class === filters.class);
    }
    if (filters?.section && filters.section !== 'All') {
      result = result.filter((r) => r.section === filters.section);
    }
    if (filters?.date) {
      result = result.filter((r) => r.date === filters.date);
    }
    if (filters?.studentId) {
      result = result.filter((r) => r.studentId === filters.studentId);
    }

    // Sort strictly by permanent numeric roll number
    return result.sort((a, b) => {
      const numA = parseInt(a.rollNumber, 10);
      const numB = parseInt(b.rollNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });
  }

  public markStudentAttendance(
    records: Array<{
      studentId: string;
      date: string;
      course?: string;
      status: StudentAttendanceRecord['status'];
      remarks?: string;
      markedBy: string;
    }>
  ): StudentAttendanceRecord[] {
    const updatedRecords: StudentAttendanceRecord[] = [];

    for (const rec of records) {
      const student = this.getStudentById(rec.studentId);
      if (!student) continue;

      const existingIndex = this.data.studentAttendance.findIndex(
        (a) =>
          a.studentId === rec.studentId &&
          a.date === rec.date &&
          (!rec.course || a.course === rec.course || (!a.course && a.class === rec.course))
      );

      if (existingIndex >= 0) {
        const old = this.data.studentAttendance[existingIndex];
        const statusChanged = old.status !== rec.status;
        const prevStatus = old.status;

        old.status = rec.status;
        old.remarks = rec.remarks || old.remarks;
        old.updatedBy = rec.markedBy;
        old.updatedAt = new Date().toISOString();
        if (rec.course) old.course = rec.course;
        updatedRecords.push(old);

        if (statusChanged) {
          this.addAuditLog(
            'MANUAL_ATTENDANCE_CORRECTION',
            rec.markedBy,
            `Manual attendance correction for ${student.fullName} (Roll: ${student.rollNumber}, Course: ${rec.course || student.admissionClass}) on ${rec.date}: Changed from ${prevStatus} to ${rec.status}.`,
            'MANUAL_ATTENDANCE_CORRECTION',
            {
              severity: 'critical',
              targetEntity: 'StudentAttendance',
              targetId: student.id,
              targetName: student.fullName,
              previousState: { status: prevStatus, date: rec.date },
              newState: { status: rec.status, date: rec.date, remarks: rec.remarks },
            }
          );
        }
      } else {
        const newRecord: StudentAttendanceRecord = {
          id: `att_stu_${rec.studentId}_${rec.date}_${Date.now()}`,
          studentId: rec.studentId,
          rollNumber: student.rollNumber,
          studentName: student.fullName,
          photoUrl: student.photoUrl,
          class: student.admissionClass,
          course: rec.course || student.admissionClass,
          section: student.section,
          date: rec.date,
          scanMethod: 'MANUAL_TEACHER',
          status: rec.status,
          remarks: rec.remarks,
          markedBy: rec.markedBy,
        };
        this.data.studentAttendance.push(newRecord);
        updatedRecords.push(newRecord);
      }
    }

    this.saveData();
    return updatedRecords;
  }

  // --- SMART QR ATTENDANCE SCANNER ---
  public scanQrAttendance(data: {
    qrToken: string;
    course: string;
    markedBy?: string;
    teacherStaffId?: string;
  }): QrScanResult {
    const token = (data.qrToken || '').trim();
    if (!token) {
      return {
        success: false,
        invalid: true,
        message: 'INVALID ID CARD — ATTENDANCE NOT RECORDED',
      };
    }

    // Lookup student by unique qrCodeToken
    const student = this.data.students.find((s) => s.qrCodeToken === token);

    // Reject unregistered, invalid, deactivated, or withdrawn students
    if (!student) {
      return {
        success: false,
        invalid: true,
        message: 'INVALID ID CARD — ATTENDANCE NOT RECORDED (Unregistered Card)',
      };
    }

    if (!student.qrCodeActive) {
      return {
        success: false,
        invalid: true,
        message: 'INVALID ID CARD — ATTENDANCE NOT RECORDED (Card Deactivated / Replaced)',
        student,
      };
    }

    if (student.status === 'Withdrawn' || student.status === 'Inactive') {
      return {
        success: false,
        invalid: true,
        message: `INVALID ID CARD — Student is currently marked as ${student.status}`,
        student,
      };
    }

    // Verify course enrollment
    const requestedCourse = (data.course || '').trim();
    const enrolled = student.enrolledCourses || [student.admissionClass];
    const isEnrolledInCourse =
      !requestedCourse ||
      requestedCourse === 'All' ||
      enrolled.some(
        (c) =>
          c.toLowerCase() === requestedCourse.toLowerCase() ||
          c.toLowerCase().includes(requestedCourse.toLowerCase()) ||
          requestedCourse.toLowerCase().includes(c.toLowerCase())
      ) ||
      student.admissionClass.toLowerCase() === requestedCourse.toLowerCase();

    if (!isEnrolledInCourse) {
      return {
        success: false,
        invalid: true,
        message: `STUDENT NOT REGISTERED IN ${requestedCourse.toUpperCase()} — ATTENDANCE NOT RECORDED`,
        student,
        course: requestedCourse,
      };
    }

    // Check for duplicate attendance entry on same day and course
    const today = new Date().toISOString().split('T')[0];
    const existing = this.data.studentAttendance.find(
      (a) =>
        a.studentId === student.id &&
        a.date === today &&
        (a.course === requestedCourse || (!a.course && a.class === requestedCourse))
    );

    if (existing) {
      return {
        success: false,
        duplicate: true,
        message: `DUPLICATE ATTENDANCE — Attendance already recorded for ${student.fullName} (Roll #${student.rollNumber}) in ${requestedCourse || student.admissionClass} today at ${existing.scanTime || 'earlier session'}.`,
        student,
        attendanceRecord: existing,
        course: requestedCourse || student.admissionClass,
        scanTime: existing.scanTime,
      };
    }

    // Record attendance
    const now = new Date();
    const scanTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const activeCourseName = requestedCourse || student.admissionClass;
    const newRecord: StudentAttendanceRecord = {
      id: `att_qr_${student.id}_${today}_${Date.now()}`,
      studentId: student.id,
      rollNumber: student.rollNumber,
      studentName: student.fullName,
      photoUrl: student.photoUrl,
      class: student.admissionClass,
      course: activeCourseName,
      section: student.section,
      date: today,
      scanTime,
      scanMethod: 'QR_CAMERA',
      status: 'Present',
      remarks: `Camera QR scan verified by ${data.markedBy || 'Authorized Scanner'}`,
      markedBy: data.markedBy || 'Authorized Staff Scanner',
    };

    this.data.studentAttendance.push(newRecord);
    this.saveData();

    this.addAuditLog(
      'STUDENT_ATTENDANCE_MARKED',
      data.markedBy || 'Authorized Staff Scanner',
      `Smart QR attendance marked for ${student.fullName} (Roll: ${student.rollNumber}) in course: ${activeCourseName} at ${scanTime}.`,
      'STUDENT_ATTENDANCE_MARKED',
      {
        severity: 'info',
        targetEntity: 'StudentAttendance',
        targetId: student.id,
        targetName: student.fullName,
        newState: {
          rollNumber: student.rollNumber,
          course: activeCourseName,
          date: today,
          scanTime,
        },
      }
    );

    return {
      success: true,
      message: 'ATTENDANCE MARKED SUCCESSFULLY',
      student,
      attendanceRecord: newRecord,
      course: activeCourseName,
      scanTime,
    };
  }

  // Regenerate student QR code (e.g. lost card)
  public regenerateStudentQrCode(studentId: string, authorizedBy = 'Administrator'): Student {
    const student = this.data.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');
    const oldToken = student.qrCodeToken;
    student.qrCodeToken = `OX-QR-${student.id}-${student.rollNumber}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    student.qrCodeActive = true;
    this.saveData();

    this.addAuditLog(
      'QR_CODE_REGENERATED',
      authorizedBy,
      `Deactivated old QR code and issued replacement QR token for ${student.fullName} (Roll: ${student.rollNumber}).`,
      'STUDENT_RECORD_MODIFIED',
      {
        severity: 'info',
        targetEntity: 'Student',
        targetId: student.id,
        targetName: student.fullName,
        previousState: { qrCodeToken: oldToken },
        newState: { qrCodeToken: student.qrCodeToken, qrCodeActive: true },
      }
    );
    return student;
  }

  // Update student status (Active, Withdrawn, Inactive)
  public updateStudentStatus(
    studentId: string,
    status: 'Active' | 'Withdrawn' | 'Inactive',
    reason = 'Administrative update',
    authorizedBy = 'Administrator'
  ): Student {
    const student = this.data.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');
    const prevStatus = student.status;
    student.status = status;
    student.qrCodeActive = status === 'Active';
    this.saveData();

    this.addAuditLog(
      'STUDENT_STATUS_UPDATED',
      authorizedBy,
      `Updated enrollment status for ${student.fullName} (Roll: ${student.rollNumber}) from ${prevStatus} to ${status}. Reason: ${reason}`,
      'STUDENT_RECORD_MODIFIED',
      {
        severity: 'warning',
        targetEntity: 'Student',
        targetId: student.id,
        targetName: student.fullName,
        previousState: { status: prevStatus },
        newState: { status, qrCodeActive: student.qrCodeActive, reason },
      }
    );
    return student;
  }

  // Course-Wise Attendance Reports
  public getCourseAttendanceReports(courseFilter?: string): {
    courseSummaries: CourseAttendanceSummary[];
    totalScansToday: number;
    dailyLogs: StudentAttendanceRecord[];
  } {
    let records = this.data.studentAttendance;
    if (courseFilter && courseFilter !== 'All') {
      records = records.filter(
        (r) =>
          (r.course && r.course.toLowerCase() === courseFilter.toLowerCase()) ||
          (!r.course && r.class.toLowerCase() === courseFilter.toLowerCase())
      );
    }

    const courseMap: Record<
      string,
      { present: number; absent: number; late: number; total: number }
    > = {};

    for (const r of this.data.studentAttendance) {
      const c = r.course || r.class || 'General';
      if (!courseMap[c]) {
        courseMap[c] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      courseMap[c].total += 1;
      if (r.status === 'Present') courseMap[c].present += 1;
      else if (r.status === 'Absent') courseMap[c].absent += 1;
      else if (r.status === 'Late') courseMap[c].late += 1;
    }

    const courseSummaries: CourseAttendanceSummary[] = Object.keys(courseMap).map((c) => {
      const d = courseMap[c];
      const pct = d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 100;
      return {
        course: c,
        totalSessions: d.total,
        totalPresent: d.present,
        totalAbsent: d.absent,
        totalLate: d.late,
        attendancePercentage: pct,
      };
    });

    const today = new Date().toISOString().split('T')[0];
    const totalScansToday = this.data.studentAttendance.filter(
      (r) => r.date === today && r.scanMethod === 'QR_CAMERA'
    ).length;

    return {
      courseSummaries,
      totalScansToday,
      dailyLogs: records.slice(0, 50),
    };
  }

  // --- Teachers & Teacher Attendance ---
  public getTeachers(): Teacher[] {
    return this.data.teachers;
  }

  public getTeacherAttendance(filters?: {
    date?: string;
    teacherId?: string;
  }): TeacherAttendanceRecord[] {
    let result = this.data.teacherAttendance;
    if (filters?.date) {
      result = result.filter((t) => t.date === filters.date);
    }
    if (filters?.teacherId) {
      result = result.filter((t) => t.teacherId === filters.teacherId);
    }
    return result;
  }

  public markTeacherAttendance(data: {
    teacherId: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    status: TeacherAttendanceRecord['status'];
    leaveDetails?: string;
    markedBy: string;
  }): TeacherAttendanceRecord {
    const teacher = this.data.teachers.find((t) => t.id === data.teacherId);
    if (!teacher) throw new Error('Teacher profile not found');

    const existingIndex = this.data.teacherAttendance.findIndex(
      (a) => a.teacherId === data.teacherId && a.date === data.date
    );

    let record: TeacherAttendanceRecord;
    if (existingIndex >= 0) {
      record = {
        ...this.data.teacherAttendance[existingIndex],
        checkInTime: data.checkInTime || this.data.teacherAttendance[existingIndex].checkInTime,
        checkOutTime: data.checkOutTime || this.data.teacherAttendance[existingIndex].checkOutTime,
        status: data.status,
        leaveDetails: data.leaveDetails,
        markedBy: data.markedBy,
      };
      this.data.teacherAttendance[existingIndex] = record;
    } else {
      record = {
        id: `att_tch_${data.teacherId}_${data.date}_${Date.now()}`,
        teacherId: teacher.id,
        staffId: teacher.staffId,
        teacherName: teacher.fullName,
        assignedSubjects: teacher.subject,
        department: teacher.department,
        date: data.date,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        status: data.status,
        leaveDetails: data.leaveDetails,
        markedBy: data.markedBy,
      };
      this.data.teacherAttendance.push(record);
    }

    this.addAuditLog(
      'TEACHER_ATTENDANCE_RECORDED',
      data.markedBy,
      `Recorded attendance for faculty member ${teacher.fullName} (${teacher.staffId}) on ${data.date}: Status ${data.status}, Check-in: ${data.checkInTime}`,
      'TEACHER_ATTENDANCE_RECORDED',
      {
        severity: 'info',
        targetEntity: 'TeacherAttendance',
        targetId: teacher.id,
        targetName: teacher.fullName,
        newState: record,
      }
    );

    this.saveData();
    return record;
  }

  // --- Examination Results ---
  public getExamResults(filters?: {
    rollNumber?: string;
    studentId?: string;
    examName?: string;
    class?: string;
    isPublished?: boolean;
  }): ExamResult[] {
    let result = this.data.examResults;
    if (filters?.rollNumber) {
      result = result.filter(
        (r) => r.rollNumber.trim().toLowerCase() === filters.rollNumber!.trim().toLowerCase()
      );
    }
    if (filters?.studentId) {
      result = result.filter((r) => r.studentId === filters.studentId);
    }
    if (filters?.examName && filters.examName !== 'All') {
      result = result.filter((r) => r.examName === filters.examName);
    }
    if (filters?.class && filters.class !== 'All') {
      result = result.filter((r) => r.class === filters.class);
    }
    if (filters?.isPublished !== undefined) {
      result = result.filter((r) => r.isPublished === filters.isPublished);
    }

    return result.sort((a, b) => {
      const numA = parseInt(a.rollNumber, 10);
      const numB = parseInt(b.rollNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });
  }

  public saveExamResult(resultData: any, authorizedBy = 'Examiner'): ExamResult {
    const student = this.getStudentById(resultData.studentId);
    if (!student) throw new Error('Student not found for examination result');

    const totalMax = (resultData.subjects || []).reduce(
      (sum: number, s: any) => sum + (Number(s.maxMarks) || 0),
      0
    );
    const totalObtained = (resultData.subjects || []).reduce(
      (sum: number, s: any) => sum + (Number(s.obtainedMarks) || 0),
      0
    );
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    let finalGrade = 'F';
    if (percentage >= 80) finalGrade = 'A+';
    else if (percentage >= 70) finalGrade = 'A';
    else if (percentage >= 60) finalGrade = 'B';
    else if (percentage >= 50) finalGrade = 'C';
    else if (percentage >= 40) finalGrade = 'D';

    const passFailStatus = percentage >= 40 ? 'Pass' : 'Fail';

    const calculated: ExamResult = {
      ...resultData,
      id: resultData.id || `res_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      rollNumber: student.rollNumber,
      studentName: student.fullName,
      fatherName: student.fatherName,
      class: student.admissionClass,
      section: student.section,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObtained,
      percentage: Number(percentage.toFixed(2)),
      finalGrade,
      passFailStatus,
      updatedBy: authorizedBy,
    };

    const existingIdx = this.data.examResults.findIndex((r) => r.id === calculated.id);
    if (existingIdx >= 0) {
      this.data.examResults[existingIdx] = calculated;
    } else {
      this.data.examResults.push(calculated);
    }

    this.addAuditLog(
      'EXAM_RESULT_SAVED',
      authorizedBy,
      `Saved exam result for ${student.fullName} (Roll: ${student.rollNumber}) in ${calculated.examName}`,
      'EXAM_RESULT_SAVED'
    );
    this.saveData();
    return calculated;
  }

  public togglePublishExamResult(
    id: string,
    isPublished: boolean,
    authorizedBy = 'Principal'
  ): ExamResult {
    const res = this.data.examResults.find((r) => r.id === id);
    if (!res) throw new Error('Result not found');
    res.isPublished = isPublished;
    res.publishedAt = isPublished ? new Date().toISOString() : undefined;
    res.updatedBy = authorizedBy;

    this.addAuditLog(
      'EXAM_RESULT_PUBLISHED',
      authorizedBy,
      `${isPublished ? 'Published' : 'Unpublished'} result ${res.examName} for ${res.studentName} (Roll: ${res.rollNumber})`,
      'EXAM_RESULT_PUBLISHED'
    );
    this.saveData();
    return res;
  }

  // --- Timetables & Announcements ---
  public getTimetables(className?: string): TimetableItem[] {
    if (className && className !== 'All') {
      return this.data.timetables.filter((t) => t.class === className);
    }
    return this.data.timetables;
  }

  public addTimetableItem(item: Omit<TimetableItem, 'id'>): TimetableItem {
    const newItem: TimetableItem = {
      ...item,
      id: `tt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    this.data.timetables.push(newItem);
    this.saveData();
    return newItem;
  }

  public deleteTimetableItem(id: string): boolean {
    const idx = this.data.timetables.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.data.timetables.splice(idx, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  public getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  public createAnnouncement(
    data: Omit<Announcement, 'id' | 'publishDate'>,
    author = 'Principal Office'
  ): Announcement {
    const item: Announcement = {
      ...data,
      id: `anc_${Date.now()}`,
      publishDate: new Date().toISOString().split('T')[0],
      author,
    };
    this.data.announcements.unshift(item);
    this.saveData();
    return item;
  }

  // --- Audit Logs ---
  public getAuditLogs(filters?: any): AuditLog[] {
    return auditLogManager.query(filters);
  }

  public getAuditLogStats() {
    return auditLogManager.getStats();
  }

  public exportAuditCsv(filters?: any): string {
    return auditLogManager.exportCsv(filters);
  }

  public addAuditLog(
    action: string,
    performedBy: string,
    details: string,
    actionType: AuditActionType = 'SETTINGS_UPDATED',
    opts?: {
      role?: string;
      targetEntity?: string;
      targetId?: string;
      targetName?: string;
      previousState?: any;
      newState?: any;
      severity?: AuditSeverity;
      ipAddress?: string;
    }
  ): AuditLog {
    const log = auditLogManager.log({
      action,
      actionType,
      performedBy,
      role: opts?.role,
      targetEntity: opts?.targetEntity,
      targetId: opts?.targetId,
      targetName: opts?.targetName,
      details,
      previousState: opts?.previousState,
      newState: opts?.newState,
      severity: opts?.severity,
      ipAddress: opts?.ipAddress,
    });
    this.data.auditLogs = auditLogManager.getLogs();
    this.saveData();
    return log;
  }

  // --- Dashboard Statistics ---
  public getDashboardStats() {
    const totalStudents = this.data.students.length;
    const totalTeachers = this.data.teachers.length;
    const pendingApplications = this.data.applications.filter((a) => a.status === 'Pending').length;
    const resultsPublished = this.data.examResults.filter((r) => r.isPublished).length;

    const totalFeesDue = this.data.feeAccounts2026.reduce((acc, f) => acc + f.totalFeeDue, 0);
    const totalFeesCollected = this.data.feeAccounts2026.reduce((acc, f) => acc + f.amountPaid, 0);
    const outstandingFeeBalance = this.data.feeAccounts2026.reduce(
      (acc, f) => acc + f.remainingBalance,
      0
    );

    const today = new Date().toISOString().split('T')[0];
    const todayStudentAtt = this.data.studentAttendance.filter((a) => a.date === today);
    const studentsPresent = todayStudentAtt.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    ).length;
    const studentsAbsent = todayStudentAtt.filter((a) => a.status === 'Absent').length;

    const todayTeacherAtt = this.data.teacherAttendance.filter((a) => a.date === today);
    const teachersPresent = todayTeacherAtt.filter((a) => a.status === 'Present').length;
    const teachersAbsent = todayTeacherAtt.filter(
      (a) => a.status === 'Absent' || a.status === 'Leave Approved'
    ).length;

    return {
      totalStudents,
      totalTeachers,
      pendingApplications,
      resultsPublished,
      totalFeesDue,
      totalFeesCollected,
      outstandingFeeBalance,
      studentsPresent,
      studentsAbsent,
      teachersPresent,
      teachersAbsent,
      todayDate: today,
      schoolLocation: this.data.settings.location,
    };
  }

  // --- Online Payments (EasyPaisa 03327185311) ---
  public getOnlinePayments(): OnlinePaymentSubmission[] {
    return this.data.onlinePayments || [];
  }

  public submitOnlinePayment(data: {
    rollNumber: string;
    studentName: string;
    fatherName?: string;
    class: string;
    paymentMethod?: 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';
    easypaisaNumber?: string;
    senderMobile: string;
    senderName: string;
    transactionId: string;
    amountPaid: number;
    month: Month2026;
    feeType?: 'Tuition Fee' | 'Admission Fee' | 'Examination Fee' | 'Full Package';
    screenshotUrl?: string;
    adminNotes?: string;
  }): OnlinePaymentSubmission {
    if (!this.data.onlinePayments) {
      this.data.onlinePayments = [];
    }

    const tidClean = (data.transactionId || '').trim();
    if (!tidClean) {
      throw new Error('Transaction ID (TID) is required for verification.');
    }

    // Check if duplicate TID already submitted
    const existing = this.data.onlinePayments.find(
      (p) => p.transactionId.trim().toLowerCase() === tidClean.toLowerCase()
    );
    if (existing) {
      throw new Error(`Transaction ID ${tidClean} was already submitted on ${existing.submissionDate}. Status: ${existing.status}`);
    }

    // Match student if exists
    const rollClean = (data.rollNumber || '').trim();
    const student = this.data.students.find(
      (s) => s.rollNumber.trim().toLowerCase() === rollClean.toLowerCase()
    );

    const submission: OnlinePaymentSubmission = {
      id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      trackingNumber: `OEH-EP-${Date.now().toString().slice(-6)}`,
      studentId: student?.id,
      rollNumber: rollClean,
      studentName: student?.fullName || data.studentName.trim(),
      fatherName: student?.fatherName || data.fatherName,
      class: student?.admissionClass || data.class,
      paymentMethod: data.paymentMethod || 'EasyPaisa',
      easypaisaNumber: data.easypaisaNumber || '03327185311',
      senderMobile: (data.senderMobile || '').trim(),
      senderName: (data.senderName || '').trim(),
      transactionId: tidClean,
      amountPaid: Number(data.amountPaid),
      month: data.month,
      feeType: data.feeType || 'Tuition Fee',
      screenshotUrl: data.screenshotUrl,
      status: 'Pending Verification',
      submissionDate: new Date().toISOString().split('T')[0],
      adminNotes: data.adminNotes,
    };

    this.data.onlinePayments.unshift(submission);

    this.addAuditLog(
      'ONLINE_PAYMENT_SUBMITTED',
      `Parent (${data.senderName || 'Anonymous'})`,
      `Online EasyPaisa Payment Submitted: Rs. ${Number(data.amountPaid).toLocaleString()} for Roll #${rollClean} (${submission.studentName}) - TID: ${tidClean} (Account: 03327185311)`,
      'ONLINE_PAYMENT_SUBMITTED',
      {
        severity: 'info',
        targetEntity: 'OnlinePayment',
        targetId: submission.id,
        targetName: submission.studentName,
        newState: submission,
      }
    );

    this.saveData();
    return submission;
  }

  public verifyOnlinePayment(
    paymentId: string,
    action: 'approve' | 'reject',
    adminNotes: string,
    authorizedBy = 'Admin Cashier'
  ): OnlinePaymentSubmission {
    if (!this.data.onlinePayments) this.data.onlinePayments = [];
    const payment = this.data.onlinePayments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment submission not found');

    if (action === 'approve') {
      payment.status = 'Approved & Verified';
      payment.verifiedBy = authorizedBy;
      payment.verifiedAt = new Date().toISOString();
      payment.adminNotes = adminNotes || 'Verified against EasyPaisa statement (03327185311).';

      // Find student and record payment in fee ledger
      let student = payment.studentId
        ? this.data.students.find((s) => s.id === payment.studentId)
        : this.data.students.find((s) => s.rollNumber.trim() === payment.rollNumber.trim());

      if (student) {
        this.recordFeePayment({
          studentId: student.id,
          amountPaid: payment.amountPaid,
          feeMonthOrPeriod: `${payment.month} 2026 (${payment.feeType})`,
          paymentMethod: 'Bank Transfer / EasyPaisa / JazzCash',
          authorizedStaff: authorizedBy,
          notes: `Verified EasyPaisa TID: ${payment.transactionId} from ${payment.senderName} (${payment.senderMobile})`,
        });
      }
    } else {
      payment.status = 'Rejected';
      payment.verifiedBy = authorizedBy;
      payment.verifiedAt = new Date().toISOString();
      payment.adminNotes = adminNotes || 'Transaction ID not verified or payment rejected.';
    }

    this.addAuditLog(
      'ONLINE_PAYMENT_VERIFIED',
      authorizedBy,
      `${action === 'approve' ? 'Approved & Recorded' : 'Rejected'} Online Payment (${payment.trackingNumber}) for Roll #${payment.rollNumber} - Rs. ${payment.amountPaid}`,
      'ONLINE_PAYMENT_VERIFIED',
      {
        severity: action === 'approve' ? 'info' : 'warning',
        targetEntity: 'OnlinePayment',
        targetId: payment.id,
        targetName: payment.studentName,
        newState: payment,
      }
    );

    this.saveData();
    return payment;
  }
}

export const db = new SchoolDatabase();
