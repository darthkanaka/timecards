import { useState, useEffect, useCallback } from 'react';
import InvoiceTable from '../components/InvoiceTable';
import ContractorList from '../components/ContractorList';
import {
  getAllContractors,
  getAllInvoices,
  advanceInvoiceStatus,
  getPayPeriodSummary,
} from '../lib/api';
import { getCurrentPayPeriod, toISODateString, getPayPeriodLabel } from '../lib/payPeriod';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approval_1', label: 'First Approval' },
  { value: 'approval_2', label: 'Second Approval' },
  { value: 'pending_payment', label: 'Payment Processing' },
  { value: 'paid', label: 'Paid' },
];

export default function Admin() {
  const [contractors, setContractors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const payPeriod = getCurrentPayPeriod();
  const currentPeriodStart = toISODateString(payPeriod.periodStart);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [contractorsData, invoicesData, summaryData] = await Promise.all([
        getAllContractors(),
        getAllInvoices({ status: statusFilter || undefined }),
        getPayPeriodSummary(currentPeriodStart),
      ]);

      setContractors(contractorsData);
      setInvoices(invoicesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPeriodStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdvanceStatus = async (invoiceId) => {
    try {
      setActionLoading(true);
      await advanceInvoiceStatus(invoiceId);
      await loadData();
    } catch (err) {
      console.error('Error advancing status:', err);
      setError(err.message || 'Failed to advance status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage contractor timecards and approvals
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Period
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {getPayPeriodLabel(payPeriod)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {summary?.submittedCount || 0}
              <span className="text-sm font-normal text-gray-500">
                {' '}/ {summary?.totalContractors || 0}
              </span>
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Period Total
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ${(summary?.totalAmount || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </p>
            {summary?.allSubmitted ? (
              <p className="text-sm font-semibold text-green-600 mt-1">
                All Submitted
              </p>
            ) : (
              <p className="text-sm font-semibold text-yellow-600 mt-1">
                {summary?.notSubmitted?.length || 0} Pending
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <InvoiceTable
              invoices={invoices}
              onAdvanceStatus={handleAdvanceStatus}
              onViewDetails={setSelectedInvoice}
              isLoading={loading || actionLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ContractorList
              contractors={contractors}
              notSubmitted={summary?.notSubmitted || []}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Invoice Details
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Contractor</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInvoice.contractors?.name || 'Unknown'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Week 1</p>
                    <p className="text-sm text-gray-700">
                      {selectedInvoice.week_1_hours}h × ${selectedInvoice.week_1_rate}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedInvoice.week_1_notes || 'No notes'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Week 2</p>
                    <p className="text-sm text-gray-700">
                      {selectedInvoice.week_2_hours}h × ${selectedInvoice.week_2_rate}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedInvoice.week_2_notes || 'No notes'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-700">Total</p>
                    <p className="text-lg font-bold text-green-600">
                      ${(selectedInvoice.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                {selectedInvoice.approval_1_at && (
                  <div className="text-xs text-gray-500">
                    <p>
                      1st Approval: {new Date(selectedInvoice.approval_1_at).toLocaleString()}
                      {selectedInvoice.approval_1_by && ` by ${selectedInvoice.approval_1_by}`}
                    </p>
                  </div>
                )}
                {selectedInvoice.approval_2_at && (
                  <div className="text-xs text-gray-500">
                    <p>
                      2nd Approval: {new Date(selectedInvoice.approval_2_at).toLocaleString()}
                      {selectedInvoice.approval_2_by && ` by ${selectedInvoice.approval_2_by}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
