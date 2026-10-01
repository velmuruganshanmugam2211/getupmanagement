import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceItem } from '../../types';
import { Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultDocType?: 'Invoice' | 'Quotation';
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  defaultDocType = 'Quotation'
}) => {
  const { addInvoice, clients } = useApp();

  const [documentType, setDocumentType] = useState<'Invoice' | 'Quotation'>(defaultDocType);
  const [clientId, setClientId] = useState(defaultClientId || clients[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const prefix = defaultDocType === 'Quotation' ? 'QUO-2026-' : 'INV-2026-';
    return prefix + Math.floor(100 + Math.random() * 900);
  });
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const selectedClient = clients.find(c => c.id === clientId);

  const [items, setItems] = useState<InvoiceItem[]>([
    { 
      id: 'itm-' + Date.now(), 
      description: selectedClient?.packageName 
        ? `${selectedClient.packageName} Package: Social Media Management & Content Production` 
        : 'Monthly Digital Marketing & Social Media Retainer', 
      quantity: 1, 
      unitPrice: selectedClient?.monthlyFee || 20000, 
      amount: selectedClient?.monthlyFee || 20000 
    }
  ]);
  const [taxRate, setTaxRate] = useState<number>(0); // 0 or 18% GST
  const [discount, setDiscount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(10000); // Default to 10k partial for quotation example!
  const [notes, setNotes] = useState('Terms: 50% advance upon quotation sign-off, remaining 50% balance upon monthly deliverables review.');

  // Sync client when selectedClient changes
  useEffect(() => {
    if (selectedClient && items.length === 1 && items[0].amount === 20000) {
      if (selectedClient.monthlyFee) {
        setItems([{
          id: 'itm-' + Date.now(),
          description: `${selectedClient.packageName || 'Monthly'} Retainer: Social Media Management & Creative Production`,
          quantity: 1,
          unitPrice: selectedClient.monthlyFee,
          amount: selectedClient.monthlyFee
        }]);
      }
    }
  }, [clientId]);

  const handleDocTypeChange = (newType: 'Invoice' | 'Quotation') => {
    setDocumentType(newType);
    const numPart = Math.floor(100 + Math.random() * 900);
    setInvoiceNumber(newType === 'Quotation' ? `QUO-2026-${numPart}` : `INV-2026-${numPart}`);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: 'itm-' + Date.now(), description: 'Additional High-Res Photo Shoot / Ad Creatives', quantity: 1, unitPrice: 5000, amount: 5000 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = Math.max(0, subtotal + taxAmount - discount);
  const safeAdvance = Math.min(total, Math.max(0, Number(advancePaid) || 0));
  const balanceDue = Math.max(0, total - safeAdvance);

  const getStatus = (): Invoice['paymentStatus'] => {
    if (safeAdvance === 0) return 'Pending';
    if (safeAdvance >= total) return 'Paid';
    return 'Partial';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === clientId);

    const invoicePayload: Omit<Invoice, 'id'> = {
      invoiceNumber,
      documentType,
      clientId,
      clientName: selClient?.businessName || 'General Client',
      clientAddress: selClient?.address || '',
      clientGst: selClient?.billing?.gstNumber,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      amountPaid: safeAdvance,
      balanceDue,
      paymentStatus: getStatus(),
      notes
    };

    addInvoice(invoicePayload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={documentType === 'Quotation' ? 'Create Client Quotation / Estimate' : 'Create Tax Invoice'}
      description="Generate quotations, retainers, and billing with flexible partial payment tracking."
      maxWidth="2xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {documentType === 'Quotation' ? 'Save Quotation' : 'Generate Invoice'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Type Selector Toggle */}
        <div className="flex items-center gap-3 p-1.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg">
          <button
            type="button"
            onClick={() => handleDocTypeChange('Quotation')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              documentType === 'Quotation'
                ? 'bg-white dark:bg-[#0B1120] text-[#008000] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            Quotation / Cost Estimate
          </button>
          <button
            type="button"
            onClick={() => handleDocTypeChange('Invoice')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              documentType === 'Invoice'
                ? 'bg-white dark:bg-[#0B1120] text-[#008000] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
            }`}
          >
            Tax Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Client Account"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </Select>

          <Input
            label={documentType === 'Quotation' ? 'Quotation Number' : 'Invoice Number'}
            value={invoiceNumber}
            onChange={e => setInvoiceNumber(e.target.value)}
          />

          <Input
            label="Document Date"
            type="date"
            value={invoiceDate}
            onChange={e => setInvoiceDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due / Valid Until Date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          <Input
            label="GST Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={e => setTaxRate(Number(e.target.value))}
          />
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1]">
              Deliverables & Service Items
            </span>
            <Button type="button" variant="secondary" size="xs" onClick={addItem} leftIcon={<Plus className="w-3 h-3" />}>
              Add Line Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="flex-1">
                  <Input
                    placeholder="Description of service / deliverable..."
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                    inputSize="sm"
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    inputSize="sm"
                  />
                </div>
                <div className="w-28">
                  <Input
                    type="number"
                    placeholder="Rate (₹)"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                    inputSize="sm"
                  />
                </div>
                <div className="w-28 text-right font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                  ₹{(item.amount || 0).toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 1}
                  className="p-1 text-[#94A3B8] hover:text-[#DC2626] disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Partial Payment / Advance Section */}
        <div className="p-3.5 bg-[#F0FDF4] dark:bg-[#14532D]/20 rounded-lg border border-[#BBF7D0] dark:border-[#166534] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#008000] dark:text-[#4ADE80]">
              Upfront / Advance Paid by Client
            </span>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
              (e.g., ₹10,000 paid against ₹20,000 quotation)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Amount Paid Upfront (₹ INR)"
              type="number"
              value={advancePaid}
              onChange={e => setAdvancePaid(Number(e.target.value))}
              placeholder="0"
            />
            <div className="flex flex-col justify-end text-xs">
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px] mb-1">Resulting Payment Status:</span>
              <span className={`font-bold inline-block px-2.5 py-1 rounded text-center ${
                getStatus() === 'Paid' 
                  ? 'bg-[#DCFCE7] text-[#008000]' 
                  : getStatus() === 'Partial' 
                  ? 'bg-[#FEF3C7] text-[#D97706]' 
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {getStatus() === 'Partial' ? `Partially Paid (₹${safeAdvance.toLocaleString()} / ₹${total.toLocaleString()})` : getStatus()}
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Summary Card */}
        <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B1120] rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
            <span>Subtotal:</span>
            <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">₹{subtotal.toLocaleString()}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
              <span>Tax (GST {taxRate}%):</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">₹{taxAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <span>Total Quoted / Billed:</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-[#008000] dark:text-[#4ADE80]">
            <span>Paid / Received to date:</span>
            <span>₹{safeAdvance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-[#DC2626] dark:text-[#F87171] pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <span>Balance Due:</span>
            <span>₹{balanceDue.toLocaleString()}</span>
          </div>
        </div>

        <Textarea
          label="Notes & Payment Instructions"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
