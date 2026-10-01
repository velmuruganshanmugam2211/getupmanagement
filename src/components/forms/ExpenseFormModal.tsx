import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addExpense, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Software');
  const [amount, setAmount] = useState<number>(5000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(currentUser.name);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [receiptName, setReceiptName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Expense description is required');
      return;
    }

    const payload: Omit<Expense, 'id'> = {
      title,
      category,
      amount: Number(amount),
      date,
      paidBy,
      paymentMethod,
      receiptName: receiptName || undefined,
      notes
    };

    addExpense(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Agency Expense"
      description="Track operational software, freelancers, hardware, or office expenses for real-time profit estimation."
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>Save Expense</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Expense Title"
          required
          placeholder="e.g. Adobe Creative Cloud Monthly Subscription"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          error={error}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value as ExpenseCategory)}
          >
            <option value="Software">Software & SaaS</option>
            <option value="Salary">Salary & Compensation</option>
            <option value="Freelancer">Freelancer / Contractor</option>
            <option value="Advertising">Advertising / Meta / Google</option>
            <option value="Travel">Travel & Commute</option>
            <option value="Office">Office & Utilities</option>
            <option value="Equipment">Camera / Studio Equipment</option>
            <option value="Subscription">AI / Asset Subscriptions</option>
            <option value="Other">Other</option>
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
            <option value="Card">Corporate Credit Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Paid By"
            placeholder="e.g. Velu"
            value={paidBy}
            onChange={e => setPaidBy(e.target.value)}
          />

          <Input
            label="Receipt Attachment Name"
            placeholder="e.g. Adobe_Bill_Sep26.pdf"
            value={receiptName}
            onChange={e => setReceiptName(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes / Justification"
          placeholder="Project allocation or invoice notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
