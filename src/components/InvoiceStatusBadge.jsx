const STATUS_CONFIG = {
  not_submitted: {
    label: 'Not Submitted',
    description: 'Timecard not yet submitted for this period',
    bgColor: '#1b2838',
    textColor: '#8a94a6',
    borderColor: '#2d3f50',
    badgeBg: '#2d3f50',
  },
  pending: {
    label: 'Not Submitted',
    description: 'Timecard not yet submitted for this period',
    bgColor: '#1b2838',
    textColor: '#8a94a6',
    borderColor: '#2d3f50',
    badgeBg: '#2d3f50',
  },
  submitted: {
    label: 'Submitted',
    description: 'Awaiting initial approval',
    bgColor: 'rgba(96, 165, 250, 0.15)',
    textColor: '#60a5fa',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    badgeBg: 'rgba(96, 165, 250, 0.25)',
  },
  approval_1: {
    label: 'Initial (1/2)',
    description: 'Awaiting final approval',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    textColor: '#a855f7',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    badgeBg: 'rgba(168, 85, 247, 0.25)',
  },
  approval_2: {
    label: 'Final (2/2)',
    description: 'Awaiting payment processing',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    textColor: '#818cf8',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    badgeBg: 'rgba(99, 102, 241, 0.25)',
  },
  pending_payment: {
    label: 'Payment Processing',
    description: 'Payment is being processed',
    bgColor: 'rgba(251, 191, 36, 0.15)',
    textColor: '#fbbf24',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    badgeBg: 'rgba(251, 191, 36, 0.25)',
  },
  paid: {
    label: 'Paid',
    description: 'Payment complete',
    bgColor: 'rgba(52, 211, 153, 0.15)',
    textColor: '#34d399',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    badgeBg: 'rgba(52, 211, 153, 0.25)',
  },
  rejected: {
    label: 'Rejected',
    description: 'Timecard was rejected - please review and resubmit',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    textColor: '#f87171',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
  },
};

export default function InvoiceStatusBadge({ status, showDescription = true, rejectionInfo = null }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;

  // Rejected state with cleaner styling
  if (status === 'rejected') {
    return (
      <div style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '8px',
        padding: '20px'
      }}>
        {/* Status badge with small inline icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg style={{ width: '18px', height: '18px', color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span style={{
              display: 'inline-flex',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '9999px',
              backgroundColor: config.badgeBg,
              color: config.textColor
            }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Rejection details */}
        {rejectionInfo && (
          <div style={{
            marginTop: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            {rejectionInfo.reason && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '6px'
                }}>
                  Reason
                </p>
                <p style={{ fontSize: '14px', color: '#ffffff' }}>
                  {rejectionInfo.reason}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {rejectionInfo.rejectedBy && (
                <div>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#8a94a6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px'
                  }}>
                    Rejected by
                  </p>
                  <p style={{ fontSize: '13px', color: '#f87171' }}>
                    {rejectionInfo.rejectedBy}
                  </p>
                </div>
              )}
              {rejectionInfo.rejectedAt && (
                <div>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#8a94a6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px'
                  }}>
                    Date
                  </p>
                  <p style={{ fontSize: '13px', color: '#f87171' }}>
                    {new Date(rejectionInfo.rejectedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showDescription && !rejectionInfo && (
          <p style={{ fontSize: '14px', color: config.textColor, opacity: 0.8, marginTop: '12px' }}>
            {config.description}
          </p>
        )}

        {/* Call to action */}
        <p style={{
          fontSize: '13px',
          color: '#8a94a6',
          marginTop: '16px'
        }}>
          Please make corrections and resubmit your timecard below.
        </p>
      </div>
    );
  }

  // Regular status badge
  return (
    <div style={{
      backgroundColor: config.bgColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: '8px',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-flex',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: '500',
          borderRadius: '9999px',
          backgroundColor: config.badgeBg,
          color: config.textColor
        }}>
          {config.label}
        </span>
      </div>
      {showDescription && (
        <p style={{ fontSize: '14px', color: config.textColor, opacity: 0.8, marginTop: '12px' }}>
          {config.description}
        </p>
      )}
    </div>
  );
}
