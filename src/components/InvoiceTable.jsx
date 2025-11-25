import { formatDateRange } from '../lib/payPeriod';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', nextAction: null },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', nextAction: 'Approve (1st)' },
  approval_1: { label: '1st Approved', color: 'bg-purple-100 text-purple-800', nextAction: 'Approve (2nd)' },
  approval_2: { label: '2nd Approved', color: 'bg-indigo-100 text-indigo-800', nextAction: 'Mark Processing' },
  pending_payment: { label: 'Processing', color: 'bg-orange-100 text-orange-800', nextAction: 'Mark Paid' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', nextAction: null },
};

export default function InvoiceTable({
  invoices,
  onAdvanceStatus,
  onViewDetails,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading invoices...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No invoices found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contractor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pay Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => {
              const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
              const periodStart = new Date(invoice.pay_period_start);
              const periodEnd = new Date(invoice.pay_period_end);
              const totalHours = (invoice.week_1_hours || 0) + (invoice.week_2_hours || 0);

              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.contractors?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {invoice.contractors?.email || ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">
                      {formatDateRange(periodStart, periodEnd)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{totalHours}h</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
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
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      {status.nextAction && (
                        <button
                          onClick={() => onAdvanceStatus && onAdvanceStatus(invoice.id)}
                          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
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
