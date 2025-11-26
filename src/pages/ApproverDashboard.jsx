import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getApproverByToken,
  getInvoicesPendingApproval,
  approveInvoice,
  rejectInvoice,
} from '../lib/api';
import { formatDateRange } from '../lib/payPeriod';

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {invoice.contractors?.name}
            </h3>
            {invoice.contractors?.company && (
              <p className="text-sm text-gray-500">{invoice.contractors.company}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatDateRange(periodStart, periodEnd)}
            </p>
            <p className="text-xs text-gray-500">
              Submitted {new Date(invoice.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="p-4 space-y-4">
        {/* Week 1 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-700">Week 1</span>
            <span className="text-sm font-semibold text-gray-900">
              ${week1Subtotal.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span>{invoice.week_1_hours || 0} hours × ${invoice.week_1_rate || 0}/hr</span>
          </div>
          {invoice.week_1_notes && (
            <p className="mt-2 text-sm text-gray-500 italic">
              "{invoice.week_1_notes}"
            </p>
          )}
        </div>

        {/* Week 2 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-700">Week 2</span>
            <span className="text-sm font-semibold text-gray-900">
              ${week2Subtotal.toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span>{invoice.week_2_hours || 0} hours × ${invoice.week_2_rate || 0}/hr</span>
          </div>
          {invoice.week_2_notes && (
            <p className="mt-2 text-sm text-gray-500 italic">
              "{invoice.week_2_notes}"
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax_rate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Tax ({(invoice.tax_rate * 100).toFixed(3)}%)
              </span>
              <span className="font-medium">${(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-1">
            <span className="text-gray-900">Total</span>
            <span className="text-green-600">${(invoice.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* First Approval Info (for Level 2 approvers) */}
        {approver.approval_level === 2 && invoice.approval_1_by && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="text-blue-800">
              <span className="font-medium">First Approval:</span> {invoice.approval_1_by}
            </p>
            <p className="text-blue-600 text-xs">
              {new Date(invoice.approval_1_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        {!showRejectForm ? (
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(invoice.id)}
              disabled={isProcessing}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              Reject
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason (required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please explain why this timecard is being rejected..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || isProcessing}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                  !rejectionReason.trim() || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !approver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const levelLabel = approver?.approval_level === 1 ? 'First' : 'Second';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Approver Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {approver?.name} ({levelLabel} Approver)
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && approver && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Pending Count */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Your Approval</p>
              <p className="text-3xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Invoice List */}
        {invoices.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No timecards pending your approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
