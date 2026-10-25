import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  PlusCircle,
  Eye,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  FeeAccount2026,
  MonthlyFeeRecord2026,
  FeePaymentReceipt,
  FeePaymentStatus,
  OnlinePaymentSubmission,
  LEARNING_LEVELS,
  TUITION_CLASSES,
  EMPTY_STUDENT_MESSAGE,
} from '../types';
import { PrintableReceipt } from '../components/PrintableReceipt';

export const FeeManagementPage: React.FC = () => {
  const [feeAccounts, setFeeAccounts] = useState<FeeAccount2026[]>([]);
  const [onlineSubmissions, setOnlineSubmissions] = useState<OnlinePaymentSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'ledgers' | 'online-easypaisa'>('ledgers');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals
  const [activeAccountForPayment, setActiveAccountForPayment] = useState<FeeAccount2026 | null>(null);
  const [activeStudentForMonths, setActiveStudentForMonths] = useState<{
    account: FeeAccount2026;
    monthly: MonthlyFeeRecord2026[];
    receipts: FeePaymentReceipt[];
  } | null>(null);
  const [activeConfigAccount, setActiveConfigAccount] = useState<FeeAccount2026 | null>(null);
  const [printableReceipt, setPrintableReceipt] = useState<FeePaymentReceipt | null>(null);

  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMonthOrPeriod, setPaymentMonthOrPeriod] = useState<string>('April 2026 Tuition Fee');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer / EasyPaisa / JazzCash' | 'Online' | 'Cheque'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [authorizedStaff, setAuthorizedStaff] = useState<string>('Accounts Officer Atif Panezai');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);

  // Fee Config states
  const [configMonthlyFee, setConfigMonthlyFee] = useState<number>(3500);
  const [configAdmissionFee, setConfigAdmissionFee] = useState<number>(5000);
  const [configOtherCharges, setConfigOtherCharges] = useState<number>(1200);
  const [configDiscounts, setConfigDiscounts] = useState<number>(0);

  const classes = [
    'All',
    ...LEARNING_LEVELS,
    ...TUITION_CLASSES,
  ];

  const statuses: (FeePaymentStatus | 'All')[] = [
    'All', 'Paid', 'Partially Paid', 'Unpaid', 'Overdue', 'Fee Waived'
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const accounts = await api.getFeeAccounts({
        class: selectedClass !== 'All' ? selectedClass : undefined,
        paymentStatus: selectedStatus !== 'All' ? (selectedStatus as FeePaymentStatus) : undefined,
      });
      setFeeAccounts(accounts);
      const submissions = await api.getOnlinePayments();
      setOnlineSubmissions(submissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmission = async (id: string, action: 'approve' | 'reject') => {
    setVerifyingId(id);
    try {
      await api.verifyOnlinePayment(
        id,
        action,
        action === 'approve'
          ? 'Verified against EasyPaisa statement (03327185311)'
          : 'Rejected by Accounts Office (TID invalid or unverified)',
        'Accounts Officer Atif Panezai'
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedStatus]);

  const filteredAccounts = feeAccounts.filter((acc) => {
    const term = searchQuery.toLowerCase();
    return (
      acc.studentName.toLowerCase().includes(term) ||
      acc.rollNumber.toLowerCase().includes(term) ||
      acc.fatherName.toLowerCase().includes(term)
    );
  });

  const handleOpenPayment = (acc: FeeAccount2026) => {
    setActiveAccountForPayment(acc);
    setPaymentAmount(String(acc.monthlyTuitionFee));
    setPaymentMonthOrPeriod('April 2026 Tuition Fee');
    setPaymentNotes('');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccountForPayment) return;

    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await api.recordFeePayment({
        feeAccountId: activeAccountForPayment.id,
        studentId: activeAccountForPayment.studentId,
        amount: amt,
        feeMonthOrPeriod: paymentMonthOrPeriod,
        paymentMethod,
        authorizedStaff,
        notes: paymentNotes,
      });

      setActiveAccountForPayment(null);
      setPrintableReceipt(res.receipt);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleOpen12Months = async (acc: FeeAccount2026) => {
    try {
      const [monthly, receipts] = await Promise.all([
        api.getMonthlyFees(acc.studentId),
        api.getFeeReceipts(acc.studentId),
      ]);
      setActiveStudentForMonths({ account: acc, monthly, receipts });
    } catch (err) {
      alert('Could not load monthly breakdown');
    }
  };

  const handleOpenConfig = (acc: FeeAccount2026) => {
    setActiveConfigAccount(acc);
    setConfigMonthlyFee(acc.monthlyTuitionFee);
    setConfigAdmissionFee(acc.admissionFee);
    setConfigOtherCharges(acc.otherApprovedCharges);
    setConfigDiscounts(acc.discountsOrWaivers);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfigAccount) return;

    try {
      await api.updateFeeStructure(activeConfigAccount.id, {
        monthlyTuitionFee: configMonthlyFee,
        admissionFee: configAdmissionFee,
        otherApprovedCharges: configOtherCharges,
        discountsOrWaivers: configDiscounts,
        authorizedBy: 'Principal Atif Panezai',
      });
      setActiveConfigAccount(null);
      await loadData();
    } catch (err) {
      alert('Failed to update fee configuration');
    }
  };

  // KPI Calculations
  const totalDue2026 = feeAccounts.reduce((sum, a) => sum + a.totalFeeDue, 0);
  const totalCollected2026 = feeAccounts.reduce((sum, a) => sum + a.amountPaid, 0);
  const totalOutstanding2026 = feeAccounts.reduce((sum, a) => sum + a.remainingBalance, 0);
  const collectionRate = totalDue2026 > 0 ? ((totalCollected2026 / totalDue2026) * 100).toFixed(1) : '0';

  const statusBadge = (status: FeePaymentStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300">
            Partially Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-red-100 text-red-800 border border-red-300">
            Overdue
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-300">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header in Emerald Green & Golden Yellow */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-8 border-2 border-yellow-400 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider border border-yellow-400/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Official Institutional Finance Directorate</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-wide">
          OXFORED EDUCATIONAL HOUSE — STUDENT FEE RECORDS 2026
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-3xl leading-relaxed">
          Comprehensive 2026 academic year fee management. Automatically connected to student enrollment with permanent database ID linking, Jan–Dec 2026 monthly billing, and instant balance auditing.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Fees Due (2026)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-950">
            Rs. {totalDue2026.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block">Session 2026–2027 Projected</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Fees Collected (2026)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-800">
            Rs. {totalCollected2026.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            {collectionRate}% Collection Rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Outstanding Fee Balance
          </span>
          <div className="text-2xl font-black font-mono text-red-600">
            Rs. {totalOutstanding2026.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 block">Calculated: Total Due − Amount Paid</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow-sm space-y-2 hover:border-yellow-400 transition-colors">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Linked Students
          </span>
          <div className="text-2xl font-black font-mono text-emerald-950">
            {feeAccounts.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">All 100% Auto-Linked</span>
        </div>
      </div>

      {/* Official Fee Schedule & 1st-5th Deadline Notice Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif font-black text-emerald-950 text-base">
              Standard Monthly Fee Schedule (Session 2026-2027)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-yellow-100 text-emerald-900 px-3 py-1 rounded-full border border-yellow-300">
            Due: 1st – 5th of Each Month
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">English Grammar</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 1,500</div>
            <p className="text-[10px] text-slate-600">Level Kids to Advance (Sir Abbas)</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Tuition Classes</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 1,000</div>
            <p className="text-[10px] text-slate-600">Per Subject (Nursery–4th: Sir Shakir, 5th–7th: Sir Atlas, 8th–10th: Sir Abbas)</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Caligraphy</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 1,000</div>
            <p className="text-[10px] text-slate-600">Per Student (Sir Sharifullah)</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Nazra e Quran</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 600</div>
            <p className="text-[10px] text-slate-600">Per Student (Sir Sharifullah)</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 flex items-start gap-2.5 text-xs text-red-950">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-red-700">Strict Due Date Policy (1st to 5th):</strong> Every student must pay their monthly fee between the <strong>1st and 5th date</strong> of each month. Otherwise, the student will be removed / barred from their class immediately without exception.
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation: 2026 Ledgers vs EasyPaisa Online Submissions (03327185311) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('ledgers')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ledgers'
              ? 'bg-emerald-950 text-yellow-300 shadow-md border-2 border-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-yellow-400" />
          <span>Student Fee Ledgers (2026)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-900 text-white text-[10px]">
            {feeAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('online-easypaisa')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'online-easypaisa'
              ? 'bg-emerald-950 text-yellow-300 shadow-md border-2 border-yellow-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping"></span>
          <span>EasyPaisa Submissions (03327185311)</span>
          {onlineSubmissions.filter((s) => s.status === 'Pending Verification').length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-emerald-950 font-black text-[10px]">
              {onlineSubmissions.filter((s) => s.status === 'Pending Verification').length} Pending
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ledgers' ? (
        <>
          {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, father name..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* MASTER 15-COLUMN TABLE */}
      <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-serif text-emerald-950">
              OXFORED EDUCATIONAL HOUSE — STUDENT FEE RECORDS 2026
            </h2>
            <p className="text-xs text-slate-500">
              Official 15-Column Institutional Register with 100% Automated Enrollment Link
            </p>
          </div>
          <span className="text-xs text-emerald-900 font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Showing {filteredAccounts.length} of {feeAccounts.length} Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-emerald-950 text-white font-bold whitespace-nowrap border-b-2 border-yellow-400">
              <tr>
                <th className="py-3 px-3 text-center">#</th>
                <th className="py-3 px-3">2. Student Name</th>
                <th className="py-3 px-3">3. Father's Name</th>
                <th className="py-3 px-3 font-mono">4. Roll Number</th>
                <th className="py-3 px-3">5. Class & Sec</th>
                <th className="py-3 px-3">6. Adm Date</th>
                <th className="py-3 px-3 text-right">7. Monthly Fee</th>
                <th className="py-3 px-3 text-right">8. Adm Fee</th>
                <th className="py-3 px-3 text-right">9. Other Charges</th>
                <th className="py-3 px-3 text-right">10. Total Due</th>
                <th className="py-3 px-3 text-right">11. Amount Paid</th>
                <th className="py-3 px-3 text-right">12. Remaining Bal</th>
                <th className="py-3 px-3 text-center">13. Status</th>
                <th className="py-3 px-3 text-center">14. Last Pay Date</th>
                <th className="py-3 px-3 text-center print:hidden">15. Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-10 text-center text-slate-500 italic">
                    Loading Oxfored Educational House 2026 Fee Ledgers...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-14 text-center">
                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-emerald-50/70 border-2 border-dashed border-emerald-200 text-emerald-950 font-bold text-xs leading-relaxed">
                      {EMPTY_STUDENT_MESSAGE}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc, index) => (
                  <tr
                    key={acc.id}
                    className={`hover:bg-yellow-50/40 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {acc.studentName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {acc.fatherName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-950">
                      {acc.rollNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {acc.class}–{acc.section}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {acc.admissionDate}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rs. {acc.monthlyTuitionFee.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rs. {acc.admissionFee.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rs. {acc.otherApprovedCharges.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950">
                      Rs. {acc.totalFeeDue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      Rs. {acc.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                      Rs. {acc.remainingBalance.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {statusBadge(acc.paymentStatus)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px]">
                      {acc.lastPaymentDate || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center print:hidden">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPayment(acc)}
                          className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-bold text-[10px] rounded-lg shadow-2xs transition-colors cursor-pointer border border-yellow-400/50"
                          title="Record new payment deposit"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={() => handleOpen12Months(acc)}
                          className="p-1 text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          title="View all 12 Months Breakdown (Jan–Dec 2026)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenConfig(acc)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Configure Fee, Scholarships & Waivers"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  ) : (
    /* EASYPAISA ONLINE SUBMISSIONS MANAGEMENT TABLE */
    <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-sm overflow-hidden space-y-0">
      <div className="p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-yellow-400">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping"></span>
            <h3 className="text-base font-black font-serif text-white uppercase tracking-wide">
              Online EasyPaisa Submissions (Account: 03327185311)
            </h3>
          </div>
          <p className="text-xs text-yellow-300">
            Verify incoming payments sent by parents to mobile number 03327185311 and credit the student fee ledger.
          </p>
        </div>
        <span className="text-xs bg-yellow-400 text-emerald-950 px-3 py-1 rounded-full font-black uppercase">
          {onlineSubmissions.length} Total Submissions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-emerald-900 text-white font-bold whitespace-nowrap border-b border-yellow-400">
            <tr>
              <th className="py-3 px-3 text-center">#</th>
              <th className="py-3 px-3 font-mono">Tracking #</th>
              <th className="py-3 px-3 font-mono">Roll #</th>
              <th className="py-3 px-3">Student Name</th>
              <th className="py-3 px-3">Class / Level</th>
              <th className="py-3 px-3">Month & Type</th>
              <th className="py-3 px-3 text-right font-black text-yellow-300">Amount Paid</th>
              <th className="py-3 px-3 font-mono">EasyPaisa TID</th>
              <th className="py-3 px-3">Sender Phone</th>
              <th className="py-3 px-3 text-center">Proof Screenshot</th>
              <th className="py-3 px-3 text-center">Date</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Verification Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {onlineSubmissions.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-500 bg-slate-50/50">
                  <div className="max-w-md mx-auto space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-700">No online EasyPaisa submissions received yet</p>
                    <p className="text-[11px] text-slate-500">
                      When parents send tuition fees to <strong>03327185311</strong> and submit the Online Payment form, their records will appear here for 1-click verification.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              onlineSubmissions.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-yellow-50/30 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-900">{sub.trackingNumber}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 bg-slate-50">{sub.rollNumber}</td>
                  <td className="py-3 px-3 font-bold text-emerald-950">
                    {sub.studentName}
                    {sub.fatherName && <span className="block text-[10px] text-slate-500">S/D/O {sub.fatherName}</span>}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{sub.class}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800">{sub.month} 2026</span>
                    <span className="block text-[10px] text-slate-500">{sub.feeType}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 bg-emerald-50/50 text-sm">
                    Rs. {sub.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-950 bg-yellow-50/50">
                    {sub.transactionId}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                    {sub.senderMobile}
                    {sub.senderName && <span className="block text-[10px] text-slate-500">{sub.senderName}</span>}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sub.screenshotUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewScreenshot(sub.screenshotUrl!)}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        View Proof
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">No Image</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                    {sub.submissionDate}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      sub.status === 'Approved & Verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : sub.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-yellow-100 text-yellow-900 border border-yellow-400'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {sub.status === 'Pending Verification' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          disabled={verifyingId === sub.id}
                          onClick={() => handleVerifySubmission(sub.id, 'approve')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] uppercase transition-all shadow cursor-pointer disabled:opacity-50"
                        >
                          {verifyingId === sub.id ? 'Saving...' : 'Approve & Credit'}
                        </button>
                        <button
                          disabled={verifyingId === sub.id}
                          onClick={() => handleVerifySubmission(sub.id, 'reject')}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {sub.verifiedBy ? `Verified by ${sub.verifiedBy}` : 'Processed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* Screenshot Preview Modal */}
  {previewScreenshot && (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b">
          <h4 className="font-bold text-emerald-950 text-sm">EasyPaisa Payment Receipt Screenshot</h4>
          <button
            onClick={() => setPreviewScreenshot(null)}
            className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto rounded-xl border">
          <img src={previewScreenshot} alt="Payment Proof" className="w-full object-contain" />
        </div>
        <button
          onClick={() => setPreviewScreenshot(null)}
          className="w-full py-2 bg-emerald-950 text-yellow-300 font-bold text-xs rounded-xl cursor-pointer"
        >
          Close Preview
        </button>
      </div>
    </div>
  )}

      {/* RECORD PAYMENT MODAL */}
      {activeAccountForPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-yellow-400 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold font-serif text-emerald-950">
                  Record Student Fee Deposit
                </h3>
                <p className="text-xs text-slate-500">
                  {activeAccountForPayment.studentName} ({activeAccountForPayment.rollNumber})
                </p>
              </div>
              <button
                onClick={() => setActiveAccountForPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Total Due:</span>
                  <strong className="text-emerald-950 font-mono">
                    Rs. {activeAccountForPayment.totalFeeDue.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Balance:</span>
                  <strong className="text-red-600 font-mono">
                    Rs. {activeAccountForPayment.remainingBalance.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full text-sm font-mono font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fee Period / Month
                </label>
                <input
                  type="text"
                  value={paymentMonthOrPeriod}
                  onChange={(e) => setPaymentMonthOrPeriod(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800 font-medium"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Bank Transfer / EasyPaisa / JazzCash">EasyPaisa / JazzCash / Bank Transfer</option>
                  <option value="Online">Online Portal</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Authorized Accounts Officer
                </label>
                <input
                  type="text"
                  value={authorizedStaff}
                  onChange={(e) => setAuthorizedStaff(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional notes or bank transaction ID..."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveAccountForPayment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer border border-yellow-400/50 uppercase text-xs tracking-wider"
                >
                  {isSubmittingPayment ? 'Processing...' : 'Confirm Deposit & Generate Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12-MONTH FEE BREAKDOWN MODAL */}
      {activeStudentForMonths && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border-2 border-yellow-400 space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold font-serif text-emerald-950">
                  12-Month Academic Year 2026 Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  {activeStudentForMonths.account.studentName} — Roll: {activeStudentForMonths.account.rollNumber} ({activeStudentForMonths.account.class})
                </p>
              </div>
              <button
                onClick={() => setActiveStudentForMonths(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Monthly Table for Jan - Dec 2026 */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-950 text-white font-bold border-b border-yellow-400">
                  <tr>
                    <th className="py-2.5 px-3">Month (2026)</th>
                    <th className="py-2.5 px-3 text-right">Tuition</th>
                    <th className="py-2.5 px-3 text-right">Other</th>
                    <th className="py-2.5 px-3 text-right">Total Due</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-center">Due Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Receipt #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeStudentForMonths.monthly.map((m, idx) => (
                    <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50/20'}>
                      <td className="py-2 px-3 font-bold text-slate-900">{m.month} 2026</td>
                      <td className="py-2 px-3 text-right font-mono">Rs. {m.monthlyTuitionFee}</td>
                      <td className="py-2 px-3 text-right font-mono">Rs. {m.otherApplicableCharges}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-950">
                        Rs. {m.totalAmountDue}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        Rs. {m.amountPaid}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-red-600">
                        Rs. {m.remainingBalance}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">
                        {m.paymentDueDate}
                      </td>
                      <td className="py-2 px-3 text-center">{statusBadge(m.paymentStatus)}</td>
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-emerald-900 font-bold">
                        {m.receiptNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment Receipts History */}
            {activeStudentForMonths.receipts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Payment Transaction History ({activeStudentForMonths.receipts.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStudentForMonths.receipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs hover:border-yellow-400 transition-colors"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-950 block">{rec.receiptNumber}</span>
                        <span className="text-[11px] text-slate-500">{rec.paymentDate} • {rec.feeMonthOrPeriod}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 block">
                          Rs. {rec.amountPaid.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setPrintableReceipt(rec)}
                          className="text-[10px] text-emerald-900 font-bold hover:underline cursor-pointer"
                        >
                          Print Voucher
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEE CONFIG & SCHOLARSHIP MODAL */}
      {activeConfigAccount && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-yellow-400 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold font-serif text-emerald-950">
                  Configure Student Fee & Waivers
                </h3>
                <p className="text-xs text-slate-500">
                  {activeConfigAccount.studentName} ({activeConfigAccount.rollNumber})
                </p>
              </div>
              <button
                onClick={() => setActiveConfigAccount(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Tuition Fee (PKR)
                </label>
                <input
                  type="number"
                  value={configMonthlyFee}
                  onChange={(e) => setConfigMonthlyFee(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admission Fee (PKR)
                </label>
                <input
                  type="number"
                  value={configAdmissionFee}
                  onChange={(e) => setConfigAdmissionFee(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Annual Lab & Other Charges (PKR)
                </label>
                <input
                  type="number"
                  value={configOtherCharges}
                  onChange={(e) => setConfigOtherCharges(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scholarship Discount / Fee Waiver (PKR)
                </label>
                <input
                  type="number"
                  value={configDiscounts}
                  onChange={(e) => setConfigDiscounts(Number(e.target.value))}
                  className="w-full text-xs font-mono border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveConfigAccount(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black rounded-xl shadow-md cursor-pointer border border-yellow-400/50 uppercase text-xs tracking-wider"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {printableReceipt && (
        <PrintableReceipt
          receipt={printableReceipt}
          onClose={() => setPrintableReceipt(null)}
        />
      )}
    </div>
  );
};
