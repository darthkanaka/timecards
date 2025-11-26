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
export async function submitTimecard(contractorId, timecardData, payPeriod) {
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
      throw new Error('Failed to update timecard');
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
      throw new Error('Failed to submit timecard');
    }
    result = data;
  }

  // Trigger n8n webhook for notifications
  if (N8N_WEBHOOK_URL) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'invoice_submitted',
          invoice: result,
          contractorId,
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
 * Get all contractors
 */
export async function getAllContractors() {
  const { data, error } = await supabase
    .from('contractors')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching contractors:', error);
    return [];
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
    return [];
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
    throw new Error('Failed to advance invoice status');
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
    return null;
  }

  const { data: contractors, error: contractorsError } = await supabase
    .from('contractors')
    .select('*')
    .eq('is_active', true);

  if (contractorsError) {
    console.error('Error fetching contractors:', contractorsError);
    return null;
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
