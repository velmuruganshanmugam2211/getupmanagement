import { Router } from 'express';
import { 
  getFinanceOverview, 
  getInvoices, 
  createInvoice, 
  markInvoicePaid, 
  deleteInvoice,
  getPayments,
  createPayment,
  deletePayment,
  getExpenses,
  createExpense,
  deleteExpense
} from '../controllers/finance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeModule } from '../middleware/role.middleware';

const router = Router();

// Guard entire finance module: requires login and Finance permission (Super Admin or Admin)
router.use(authenticate, authorizeModule('finance'));

router.get('/overview', getFinanceOverview);

// Invoices & Quotations
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.post('/invoices/:id/pay', markInvoicePaid);
router.delete('/invoices/:id', deleteInvoice);

// Payments
router.get('/payments', getPayments);
router.post('/payments', createPayment);
router.delete('/payments/:id', deletePayment);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.delete('/expenses/:id', deleteExpense);

export default router;
