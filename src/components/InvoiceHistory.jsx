import { formatDateRange } from '../lib/payPeriod';

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-status-warning text-status-warning-text' },
  submitted: { label: 'Submitted', color: 'bg-status-info text-status-info-text' },
  approval_1: { label: 'Initial (1/2)', color: 'bg-purple-900/50 text-purple-400' },
  approval_2: { label: 'Final (2/2)', color: 'bg-indigo-900/50 text-indigo-400' },
  pending_payment: { label: 'Payment Processing', color: 'bg-status-warning text-status-warning-text' },
  paid: { label: 'Paid', color: 'bg-status-success text-status-success-text' },
  rejected: { label: 'Rejected', color: 'bg-status-error text-status-error-text' },
};

export default function InvoiceHistory({ invoices, onSelect }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="card-dark p-6 text-center">
        <p className="text-text-secondary text-sm">No previous invoices found.</p>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-border">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Invoice History</h3>
      </div>

      <div className="divide-y divide-dark-border">
        {invoices.map((invoice) => {
          const status = STATUS_LABELS[invoice.status] || STATUS_LABELS.pending;
          const periodStart = new Date(invoice.pay_period_start);
          const periodEnd = new Date(invoice.pay_period_end);

          return (
            <div
              key={invoice.id}
              className="p-4 hover:bg-dark-elevated cursor-pointer transition-colors"
              onClick={() => onSelect && onSelect(invoice)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  {formatDateRange(periodStart, periodEnd)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>
                  {(invoice.week_1_hours || 0) + (invoice.week_2_hours || 0)} hours
                </span>
                <span className="font-medium text-white">
                  ${(invoice.total_amount || 0).toFixed(2)}
                </span>
              </div>

              {invoice.submitted_at && (
                <p className="text-xs text-text-muted mt-1">
                  Submitted{' '}
                  {new Date(invoice.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
