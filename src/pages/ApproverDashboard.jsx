import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getApproverByToken,
  getInvoicesPendingApproval,
  approveInvoice,
  rejectInvoice,
} from '../lib/api';
import { formatDateRange } from '../lib/payPeriod';

const LOGO_URL = "https://static.wixstatic.com/media/edda46_11cebb29dd364966929fec216683b3f3~mv2.png/v1/fill/w_486,h_344,al_c,lg_1,q_85,enc_avif,quality_auto/IA%20LOGO.png";

function InvoiceCard({ invoice, approver, onApprove, onReject, isProcessing }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const periodStart = new Date(invoice.pay_period_start + 'T00:00:00');
  const periodEnd = new Date(invoice.pay_period_end + 'T00:00:00');

  const week1Subtotal = (invoice.week_1_hours || 0) * (invoice.week_1_rate || 0);
  const week2Subtotal = (invoice.week_2_hours || 0) * (invoice.week_2_rate || 0);
  const subtotal = week1Subtotal + week2Subtotal;

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) return;
    onReject(invoice.id, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  return (
    <div className="card-dark overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">
              {invoice.contractors?.name}
            </h3>
            {invoice.contractors?.company && (
              <p className="text-text-secondary text-sm">{invoice.contractors.company}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">
              {formatDateRange(periodStart, periodEnd)}
            </p>
            <p className="text-text-muted text-xs">
              Submitted {new Date(invoice.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="p-6 space-y-4">
        {/* Week 1 */}
        <div className="bg-dark-elevated rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-sm font-medium">Week 1</span>
            <span className="text-white font-semibold">
              ${week1Subtotal.toFixed(2)}
            </span>
          </div>
          <div className="text-text-muted text-sm">
            <span>{invoice.week_1_hours || 0} hours × ${invoice.week_1_rate || 0}/hr</span>
          </div>
          {invoice.week_1_notes && (
            <p className="mt-2 text-text-secondary text-sm italic">
              "{invoice.week_1_notes}"
            </p>
          )}
        </div>

        {/* Week 2 */}
        <div className="bg-dark-elevated rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-sm font-medium">Week 2</span>
            <span className="text-white font-semibold">
              ${week2Subtotal.toFixed(2)}
            </span>
          </div>
          <div className="text-text-muted text-sm">
            <span>{invoice.week_2_hours || 0} hours × ${invoice.week_2_rate || 0}/hr</span>
          </div>
          {invoice.week_2_notes && (
            <p className="mt-2 text-text-secondary text-sm italic">
              "{invoice.week_2_notes}"
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-dark-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax_rate && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                Tax ({(invoice.tax_rate * 100).toFixed(3)}%)
              </span>
              <span className="text-white font-medium">${(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <span className="text-white font-semibold">Total</span>
            <span className="text-status-success-text text-lg font-bold">${(invoice.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* First Approval Info (for Level 2 approvers) */}
        {approver.approval_level === 2 && invoice.approval_1_by && (
          <div className="bg-status-info/20 rounded-lg p-4 text-sm">
            <p className="text-status-info-text">
              <span className="font-medium">First Approval:</span> {invoice.approval_1_by}
            </p>
            <p className="text-status-info-text/70 text-xs">
              {new Date(invoice.approval_1_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-dark-border">
        {!showRejectForm ? (
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(invoice.id)}
              disabled={isProcessing}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? 'bg-accent/50 text-text-muted cursor-not-allowed'
                  : 'bg-status-success text-status-success-text hover:bg-status-success/80'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? 'bg-dark-elevated text-text-muted cursor-not-allowed'
                  : 'bg-dark-elevated text-status-error-text hover:bg-status-error/20 border border-status-error/50'
              }`}
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label-dark">Rejection Reason (required)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full bg-dark-elevated border border-dark-border rounded-lg px-4 py-3 text-white text-sm placeholder-text-muted focus:outline-none focus:border-status-error-text/50"
                placeholder="Please explain why this timecard is being rejected..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || isProcessing}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  !rejectionReason.trim() || isProcessing
                    ? 'bg-accent/50 text-text-muted cursor-not-allowed'
                    : 'bg-status-error text-status-error-text hover:bg-status-error/80'
                }`}
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                className="px-4 py-3 text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApproverDashboard() {
  const { token } = useParams();
  const [approver, setApprover] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!approver) return;

    try {
      const pendingInvoices = await getInvoicesPendingApproval(approver.approval_level);
      setInvoices(pendingInvoices);
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  }, [approver]);

  useEffect(() => {
    async function loadApprover() {
      try {
        setLoading(true);
        setError(null);

        const approverData = await getApproverByToken(token);
        if (!approverData) {
          setError('Invalid or inactive approver link');
          return;
        }

        setApprover(approverData);
      } catch (err) {
        console.error('Error loading approver:', err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadApprover();
    }
  }, [token]);

  useEffect(() => {
    if (approver) {
      loadData();
    }
  }, [approver, loadData]);

  const handleApprove = async (invoiceId) => {
    try {
      setProcessingId(invoiceId);
      setError(null);

      await approveInvoice(invoiceId, approver.name, approver.approval_level);

      setSuccessMessage('Invoice approved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      await loadData();
    } catch (err) {
      console.error('Error approving invoice:', err);
      setError(err.message || 'Failed to approve invoice');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invoiceId, reason) => {
    try {
      setProcessingId(invoiceId);
      setError(null);

      await rejectInvoice(invoiceId, approver.name, reason);

      setSuccessMessage('Invoice rejected and contractor notified');
      setTimeout(() => setSuccessMessage(''), 3000);

      await loadData();
    } catch (err) {
      console.error('Error rejecting invoice:', err);
      setError(err.message || 'Failed to reject invoice');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-text-secondary border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !approver) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col">
        {/* Header with logo */}
        <div className="p-6">
          <img src={LOGO_URL} alt="InvizArts" className="h-12 w-auto" />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card-dark p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-status-error rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-status-error-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-3">Access Denied</h1>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const levelLabel = approver?.approval_level === 1 ? 'First' : 'Final';

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header with logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src={LOGO_URL} alt="InvizArts" className="h-10 w-auto" />
          <div className="text-right">
            <p className="text-white font-medium">{approver?.name}</p>
            <p className="text-text-secondary text-sm">{levelLabel} Approver</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-white tracking-wide">
            Approver Dashboard
          </h1>
          <p className="text-text-secondary mt-2">
            Review and approve contractor timecards
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-status-success/20 border border-status-success rounded-lg p-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-status-success-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-status-success-text font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && approver && (
          <div className="bg-status-error/20 border border-status-error rounded-lg p-4 mb-6">
            <p className="text-status-error-text text-sm">{error}</p>
          </div>
        )}

        {/* Pending Count */}
        <div className="card-dark p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm uppercase tracking-wider">Pending Your Approval</p>
              <p className="text-4xl font-light text-white mt-2">{invoices.length}</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 text-text-secondary hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <div className="w-20 h-20 bg-dark-elevated rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-status-success-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">All caught up!</h3>
            <p className="text-text-secondary">No timecards pending your approval.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                approver={approver}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={processingId === invoice.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
