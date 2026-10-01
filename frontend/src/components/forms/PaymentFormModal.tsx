import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInvoiceId?: string;
  defaultClientId?: string;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  defaultInvoiceId,
  defaultClientId
}) => {
  const { addPayment, invoices, clients } = useApp();

  const [invoiceId, setInvoiceId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState<number>(10000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Sync state whenever modal opens or defaultInvoiceId changes
  useEffect(() => {
    if (isOpen) {
      const targetInv = defaultInvoiceId 
        ? invoices.find(i => i.id === defaultInvoiceId)
        : (invoices.find(i => i.balanceDue > 0) || invoices[0]);

      if (targetInv) {
        setInvoiceId(targetInv.id);
        setSelectedClientId(targetInv.clientId);
        setAmount(targetInv.balanceDue > 0 ? targetInv.balanceDue : targetInv.total);
      } else if (defaultClientId) {
        setSelectedClientId(defaultClientId);
        setInvoiceId('');
        setAmount(10000);
      } else if (clients.length > 0) {
        setSelectedClientId(clients[0].id);
        setInvoiceId('');
        setAmount(10000);
      }
      setReferenceNumber('TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [isOpen, defaultInvoiceId, defaultClientId, invoices]);

  const selectedInvoice = invoices.find(i => i.id === invoiceId);

  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setSelectedClientId(inv.clientId);
      setAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.total);
    }
  };

  const currentBalance = selectedInvoice ? selectedInvoice.balanceDue : amount;
  const safeAmount = Math.max(0, Number(amount) || 0);
  const remainingBalanceAfter = selectedInvoice 
    ? Math.max(0, selectedInvoice.balanceDue - safeAmount)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (safeAmount <= 0) return;

    if (selectedInvoice) {
      addPayment({
        clientId: selectedInvoice.clientId,
        clientName: selectedInvoice.clientName,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        amount: safeAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'Completed',
        notes: notes || `Payment recorded for ${selectedInvoice.invoiceNumber}`
      });
    } else {
      const client = clients.find(c => c.id === selectedClientId) || clients[0];
      addPayment({
        clientId: client?.id || 'gen',
        clientName: client?.businessName || 'General Client',
        invoiceId: '',
        invoiceNumber: 'DIRECT',
        amount: safeAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber || 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'Completed',
        notes: notes || 'Direct on-account payment'
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Client Payment"
      description="Credit incoming client payment to an existing quotation / invoice and update balance."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>Confirm Payment Receipt</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {invoices.length > 0 ? (
          <div>
            <Select
              label="Select Quotation / Invoice Reference"
              value={invoiceId}
              onChange={e => handleInvoiceChange(e.target.value)}
            >
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.documentType === 'Quotation' ? 'Quotation' : 'Invoice'} #{inv.invoiceNumber} — {inv.clientName} (Total: ₹{inv.total.toLocaleString()} | Paid: ₹{inv.amountPaid.toLocaleString()} | Balance: ₹{inv.balanceDue.toLocaleString()})
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div>
            <Select
              label="Select Client Account"
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.businessName}</option>
              ))}
            </Select>
          </div>
        )}

        {/* Invoice Balance Snapshot Card */}
        {selectedInvoice && (
          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Quoted / Invoiced Total:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">₹{selectedInvoice.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Previously Paid:</span>
              <span className="font-semibold text-[#008000] dark:text-[#4ADE80]">₹{selectedInvoice.amountPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <span className="font-bold text-[#DC2626]">Current Balance Due:</span>
              <span className="font-bold text-[#DC2626]">₹{selectedInvoice.balanceDue.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Amount Received (₹ INR)"
              type="number"
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
            {selectedInvoice && selectedInvoice.balanceDue > 0 && (
              <div className="flex gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setAmount(selectedInvoice.balanceDue)}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#DCFCE7] text-[#008000] hover:bg-[#BBF7D0] font-semibold"
                >
                  Pay Full Balance (₹{selectedInvoice.balanceDue.toLocaleString()})
                </button>
                {selectedInvoice.balanceDue > 5000 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(selectedInvoice.balanceDue / 2))}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  >
                    50% (₹{Math.round(selectedInvoice.balanceDue / 2).toLocaleString()})
                  </button>
                )}
              </div>
            )}
          </div>

          <Input
            label="Payment Date"
            type="date"
            required
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
          />
        </div>

        {/* Dynamic Post-Payment Preview */}
        {selectedInvoice && (
          <div className="p-2.5 rounded bg-[#F0FDF4] dark:bg-[#14532D]/20 border border-[#BBF7D0] dark:border-[#166534] flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Balance after this payment:</span>
              <span className={`font-bold ${remainingBalanceAfter === 0 ? 'text-[#008000]' : 'text-[#D97706]'}`}>
                {remainingBalanceAfter === 0 ? '₹0 (Invoice Fully Cleared! 🎉)' : `₹${remainingBalanceAfter.toLocaleString()} (Remaining Due)`}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              remainingBalanceAfter === 0 ? 'bg-[#008000] text-white' : 'bg-[#FEF3C7] text-[#D97706]'
            }`}>
              {remainingBalanceAfter === 0 ? 'Status: PAID' : 'Status: PARTIAL'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
            <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </Select>

          <Input
            label="Transaction / UTR Number"
            placeholder="e.g. UTR-HDFC-99384"
            value={referenceNumber}
            onChange={e => setReferenceNumber(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes / Description"
          placeholder="Receipt acknowledgment, bank transaction reference..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
