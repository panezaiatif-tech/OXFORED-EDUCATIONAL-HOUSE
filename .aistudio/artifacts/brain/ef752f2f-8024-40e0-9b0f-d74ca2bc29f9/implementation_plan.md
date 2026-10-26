# Implementation Plan: Dynamic Roll Number Reallocation & Student Departure System

## User Review Required

> [!IMPORTANT]
> **Key Operational Policies To Review:**
> 1. **Roll Number Gap-Filling Strategy:** When a student leaves or has their roll number changed, the freed roll number (e.g., Roll #1, Roll #3) is automatically placed into the **Vacated Roll Numbers Pool**. The enrollment system will prioritize reusing these vacated numbers in ascending order before generating higher numbers, keeping the roster compact.
> 2. **Departure / Exit Mechanism:** When a student leaves or is removed, their status is set to `Withdrawn` / `Left Academy`. They are immediately barred and excluded from the Daily Attendance Register, class rosters, and new billing cycles, while their past payment receipts and exam marks remain safely archived with an audit trail.
> 3. **Manual Roll Number Reassignment:** Authorized school administrators and faculty can manually change any student's roll number at any time through the Admin Portal, with instant conflict detection and cascading updates to their Fee Account, Attendance Records, and Student ID Card QR Token.

---

## Proposed Changes

### 1. Data Schema & Core Engine (`src/types.ts` & `server/db.ts`)

#### `src/types.ts`
- Add departure tracking fields to `Student`:
  - `departureReason?: 'Voluntary Withdrawal' | 'Fee Non-Payment Removal' | 'Relocation' | 'Disciplinary Expulsion' | 'Course Completed';`
  - `departureDate?: string;`
  - `departureNotes?: string;`
  - `isArchived?: boolean;`
- Extend database state to maintain `vacatedRollNumbers: string[]` representing freed numbers ready for immediate reallocation.

#### `server/db.ts`
- **Smart Roll Number Allocation (`generateNextPermanentRollNumber`)**:
  - Check `vacatedRollNumbers` first. If any vacated numbers exist (e.g. `['1', '3']`), pop the lowest numeric roll number and assign it to the new student.
  - If no vacated numbers exist, increment the highest active roll number.
- **Manual Roll Number Change Method (`reassignStudentRollNumber`)**:
  - Validates that the requested target roll number is not currently occupied by another active student.
  - If the requested roll number was in the `vacatedRollNumbers` pool, remove it from the pool.
  - Place the student's old roll number into `vacatedRollNumbers`.
  - Update `student.rollNumber` and regenerate `qrCodeToken`.
  - Cascade roll number updates across `feeAccounts2026`, `monthlyFees2026`, `studentAttendance`, and `examResults`.
  - Record a critical audit log entry in `AuditLogManager`.
- **Student Departure / Exit Method (`processStudentDeparture`)**:
  - Changes `student.status` to `'Withdrawn'`.
  - Deactivates `student.qrCodeActive = false`.
  - Adds the student's current roll number into `vacatedRollNumbers` pool so it can be reallocated to another student immediately.
  - Clears `student.rollNumber` to an archived format (e.g., `ARCHIVED-1`) or releases the numeric identifier `1` while preserving student ID for historical lookup.
  - Logs departure reason and administrative notes in `AuditLogManager`.
- **Attendance Filter Enhancement (`getStudents`)**:
  - By default, only return `status: 'Active'` students in daily attendance and active class rosters so withdrawn students never clutter the register.
  - Provide an optional `includeWithdrawn: boolean` query flag for directory and historical records.

---

### 2. Backend API Routes (`server.ts`)

- `POST /api/students/:id/reassign-roll`:
  - Payload: `{ newRollNumber: string, reason: string, authorizedBy: string }`
  - Calls `db.reassignStudentRollNumber` and returns updated student record.
- `POST /api/students/:id/departure`:
  - Payload: `{ reason: string, notes: string, releaseRollNumber: boolean, authorizedBy: string }`
  - Calls `db.processStudentDeparture`.
- `GET /api/students/vacated-rolls`:
  - Returns current array of available vacated roll numbers and recent departure logs.

---

### 3. User Interface Updates

#### `AdminDashboardPage.tsx`
- **"Change Roll Number" Modal**:
  - Accessible via a quick action button on any student in the directory.
  - Shows current roll number, quick suggestions from the **Vacated Roll Numbers Pool**, and an input for custom roll numbers with real-time uniqueness validation.
- **"Student Departure / Exit from Academy" Modal**:
  - Allows staff to remove a student who wants to leave or was barred.
  - Reasons: Voluntary withdrawal, Fee non-payment expulsion, Relocation, Course completed.
  - Checkbox: *"Release Roll Number #[X] immediately for other students (Recommended)"*.
  - Success alert confirming the student is removed from all class rosters and their roll number is ready for reuse.
- **Vacated Roll Numbers Status Banner**:
  - Displays currently available roll numbers ready to be granted to new students.

#### `StudentAttendancePage.tsx`
- Ensure students who have left the academy are automatically excluded from the daily register and summary counters.
- If a vacated roll number is assigned to a new student, that new student immediately appears under their new roll number with their own photograph.

#### `EnrollmentPage.tsx`
- Displays the assigned roll number on the confirmation screen, noting if a recycled/vacated roll number was reused (e.g., *"Assigned Vacated Roll Number: 1"*).

---

## Verification Plan

### Automated Endpoint Testing
1. **Enroll Student A** with Roll #1.
2. **Process Departure for Student A**:
   - Verify Student A status is updated to `Withdrawn`.
   - Verify Roll #1 is placed into `vacatedRollNumbers`.
   - Verify Student A is no longer listed in active attendance rosters.
3. **Enroll Student B**:
   - Verify Student B automatically receives Roll #1 (gap filled).
   - Verify Student B appears in the Daily Attendance Register under Roll #1 with Student B's photograph.
4. **Manual Roll Number Change**:
   - Reassign Student B to custom Roll #5.
   - Verify associated fee account, attendance logs, and QR code reflect Roll #5 without errors.

### Manual Verification
- Test "Change Roll Number" modal directly in the Admin Dashboard.
- Test "Leave Academy / Remove Student" button on a student card.
- Confirm vacated roll number pool updates in real time.
- Verify that ID card printout updates instantly with the new roll number and newly regenerated QR code.
