import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { FeePaymentReceipt } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface PrintableReceiptProps {
  receipt: FeePaymentReceipt;
  onClose: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 border-2 border-yellow-400 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Action Controls (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Official Fee Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-yellow-300 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm cursor-pointer border border-yellow-400/50"
            >
              <Printer className="w-4 h-4 text-yellow-400" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="border-4 border-double border-emerald-950 p-6 rounded-2xl bg-emerald-50/20 relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-7xl font-black text-emerald-950 transform -rotate-12">
              OXFORED
            </span>
          </div>

          {/* School Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-950 space-y-1">
            <div className="flex justify-center mb-2">
              <SchoolLogo size="sm" showText={false} variant="dark" />
            </div>
            <h1 className="text-2xl font-black font-serif text-emerald-950 tracking-wide uppercase">
              OXFORED EDUCATIONAL HOUSE
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Location: BEREWRY ROAD QUETTA NEAR SBK UNIVERSITY APPOSITE MICRO COLONI
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Official Phone / EasyPaisa: 03327185311 • Email: info@oxfored.edu.pk • Accounts Dept.
            </p>
            <div className="inline-block mt-2 px-3.5 py-1 bg-emerald-950 text-yellow-300 font-black text-xs rounded-full uppercase tracking-widest border border-yellow-400">
              Student Fee Deposit Voucher — 2026
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
            <div>
              <span className="text-slate-500">Receipt No: </span>
              <strong className="font-mono text-emerald-950 text-sm font-bold">{receipt.receiptNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Date of Payment: </span>
              <strong className="text-slate-900 font-bold">{receipt.paymentDate}</strong>
            </div>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 py-4 text-xs border-b border-slate-200">
            <div>
              <span className="text-slate-500 block">Student Full Name:</span>
              <span className="font-bold text-slate-900 text-sm">{receipt.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Roll Number:</span>
              <span className="font-mono font-bold text-emerald-950 text-sm">{receipt.rollNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Father / Guardian Name:</span>
              <span className="font-semibold text-slate-800">{receipt.fatherName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Class & Section:</span>
              <span className="font-semibold text-slate-800">{receipt.class} — Section {receipt.section}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment For Period:</span>
              <span className="font-semibold text-yellow-800">{receipt.feeMonthOrPeriod}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Method:</span>
              <span className="font-semibold text-slate-800">{receipt.paymentMethod}</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-emerald-950 text-white font-bold border-b border-yellow-400">
                  <th className="py-2.5 px-3 text-left">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    Total Account Balance Due for 2026 Session
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                    Rs. {receipt.totalDue.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td className="py-2.5 px-3 font-bold text-emerald-950">
                    Amount Paid in This Transaction
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 text-sm">
                    Rs. {receipt.amountPaid.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    Remaining Outstanding Balance
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">
                    Rs. {receipt.remainingBalance.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes & Verification */}
          {receipt.notes && (
            <div className="text-[11px] text-slate-600 bg-slate-100 p-2.5 rounded-lg mb-4">
              <strong>Remarks:</strong> {receipt.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-1">
              <p className="font-semibold text-slate-800">{receipt.authorizedStaff}</p>
              <p className="text-[10px] text-slate-500">Accounts Officer Signature & Stamp</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-semibold text-slate-800">Principal Office</p>
              <p className="text-[10px] text-slate-500">Oxfored Educational House Quetta</p>
            </div>
          </div>

          <div className="text-center pt-6 text-[10px] text-slate-400 border-t border-slate-200 mt-6">
            System generated computer slip • Secured by Oxfored Educational House Database ERP
          </div>
        </div>
      </div>
    </div>
  );
};
