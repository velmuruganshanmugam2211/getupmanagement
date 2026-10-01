import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultTeamMemberId?: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  defaultTeamMemberId
}) => {
  const { addExpense, currentUser, clients, users } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Equipment');
  const [amount, setAmount] = useState<number>(3000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(currentUser.name);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [teamMemberId, setTeamMemberId] = useState(defaultTeamMemberId || '');
  const [receiptName, setReceiptName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Expense description / title is required');
      return;
    }

    const selectedClient = clients.find(c => c.id === clientId);
    const selectedUser = users.find(u => u.id === teamMemberId);

    const payload: Omit<Expense, 'id'> = {
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      paidBy: paidBy.trim() || currentUser.name,
      paymentMethod,
      clientId: clientId || undefined,
      clientName: selectedClient ? selectedClient.businessName : undefined,
      teamMemberId: teamMemberId || undefined,
      teamMemberName: selectedUser ? `${selectedUser.name} (${selectedUser.role})` : undefined,
      receiptName: receiptName.trim() || undefined,
      notes: notes.trim()
    };

    addExpense(payload);
    onClose();
  };

  const setQuickPreset = (presetTitle: string, presetCategory: ExpenseCategory, presetAmount: number) => {
    setTitle(presetTitle);
    setCategory(presetCategory);
    setAmount(presetAmount);
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Agency & Client Expense"
      description="Tag expenditure to specific clients (e.g. camera rent, petrol) and creators (e.g. video editor payouts, storage cards)."
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>Save Expense Record</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mr-1">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setQuickPreset('Sony FX3 Camera & Lens Day Rental', 'Equipment', 3500)}
            className="text-[10px] px-2 py-1 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:bg-[#008000]/10 hover:text-[#008000] transition-colors"
          >
            📸 Camera Rent
          </button>
          <button
            type="button"
            onClick={() => setQuickPreset('Shoot Location Commute & Petrol Fuel', 'Travel', 1200)}
            className="text-[10px] px-2 py-1 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:bg-[#008000]/10 hover:text-[#008000] transition-colors"
          >
            ⛽ Petrol & Commute
          </button>
          <button
            type="button"
            onClick={() => setQuickPreset('Video Editor Project Payout & Cuts', 'Freelancer', 5000)}
            className="text-[10px] px-2 py-1 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:bg-[#008000]/10 hover:text-[#008000] transition-colors"
          >
            🎬 Video Editor Amount
          </button>
          <button
            type="button"
            onClick={() => setQuickPreset('SanDisk 128GB High-Speed SD Card / Hard Drive', 'Equipment', 1800)}
            className="text-[10px] px-2 py-1 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] hover:bg-[#008000]/10 hover:text-[#008000] transition-colors"
          >
            💾 Storage / Memory Card
          </button>
        </div>

        <Input
          label="Expense Title"
          required
          placeholder="e.g. Sony A7IV Camera Day Rental for Client Shoot"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          error={error}
        />

        {/* Client and Team Member Tagging */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B]">
          <Select
            label="Tag Client (Assign Cost to Client)"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            <option value="">General Agency / No Client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </Select>

          <Select
            label="Tag Team Member / Video Editor"
            value={teamMemberId}
            onChange={e => setTeamMemberId(e.target.value)}
          >
            <option value="">None / General Expense</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Expense Category"
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
          >
            <option value="Equipment">Camera / Studio Equipment Rent</option>
            <option value="Travel">Petrol / Commute / Travel Fuel</option>
            <option value="Freelancer">Video Editor Payout / Freelance</option>
            <option value="Software">Software & Creative Cloud Subscriptions</option>
            <option value="Salary">Salary & Crew Compensation</option>
            <option value="Advertising">Advertising / Meta & Google Ad Spend</option>
            <option value="Office">Office & Production Space</option>
            <option value="Subscription">Stock Footage & Music Assets</option>
            <option value="Other">Other Operational Cost</option>
          </Select>

          <Input
            label="Amount (₹ INR)"
            type="number"
            required
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Expense Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
            <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
            <option value="Card">Corporate Credit / Debit Card</option>
            <option value="Cash">Cash in Hand</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Paid By (Spender Name)"
            placeholder="e.g. Velu"
            value={paidBy}
            onChange={e => setPaidBy(e.target.value)}
          />

          <Input
            label="Receipt / Voucher Ref"
            placeholder="e.g. Rental_Bill_102.pdf"
            value={receiptName}
            onChange={e => setReceiptName(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes / Purpose"
          placeholder="Details on the shoot, scene count, or storage allocation..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
