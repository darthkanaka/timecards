import { supabase } from './supabase';
import { getCurrentPayPeriod, toISODateString } from './payPeriod';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Get contractor by URL token
 */
export async function getContractorByToken(token) {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .eq('url_token', token)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching contractor:', error);
    // PGRST116 means no rows found - that's expected for invalid tokens
    if (error.code !== 'PGRST116') {
      throw new Error(error.message || 'Failed to load contractor');
    }
    return null;
  }

  return data;
}

/**
 * Get invoice for a contractor and pay period
 */
export async function getInvoiceForPeriod(contractorId, payPeriodStart) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('contractor_id', contractorId)
    .eq('pay_period_start', payPeriodStart)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data;
}

/**
 * Get current period invoice for a contractor
 */
export async function getCurrentInvoice(contractorId) {
  const payPeriod = getCurrentPayPeriod();
  const periodStart = toISODateString(payPeriod.periodStart);
  return getInvoiceForPeriod(contractorId, periodStart);
}

/**
 * Get all invoices for a contractor (for history)
 */
export async function getContractorInvoices(contractorId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('contractor_id', contractorId)
    .order('pay_period_start', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }

  return data || [];
}

/**
 * Submit a timecard (create or update invoice) for a specific pay period
 */
export async function submitTimecard(contractorId, timecardData, payPeriod, isResubmission = false) {
  const invoiceData = {
    contractor_id: contractorId,
    pay_period_start: toISODateString(payPeriod.periodStart),
    pay_period_end: toISODateString(payPeriod.periodEnd),
    week_1_start: toISODateString(payPeriod.week1.start),
    week_1_end: toISODateString(payPeriod.week1.end),
    week_1_hours: timecardData.week1Hours,
    week_1_rate: timecardData.week1Rate,
    week_1_notes: timecardData.week1Notes,
    week_2_start: toISODateString(payPeriod.week2.start),
    week_2_end: toISODateString(payPeriod.week2.end),
    week_2_hours: timecardData.week2Hours,
    week_2_rate: timecardData.week2Rate,
    week_2_notes: timecardData.week2Notes,
    tax_rate: timecardData.taxRate || null,
    tax_amount: timecardData.taxAmount || null,
    total_amount: timecardData.totalAmount,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  };

  // If resubmission after rejection, clear approval and rejection fields
  if (isResubmission) {
    invoiceData.approval_1_at = null;
    invoiceData.approval_1_by = null;
    invoiceData.approval_2_at = null;
    invoiceData.approval_2_by = null;
    invoiceData.rejection_reason = null;
    invoiceData.rejected_by = null;
    invoiceData.rejected_at = null;
  }

  // Check if invoice already exists for this period
  const periodStart = toISODateString(payPeriod.periodStart);
  const existing = await getInvoiceForPeriod(contractorId, periodStart);

  let result;
  if (existing) {
    // Update existing invoice
    const { data, error } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      throw new Error(error.message || 'Failed to update timecard');
    }
    result = data;
  } else {
    // Create new invoice
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      throw new Error(error.message || 'Failed to submit timecard');
    }
    result = data;
  }

  // Trigger n8n webhook for notifications
  if (N8N_WEBHOOK_URL) {
    try {
      // Fetch contractor details for the webhook
      const { data: contractor } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', contractorId)
        .single();

      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'invoice_submitted',
          invoice: result,
          contractor: contractor || null,
          contractorName: contractor?.name,
          contractorEmail: contractor?.email,
          contractorCompany: contractor?.company,
          isResubmission,
          // Flattened fields for easy email template access
          payPeriodStart: result.pay_period_start,
          payPeriodEnd: result.pay_period_end,
          week1Hours: result.week_1_hours,
          week1Rate: result.week_1_rate,
          week1Notes: result.week_1_notes,
          week2Hours: result.week_2_hours,
          week2Rate: result.week_2_rate,
          week2Notes: result.week_2_notes,
          totalAmount: result.total_amount,
        }),
      });
    } catch (webhookError) {
      console.warn('Failed to trigger webhook:', webhookError);
    }
  }

  return result;
}

// ==================== Admin API Functions ====================

/**
 * Delete an invoice completely (resets to fresh state for contractor)
 */
export async function deleteInvoice(invoiceId) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw new Error(error.message || 'Failed to delete invoice');
  }

  return true;
}

