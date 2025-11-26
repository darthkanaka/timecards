import { useState } from 'react';
import { sendTimecardReminder } from '../lib/api';
import { formatDateRange, toISODateString } from '../lib/payPeriod';

const STATUS_CONFIG = {
  not_submitted: { label: 'Not Submitted', bgColor: 'rgba(239, 68, 68, 0.2)', textColor: '#f87171' },
  submitted: { label: 'Submitted', bgColor: 'rgba(96, 165, 250, 0.2)', textColor: '#60a5fa' },
  approval_1: { label: 'Nick (1/2)', bgColor: 'rgba(168, 85, 247, 0.2)', textColor: '#a855f7' },
  approval_2: { label: 'Chris (2/2)', bgColor: 'rgba(99, 102, 241, 0.2)', textColor: '#818cf8' },
  pending_payment: { label: 'Processing', bgColor: 'rgba(251, 191, 36, 0.2)', textColor: '#fbbf24' },
  paid: { label: 'Paid', bgColor: 'rgba(52, 211, 153, 0.2)', textColor: '#34d399' },
  rejected: { label: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.2)', textColor: '#f87171' },
};

export default function SendReminderModal({ contractor, payPeriod, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  if (!contractor || !payPeriod) return null;

  const invoice = contractor.invoice;
  const status = STATUS_CONFIG[contractor.status] || STATUS_CONFIG.not_submitted;
  const periodStart = payPeriod.periodStart;
  const periodEnd = payPeriod.periodEnd;

  const handleSend = async () => {
    try {
      setSending(true);
      setError(null);

      await sendTimecardReminder(
        contractor,
        toISODateString(periodStart),
        toISODateString(periodEnd),
        invoice,
        notes
      );

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError(err.message || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0d1b2a',
          border: '1px solid #2d3f50',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2d3f50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
            Send Timecard Reminder
          </h2>
          <button
            onClick={onClose}
            style={{
              color: '#8a94a6',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '4px'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Contractor Info */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px'
            }}>
              Contractor
            </p>
            <p style={{ color: '#ffffff', fontWeight: '500', fontSize: '16px' }}>
              {contractor.name}
            </p>
            <p style={{ color: '#8a94a6', fontSize: '14px', marginTop: '4px' }}>
              {contractor.email}
            </p>
            {contractor.company && (
              <p style={{ color: '#5a6478', fontSize: '13px', marginTop: '2px' }}>
                {contractor.company}
              </p>
            )}
          </div>

          {/* Pay Period */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px'
            }}>
              Pay Period
            </p>
            <p style={{ color: '#ffffff', fontSize: '15px' }}>
              {formatDateRange(periodStart, periodEnd)}
            </p>
          </div>

          {/* Current Status */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px'
            }}>
              Current Status
            </p>
            <span style={{
              display: 'inline-flex',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '9999px',
              backgroundColor: status.bgColor,
              color: status.textColor
            }}>
              {status.label}
            </span>
          </div>

          {/* Invoice Details (if submitted) */}
          {invoice && (
            <div style={{
              backgroundColor: '#1b2838',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '500',
                color: '#8a94a6',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '12px'
              }}>
                Timecard Details
              </p>
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#5a6478' }}>Week 1</p>
                  <p style={{ fontSize: '14px', color: '#ffffff' }}>
                    {invoice.week_1_hours || 0}h @ ${invoice.week_1_rate || 0}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#5a6478' }}>Week 2</p>
                  <p style={{ fontSize: '14px', color: '#ffffff' }}>
                    {invoice.week_2_hours || 0}h @ ${invoice.week_2_rate || 0}
                  </p>
                </div>
              </div>
              {invoice.total_amount && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2d3f50' }}>
                  <div className="flex justify-between">
                    <span style={{ fontSize: '14px', color: '#8a94a6' }}>Total</span>
                    <span style={{ fontSize: '16px', color: '#4ade80', fontWeight: '600' }}>
                      ${invoice.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              {invoice.rejection_reason && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2d3f50' }}>
                  <p style={{ fontSize: '12px', color: '#f87171', fontWeight: '500' }}>Rejection Reason:</p>
                  <p style={{ fontSize: '13px', color: '#fca5a5', marginTop: '4px', fontStyle: 'italic' }}>
                    "{invoice.rejection_reason}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px'
            }}>
              Add Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a personalized message to include in the reminder email..."
              rows={4}
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
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#fca5a5', fontSize: '13px' }}>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
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
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '15px',
                color: '#ffffff',
                backgroundColor: sending ? '#3d4f5f' : '#3b82f6',
                border: 'none',
                cursor: sending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {sending ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Reminder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
