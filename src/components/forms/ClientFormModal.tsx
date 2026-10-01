import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Client;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { addClient, updateClient, packages, users } = useApp();

  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [industry, setIndustry] = useState(initialData?.industry || 'Food & Beverage');

  // Digital
  const [website, setWebsite] = useState(initialData?.socials.website || '');
  const [instagram, setInstagram] = useState(initialData?.socials.instagram || '');
  const [facebook, setFacebook] = useState(initialData?.socials.facebook || '');
  const [youtube, setYoutube] = useState(initialData?.socials.youtube || '');
  const [googleBusiness, setGoogleBusiness] = useState(initialData?.socials.googleBusiness || '');

  // Billing
  const [gstNumber, setGstNumber] = useState(initialData?.billing.gstNumber || '');
  const [billingName, setBillingName] = useState(initialData?.billing.billingName || '');
  const [billingAddress, setBillingAddress] = useState(initialData?.billing.billingAddress || '');

  // Account
  const [packageId, setPackageId] = useState(initialData?.packageId || (packages[0]?.id || ''));
  const [monthlyFee, setMonthlyFee] = useState<number>(initialData?.monthlyFee || packages[0]?.monthlyPrice || 25000);
  const [startDate, setStartDate] = useState(initialData?.startDate || '2026-09-01');
  const [endDate, setEndDate] = useState(initialData?.endDate || '2027-08-31');
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || 'Due on 1st of month');
  const [accountManagerId, setAccountManagerId] = useState(initialData?.accountManagerId || users[1]?.id || 'usr-2');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePackageChange = (pkgId: string) => {
    setPackageId(pkgId);
    const sel = packages.find(p => p.id === pkgId);
    if (sel) {
      setMonthlyFee(sel.monthlyPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedPkg = packages.find(p => p.id === packageId);
    const selectedManager = users.find(u => u.id === accountManagerId);

    const clientPayload: Omit<Client, 'id' | 'createdAt'> = {
      businessName,
      contactPerson,
      phone,
      whatsapp: whatsapp || phone,
      email,
      address,
      industry,
      socials: { website, instagram, facebook, youtube, googleBusiness },
      billing: { gstNumber, billingName: billingName || businessName, billingAddress: billingAddress || address },
      packageId,
      packageName: selectedPkg?.name || 'Custom Package',
      monthlyFee: Number(monthlyFee),
      startDate,
      endDate,
      paymentTerms,
      paymentStatus: initialData?.paymentStatus || 'pending',
      status: initialData?.status || 'active',
      accountManagerId,
      accountManagerName: selectedManager?.name || 'Velu',
      notes
    };

    if (initialData) {
      updateClient(initialData.id, clientPayload);
    } else {
      addClient(clientPayload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Client Record' : 'Add New Client'}
      description="Create an internal record for tracking content quotas, retainer tasks, and billing."
      maxWidth="2xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {initialData ? 'Save Changes' : 'Create Client'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#008000] mb-3 pb-1 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            1. Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business Name"
              required
              placeholder="e.g. Royal Bakes & Cafe"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              error={errors.businessName}
            />
            <Input
              label="Contact Person"
              required
              placeholder="e.g. Ramesh Kumar"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              error={errors.contactPerson}
            />
            <Input
              label="Phone Number"
              required
              placeholder="+91 98400 12345"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              error={errors.phone}
            />
            <Input
              label="WhatsApp Number"
              placeholder="+91 98400 12345"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
            />
            <Input
              label="Email Address"
              required
              type="email"
              placeholder="contact@business.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
            />
            <Select
              label="Industry"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            >
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Retail & Fashion">Retail & Fashion</option>
              <option value="Healthcare">Healthcare & Wellness</option>
              <option value="EdTech & Training">EdTech & Training</option>
              <option value="Interior Design & Architecture">Interior Design & Architecture</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Hospitality & Travel">Hospitality & Travel</option>
              <option value="Other">Other</option>
            </Select>
            <div className="sm:col-span-2">
              <Input
                label="Physical Address"
                placeholder="Shop / Office address, city, pin code"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Digital Presence */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#008000] mb-3 pb-1 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            2. Digital Presence
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Website URL"
              placeholder="https://clientwebsite.com"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
            <Input
              label="Instagram Handle"
              placeholder="@brand_official"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
            />
            <Input
              label="Facebook Page"
              placeholder="facebook.com/brand"
              value={facebook}
              onChange={e => setFacebook(e.target.value)}
            />
            <Input
              label="Google Business URL"
              placeholder="g.page/brand"
              value={googleBusiness}
              onChange={e => setGoogleBusiness(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Billing Information */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#008000] mb-3 pb-1 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            3. Business & Billing Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GST Number"
              placeholder="33AAAAA0000A1Z5"
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value)}
            />
            <Input
              label="Billing Name"
              placeholder="Official Entity / LLP / Pvt Ltd"
              value={billingName}
              onChange={e => setBillingName(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                label="Billing Address"
                placeholder="Invoice registered address"
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Account & Package Subscription */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#008000] mb-3 pb-1 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            4. Retainer Package & Account Setup
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Service Package"
              value={packageId}
              onChange={e => handlePackageChange(e.target.value)}
            >
              {packages.length === 0 ? (
                <option value="">Custom Package (No tiers configured yet)</option>
              ) : (
                packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.monthlyPrice.toLocaleString()}/mo)
                  </option>
                ))
              )}
            </Select>

            <Input
              label="Monthly Fee (₹ INR)"
              type="number"
              value={monthlyFee}
              onChange={e => setMonthlyFee(Number(e.target.value))}
            />

            <Input
              label="Contract Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />

            <Input
              label="Contract End Date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />

            <Select
              label="Payment Terms"
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
            >
              <option value="Due on 1st of month">Due on 1st of month</option>
              <option value="Due on 5th of month">Due on 5th of month</option>
              <option value="Due on 10th of month">Due on 10th of month</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
            </Select>

            <Select
              label="Assigned Account Manager"
              value={accountManagerId}
              onChange={e => setAccountManagerId(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>

            <div className="sm:col-span-2">
              <Textarea
                label="Internal Notes & Priorities"
                placeholder="Content priorities, special client guidelines, shoot schedules..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
