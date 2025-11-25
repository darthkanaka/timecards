import { formatDateRange } from '../lib/payPeriod';

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  approval_1: { label: 'First Approval', color: 'bg-purple-100 text-purple-800' },
  approval_2: { label: 'Second Approval', color: 'bg-indigo-100 text-indigo-800' },
  pending_payment: { label: 'Payment Processing', color: 'bg-orange-100 text-orange-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
};

export default function InvoiceHistory({ invoices, onSelect }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500 text-sm">No previous invoices found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Invoice History</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {invoices.map((invoice) => {
          const status = STATUS_LABELS[invoice.status] || STATUS_LABELS.pending;
          const periodStart = new Date(invoice.pay_period_start);
          const periodEnd = new Date(invoice.pay_period_end);

          return (
            <div
              key={invoice.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelect && onSelect(invoice)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {formatDateRange(periodStart, periodEnd)}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {(invoice.week_1_hours || 0) + (invoice.week_2_hours || 0)} hours
                </span>
                <span className="font-medium text-gray-700">
                  ${(invoice.total_amount || 0).toFixed(2)}
                </span>
              </div>

              {invoice.submitted_at && (
                <p className="text-xs text-gray-400 mt-1">
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
