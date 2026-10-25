import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==================== REST API ENDPOINTS ====================

// --- Settings ---
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = db.updateSettings(req.body, req.body.adminName || 'Admin');
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Students ---
app.get('/api/students', (req, res) => {
  res.json(db.getStudents());
});

app.get('/api/students/:id', (req, res) => {
  const student = db.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.get('/api/students/roll/:rollNumber', (req, res) => {
  const student = db.getStudentByRoll(req.params.rollNumber);
  if (!student) return res.status(404).json({ error: 'Student with this roll number not found' });
  res.json(student);
});

app.put('/api/students/:id', (req, res) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body, req.body.authorizedBy || 'Admin');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/students/:id/move-level', (req, res) => {
  try {
    const { newLevelOrClass, reason, authorizedBy } = req.body;
    if (!newLevelOrClass) {
      return res.status(400).json({ error: 'New learning level or tuition class is required' });
    }
    const result = db.moveStudentLevelOrClass(
      req.params.id,
      newLevelOrClass,
      reason,
      authorizedBy || 'Principal'
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// QR Code Scanning & Attendance Route
app.post('/api/students/scan-qr', (req, res) => {
  try {
    const result = db.scanQrAttendance(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Regenerate Student QR Code (replacement card)
app.post('/api/students/:id/regenerate-qr', (req, res) => {
  try {
    const student = db.regenerateStudentQrCode(req.params.id, req.body.authorizedBy || 'Administrator');
    res.json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Student Status (Active, Withdrawn, Inactive)
app.patch('/api/students/:id/status', (req, res) => {
  try {
    const { status, reason, authorizedBy } = req.body;
    const student = db.updateStudentStatus(req.params.id, status, reason, authorizedBy);
    res.json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Course Attendance Reports
app.get('/api/attendance/course-reports', (req, res) => {
  const { course } = req.query as { course?: string };
  res.json(db.getCourseAttendanceReports(course));
});

// --- Enrollment System ---
app.get('/api/applications', (req, res) => {
  res.json(db.getApplications());
});

app.post('/api/enrollment', (req, res) => {
  try {
    const { autoApprove, ...appData } = req.body;
    // Server validation
    if (!appData.fullName || !appData.fatherName || !appData.dob || !appData.phone || !appData.admissionClass) {
      return res.status(400).json({ error: 'Please provide all required enrollment details.' });
    }

    const result = db.submitEnrollment(appData, autoApprove === true);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/applications/:id/approve', (req, res) => {
  try {
    const adminName = req.body.adminName || 'Admin Principal';
    const result = db.approveApplication(req.params.id, adminName);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/applications/:id/reject', (req, res) => {
  try {
    const { reason, adminName } = req.body;
    const result = db.rejectApplication(req.params.id, reason || 'Did not meet criteria', adminName || 'Admin Principal');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Fee Management 2026 ---
app.get('/api/fees/accounts', (req, res) => {
  res.json(db.getFeeAccounts());
});

app.get('/api/fees/accounts/:studentId', (req, res) => {
  const account = db.getFeeAccountByStudentId(req.params.studentId);
  if (!account) return res.status(404).json({ error: 'Fee account not found' });
  const monthly = db.getMonthlyFeesByStudentId(req.params.studentId);
  const receipts = db.getFeeReceipts(req.params.studentId);
  res.json({ account, monthly, receipts });
});

app.post('/api/fees/payments', (req, res) => {
  try {
    const { studentId, amountPaid, feeMonthOrPeriod, paymentMethod, authorizedStaff, notes } = req.body;
    if (!studentId || !amountPaid || !feeMonthOrPeriod) {
      return res.status(400).json({ error: 'Missing payment details.' });
    }
    const result = db.recordFeePayment({
      studentId,
      amountPaid: Number(amountPaid),
      feeMonthOrPeriod,
      paymentMethod: paymentMethod || 'Cash',
      authorizedStaff: authorizedStaff || 'Finance Cashier',
      notes,
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/fees/accounts/:studentId/config', (req, res) => {
  try {
    const updated = db.updateFeeAccountConfig(req.params.studentId, req.body, req.body.authorizedBy || 'Finance Head');
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/fees/receipts', (req, res) => {
  const studentId = req.query.studentId as string | undefined;
  res.json(db.getFeeReceipts(studentId));
});

// --- Online Payments (EasyPaisa 03327185311) ---
app.get('/api/fees/online-payments', (req, res) => {
  res.json(db.getOnlinePayments());
});

app.post('/api/fees/online-payments', (req, res) => {
  try {
    const submission = db.submitOnlinePayment(req.body);
    res.status(201).json(submission);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/fees/online-payments/:id/verify', (req, res) => {
  try {
    const { action, adminNotes, authorizedBy } = req.body;
    const result = db.verifyOnlinePayment(req.params.id, action || 'approve', adminNotes, authorizedBy);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Student Attendance ---
app.get('/api/attendance/students', (req, res) => {
  const { class: className, section, date, studentId } = req.query as { class?: string; section?: string; date?: string; studentId?: string };
  res.json(db.getStudentAttendance({ class: className, section, date, studentId }));
});

app.post('/api/attendance/students', (req, res) => {
  try {
    const records = req.body.records;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records array required' });
    }
    const updated = db.markStudentAttendance(records);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Teachers & Teacher Attendance ---
app.get('/api/teachers', (req, res) => {
  res.json(db.getTeachers());
});

app.get('/api/attendance/teachers', (req, res) => {
  const { date, teacherId } = req.query as { date?: string; teacherId?: string };
  res.json(db.getTeacherAttendance({ date, teacherId }));
});

app.post('/api/attendance/teachers', (req, res) => {
  try {
    const result = db.markTeacherAttendance(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Examination Results ---
app.get('/api/exams/results', (req, res) => {
  const { rollNumber, studentId, examName, class: className, isPublished } = req.query as any;
  const isPub = isPublished !== undefined ? isPublished === 'true' : undefined;
  res.json(db.getExamResults({ rollNumber, studentId, examName, class: className, isPublished: isPub }));
});

app.post('/api/exams/results', (req, res) => {
  try {
    const authorizedBy = req.body.authorizedBy || 'Examiner';
    const saved = db.saveExamResult(req.body, authorizedBy);
    res.json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/exams/results/:id/publish', (req, res) => {
  try {
    const { isPublished, authorizedBy } = req.body;
    const result = db.togglePublishExamResult(req.params.id, Boolean(isPublished), authorizedBy || 'Principal');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Timetable & Announcements ---
app.get('/api/timetables', (req, res) => {
  const className = req.query.class as string | undefined;
  res.json(db.getTimetables(className));
});

app.post('/api/timetables', (req, res) => {
  try {
    const item = db.addTimetableItem(req.body);
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/timetables/:id', (req, res) => {
  const success = db.deleteTimetableItem(req.params.id);
  res.json({ success });
});

app.get('/api/announcements', (req, res) => {
  res.json(db.getAnnouncements());
});

app.post('/api/announcements', (req, res) => {
  try {
    const item = db.createAnnouncement(req.body, req.body.author || 'Admin Office');
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Dashboard Stats & Audit Logs ---
app.get('/api/dashboard/stats', (req, res) => {
  res.json(db.getDashboardStats());
});

app.get('/api/audit-logs', (req, res) => {
  const { actionType, severity, performedBy, targetEntity, search, startDate, endDate, limit } = req.query as any;
  const logs = db.getAuditLogs({
    actionType,
    severity,
    performedBy,
    targetEntity,
    search,
    startDate,
    endDate,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(logs);
});

app.get('/api/audit-logs/stats', (req, res) => {
  res.json(db.getAuditLogStats());
});

app.get('/api/audit-logs/export', (req, res) => {
  const { actionType, severity, performedBy, targetEntity, search } = req.query as any;
  const csv = (db as any).exportAuditCsv?.({ actionType, severity, performedBy, targetEntity, search }) || '';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="oxfored_audit_logs.csv"');
  res.send(csv);
});

// ==================== AI CAPABILITIES (GEMINI API) ====================

// 1. Registration AI Support Chatbot
app.post('/api/ai/registration-support', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const schoolContext = `
You are the Official AI Admission Support Assistant for "OXFORED EDUCATIONAL HOUSE", located at BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI.
Website developer: Made by Atif Panezai, Professional App and Web Developer of Pakistan.
School motto: "Excellence in Education, Character Building & Modern Learning".

School Information:
- Academic Year: 2026-2027
- Programs: 11 Learning Levels (Level Kids to Level Advance, Nazra e Quran, Caligraphy) and Tuition Classes (Nursery to Class 10th).
- Dedicated Institutional Faculty:
  1. SIR ABBAS: Senior Faculty & Head of English Department (All English Grammar levels Level Kids to Advance & Senior Board Tuitions Class 8th to 10th)
  2. SIR SHARIFULLAH: Master Instructor of Quranic Sciences & Islamic Calligraphy (Caligraphy & Nazra e Quran)
  3. SIR SHAKIR: Primary Tuition Specialist (Tuition Classes from Nursery to Class 4)
  4. SIR ATLAS: Middle School Tuition Specialist (Tuition Classes from Class 5 to 7th Class)
- Official Fee Structure:
  - English Grammar (from Level Kids to Level Advance): Rs. 1,500 per month
  - Tuition Classes (Nursery to Class 10th): Rs. 1,000 per subject per month
  - Caligraphy: Rs. 1,000 per student per month
  - Nazra e Quran: Rs. 600 per student per month
- Strict Monthly Fee Payment Policy:
  - Every student must pay their fee at the start of the month between the 1st and 5th date (1st to 5th).
  - CRITICAL RULE: Otherwise, the student will be removed / barred from their class!
- EasyPaisa Official Account:
  - Mobile Number: 03327185311
  - Account Title: OXFORED EDUCATIONAL HOUSE / ATIF PANEZAI
- Contact Information:
  - Phone / WhatsApp / EasyPaisa: 03327185311
  - Email: info@oxfored.edu.pk
  - Address: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI

Instructions:
- Be warm, welcoming, polite, highly informative, and encouraging to prospective students and parents.
- Answer questions in English or Urdu (if the user asks in Urdu/Roman Urdu, respond courteously in the same language or bilingual).
- Guide users step-by-step through the online enrollment form on the website.
- Emphasize the permanent roll number system (starting at 1) and automatic fee linking.
- Keep responses concise, clear, and well-structured using bullet points.
`;

  try {
    if (aiClient) {
      const prompt = `${schoolContext}\n\nUser Question: ${message}\nAnswer:`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      return res.json({ reply: response.text });
    }
  } catch (err: any) {
    console.error('Gemini Registration AI call error:', err);
  }

  // Fallback intelligent responder if API key is not yet set or call fails
  const lower = message.toLowerCase();
  let fallbackReply = `Welcome to Oxfored Educational House! Our Admissions for the 2026-2027 Academic Session are open. We offer 11 Learning Levels (Level Kids to Advance, Nazra e Quran, Caligraphy) and Tuition Classes (Nursery to 10th). Our faculty includes Sir Abbas, Sir Sharifullah, Sir Shakir, and Sir Atlas. Admitted students receive permanent numeric roll numbers starting at 1.`;

  if (lower.includes('fee') || lower.includes('cost') || lower.includes('charges')) {
    fallbackReply = `Here is the Oxfored Educational House Official Fee Schedule:
• English Grammar (Level Kids to Level Advance): Rs. 1,500 / month
• Tuition Classes (Nursery to Class 10th): Rs. 1,000 / month per subject
  - Nursery to Class 4: SIR SHAKIR
  - Class 5 to 7th Class: SIR ATLAS
  - Class 8 to 10th Class: SIR ABBAS
• Caligraphy: Rs. 1,000 / month (SIR SHARIFULLAH)
• Nazra e Quran: Rs. 600 / month (SIR SHARIFULLAH)
⚠️ STRICT RULE: Every student must pay their monthly fee between the 1st and 5th date of each month; otherwise the student will be removed from their class!
EasyPaisa Number for Online Fee Payment: 03327185311`;
  } else if (lower.includes('teacher') || lower.includes('faculty') || lower.includes('shakir') || lower.includes('atlas') || lower.includes('abbas')) {
    fallbackReply = `Our dedicated teaching faculty:
• SIR ABBAS: Senior Faculty & Head of English Department (English Grammar Kids to Advance & Senior Tuitions)
• SIR SHARIFULLAH: Master Instructor (Caligraphy & Nazra e Quran)
• SIR SHAKIR: Primary Tuition Specialist (Nursery to Class 4)
• SIR ATLAS: Middle School Tuition Specialist (Class 5 to 7th Class)`;
  } else if (lower.includes('document') || lower.includes('require') || lower.includes('paper')) {
    fallbackReply = `Required Documents for Admission at Oxfored Educational House:
1. Student's B-Form or Official Birth Certificate copy
2. Father / Guardian's CNIC copy
3. Recent genuine student photograph (mandatory upload)
4. Previous School Leaving Certificate (SLC) if applicable
You can upload these directly during online enrollment.`;
  } else if (lower.includes('where') || lower.includes('location') || lower.includes('address') || lower.includes('contact') || lower.includes('phone')) {
    fallbackReply = `Oxfored Educational House Campus Contact Details:
• Location: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
• Phone / EasyPaisa: 03327185311
• Email: info@oxfored.edu.pk
Office timings: Monday to Saturday, 08:00 AM to 02:00 PM (PKT).`;
  }

  return res.json({ reply: fallbackReply });
});

// 2. Smart AI Student Academic Assistant
app.post('/api/ai/student-assistant', async (req, res) => {
  const { question, studentClass, subject } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const academicContext = `
You are "Smart AI", the dedicated 24/7 personal academic tutor and learning mentor for students of "OXFORED EDUCATIONAL HOUSE" Quetta.
Your mission is to help students excel in their studies, understand difficult concepts, solve homework problems, prepare for exams (Federal Board & Balochistan Board curriculum), and develop sharp critical thinking skills.

Student Details:
- Class: ${studentClass || 'General Secondary School'}
- Subject: ${subject || 'General Studies'}

Pedagogical Instructions:
- Provide clear, accurate, step-by-step explanations suited to the student's grade level.
- When explaining Mathematics or Science, write equations clearly and explain each step in plain English (or Urdu where helpful).
- Encourage the student with positive, motivating academic feedback.
- Provide practical real-world examples and memory tips/mnemonics.
- Never just do tests without explaining the reasoning.
- Keep the tone respectful, scholarly, and supportive.
`;

  try {
    if (aiClient) {
      const prompt = `${academicContext}\n\nStudent Question: ${question}\n\nExplanation & Solution:`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      return res.json({ answer: response.text });
    }
  } catch (err: any) {
    console.error('Gemini Student AI call error:', err);
  }

  // Fallback academic response
  const fallbackAnswer = `Hello! I am your Oxfored Educational House Smart AI Tutor. 
Regarding your question on "${question}":

1. Concept Overview:
Every subject builds upon fundamental principles. In ${subject || 'Science & Math'}, breakdown large problems into smaller logical steps.

2. Step-by-Step Approach:
• Identify the given data and what needs to be solved.
• Apply the relevant standard formula or grammatical rule.
• Double check your final units and calculations.

For deeper insights, please feel free to review your class notes or discuss this in your next class with your teacher at Oxfored Educational House!`;

  return res.json({ answer: fallbackAnswer });
});

// ==================== VITE & STATIC FILES ====================

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oxfored Educational House Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
});
