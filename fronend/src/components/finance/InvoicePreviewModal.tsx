import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Invoice } from '../../types';
import { Printer, CheckCircle, CreditCard, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/Badge';
import { PaymentFormModal } from '../forms/PaymentFormModal';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  const { markInvoicePaid } = useApp();
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isQuotation = invoice.documentType === 'Quotation';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${isQuotation ? 'Quotation' : 'Invoice'} #${invoice.invoiceNumber}`}
        description={`Professional ${isQuotation ? 'quotation & estimate' : 'tax-compliant invoice'} document preview.`}
        maxWidth="2xl"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {invoice.balanceDue > 0 && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    onClick={() => setIsRecordPaymentOpen(true)}
                  >
                    Record Payment (Due: ₹{invoice.balanceDue.toLocaleString()})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<CheckCircle className="w-4 h-4 text-[#008000]" />}
                    onClick={() => {
                      markInvoicePaid(invoice.id);
                      onClose();
                    }}
                  >
                    Mark Full Paid
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                Print / Save PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="bg-white dark:bg-[#111827] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] space-y-6 printable-invoice">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#008000] flex items-center justify-center text-white font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">GETUP DIGITAL SOLUTION</span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                High-Impact Digital Marketing & Media Production
              </p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                GSTIN: 33AAACG9988Z1ZP • contact@getupdigital.com
              </p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-black text-[#008000] dark:text-[#4ADE80] tracking-wide">
                {isQuotation ? 'QUOTATION / ESTIMATE' : 'TAX INVOICE'}
              </h2>
              <p className="text-xs font-mono font-bold text-[#475569] dark:text-[#CBD5E1]">
                #{invoice.invoiceNumber}
              </p>
              <div className="mt-1 inline-block">
                <StatusBadge status={invoice.paymentStatus} />
              </div>
            </div>
          </div>

          {/* Bill To & Meta Info */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#94A3B8]">
                {isQuotation ? 'Quoted To:' : 'Billed To:'}
              </span>
              <p className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{invoice.clientName}</p>
              <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed whitespace-pre-line">
                {invoice.clientAddress || 'Registered Office Address'}
              </p>
              {invoice.clientGst && (
                <p className="text-[#475569] dark:text-[#CBD5E1] font-mono">
                  GSTIN: <span className="font-semibold">{invoice.clientGst}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-right">
              <div>
                <span className="text-[#94A3B8]">{isQuotation ? 'Quotation Date:' : 'Invoice Date:'}</span>{' '}
                <span className="font-semibold">{invoice.invoiceDate}</span>
              </div>
              <div>
                <span className="text-[#94A3B8]">{isQuotation ? 'Valid Until:' : 'Payment Due:'}</span>{' '}
                <span className="font-semibold text-[#DC2626] dark:text-[#F87171]">{invoice.dueDate}</span>
              </div>
              <div>
                <span className="text-[#94A3B8]">Terms:</span>{' '}
                <span className="font-semibold">{isQuotation ? '50% Advance on Acceptance' : 'Net 10 Days'}</span>
              </div>
            </div>
          </div>

          {/* Table of items */}
          <div className="border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B1120] border-b border-[#E2E8F0] dark:border-[#1E293B] font-semibold text-[#475569] dark:text-[#94A3B8]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Service / Deliverable Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Rate (₹)</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {invoice.items.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="p-3 text-[#94A3B8]">{idx + 1}</td>
                    <td className="p-3 font-medium">{it.description}</td>
                    <td className="p-3 text-center">{it.quantity}</td>
                    <td className="p-3 text-right">{it.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold">{it.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span>GST ({invoice.taxRate}%):</span>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">₹{invoice.taxAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-[#16A34A]">
                  <span>Discount:</span>
                  <span className="font-semibold">-₹{invoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <span>Total {isQuotation ? 'Quotation' : 'Billed'}:</span>
                <span>₹{invoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#008000] dark:text-[#4ADE80] pt-1">
                <span>Amount Paid / Advance Received:</span>
                <span>₹{invoice.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#DC2626] dark:text-[#F87171] pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <span>Balance Due:</span>
                <span>₹{invoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bank & Notes */}
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] text-[#64748B] dark:text-[#94A3B8] space-y-1">
            <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Agency Remittance & UPI Details:</p>
            <p>Bank: HDFC Bank • Account Name: Getup Digital Solution LLP</p>
            <p>Account No: 50200088991122 • IFSC: HDFC0001234 • UPI ID: getupdigital@hdfcbank</p>
            <p className="pt-1 italic">{invoice.notes || 'Thank you for your partnership!'}</p>
          </div>
        </div>
      </Modal>

      {/* Record Payment Submodal */}
      <PaymentFormModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          onClose();
        }}
        defaultInvoiceId={invoice.id}
      />
    </>
  );
};