/**
 * Get all contractors
 */
export async function getAllContractors() {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching contractors:', error);
    throw new Error(error.message || 'Failed to load contractors');
  }

  return data || [];
}

/**
 * Get all invoices with optional filters
 */
export async function getAllInvoices(filters = {}) {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      contractors (
        id,
        name,
        email
      )
    `)
    .order('pay_period_start', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.payPeriodStart) {
    query = query.eq('pay_period_start', filters.payPeriodStart);
  }

  if (filters.contractorId) {
    query = query.eq('contractor_id', filters.contractorId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(error.message || 'Failed to load invoices');
  }

  return data || [];
}

/**
 * Get invoice by ID with contractor details
 */
export async function getInvoiceById(invoiceId) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      contractors (
        id,
        name,
        email,
        default_hourly_rate
      )
    `)
    .eq('id', invoiceId)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    if (error.code !== 'PGRST116') {
      throw new Error(error.message || 'Failed to load invoice');
    }
    return null;
  }

  return data;
}

/**
 * Advance invoice to next status
 */
export async function advanceInvoiceStatus(invoiceId, approverName = 'Admin') {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const statusOrder = ['pending', 'submitted', 'approval_1', 'approval_2', 'pending_payment', 'paid'];
  const currentIndex = statusOrder.indexOf(invoice.status);

  if (currentIndex === -1 || currentIndex >= statusOrder.length - 1) {
    throw new Error('Cannot advance status');
  }

  const nextStatus = statusOrder[currentIndex + 1];
  const updateData = { status: nextStatus };

  // Add timestamp and approver for approval stages
  if (nextStatus === 'approval_1') {
    updateData.approval_1_at = new Date().toISOString();
    updateData.approval_1_by = approverName;
  } else if (nextStatus === 'approval_2') {
    updateData.approval_2_at = new Date().toISOString();
    updateData.approval_2_by = approverName;
  } else if (nextStatus === 'paid') {
    updateData.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error advancing invoice:', error);
    throw new Error(error.message || 'Failed to advance invoice status');
  }

  // Trigger n8n webhook for status change notification
  if (N8N_WEBHOOK_URL) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'status_changed',
          invoice: data,
          previousStatus: invoice.status,
          newStatus: nextStatus,
        }),
      });
    } catch (webhookError) {
      console.warn('Failed to trigger webhook:', webhookError);
    }
  }

  return data;
}

/**
 * Get pay period summary
 */
export async function getPayPeriodSummary(payPeriodStart) {
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select(`
      *,
      contractors (
        id,
        name,
        email
      )
    `)
    .eq('pay_period_start', payPeriodStart);

  if (invoicesError) {
    console.error('Error fetching period summary:', invoicesError);
    throw new Error(invoicesError.message || 'Failed to load period summary');
  }

  const { data: contractors, error: contractorsError } = await supabase
    .from('contractors')
    .select('*')
    .eq('is_active', true);

  if (contractorsError) {
    console.error('Error fetching contractors:', contractorsError);
    throw new Error(contractorsError.message || 'Failed to load contractors');
  }

  const submittedIds = new Set(invoices?.map(i => i.contractor_id) || []);
  const notSubmitted = contractors?.filter(c => !submittedIds.has(c.id)) || [];

  const totalAmount = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

  return {
    invoices: invoices || [],
    totalContractors: contractors?.length || 0,
    submittedCount: invoices?.length || 0,
    notSubmitted,
    totalAmount,
    allSubmitted: notSubmitted.length === 0 && (contractors?.length || 0) > 0,
  };
}

// ==================== Approver API Functions ====================

/**
 * Get approver by URL token
 */
export async function getApproverByToken(token) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('url_token', token)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching approver:', error);
    // PGRST116 means no rows found - that's expected for invalid tokens
    if (error.code !== 'PGRST116') {
      throw new Error(error.message || 'Failed to load approver');
    }
    return null;
  }

  return data;
}

/**
 * Get invoices pending approval for a specific approval level
 */
