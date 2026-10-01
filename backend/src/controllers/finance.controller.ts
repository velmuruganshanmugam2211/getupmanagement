import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { Invoice, Payment, Expense, Client } from '../types';

export const getFinanceOverview = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = store.getInvoices();
    const payments = store.getPayments();
    const expenses = store.getExpenses();

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCollected = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const totalPending = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const overdueInvoices = invoices.filter(inv => inv.paymentStatus === 'Overdue');
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netCashflow = Math.max(0, totalCollected - totalExpenses);

    return successResponse(res, {
      totalInvoiced,
      totalCollected,
      totalPending,
      totalOverdue,
      totalExpenses,
      netCashflow,
      invoicesCount: invoices.length,
      paymentsCount: payments.length,
      expensesCount: expenses.length
    }, 'Finance summary retrieved');
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, status, documentType, search } = req.query;
    let invoices = store.getInvoices();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      invoices = invoices.filter(i => 
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.clientName.toLowerCase().includes(q)
      );
    }
    if (clientId && clientId !== 'all') {
      invoices = invoices.filter(i => i.clientId === clientId);
    }
    if (status && status !== 'all') {
      invoices = invoices.filter(i => i.paymentStatus.toLowerCase() === (status as string).toLowerCase());
    }
    if (documentType && documentType !== 'all') {
      invoices = invoices.filter(i => i.documentType === documentType);
    }

    return successResponse(res, invoices, 'Invoices retrieved');
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newId = 'inv-' + Date.now();
    const newInvoice: Invoice = {
      ...data,
      id: newId
    };

    const invoices = [newInvoice, ...store.getInvoices()];
    store.setInvoices(invoices);

    // If an initial advance was recorded, auto-generate a payment receipt
    if (newInvoice.amountPaid > 0) {
      const payment: Payment = {
        id: 'pay-' + Date.now(),
        clientId: newInvoice.clientId,
        clientName: newInvoice.clientName,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        amount: newInvoice.amountPaid,
        paymentDate: newInvoice.invoiceDate || new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        referenceNumber: 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'Completed',
        notes: `Initial advance recorded on ${newInvoice.documentType || 'invoice'} creation.`
      };
      store.setPayments([payment, ...store.getPayments()]);

      // Update client payment status
      const clients = store.getClients().map(c => {
        if (c.id === newInvoice.clientId) {
          return {
            ...c,
            paymentStatus: (newInvoice.balanceDue === 0 ? 'paid' : 'partial') as Client['paymentStatus']
          };
        }
        return c;
      });
      store.setClients(clients);
    }

    const docType = newInvoice.documentType || 'Invoice';
    store.addLog('System', 'Admin', `Generated ${docType.toLowerCase()}`, `${newInvoice.invoiceNumber} for ${newInvoice.clientName}`, 'finance');
    return successResponse(res, newInvoice, `${docType} created`, 201);
  } catch (error) {
    next(error);
  }
};

export const markInvoicePaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'Bank Transfer' } = req.body;
    const invoice = store.getInvoices().find(i => i.id === id);

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    const updatedInvoices = store.getInvoices().map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          paymentStatus: 'Paid' as const,
          amountPaid: inv.total,
          balanceDue: 0
        };
      }
      return inv;
    });
    store.setInvoices(updatedInvoices);

    const payment: Payment = {
      id: 'pay-' + Date.now(),
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.balanceDue || invoice.total,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNumber: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      status: 'Completed',
      notes: 'Marked paid from action.'
    };
    store.setPayments([payment, ...store.getPayments()]);

    const clients = store.getClients().map(c => c.id === invoice.clientId ? { ...c, paymentStatus: 'paid' as const } : c);
    store.setClients(clients);

    store.addLog('System', 'Admin', 'Recorded payment in full', `₹${payment.amount} for ${invoice.invoiceNumber}`, 'finance');
    return successResponse(res, { invoiceId: id, payment }, 'Invoice marked paid');
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const target = store.getInvoices().find(i => i.id === id);
    store.setInvoices(store.getInvoices().filter(i => i.id !== id));
    if (target) {
      store.addLog('System', 'Admin', 'Deleted invoice', target.invoiceNumber, 'finance');
    }
    return successResponse(res, { id }, 'Invoice removed');
  } catch (error) {
    next(error);
  }
};

// Payments
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, search } = req.query;
    let payments = store.getPayments();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      payments = payments.filter(p => 
        p.clientName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
      );
    }
    if (clientId && clientId !== 'all') {
      payments = payments.filter(p => p.clientId === clientId);
    }

    return successResponse(res, payments, 'Payments retrieved');
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paymentData = req.body;
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + Date.now()
    };
    store.setPayments([newPayment, ...store.getPayments()]);

    // Update corresponding invoice if linked
    if (paymentData.invoiceId) {
      const invoices = store.getInvoices().map(inv => {
        if (inv.id === paymentData.invoiceId) {
          const newPaid = inv.amountPaid + paymentData.amount;
          const newBalance = Math.max(0, inv.total - newPaid);
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBalance,
            paymentStatus: (newBalance === 0 ? 'Paid' : 'Partial') as Invoice['paymentStatus']
          };
        }
        return inv;
      });
      store.setInvoices(invoices);
    }

    store.addLog('System', 'Admin', 'Recorded payment receipt', `₹${newPayment.amount} from ${newPayment.clientName}`, 'finance');
    return successResponse(res, newPayment, 'Payment recorded', 201);
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const target = store.getPayments().find(p => p.id === id);

    if (target && target.invoiceId) {
      const invoices = store.getInvoices().map(inv => {
        if (inv.id === target.invoiceId) {
          const newPaid = Math.max(0, inv.amountPaid - target.amount);
          const newBalance = Math.max(0, inv.total - newPaid);
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBalance,
            paymentStatus: (newBalance <= 0 ? 'Paid' : (newPaid > 0 ? 'Partial' : 'Pending')) as Invoice['paymentStatus']
          };
        }
        return inv;
      });
      store.setInvoices(invoices);
    }

    store.setPayments(store.getPayments().filter(p => p.id !== id));
    if (target) {
      store.addLog('System', 'Admin', 'Voided payment receipt', `₹${target.amount} for ${target.clientName}`, 'finance');
    }
    return successResponse(res, { id }, 'Payment deleted');
  } catch (error) {
    next(error);
  }
};

// Expenses
export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;
    let expenses = store.getExpenses();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      expenses = expenses.filter(e => e.title.toLowerCase().includes(q));
    }
    if (category && category !== 'all') {
      expenses = expenses.filter(e => e.category === category);
    }

    return successResponse(res, expenses, 'Expenses retrieved');
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newExpense: Expense = {
      ...data,
      id: 'exp-' + Date.now()
    };
    store.setExpenses([newExpense, ...store.getExpenses()]);
    store.addLog('System', 'Admin', 'Recorded expense', `${newExpense.title} (₹${newExpense.amount})`, 'finance');
    return successResponse(res, newExpense, 'Expense recorded', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    store.setExpenses(store.getExpenses().filter(e => e.id !== id));
    return successResponse(res, { id }, 'Expense deleted');
  } catch (error) {
    next(error);
  }
};
