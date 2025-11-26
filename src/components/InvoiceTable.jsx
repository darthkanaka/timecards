import { formatDateRange } from '../lib/payPeriod';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bgColor: 'rgba(251, 191, 36, 0.2)', textColor: '#fbbf24', nextAction: null },
  submitted: { label: 'Submitted', bgColor: 'rgba(96, 165, 250, 0.2)', textColor: '#60a5fa', nextAction: 'Approve (1st)' },
  approval_1: { label: '1st Approved', bgColor: 'rgba(168, 85, 247, 0.2)', textColor: '#a855f7', nextAction: 'Approve (2nd)' },
  approval_2: { label: '2nd Approved', bgColor: 'rgba(99, 102, 241, 0.2)', textColor: '#818cf8', nextAction: 'Mark Processing' },
  pending_payment: { label: 'Processing', bgColor: 'rgba(251, 191, 36, 0.2)', textColor: '#fbbf24', nextAction: 'Mark Paid' },
  paid: { label: 'Paid', bgColor: 'rgba(52, 211, 153, 0.2)', textColor: '#34d399', nextAction: null },
  rejected: { label: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.2)', textColor: '#f87171', nextAction: null },
};

export default function InvoiceTable({
  invoices,
  onAdvanceStatus,
  onViewDetails,
  isLoading = false,
}) {
  const headerStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '500',
    color: '#8a94a6',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  };

  const cellStyle = {
    padding: '14px 16px'
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#0d1b2a',
        border: '1px solid #2d3f50',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #3d4f5f',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#8a94a6', fontSize: '14px' }}>Loading invoices...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div style={{
        backgroundColor: '#0d1b2a',
        border: '1px solid #2d3f50',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#8a94a6', fontSize: '14px' }}>No invoices found.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#0d1b2a',
      border: '1px solid #2d3f50',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ borderBottom: '1px solid #2d3f50' }}>
            <tr>
              <th style={headerStyle}>Contractor</th>
              <th style={headerStyle}>Pay Period</th>
              <th style={headerStyle}>Hours</th>
              <th style={headerStyle}>Amount</th>
              <th style={headerStyle}>Status</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, idx) => {
              const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
              const periodStart = new Date(invoice.pay_period_start);
              const periodEnd = new Date(invoice.pay_period_end);
              const totalHours = (invoice.week_1_hours || 0) + (invoice.week_2_hours || 0);

              return (
                <tr
                  key={invoice.id}
                  style={{
                    borderBottom: idx < invoices.length - 1 ? '1px solid #2d3f50' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1b2838'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={cellStyle}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '2px' }}>
                        {invoice.contractors?.name || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#5a6478' }}>
                        {invoice.contractors?.email || ''}
                      </p>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ fontSize: '14px', color: '#8a94a6' }}>
                      {formatDateRange(periodStart, periodEnd)}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ fontSize: '14px', color: '#8a94a6' }}>{totalHours}h</span>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
                      ${(invoice.total_amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '9999px',
                      backgroundColor: status.bgColor,
                      color: status.textColor
                    }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => onViewDetails && onViewDetails(invoice)}
                        style={{
                          fontSize: '13px',
                          color: '#60a5fa',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                      >
                        View
                      </button>
                      {status.nextAction && (
                        <button
                          onClick={() => onAdvanceStatus && onAdvanceStatus(invoice.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          {status.nextAction}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
