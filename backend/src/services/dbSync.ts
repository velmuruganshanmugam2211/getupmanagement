import fs from 'fs';
import path from 'path';
import { prisma } from '../config/database';
import { 
  User as StoreUser, 
  Client as StoreClient, 
  Package as StorePackage, 
  MonthlyQuota as StoreQuota, 
  ContentItem as StoreContent, 
  Task as StoreTask, 
  Campaign as StoreCampaign, 
  Invoice as StoreInvoice, 
  Payment as StorePayment, 
  Expense as StoreExpense, 
  MediaItem as StoreMedia, 
  Notification as StoreNotif, 
  ActivityLog as StoreLog 
} from '../types';

// Role mapping helper
export const mapRoleToPrisma = (role?: string): any => {
  switch (role) {
    case 'Super Admin': return 'SUPER_ADMIN';
    case 'Admin': return 'ADMIN';
    case 'Digital Marketer': return 'DIGITAL_MARKETER';
    case 'Designer': return 'DESIGNER';
    case 'Video Editor': return 'VIDEO_EDITOR';
    default: return 'DIGITAL_MARKETER';
  }
};

export const mapWorkloadToPrisma = (workload?: string): any => {
  switch (workload) {
    case 'Low': return 'Low';
    case 'High': return 'High';
    case 'Overloaded': return 'Overloaded';
    case 'Normal':
    default:
      return 'Normal';
  }
};

export const mapTaskStatusToPrisma = (status?: string): any => {
  switch (status) {
    case 'In Progress': return 'In_Progress';
    case 'Review': return 'Review';
    case 'Completed': return 'Completed';
    case 'Cancelled': return 'Cancelled';
    case 'Todo':
    default:
      return 'Todo';
  }
};

export const mapContentStatusToPrisma = (status?: string): any => {
  switch (status) {
    case 'Idea': return 'Idea';
    case 'Planned': return 'Planned';
    case 'Assigned': return 'Assigned';
    case 'In Progress': return 'In_Progress';
    case 'Internal Review': return 'Internal_Review';
    case 'Ready': return 'Ready';
    case 'Scheduled': return 'Scheduled';
    case 'Published': return 'Published';
    case 'Cancelled': return 'Cancelled';
    default: return 'Planned';
  }
};

export const mapContentTypeToPrisma = (type?: string): any => {
  switch (type) {
    case 'Video': return 'Video';
    case 'Reel': return 'Reel';
    case 'Poster': return 'Poster';
    case 'Photo': return 'Photo';
    case 'Story': return 'Story';
    case 'Carousel': return 'Carousel';
    case 'Ad Creative':
    case 'Ad_Creative':
      return 'Ad_Creative';
    default: return 'Reel';
  }
};

export const mapPaymentMethodToPrisma = (method?: string): any => {
  switch (method) {
    case 'Cash': return 'Cash';
    case 'UPI': return 'UPI';
    case 'Bank Transfer':
    case 'Bank_Transfer':
      return 'Bank_Transfer';
    case 'Card': return 'Card';
    default: return 'Other';
  }
};

export const mapMediaFolderToPrisma = (folder?: string): any => {
  switch (folder) {
    case 'Brand Assets':
    case 'Brand_Assets':
      return 'Brand_Assets';
    case 'Photos': return 'Photos';
    case 'Videos': return 'Videos';
    case 'Posters': return 'Posters';
    case 'Reels': return 'Reels';
    case 'Documents': return 'Documents';
    default: return 'Reels';
  }
};

export const mapExpenseCategoryToPrisma = (cat?: string): any => {
  const valid = ['Software', 'Salary', 'Freelancer', 'Advertising', 'Travel', 'Office', 'Equipment', 'Subscription', 'Other'];
  return valid.includes(cat || '') ? cat : 'Other';
};

/**
 * Sync entire StoreData into PostgreSQL tables via Prisma.
 */
