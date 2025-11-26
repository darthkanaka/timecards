import { formatDateRange } from '../lib/payPeriod';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-status-warning text-status-warning-text', nextAction: null },
  submitted: { label: 'Submitted', color: 'bg-status-info text-status-info-text', nextAction: 'Approve (1st)' },
  approval_1: { label: '1st Approved', color: 'bg-purple-900/50 text-purple-400', nextAction: 'Approve (2nd)' },
  approval_2: { label: '2nd Approved', color: 'bg-indigo-900/50 text-indigo-400', nextAction: 'Mark Processing' },
  pending_payment: { label: 'Processing', color: 'bg-status-warning text-status-warning-text', nextAction: 'Mark Paid' },
  paid: { label: 'Paid', color: 'bg-status-success text-status-success-text', nextAction: null },
  rejected: { label: 'Rejected', color: 'bg-status-error text-status-error-text', nextAction: null },
};

export default function InvoiceTable({
  invoices,
  onAdvanceStatus,
  onViewDetails,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="card-dark p-8 text-center">
        <div className="w-8 h-8 border-2 border-text-secondary border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading invoices...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-text-secondary">No invoices found.</p>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Contractor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Pay Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {invoices.map((invoice) => {
              const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
              const periodStart = new Date(invoice.pay_period_start);
              const periodEnd = new Date(invoice.pay_period_end);
              const totalHours = (invoice.week_1_hours || 0) + (invoice.week_2_hours || 0);

              return (
                <tr key={invoice.id} className="hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {invoice.contractors?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {invoice.contractors?.email || ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-secondary">
                      {formatDateRange(periodStart, periodEnd)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-secondary">{totalHours}h</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">
                      ${(invoice.total_amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewDetails && onViewDetails(invoice)}
                        className="text-sm text-status-info-text hover:text-white transition-colors"
                      >
                        View
                      </button>
                      {status.nextAction && (
                        <button
                          onClick={() => onAdvanceStatus && onAdvanceStatus(invoice.id)}
                          className="px-3 py-1 text-xs font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors"
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
