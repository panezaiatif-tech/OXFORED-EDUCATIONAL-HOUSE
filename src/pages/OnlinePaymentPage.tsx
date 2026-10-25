import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Phone,
  Copy,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  Upload,
  Search,
  Printer,
  ChevronRight,
  HelpCircle,
  FileText,
  Building2,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { SchoolLogo } from '../components/SchoolLogo';
import { api } from '../utils/api';
import {
  FeeAccount2026,
  Month2026,
  OnlinePaymentSubmission,
  LEARNING_LEVELS,
  TUITION_CLASSES,
} from '../types';

const MONTHS_2026: Month2026[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface OnlinePaymentPageProps {
  initialRollNumber?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const OnlinePaymentPage: React.FC<OnlinePaymentPageProps> = ({
  initialRollNumber,
  onNavigateToTab,
}) => {
  // EasyPaisa Details
  const EASYPAISA_NUMBER = '03327185311';
  const EASYPAISA_TITLE = 'OXFORED EDUCATIONAL HOUSE / ATIF PANEZAI (Principal Desk)';
  const JAZZCASH_NUMBER = '03327185311';

  // Copy Feedback state
  const [copied, setCopied] = useState(false);

  // Student Fee Lookup State
  const [searchRoll, setSearchRoll] = useState(initialRollNumber || '');
  const [lookupAccount, setLookupAccount] = useState<FeeAccount2026 | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Submission Form State
  const [form, setForm] = useState({
    rollNumber: initialRollNumber || '',
    studentName: '',
    fatherName: '',
    class: 'Level Kids',
    paymentMethod: 'EasyPaisa' as 'EasyPaisa' | 'JazzCash' | 'Bank Transfer',
    easypaisaNumber: EASYPAISA_NUMBER,
    senderMobile: '',
    senderName: '',
    transactionId: '',
    amountPaid: '',
    month: 'January' as Month2026,
    feeType: 'Tuition Fee' as 'Tuition Fee' | 'Admission Fee' | 'Examination Fee' | 'Full Package',
    screenshotUrl: '',
    adminNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedVoucher, setSubmittedVoucher] = useState<OnlinePaymentSubmission | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tracking Lookup State
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedRecord, setTrackedRecord] = useState<OnlinePaymentSubmission | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<OnlinePaymentSubmission[]>([]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const list = await api.getOnlinePayments();
      setAllSubmissions(list);
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLookupStudent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchRoll.trim();
    if (!q) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupAccount(null);

    try {
      const accounts = await api.getFeeAccounts();
      const match = accounts.find(
        (a) => a.rollNumber.toLowerCase() === q.toLowerCase() || a.studentId.toLowerCase() === q.toLowerCase()
      );

      if (match) {
        setLookupAccount(match);
        // Autofill form
        setForm((prev) => ({
          ...prev,
          rollNumber: match.rollNumber,
          studentName: match.studentName,
          fatherName: match.fatherName,
          class: match.class,
          amountPaid: String(match.monthlyTuitionFee || 1500),
        }));
      } else {
        setLookupError(`No fee account found for Roll Number "${q}". If recently enrolled, your record is pending approval.`);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Error looking up student fee details.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a genuine image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller screenshot.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setForm((prev) => ({ ...prev, screenshotUrl: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.studentName.trim()) {
      setErrorMsg('Student Name is required.');
      return;
    }
    if (!form.transactionId.trim()) {
      setErrorMsg('EasyPaisa Transaction ID (TID) is strictly required for payment verification.');
      return;
    }
    if (!form.amountPaid || Number(form.amountPaid) <= 0) {
      setErrorMsg('Please enter a valid amount paid in PKR.');
      return;
    }
    if (!form.senderMobile.trim()) {
      setErrorMsg('Sender Mobile Number is required so we can verify the transaction.');
      return;
    }

    setSubmitting(true);
    try {
      const submission = await api.submitOnlinePayment({
        ...form,
        amountPaid: Number(form.amountPaid),
      });
      setSubmittedVoucher(submission);
      loadSubmissions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit online payment verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackingQuery.trim().toLowerCase();
    if (!q) return;

    const found = allSubmissions.find(
      (s) =>
        s.trackingNumber.toLowerCase() === q ||
        s.transactionId.toLowerCase() === q ||
        s.rollNumber.toLowerCase() === q
    );
    setTrackedRecord(found || null);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. DEVELOPER BANNER & HERO TITLE */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-6 sm:p-10 border-2 border-yellow-400 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>MADE BY ATIF PANEZAI PROFESSIONEL APP AND WEB DEVELOPER OF PAKISTAN</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <SchoolLogo size="md" showText={false} variant="light" />
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white uppercase">
                    ONLINE FEE PAYMENT PORTAL
                  </h1>
                  <p className="text-yellow-300 font-bold text-xs sm:text-sm">
                    OXFORED EDUCATIONAL HOUSE • OFFICIAL EASYPAISA ACCOUNT: 03327185311
                  </p>
                </div>
              </div>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Pay student tuition fees, admission charges, and examination vouchers instantly via EasyPaisa or JazzCash. Submit your Transaction ID (TID) below for official verification and automatic fee ledger updates.
              </p>
            </div>

            {/* Campus Location Badge */}
            <div className="bg-emerald-900/90 p-4 rounded-2xl border border-yellow-400/60 text-xs space-y-1.5 self-start md:self-auto max-w-xs shadow-lg">
              <div className="flex items-center gap-1.5 text-yellow-300 font-bold">
                <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="uppercase tracking-wider text-[11px]">Campus Location</span>
              </div>
              <p className="text-[11px] font-semibold text-white leading-snug">
                BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
              </p>
              <p className="text-[10px] text-yellow-300 font-mono">Mobile / EasyPaisa: 03327185311</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EASYPAISA OFFICIAL ACCOUNT CARD & STEP-BY-STEP INSTRUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* EasyPaisa Green & Gold Master Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-emerald-900 via-emerald-950 to-green-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-yellow-400 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-yellow-400/40 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-yellow-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
                EP
              </span>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-yellow-300 font-black block">
                  Official School Account
                </span>
                <h2 className="text-lg font-black tracking-wide text-white">EasyPaisa Mobile Account</h2>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-800 text-yellow-300 border border-yellow-400/50 text-[11px] font-bold">
              Active 24/7
            </span>
          </div>

          {/* Account Number Box with Click-to-Copy */}
          <div className="p-5 rounded-2xl bg-emerald-900/90 border-2 border-yellow-400/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-200">EasyPaisa Mobile Number</span>
              <span className="text-[11px] text-yellow-300 font-bold">Pakistan (+92)</span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-emerald-950/80 p-3 rounded-xl border border-yellow-400">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-yellow-300">
                {EASYPAISA_NUMBER}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(EASYPAISA_NUMBER)}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-950" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1 pt-1 text-xs text-emerald-100">
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300">Account Title: </span>
                  <strong className="text-white font-bold">{EASYPAISA_TITLE}</strong>
                </div>
              </div>
              <p className="text-[11px] text-yellow-300 font-semibold pl-5.5">
                * Please verify the account title on your EasyPaisa confirmation screen before entering PIN.
              </p>
            </div>
          </div>

          {/* Alternative Payment Options (JazzCash / Cash) */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 space-y-1">
              <span className="text-yellow-300 font-bold block text-[11px] uppercase">JazzCash Option</span>
              <p className="text-white font-mono font-bold text-sm">{JAZZCASH_NUMBER}</p>
              <p className="text-[10px] text-emerald-200">Title: Atif Panezai</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-emerald-700/60 space-y-1">
              <span className="text-yellow-300 font-bold block text-[11px] uppercase">Campus Counter</span>
              <p className="text-white font-bold text-xs">Brewery Road Accounts</p>
              <p className="text-[10px] text-emerald-200">Mon–Sat, 8am–2pm</p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Payment Instructions */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black font-serif text-emerald-950 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
              Easy 4-Step Payment Guide
            </h3>
            <p className="text-xs text-slate-500">
              Follow these simple steps from any EasyPaisa app or mobile retailer in Pakistan.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-yellow-300 font-black flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-emerald-950 block font-bold">Open EasyPaisa App</strong>
                <p className="text-slate-600 text-[11px]">
                  Log in to your EasyPaisa account, select <strong>"Send Money"</strong> and choose <strong>"EasyPaisa Mobile Account"</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-yellow-50/60 border border-yellow-200">
              <span className="w-6 h-6 rounded-full bg-yellow-400 text-emerald-950 font-black flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-emerald-950 block font-bold">Send to 03327185311</strong>
                <p className="text-slate-600 text-[11px]">
                  Enter <strong>03327185311</strong> and input the fee amount. Confirm that the title displays <strong>OXFORED EDUCATIONAL HOUSE / ATIF PANEZAI</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-yellow-300 font-black flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-emerald-950 block font-bold">Save Transaction ID (TID) & Screenshot</strong>
                <p className="text-slate-600 text-[11px]">
                  Once sent, note down your 11/12-digit <strong>Transaction ID (TID)</strong> from the SMS or app screen, and take a screenshot of the receipt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-900 text-white border border-yellow-400">
              <span className="w-6 h-6 rounded-full bg-yellow-400 text-emerald-950 font-black flex items-center justify-center shrink-0 text-xs">
                4
              </span>
              <div>
                <strong className="text-yellow-300 block font-bold">Submit Form Below</strong>
                <p className="text-emerald-100 text-[11px]">
                  Fill out the verification form with student roll number, month, and TID to receive an official digital submission slip!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Help Desk Support: <strong className="text-emerald-950">03327185311</strong></span>
            <span>Accounts Dept. Quetta</span>
          </div>
        </div>
      </div>

      {/* 2.5 OFFICIAL FEE RATES & STRICT 1st-5th DEADLINE NOTICE */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif font-black text-emerald-950 text-base">
              Monthly Fee Rates (Session 2026-2027)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-yellow-100 text-emerald-900 px-3 py-1 rounded-full border border-yellow-300">
            Payment Window: 1st – 5th Date
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">English Grammar</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 1,500</div>
            <p className="text-[10px] text-slate-600">Level Kids to Advance (Sir Abbas)</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Tuition Classes</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 1,000</div>
            <p className="text-[10px] text-slate-600">Per Subject (Nursery–4th: Sir Shakir, 5th–7th: Sir Atlas, 8th–10th: Sir Abbas)</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Caligraphy</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 1,000</div>
            <p className="text-[10px] text-slate-600">Per Student (Sir Sharifullah)</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Nazra e Quran</span>
            <div className="text-xl font-black font-mono text-emerald-950">Rs. 600</div>
            <p className="text-[10px] text-slate-600">Per Student (Sir Sharifullah)</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 flex items-start gap-3 text-xs text-red-950">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-red-700 block text-sm">
              Strict Monthly Deadline: 1st to 5th Date of Every Month
            </strong>
            <p className="text-red-900 leading-relaxed">
              Every student must pay their monthly fee between the <strong>1st and 5th date</strong> of each month. <em>Otherwise, the student will be removed / barred from their class!</em>
            </p>
          </div>
        </div>
      </div>

      {/* 3. STUDENT FEE LOOKUP TOOL (OPTIONAL QUICK PRE-FILL) */}
      <div className="bg-gradient-to-r from-yellow-50 via-white to-emerald-50 p-6 rounded-3xl border-2 border-yellow-300 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black font-serif text-emerald-950 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-800" />
              Check Student Fee Status Before Paying (Optional)
            </h3>
            <p className="text-xs text-slate-600">
              Enter the student's permanent Roll Number to verify exact pending dues and standard monthly tuition.
            </p>
          </div>

          <form onSubmit={handleLookupStudent} className="flex items-center gap-2">
            <input
              type="text"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              placeholder="e.g. 1 or 2"
              className="border border-slate-300 bg-white rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 w-36"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-bold text-xs rounded-xl transition-all cursor-pointer shadow flex items-center gap-1 border border-yellow-400"
            >
              {lookupLoading ? 'Checking...' : 'Check Status'}
            </button>
          </form>
        </div>

        {lookupError && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}

        {lookupAccount && (
          <div className="p-4 bg-white rounded-2xl border-2 border-emerald-400 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Official Student Record</span>
                <h4 className="text-base font-black text-emerald-950">{lookupAccount.studentName}</h4>
                <p className="text-xs text-slate-600">
                  Father: {lookupAccount.fatherName} • Roll Number: <strong className="font-mono text-emerald-800 font-bold">{lookupAccount.rollNumber}</strong> • Class/Level: <strong className="text-emerald-950">{lookupAccount.class}</strong>
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                lookupAccount.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Status: {lookupAccount.paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-[10px] text-slate-500 block">Monthly Tuition Fee</span>
                <strong className="text-emerald-950 text-sm">Rs. {lookupAccount.monthlyTuitionFee?.toLocaleString()}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-[10px] text-slate-500 block">2026 Total Due</span>
                <strong className="text-slate-800 text-sm">Rs. {lookupAccount.totalFeeDue?.toLocaleString()}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-[10px] text-slate-500 block">Total Paid So Far</span>
                <strong className="text-emerald-700 text-sm">Rs. {lookupAccount.amountPaid?.toLocaleString()}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-700 block">Remaining Balance</span>
                <strong className="text-amber-950 text-sm">Rs. {lookupAccount.remainingBalance?.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 font-semibold">
              Student details have been pre-filled below. Please complete payment on EasyPaisa <strong>03327185311</strong> and submit your TID.
            </p>
          </div>
        )}
      </div>

      {/* 4. ONLINE PAYMENT PROOF SUBMISSION FORM */}
      <div className="bg-white rounded-3xl border-2 border-emerald-900/20 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 p-6 text-white border-b-2 border-yellow-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-black font-serif text-white uppercase">
                Submit EasyPaisa Payment Verification Form
              </h3>
            </div>
            <p className="text-xs text-yellow-300 font-medium">
              Receiver Mobile Account: 03327185311 (Oxfored Educational House)
            </p>
          </div>
          <span className="px-3 py-1 bg-yellow-400 text-emerald-950 font-black text-xs rounded-full uppercase tracking-wider self-start sm:self-auto">
            Fee Year 2026
          </span>
        </div>

        <div className="p-6 sm:p-10">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-xs text-red-900 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">Submission Error</strong>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Student Identification Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Permanent Roll Number:
                </label>
                <input
                  type="text"
                  value={form.rollNumber}
                  onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                  placeholder="e.g. 1, 2, 3 (or Pending)"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Official roll number or applicant reference
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Student Full Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="e.g. Hamza Achakzai"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Father's Name:
                </label>
                <input
                  type="text"
                  value={form.fatherName}
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  placeholder="e.g. Tariq Achakzai"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
            </div>

            {/* Academic Level & Month */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Learning Level or Tuition Class:
                </label>
                <select
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                >
                  <optgroup label="Official Learning Levels">
                    {LEARNING_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tuition Classes (Prep - Class 10)">
                    {TUITION_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fee Month (Academic 2026):
                </label>
                <select
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value as Month2026 })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                >
                  {MONTHS_2026.map((m) => (
                    <option key={m} value={m}>
                      {m} 2026
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Fee Category:
                </label>
                <select
                  value={form.feeType}
                  onChange={(e) => setForm({ ...form, feeType: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                >
                  <option value="Tuition Fee">Monthly Tuition Fee</option>
                  <option value="Admission Fee">Admission & Enrollment Fee</option>
                  <option value="Examination Fee">Periodic / Final Examination Fee</option>
                  <option value="Full Package">Full Package (Tuition + Notes + Exam)</option>
                </select>
              </div>
            </div>

            {/* EasyPaisa Payment Verification Critical Fields */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-4">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                EasyPaisa Verification Details (Account: 03327185311)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    EasyPaisa Transaction ID (TID): <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.transactionId}
                    onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                    placeholder="e.g. 192837465012 (From SMS)"
                    className="w-full border-2 border-yellow-500 bg-white rounded-xl px-3 py-2.5 font-mono font-black text-emerald-950 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    11 or 12 digit TID received from 3737
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Amount Paid (PKR): <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-mono font-bold text-slate-500">Rs.</span>
                    <input
                      type="number"
                      required
                      min={100}
                      value={form.amountPaid}
                      onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
                      placeholder="e.g. 1500"
                      className="w-full border-2 border-emerald-500 bg-white rounded-xl pl-10 pr-3 py-2.5 font-mono font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Exact amount sent to 03327185311
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Sender EasyPaisa Mobile Number: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.senderMobile}
                    onChange={(e) => setForm({ ...form, senderMobile: e.target.value })}
                    placeholder="e.g. 0333 1234567"
                    className="w-full border border-slate-300 bg-white rounded-xl px-3 py-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Parent's phone used to transfer
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Sender Account Holder Name:
                  </label>
                  <input
                    type="text"
                    value={form.senderName}
                    onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                    placeholder="e.g. Tariq Khan"
                    className="w-full border border-slate-300 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Upload Payment Screenshot / SMS Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-900 file:text-yellow-300 hover:file:bg-emerald-800 cursor-pointer"
                  />
                  {form.screenshotUrl && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Receipt screenshot attached</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Additional Remarks (Optional):
              </label>
              <input
                type="text"
                value={form.adminNotes}
                onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                placeholder="e.g. Paid for 2 months advance, or included exam fee"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-yellow-400 text-emerald-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-yellow-500"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying & Recording Payment...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-emerald-950" />
                  <span>Submit Payment Verification (03327185311)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 5. SUCCESS MODAL / DIGITAL VOUCHER */}
      {submittedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-yellow-400 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 to-green-950 p-6 text-white text-center space-y-1 relative">
              <span className="w-12 h-12 rounded-full bg-yellow-400 text-emerald-950 flex items-center justify-center mx-auto mb-2 font-black shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-emerald-950" />
              </span>
              <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
                PAYMENT PROOF SUBMITTED!
              </h3>
              <p className="text-yellow-300 text-xs font-bold font-mono">
                Tracking Number: {submittedVoucher.trackingNumber}
              </p>
            </div>

            {/* Voucher Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-emerald-950 font-bold">{submittedVoucher.studentName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Roll Number:</span>
                  <strong className="font-mono text-emerald-900 font-bold">{submittedVoucher.rollNumber || 'Admitted'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class / Level:</span>
                  <strong className="text-slate-800">{submittedVoucher.class}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Month / Category:</span>
                  <strong className="text-slate-800">{submittedVoucher.month} 2026 ({submittedVoucher.feeType})</strong>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600 font-bold">Amount Transferred:</span>
                  <strong className="text-emerald-950 font-black text-sm">
                    Rs. {submittedVoucher.amountPaid.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">EasyPaisa TID:</span>
                  <strong className="font-mono text-emerald-950 font-bold">{submittedVoucher.transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Received By Account:</span>
                  <strong className="font-mono text-slate-800">{submittedVoucher.easypaisaNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 font-bold text-[10px] border border-yellow-300">
                    {submittedVoucher.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Our school accounts office at Brewery Road Quetta verifies EasyPaisa statements within 2 to 4 hours. Once verified, your student fee ledger will automatically reflect this payment.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-emerald-950 hover:bg-emerald-900 text-yellow-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-yellow-400"
                >
                  <Printer className="w-4 h-4 text-yellow-400" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedVoucher(null)}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. STATUS TRACKER FOR SUBMITTED PAYMENTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="text-base font-black font-serif text-emerald-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-800" />
              Check Status of Online Payment
            </h3>
            <p className="text-xs text-slate-500">
              Enter your Tracking ID (OEH-EP-XXXXXX) or EasyPaisa TID to check verification status.
            </p>
          </div>

          <form onSubmit={handleTrackSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="e.g. OEH-EP-123456 or TID"
              className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-800 w-44"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-yellow-300 font-bold text-xs rounded-xl cursor-pointer shadow"
            >
              Search
            </button>
          </form>
        </div>

        {trackedRecord && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-500">{trackedRecord.trackingNumber}</span>
                <h4 className="text-sm font-bold text-emerald-950">{trackedRecord.studentName} (Roll: {trackedRecord.rollNumber})</h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                trackedRecord.status === 'Approved & Verified'
                  ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                  : trackedRecord.status === 'Rejected'
                  ? 'bg-red-100 text-red-900'
                  : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
              }`}>
                {trackedRecord.status}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
              <div><span className="text-slate-500">Amount:</span> <strong>Rs. {trackedRecord.amountPaid.toLocaleString()}</strong></div>
              <div><span className="text-slate-500">TID:</span> <strong className="font-mono">{trackedRecord.transactionId}</strong></div>
              <div><span className="text-slate-500">Date:</span> <strong>{trackedRecord.submissionDate}</strong></div>
              <div><span className="text-slate-500">Month:</span> <strong>{trackedRecord.month} 2026</strong></div>
            </div>
            {trackedRecord.adminNotes && (
              <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border">
                <strong>Admin Note:</strong> {trackedRecord.adminNotes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 7. GOOGLE MAP SECTION — BREWERY ROAD NEAR SBK UNIVERSITY QUETTA */}
      <div className="bg-white rounded-3xl border-2 border-emerald-900/20 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 p-6 text-white border-b-2 border-yellow-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-yellow-400 text-emerald-950 font-black">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-serif font-black text-white">
                  Campus Location & Physical Fee Deposit Desk
                </h3>
                <p className="text-xs text-yellow-300 font-semibold">
                  Brewery Road Quetta near SBK Women's University (Opposite Micro Coloni)
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-200 pl-11">
              Parents may also visit the campus accounts department during school hours to deposit fees or collect official computer-printed vouchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sardar+Bahadur+Khan+Women's+University+Brewery+Road+Quetta"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-950" />
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-950" />
            </a>
            <a
              href="tel:03327185311"
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-yellow-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-yellow-400/50 transition-all"
            >
              <Phone className="w-4 h-4 text-yellow-400" />
              <span>03327185311</span>
            </a>
          </div>
        </div>

        {/* Embedded Google Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 h-[380px] w-full bg-slate-100 relative">
            <iframe
              src="https://maps.google.com/maps?q=Sardar+Bahadur+Khan+Women's+University+Brewery+Road+Quetta&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Campus Map - Brewery Road near SBK University Quetta"
              className="w-full h-full"
            />
            <div className="absolute bottom-3 left-3 bg-emerald-950/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-[11px] font-bold border border-yellow-400 shadow-lg flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              <span>Brewery Road Campus • Quetta</span>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 bg-gradient-to-b from-emerald-50/60 to-white space-y-4 border-t lg:border-t-0 lg:border-l border-emerald-100 text-xs">
            <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-xs flex items-center gap-1.5 pb-2 border-b border-emerald-200">
              <Building2 className="w-4 h-4 text-emerald-800" />
              Visiting & Cash Counter
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-950 block">Official Campus Address</span>
                <p className="text-[11px] text-slate-700 font-semibold">
                  Location: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-950 block">Accounts Counter Hours</span>
                <p className="text-[11px] text-slate-600">
                  Monday to Saturday: 08:00 AM – 02:00 PM (PKT). Closed on Sundays and official gazetted holidays.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm space-y-1">
                <span className="font-bold text-emerald-950 block">Official Contact & EasyPaisa</span>
                <p className="text-sm font-mono font-black text-emerald-950">
                  03327185311
                </p>
                <p className="text-[10px] text-slate-500">Direct phone call, WhatsApp & EasyPaisa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