export async function getInvoicesPendingApproval(approvalLevel) {
  // Level 1 approvers see 'submitted' invoices
  // Level 2 approvers see 'approval_1' invoices
  const statusToView = approvalLevel === 1 ? 'submitted' : 'approval_1';

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      contractors (
        id,
        name,
        email,
        company,
        url_token
      )
    `)
    .eq('status', statusToView)
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending invoices:', error);
    throw new Error(error.message || 'Failed to load pending invoices');
  }

  return data || [];
}

/**
 * Approve an invoice (level 1 or level 2)
 */
export async function approveInvoice(invoiceId, approverName, approvalLevel) {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Validate correct status for this approval level
  if (approvalLevel === 1 && invoice.status !== 'submitted') {
    throw new Error('Invoice is not awaiting first approval');
  }
  if (approvalLevel === 2 && invoice.status !== 'approval_1') {
    throw new Error('Invoice is not awaiting second approval');
  }

  const updateData = {};
  let newStatus;

  if (approvalLevel === 1) {
    newStatus = 'approval_1';
    updateData.status = newStatus;
    updateData.approval_1_at = new Date().toISOString();
    updateData.approval_1_by = approverName;
  } else {
    newStatus = 'approval_2';
    updateData.status = newStatus;
    updateData.approval_2_at = new Date().toISOString();
    updateData.approval_2_by = approverName;
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error approving invoice:', error);
    throw new Error(error.message || 'Failed to approve invoice');
  }

  // Trigger n8n webhook for approval notification
  if (N8N_WEBHOOK_URL) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'invoice_approved',
          invoice: data,
          approverName,
          approvalLevel,
          approvalLabel: approvalLevel === 1 ? 'Nick (1/2)' : 'Chris (2/2)',
          previousStatus: invoice.status,
          newStatus,
          // Contractor details
          contractor: invoice.contractors || null,
          contractorName: invoice.contractors?.name,
          contractorEmail: invoice.contractors?.email,
          contractorCompany: invoice.contractors?.company,
          contractorTimecardUrl: invoice.contractors?.url_token,
          // Invoice details for easy template access
          payPeriodStart: invoice.pay_period_start,
          payPeriodEnd: invoice.pay_period_end,
          week1Hours: invoice.week_1_hours,
          week1Rate: invoice.week_1_rate,
          week1Notes: invoice.week_1_notes,
          week2Hours: invoice.week_2_hours,
          week2Rate: invoice.week_2_rate,
          week2Notes: invoice.week_2_notes,
          totalAmount: invoice.total_amount,
        }),
      });
    } catch (webhookError) {
      console.warn('Failed to trigger webhook:', webhookError);
    }
  }

  return data;
}

/**
 * Reject an invoice
 */
export async function rejectInvoice(invoiceId, approverName, rejectionReason) {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Can only reject submitted or approval_1 invoices
  if (!['submitted', 'approval_1'].includes(invoice.status)) {
    throw new Error('Invoice cannot be rejected at this stage');
  }

  const updateData = {
    status: 'rejected',
    rejection_reason: rejectionReason,
    rejected_by: approverName,
    rejected_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting invoice:', error);
    throw new Error(error.message || 'Failed to reject invoice');
  }

  // Trigger n8n webhook for rejection notification
  if (N8N_WEBHOOK_URL) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'invoice_rejected',
          invoice: data,
          approverName,
          rejectionReason,
          previousStatus: invoice.status,
          // Contractor details
          contractor: invoice.contractors || null,
          contractorName: invoice.contractors?.name,
          contractorEmail: invoice.contractors?.email,
          contractorCompany: invoice.contractors?.company,
          contractorTimecardUrl: invoice.contractors?.url_token,
          // Invoice details for easy template access
          payPeriodStart: invoice.pay_period_start,
          payPeriodEnd: invoice.pay_period_end,
          week1Hours: invoice.week_1_hours,
          week1Rate: invoice.week_1_rate,
          week1Notes: invoice.week_1_notes,
          week2Hours: invoice.week_2_hours,
          week2Rate: invoice.week_2_rate,
          week2Notes: invoice.week_2_notes,
          totalAmount: invoice.total_amount,
        }),
      });
    } catch (webhookError) {
      console.warn('Failed to trigger webhook:', webhookError);
    }
  }

  return data;
}

/**
 * Get recent approver activity (approved/rejected today)
 */
export async function getApproverActivity(approverName, limit = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      contractors (
        id,
        name,
        company
      )
    `)
    .or(`approval_1_by.eq.${approverName},approval_2_by.eq.${approverName},rejected_by.eq.${approverName}`)
    .gte('updated_at', todayISO)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching approver activity:', error);
    return [];
  }

  return data || [];
}
