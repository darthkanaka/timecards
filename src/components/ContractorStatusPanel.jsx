import { useState, useEffect, useCallback } from 'react';
import { getContractorsWithStatus } from '../lib/api';
import {
  getCurrentPayPeriod,
  getPreviousPayPeriod,
  getNextPayPeriod,
  toISODateString,
  formatDateRange,
  isCurrentPeriod,
  isFuturePeriod,
} from '../lib/payPeriod';

const STATUS_CONFIG = {
  not_submitted: { label: 'Not Submitted', bgColor: 'rgba(239, 68, 68, 0.2)', textColor: '#f87171' },
  submitted: { label: 'Submitted', bgColor: 'rgba(96, 165, 250, 0.2)', textColor: '#60a5fa' },
  approval_1: { label: 'Nick (1/2)', bgColor: 'rgba(168, 85, 247, 0.2)', textColor: '#a855f7' },
  approval_2: { label: 'Chris (2/2)', bgColor: 'rgba(99, 102, 241, 0.2)', textColor: '#818cf8' },
  pending_payment: { label: 'Processing', bgColor: 'rgba(251, 191, 36, 0.2)', textColor: '#fbbf24' },
  paid: { label: 'Paid', bgColor: 'rgba(52, 211, 153, 0.2)', textColor: '#34d399' },
  rejected: { label: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.2)', textColor: '#f87171' },
};

export default function ContractorStatusPanel({ onSendReminder }) {
  const [payPeriod, setPayPeriod] = useState(getCurrentPayPeriod());
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContractors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const periodStart = toISODateString(payPeriod.periodStart);
      const data = await getContractorsWithStatus(periodStart);
      setContractors(data);
    } catch (err) {
      console.error('Error loading contractors:', err);
      setError(err.message || 'Failed to load contractors');
    } finally {
      setLoading(false);
    }
  }, [payPeriod]);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  const handlePreviousPeriod = () => {
    setPayPeriod(getPreviousPayPeriod(payPeriod.periodStart));
  };

  const handleNextPeriod = () => {
    if (!isCurrentPeriod(payPeriod)) {
      setPayPeriod(getNextPayPeriod(payPeriod.periodStart));
    }
  };

  const periodStart = payPeriod.periodStart;
  const periodEnd = payPeriod.periodEnd;
  const isCurrentPayPeriod = isCurrentPeriod(payPeriod);

  const submittedCount = contractors.filter(c => c.status !== 'not_submitted').length;
  const notSubmittedCount = contractors.filter(c => c.status === 'not_submitted').length;

  return (
    <div style={{
      backgroundColor: '#0d1b2a',
      border: '1px solid #2d3f50',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header with Pay Period Navigation */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #2d3f50' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
            Contractor Status
          </h3>
          <button
            onClick={loadContractors}
            disabled={loading}
            style={{
              padding: '6px',
              color: '#8a94a6',
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Pay Period Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousPeriod}
            style={{
              padding: '8px',
              color: '#8a94a6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8a94a6'}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
              {formatDateRange(periodStart, periodEnd)}
            </p>
            {isCurrentPayPeriod && (
              <span style={{
                fontSize: '10px',
                color: '#4ade80',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Current Period
              </span>
            )}
          </div>
          <button
            onClick={handleNextPeriod}
            disabled={isCurrentPayPeriod}
            style={{
              padding: '8px',
              color: isCurrentPayPeriod ? '#3d4f5f' : '#8a94a6',
              background: 'none',
              border: 'none',
              cursor: isCurrentPayPeriod ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isCurrentPayPeriod) e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              if (!isCurrentPayPeriod) e.currentTarget.style.color = '#8a94a6';
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-4 justify-center" style={{ marginTop: '16px' }}>
          <div className="text-center">
            <p style={{ fontSize: '24px', fontWeight: '300', color: '#4ade80' }}>{submittedCount}</p>
            <p style={{ fontSize: '11px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</p>
          </div>
          <div style={{ width: '1px', backgroundColor: '#2d3f50' }}></div>
          <div className="text-center">
            <p style={{ fontSize: '24px', fontWeight: '300', color: notSubmittedCount > 0 ? '#f87171' : '#8a94a6' }}>{notSubmittedCount}</p>
            <p style={{ fontSize: '11px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</p>
          </div>
        </div>
      </div>

      {/* Contractor List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #3d4f5f',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#8a94a6', fontSize: '13px' }}>Loading...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>
          </div>
        ) : contractors.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#8a94a6', fontSize: '13px' }}>No contractors found</p>
          </div>
        ) : (
          contractors.map((contractor, idx) => {
            const status = STATUS_CONFIG[contractor.status] || STATUS_CONFIG.not_submitted;
            const canSendReminder = contractor.status === 'not_submitted';
            return (
              <div
                key={contractor.id}
                onClick={() => canSendReminder && onSendReminder && onSendReminder(contractor, payPeriod)}
                style={{
                  padding: '16px 24px',
                  borderBottom: idx < contractors.length - 1 ? '1px solid #2d3f50' : 'none',
                  cursor: canSendReminder ? 'pointer' : 'default',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (canSendReminder) e.currentTarget.style.backgroundColor = '#1b2838';
                }}
                onMouseLeave={(e) => {
                  if (canSendReminder) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '4px' }}>
                      {contractor.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#5a6478' }}>
                      {contractor.email}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '500',
                    borderRadius: '9999px',
                    backgroundColor: status.bgColor,
                    color: status.textColor
                  }}>
                    {status.label}
                  </span>
                </div>
                {contractor.invoice && contractor.invoice.total_amount && (
                  <p style={{ fontSize: '12px', color: '#8a94a6', marginTop: '8px' }}>
                    ${contractor.invoice.total_amount.toFixed(2)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
