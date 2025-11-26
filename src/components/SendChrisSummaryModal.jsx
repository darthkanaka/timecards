import { useState } from 'react';
import { sendChrisSummary } from '../lib/api';
import { toISODateString } from '../lib/payPeriod';

export default function SendChrisSummaryModal({ approverName, payPeriod, onClose, onSuccess }) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    try {
      setIsSending(true);
      setError(null);

      await sendChrisSummary(
        approverName,
        toISODateString(payPeriod.periodStart),
        toISODateString(payPeriod.periodEnd)
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error sending summary:', err);
      setError(err.message || 'Failed to send summary');
    } finally {
      setIsSending(false);
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
          padding: '32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <svg style={{ width: '28px', height: '28px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '12px'
        }}>
          Send Summary to Chris?
        </h3>

        <p style={{
          fontSize: '14px',
          color: '#8a94a6',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          This will email Chris a summary of all approved timecards for the current pay period. Continue?
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#f87171', fontSize: '13px' }}>{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '15px',
              color: '#ffffff',
              backgroundColor: 'transparent',
              border: '1px solid #2d3f50',
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '15px',
              color: '#ffffff',
              backgroundColor: '#2d4a6a',
              border: 'none',
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSending ? 'Sending...' : 'Send Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