export async function syncStoreToPostgres(inputData?: any): Promise<void> {
  console.log('🔄 Starting PostgreSQL database sync...');

  try {
    let data = inputData;
    if (!data) {
      const dataFile = path.resolve(__dirname, '../../data/store.json');
      if (fs.existsSync(dataFile)) {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      }
    }

    if (!data) {
      console.warn('⚠️ No data available to sync to PostgreSQL.');
      return;
    }

    // 1. Sync Users
    if (data.users && Array.isArray(data.users)) {
      for (const u of data.users) {
        await prisma.user.upsert({
          where: { email: u.email.toLowerCase().trim() },
          update: {
            name: u.name || 'User',
            phone: u.phone || '+91 98400 00000',
            role: mapRoleToPrisma(u.role),
            avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            status: u.status || 'active',
            workload: mapWorkloadToPrisma(u.workload),
            passwordHash: u.passwordHash || '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
          },
          create: {
            id: u.id,
            email: u.email.toLowerCase().trim(),
            name: u.name || 'User',
            phone: u.phone || '+91 98400 00000',
            role: mapRoleToPrisma(u.role),
            avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            status: u.status || 'active',
            workload: mapWorkloadToPrisma(u.workload),
            passwordHash: u.passwordHash || '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
          }
        });
      }
      console.log(`✅ Synced ${data.users.length} users to PostgreSQL.`);
    }

    // Retrieve default user id for foreign keys if needed
    const defaultUser = await prisma.user.findFirst();
    const defaultUserId = defaultUser?.id || '';

    // 2. Sync Packages
    if (data.packages && Array.isArray(data.packages)) {
      for (const p of data.packages) {
        await prisma.package.upsert({
          where: { name: p.name },
          update: {
            description: p.description || '',
            monthlyPrice: Number(p.monthlyPrice) || 0,
            billingCycle: p.billingCycle || 'Monthly',
            status: p.status || 'active',
            quotaVideos: p.quota?.videos ?? 0,
            quotaReels: p.quota?.reels ?? 0,
            quotaPosters: p.quota?.posters ?? 0,
            quotaPhotos: p.quota?.photos ?? 0,
            quotaStories: p.quota?.stories ?? 0,
            services: Array.isArray(p.services) ? p.services : [],
            isCustom: !!p.isCustom
          },
          create: {
            id: p.id,
            name: p.name,
            description: p.description || '',
            monthlyPrice: Number(p.monthlyPrice) || 0,
            billingCycle: p.billingCycle || 'Monthly',
            status: p.status || 'active',
            quotaVideos: p.quota?.videos ?? 0,
            quotaReels: p.quota?.reels ?? 0,
            quotaPosters: p.quota?.posters ?? 0,
            quotaPhotos: p.quota?.photos ?? 0,
            quotaStories: p.quota?.stories ?? 0,
            services: Array.isArray(p.services) ? p.services : [],
            isCustom: !!p.isCustom
          }
        });
      }
      console.log(`✅ Synced ${data.packages.length} packages to PostgreSQL.`);
    }

    const defaultPkg = await prisma.package.findFirst();
    const defaultPkgId = defaultPkg?.id || '';

    // 3. Sync Clients
    if (data.clients && Array.isArray(data.clients)) {
      for (const c of data.clients) {
        // Ensure accountManagerId is valid
        let managerId = c.accountManagerId;
        const managerExists = await prisma.user.findUnique({ where: { id: managerId } });
        if (!managerExists) {
          managerId = defaultUserId;
        }

        // Ensure packageId is valid
        let pkgId = c.packageId;
        const pkgExists = await prisma.package.findUnique({ where: { id: pkgId } });
        if (!pkgExists) {
          pkgId = defaultPkgId;
        }

        await prisma.client.upsert({
          where: { id: c.id },
          update: {
            businessName: c.businessName,
            contactPerson: c.contactPerson || c.businessName,
            phone: c.phone || '',
            whatsapp: c.whatsapp || c.phone || '',
            email: c.email || '',
            address: c.address || '',
            industry: c.industry || 'Digital Marketing',
            website: c.socials?.website || null,
            instagram: c.socials?.instagram || null,
            facebook: c.socials?.facebook || null,
            youtube: c.socials?.youtube || null,
            googleBusiness: c.socials?.googleBusiness || null,
            gstNumber: c.billing?.gstNumber || null,
            billingName: c.billing?.billingName || c.businessName,
            billingAddress: c.billing?.billingAddress || c.address || '',
            packageId: pkgId,
            monthlyFee: Number(c.monthlyFee) || 0,
            startDate: c.startDate ? new Date(c.startDate) : new Date(),
            endDate: c.endDate ? new Date(c.endDate) : new Date(Date.now() + 180 * 86400000),
            paymentTerms: c.paymentTerms || 'Net 15',
            paymentStatus: (c.paymentStatus as any) || 'pending',
            status: (c.status as any) || 'active',
            accountManagerId: managerId,
            notes: c.notes || null
          },
          create: {
            id: c.id,
            businessName: c.businessName,
            contactPerson: c.contactPerson || c.businessName,
            phone: c.phone || '',
            whatsapp: c.whatsapp || c.phone || '',
            email: c.email || '',
            address: c.address || '',
            industry: c.industry || 'Digital Marketing',
            website: c.socials?.website || null,
            instagram: c.socials?.instagram || null,
            facebook: c.socials?.facebook || null,
            youtube: c.socials?.youtube || null,
            googleBusiness: c.socials?.googleBusiness || null,
            gstNumber: c.billing?.gstNumber || null,
            billingName: c.billing?.billingName || c.businessName,
            billingAddress: c.billing?.billingAddress || c.address || '',
            packageId: pkgId,
            monthlyFee: Number(c.monthlyFee) || 0,
            startDate: c.startDate ? new Date(c.startDate) : new Date(),
            endDate: c.endDate ? new Date(c.endDate) : new Date(Date.now() + 180 * 86400000),
            paymentTerms: c.paymentTerms || 'Net 15',
            paymentStatus: (c.paymentStatus as any) || 'pending',
            status: (c.status as any) || 'active',
            accountManagerId: managerId,
            notes: c.notes || null
          }
        });
      }
      console.log(`✅ Synced ${data.clients.length} clients to PostgreSQL.`);
    }

    // 4. Sync MonthlyQuotas
    if (data.quotas && Array.isArray(data.quotas)) {
      for (const q of data.quotas) {
        const clientExists = await prisma.client.findUnique({ where: { id: q.clientId } });
        if (!clientExists) continue;

        await prisma.monthlyQuota.upsert({
          where: { clientId_month: { clientId: q.clientId, month: q.month } },
          update: {
            monthLabel: q.monthLabel || q.month,
            status: q.status || 'on_track',
            notes: q.notes || null,
            videosAllocated: q.items?.videos?.allocated ?? 0,
            videosCompleted: q.items?.videos?.completed ?? 0,
            reelsAllocated: q.items?.reels?.allocated ?? 0,
            reelsCompleted: q.items?.reels?.completed ?? 0,
            postersAllocated: q.items?.posters?.allocated ?? 0,
            postersCompleted: q.items?.posters?.completed ?? 0,
            photosAllocated: q.items?.photos?.allocated ?? 0,
            photosCompleted: q.items?.photos?.completed ?? 0,
            storiesAllocated: q.items?.stories?.allocated ?? 0,
            storiesCompleted: q.items?.stories?.completed ?? 0
          },
          create: {
            id: q.id || undefined,
            clientId: q.clientId,
            month: q.month,
            monthLabel: q.monthLabel || q.month,
            status: q.status || 'on_track',
            notes: q.notes || null,
            videosAllocated: q.items?.videos?.allocated ?? 0,
            videosCompleted: q.items?.videos?.completed ?? 0,
            reelsAllocated: q.items?.reels?.allocated ?? 0,
            reelsCompleted: q.items?.reels?.completed ?? 0,
            postersAllocated: q.items?.posters?.allocated ?? 0,
            postersCompleted: q.items?.posters?.completed ?? 0,
            photosAllocated: q.items?.photos?.allocated ?? 0,
            photosCompleted: q.items?.photos?.completed ?? 0,
            storiesAllocated: q.items?.stories?.allocated ?? 0,
            storiesCompleted: q.items?.stories?.completed ?? 0
          }
        });
      }
      console.log(`✅ Synced ${data.quotas.length} monthly quotas to PostgreSQL.`);
    }

    // 5. Sync Tasks
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const t of data.tasks) {
        const clientExists = await prisma.client.findUnique({ where: { id: t.clientId } });
        if (!clientExists) continue;

        let assignedId = t.assignedToId;
        const userExists = await prisma.user.findUnique({ where: { id: assignedId } });
        if (!userExists) assignedId = defaultUserId;

        await prisma.task.upsert({
          where: { id: t.id },
          update: {
            title: t.title,
            description: t.description || '',
            clientId: t.clientId,
            project: t.project || 'Social Media Retainer',
            assignedToId: assignedId,
            priority: (t.priority as any) || 'High',
            status: mapTaskStatusToPrisma(t.status),
            dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
            estimatedHours: Number(t.estimatedHours) || 1.0,
            actualHours: t.actualHours ? Number(t.actualHours) : null
          },
          create: {
            id: t.id,
            title: t.title,
            description: t.description || '',
            clientId: t.clientId,
            project: t.project || 'Social Media Retainer',
            assignedToId: assignedId,
            priority: (t.priority as any) || 'High',
            status: mapTaskStatusToPrisma(t.status),
            dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
            estimatedHours: Number(t.estimatedHours) || 1.0,
            actualHours: t.actualHours ? Number(t.actualHours) : null
          }
        });
      }
      console.log(`✅ Synced ${data.tasks.length} tasks to PostgreSQL.`);
    }

    // 6. Sync Content Items
    if (data.contents && Array.isArray(data.contents)) {
      for (const c of data.contents) {
        const clientExists = await prisma.client.findUnique({ where: { id: c.clientId } });
        if (!clientExists) continue;

        let assignedId = c.assignedToId;
        const userExists = await prisma.user.findUnique({ where: { id: assignedId } });
        if (!userExists) assignedId = defaultUserId;

        await prisma.contentItem.upsert({
          where: { id: c.id },
          update: {
            clientId: c.clientId,
            contentType: mapContentTypeToPrisma(c.contentType),
            title: c.title,
            description: c.description || '',
            platform: c.platform || 'Instagram',
            assignedToId: assignedId,
            dueDate: c.dueDate ? new Date(c.dueDate) : new Date(),
            publishDate: c.publishDate ? new Date(c.publishDate) : new Date(),
            priority: (c.priority as any) || 'High',
            status: mapContentStatusToPrisma(c.status),
            mediaUrl: c.mediaUrl || null,
            mediaThumbnail: c.mediaThumbnail || null,
            caption: c.caption || null,
            hashtags: c.hashtags || null,
            notes: c.notes || null
          },
          create: {
            id: c.id,
            clientId: c.clientId,
            contentType: mapContentTypeToPrisma(c.contentType),
            title: c.title,
            description: c.description || '',
            platform: c.platform || 'Instagram',
            assignedToId: assignedId,
            dueDate: c.dueDate ? new Date(c.dueDate) : new Date(),
            publishDate: c.publishDate ? new Date(c.publishDate) : new Date(),
            priority: (c.priority as any) || 'High',
            status: mapContentStatusToPrisma(c.status),
            mediaUrl: c.mediaUrl || null,
            mediaThumbnail: c.mediaThumbnail || null,
            caption: c.caption || null,
            hashtags: c.hashtags || null,
            notes: c.notes || null
          }
        });
      }
      console.log(`✅ Synced ${data.contents.length} content items to PostgreSQL.`);
    }

    // 7. Sync Invoices
    if (data.invoices && Array.isArray(data.invoices)) {
      for (const inv of data.invoices) {
        const clientExists = await prisma.client.findUnique({ where: { id: inv.clientId } });
        if (!clientExists) continue;

        await prisma.invoice.upsert({
          where: { invoiceNumber: inv.invoiceNumber },
          update: {
            documentType: inv.documentType === 'Quotation' ? 'Quotation' : 'Invoice',
            clientId: inv.clientId,
            invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate) : new Date(),
            dueDate: inv.dueDate ? new Date(inv.dueDate) : new Date(),
            subtotal: Number(inv.subtotal) || 0,
            taxRate: Number(inv.taxRate) || 0,
            taxAmount: Number(inv.taxAmount) || 0,
            discount: Number(inv.discount) || 0,
            total: Number(inv.total) || 0,
            amountPaid: Number(inv.amountPaid) || 0,
            balanceDue: Number(inv.balanceDue) || 0,
            paymentStatus: inv.paymentStatus || 'Pending',
            notes: inv.notes || null
          },
          create: {
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            documentType: inv.documentType === 'Quotation' ? 'Quotation' : 'Invoice',
            clientId: inv.clientId,
            invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate) : new Date(),
            dueDate: inv.dueDate ? new Date(inv.dueDate) : new Date(),
            subtotal: Number(inv.subtotal) || 0,
            taxRate: Number(inv.taxRate) || 0,
            taxAmount: Number(inv.taxAmount) || 0,
            discount: Number(inv.discount) || 0,
            total: Number(inv.total) || 0,
            amountPaid: Number(inv.amountPaid) || 0,
            balanceDue: Number(inv.balanceDue) || 0,
            paymentStatus: inv.paymentStatus || 'Pending',
            notes: inv.notes || null
          }
        });

        // Sync items
        if (inv.items && Array.isArray(inv.items)) {
          for (const item of inv.items) {
            await prisma.invoiceItem.upsert({
              where: { id: item.id },
              update: {
                invoiceId: inv.id,
                description: item.description,
                quantity: item.quantity || 1,
                unitPrice: Number(item.unitPrice) || 0,
                amount: Number(item.amount) || 0
              },
              create: {
                id: item.id,
                invoiceId: inv.id,
                description: item.description,
                quantity: item.quantity || 1,
                unitPrice: Number(item.unitPrice) || 0,
                amount: Number(item.amount) || 0
              }
            });
          }
        }
      }
      console.log(`✅ Synced ${data.invoices.length} invoices to PostgreSQL.`);
    }

    // 8. Sync Payments
    if (data.payments && Array.isArray(data.payments)) {
      for (const p of data.payments) {
        const clientExists = await prisma.client.findUnique({ where: { id: p.clientId } });
        if (!clientExists) continue;

        await prisma.payment.upsert({
          where: { id: p.id },
          update: {
            clientId: p.clientId,
            invoiceId: p.invoiceId || null,
            amount: Number(p.amount) || 0,
            paymentDate: p.paymentDate ? new Date(p.paymentDate) : new Date(),
            paymentMethod: mapPaymentMethodToPrisma(p.paymentMethod),
            referenceNumber: p.referenceNumber || null,
            status: p.status || 'Completed',
            notes: p.notes || null
          },
          create: {
            id: p.id,
            clientId: p.clientId,
            invoiceId: p.invoiceId || null,
            amount: Number(p.amount) || 0,
            paymentDate: p.paymentDate ? new Date(p.paymentDate) : new Date(),
            paymentMethod: mapPaymentMethodToPrisma(p.paymentMethod),
            referenceNumber: p.referenceNumber || null,
            status: p.status || 'Completed',
            notes: p.notes || null
          }
        });
      }
      console.log(`✅ Synced ${data.payments.length} payments to PostgreSQL.`);
    }

    // 9. Sync Expenses
    if (data.expenses && Array.isArray(data.expenses)) {
      for (const e of data.expenses) {
        await prisma.expense.upsert({
          where: { id: e.id },
          update: {
            title: e.title,
            category: mapExpenseCategoryToPrisma(e.category),
            amount: Number(e.amount) || 0,
            date: e.date ? new Date(e.date) : new Date(),
            paidBy: e.paidBy || 'Agency',
            paymentMethod: mapPaymentMethodToPrisma(e.paymentMethod),
            clientId: e.clientId || null,
            clientName: e.clientName || null,
            teamMemberId: e.teamMemberId || null,
            teamMemberName: e.teamMemberName || null,
            receiptName: e.receiptName || null,
            receiptUrl: e.receiptUrl || null,
            notes: e.notes || null
          },
          create: {
            id: e.id,
            title: e.title,
            category: mapExpenseCategoryToPrisma(e.category),
            amount: Number(e.amount) || 0,
            date: e.date ? new Date(e.date) : new Date(),
            paidBy: e.paidBy || 'Agency',
            paymentMethod: mapPaymentMethodToPrisma(e.paymentMethod),
            clientId: e.clientId || null,
            clientName: e.clientName || null,
            teamMemberId: e.teamMemberId || null,
            teamMemberName: e.teamMemberName || null,
            receiptName: e.receiptName || null,
            receiptUrl: e.receiptUrl || null,
            notes: e.notes || null
          }
        });
      }
      console.log(`✅ Synced ${data.expenses.length} expenses to PostgreSQL.`);
    }

    // 10. Sync Activity Logs
    if (data.activityLogs && Array.isArray(data.activityLogs)) {
      for (const log of data.activityLogs.slice(0, 50)) { // limit to last 50
        await prisma.activityLog.upsert({
          where: { id: log.id },
          update: {
            userName: log.userName || 'System',
            userRole: log.userRole || 'Admin',
            action: log.action || '',
            target: log.target || '',
            type: log.type || 'system'
          },
          create: {
            id: log.id,
            userName: log.userName || 'System',
            userRole: log.userRole || 'Admin',
            action: log.action || '',
            target: log.target || '',
            type: log.type || 'system'
          }
        });
      }
    }

    console.log('🎉 PostgreSQL database synchronization complete!');
  } catch (error) {
    console.error('❌ Error synchronizing store to PostgreSQL:', error);
  }
}
