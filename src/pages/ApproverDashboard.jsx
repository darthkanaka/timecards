import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getApproverByToken,
  getInvoicesPendingApproval,
  approveInvoice,
  rejectInvoice,
} from '../lib/api';
import { formatDateRange } from '../lib/payPeriod';
import ContractorStatusPanel from '../components/ContractorStatusPanel';
import SendReminderModal from '../components/SendReminderModal';

const LOGO_URL = "https://static.wixstatic.com/media/edda46_11cebb29dd364966929fec216683b3f3~mv2.png/v1/fill/w_486,h_344,al_c,lg_1,q_85,enc_avif,quality_auto/IA%20LOGO.png";
const BG_IMAGE_URL = "https://images.squarespace-cdn.com/content/57e6cc979de4bbd5509a028e/175a8bbd-61af-4377-8b41-d082d2321fb5/TimecardBH2.jpg?content-type=image%2Fjpeg";

function InvoiceCard({ invoice, approver, onApprove, onReject, isProcessing }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);

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

  const handleApproveClick = () => {
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    setShowApproveModal(false);
    onApprove(invoice.id);
  };

  return (
    <div style={{
      backgroundColor: '#0d1b2a',
      border: '1px solid #2d3f50',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #2d3f50' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ fontSize: '18px', color: '#ffffff', fontWeight: '600' }}>
              {invoice.contractors?.name}
            </h3>
            {invoice.contractors?.company && (
              <p style={{ fontSize: '14px', color: '#8a94a6', marginTop: '4px' }}>{invoice.contractors.company}</p>
            )}
          </div>
          <div className="text-right">
            <p style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>
              {formatDateRange(periodStart, periodEnd)}
            </p>
            <p style={{ fontSize: '12px', color: '#5a6478', marginTop: '4px' }}>
              Submitted {new Date(invoice.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ padding: '24px' }}>
        {/* Week 1 */}
        <div style={{ backgroundColor: '#1b2838', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#8a94a6', fontWeight: '500' }}>Week 1</span>
            <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>
              ${week1Subtotal.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#5a6478' }}>
            <span>{invoice.week_1_hours || 0} hours × ${invoice.week_1_rate || 0}/hr</span>
          </div>
          {invoice.week_1_notes && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#8a94a6', fontStyle: 'italic' }}>
              "{invoice.week_1_notes}"
            </p>
          )}
        </div>

        {/* Week 2 */}
        <div style={{ backgroundColor: '#1b2838', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#8a94a6', fontWeight: '500' }}>Week 2</span>
            <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>
              ${week2Subtotal.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#5a6478' }}>
            <span>{invoice.week_2_hours || 0} hours × ${invoice.week_2_rate || 0}/hr</span>
          </div>
          {invoice.week_2_notes && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#8a94a6', fontStyle: 'italic' }}>
              "{invoice.week_2_notes}"
            </p>
          )}
        </div>

        {/* Expenses */}
        {(() => {
          const expenses = invoice.expenses ? (typeof invoice.expenses === 'string' ? JSON.parse(invoice.expenses) : invoice.expenses) : [];
          const expensesTotal = invoice.expenses_total || 0;

          if (expenses.length === 0) return null;

          return (
            <div style={{ backgroundColor: '#1b2838', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#8a94a6', fontWeight: '500' }}>Expenses</span>
                <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>
                  ${expensesTotal.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expenses.map((expense, index) => (
                  <div key={index} style={{ paddingTop: index > 0 ? '12px' : '0', borderTop: index > 0 ? '1px solid #2d3f50' : 'none' }}>
                    <div className="flex justify-between items-start">
                      <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>
                        {expense.merchant || 'Unknown merchant'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#ffffff' }}>
                        ${(parseFloat(expense.amount) || 0).toFixed(2)}
                      </span>
                    </div>
                    {expense.description && (
                      <p style={{ marginTop: '6px', fontSize: '12px', color: '#8a94a6', fontStyle: 'italic' }}>
                        "{expense.description}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '12px', fontSize: '11px', color: '#5a6478', fontStyle: 'italic' }}>
                * Expenses are not subject to tax
              </p>
            </div>
          );
        })()}

        {/* Totals */}
        <div style={{ borderTop: '1px solid #2d3f50', paddingTop: '16px' }}>
          <div className="flex justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', color: '#8a94a6' }}>Subtotal</span>
            <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>${subtotal.toFixed(2)}</span>
          </div>
          {invoice.tax_rate && (
            <div className="flex justify-between" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: '#8a94a6' }}>
                Tax ({(invoice.tax_rate * 100).toFixed(3)}%)
              </span>
              <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>${(invoice.tax_amount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center" style={{ paddingTop: '12px' }}>
            <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Total</span>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#4ade80' }}>${(invoice.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* First Approval Info (for Level 2 approvers) */}
        {approver.approval_level === 2 && invoice.approval_1_by && (
          <div style={{ backgroundColor: 'rgba(45, 74, 90, 0.3)', borderRadius: '8px', padding: '16px', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#60a5fa' }}>
              <span style={{ fontWeight: '500' }}>Nick (1/2):</span> {invoice.approval_1_by}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(96, 165, 250, 0.7)', marginTop: '4px' }}>
              {new Date(invoice.approval_1_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid #2d3f50' }}>
        {!showRejectForm ? (
          <div className="flex gap-3">
            <button
              onClick={handleApproveClick}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '15px',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                backgroundColor: isProcessing ? 'rgba(61, 79, 95, 0.5)' : '#2d5a3d',
                color: isProcessing ? '#5a6478' : '#4ade80',
                transition: 'background-color 0.2s'
              }}
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '15px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                backgroundColor: '#1b2838',
                color: isProcessing ? '#5a6478' : '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.5)',
                transition: 'background-color 0.2s'
              }}
            >
              Reject
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '500',
                color: '#8a94a6',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px'
              }}>
                Rejection Reason (required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#1b2838',
                  border: '1px solid #2d3f50',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
                placeholder="Please explain why this timecard is being rejected..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || isProcessing}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '15px',
                  border: 'none',
                  cursor: (!rejectionReason.trim() || isProcessing) ? 'not-allowed' : 'pointer',
                  backgroundColor: (!rejectionReason.trim() || isProcessing) ? 'rgba(61, 79, 95, 0.5)' : '#5a2d2d',
                  color: (!rejectionReason.trim() || isProcessing) ? '#5a6478' : '#f87171',
                  transition: 'background-color 0.2s'
                }}
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                style={{
                  padding: '14px 20px',
                  color: '#8a94a6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approval Confirmation Modal */}
      {showApproveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowApproveModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0d1b2a',
              border: '1px solid #2d3f50',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(45, 90, 61, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg style={{ width: '28px', height: '28px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Approve Timecard?
            </h3>

            <p style={{
              fontSize: '14px',
              color: '#8a94a6',
              marginBottom: '8px'
            }}>
              {invoice.contractors?.name}
            </p>
            <p style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#4ade80',
              marginBottom: '24px'
            }}>
              ${(invoice.total_amount || 0).toFixed(2)}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '15px',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  border: '1px solid #2d3f50',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '15px',
                  color: '#ffffff',
                  backgroundColor: '#2d5a3d',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isProcessing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [reminderContractor, setReminderContractor] = useState(null);
  const [reminderPayPeriod, setReminderPayPeriod] = useState(null);

  const handleSendReminder = (contractor, payPeriod) => {
    setReminderContractor(contractor);
    setReminderPayPeriod(payPeriod);
  };

  const handleReminderClose = () => {
    setReminderContractor(null);
    setReminderPayPeriod(null);
  };

  const handleReminderSuccess = () => {
    setSuccessMessage('Reminder email sent successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const loadData = useCallback(async () => {
    if (!approver) return;

    try {
      const pendingInvoices = await getInvoicesPendingApproval(approver.approval_level);
      setInvoices(pendingInvoices);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError(err.message || 'Failed to load pending invoices');
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
        setError(err.message || 'Failed to load dashboard');
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a1628' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-500 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#8a94a6' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !approver) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
        {/* Fixed Background Image - full viewport */}
        <div
          className="hidden lg:block"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <img
            src={BG_IMAGE_URL}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top'
            }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
        </div>

        {/* Fixed Logo */}
        <img
          src={LOGO_URL}
          alt="InvizArts"
          className="hidden lg:block"
          style={{
            position: 'fixed',
            top: '24px',
            left: '24px',
            width: '90px',
            height: 'auto',
            zIndex: 50
          }}
        />

        {/* Centered Content Panel */}
        <div className="min-h-screen flex items-center justify-center p-6" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            backgroundColor: '#0d1b2a',
            border: '1px solid #2d3f50',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#5a2d2d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>Access Denied</h1>
            <p style={{ color: '#8a94a6', fontSize: '15px' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const levelLabel = approver?.approval_level === 1 ? 'Nick (1/2)' : 'Chris (2/2)';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      {/* Fixed Background Image - full viewport */}
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        <img
          src={BG_IMAGE_URL}
          alt=""
          style={{
            width: '2560px',
            height: '3200px',
            objectFit: 'cover',
            objectPosition: 'center top',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
      </div>

      {/* Fixed Logo */}
      <img
        src={LOGO_URL}
        alt="InvizArts"
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          width: '90px',
          height: 'auto',
          zIndex: 50
        }}
      />

      {/* Mobile background fallback */}
      <div className="lg:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: '#0a1628', zIndex: 0 }}></div>

      {/* Centered Content Panel */}
      <div className="min-h-screen flex flex-col" style={{ position: 'relative', zIndex: 10 }}>
        {/* Mobile logo */}
        <div className="lg:hidden pt-6 pl-6">
          <img src={LOGO_URL} alt="InvizArts" style={{ width: '80px', height: 'auto' }} />
        </div>

        <div className="flex-1 flex justify-center">
          <div style={{
            backgroundColor: '#0a1628',
            width: '100%',
            maxWidth: '900px',
            minHeight: '100vh',
            padding: '40px 32px'
          }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '30px', fontWeight: '400', color: '#ffffff', letterSpacing: '0.02em' }}>
                  Approver Dashboard
                </h1>
                <p style={{ fontSize: '16px', color: '#8a94a6', marginTop: '8px' }}>
                  Review and approve contractor timecards
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <p style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>{approver?.name}</p>
                <p style={{ fontSize: '13px', color: '#8a94a6' }}>{levelLabel}</p>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center gap-4" style={{
                backgroundColor: 'rgba(45, 90, 61, 0.2)',
                border: '1px solid #2d5a3d',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p style={{ fontSize: '15px', color: '#4ade80', fontWeight: '500' }}>{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && approver && (
              <div style={{
                backgroundColor: 'rgba(90, 45, 45, 0.2)',
                border: '1px solid #5a2d2d',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <p style={{ fontSize: '14px', color: '#f87171' }}>{error}</p>
              </div>
            )}

            {/* Pending Count */}
            <div style={{
              backgroundColor: '#0d1b2a',
              border: '1px solid #2d3f50',
              borderRadius: '12px',
              padding: '28px',
              marginBottom: '32px'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: '12px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Pending Your Approval
                  </p>
                  <p style={{ fontSize: '42px', fontWeight: '300', color: '#ffffff', marginTop: '8px' }}>{invoices.length}</p>
                </div>
                <button
                  onClick={loadData}
                  style={{
                    padding: '10px',
                    color: '#8a94a6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#8a94a6'}
                >
                  <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contractor Status Panel - Only for Level 1 approvers (Nick) */}
            {approver?.approval_level === 1 && (
              <div style={{ marginBottom: '32px' }}>
                <ContractorStatusPanel onSendReminder={handleSendReminder} />
              </div>
            )}

            {/* Invoice List */}
            {invoices.length === 0 ? (
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px solid #2d3f50',
                borderRadius: '12px',
                padding: '60px 40px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#1b2838',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <svg style={{ width: '40px', height: '40px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>All caught up!</h3>
                <p style={{ fontSize: '15px', color: '#8a94a6' }}>No timecards pending your approval.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
      </div>

      {/* Send Reminder Modal */}
      {reminderContractor && reminderPayPeriod && (
        <SendReminderModal
          contractor={reminderContractor}
          payPeriod={reminderPayPeriod}
          onClose={handleReminderClose}
          onSuccess={handleReminderSuccess}
        />
      )}
    </div>
  );
}
