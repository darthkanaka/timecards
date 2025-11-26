import { useState, useEffect, useCallback } from 'react';
import InvoiceTable from '../components/InvoiceTable';
import ContractorList from '../components/ContractorList';
import {
  getAllContractors,
  getAllInvoices,
  advanceInvoiceStatus,
  getPayPeriodSummary,
  deleteInvoice,
} from '../lib/api';
import { getCurrentPayPeriod, toISODateString, getPayPeriodLabel } from '../lib/payPeriod';

const LOGO_URL = "https://static.wixstatic.com/media/edda46_11cebb29dd364966929fec216683b3f3~mv2.png/v1/fill/w_486,h_344,al_c,lg_1,q_85,enc_avif,quality_auto/IA%20LOGO.png";

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approval_1', label: 'First Approval' },
  { value: 'approval_2', label: 'Second Approval' },
  { value: 'pending_payment', label: 'Payment Processing' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
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

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this timecard? This will allow the contractor to submit a fresh timecard for this period.')) {
      return;
    }
    try {
      setActionLoading(true);
      await deleteInvoice(invoiceId);
      setSelectedInvoice(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err.message || 'Failed to delete invoice');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header with logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={LOGO_URL} alt="InvizArts" className="h-10 w-auto" />
          <p className="text-text-secondary text-sm">Admin Dashboard</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-white tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary mt-2">
            Manage contractor timecards and approvals
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-status-error/20 border border-status-error rounded-lg p-4 mb-6">
            <p className="text-status-error-text text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-dark p-5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Current Period
            </p>
            <p className="text-white font-medium mt-2">
              {getPayPeriodLabel(payPeriod)}
            </p>
          </div>
          <div className="card-dark p-5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Submitted
            </p>
            <p className="text-3xl font-light text-white mt-2">
              {summary?.submittedCount || 0}
              <span className="text-sm font-normal text-text-muted">
                {' '}/ {summary?.totalContractors || 0}
              </span>
            </p>
          </div>
          <div className="card-dark p-5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Period Total
            </p>
            <p className="text-3xl font-light text-status-success-text mt-2">
              ${(summary?.totalAmount || 0).toFixed(2)}
            </p>
          </div>
          <div className="card-dark p-5">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Status
            </p>
            {summary?.allSubmitted ? (
              <p className="text-status-success-text font-medium mt-2">
                All Submitted
              </p>
            ) : (
              <p className="text-status-warning-text font-medium mt-2">
                {summary?.notSubmitted?.length || 0} Pending
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="card-dark p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="label-dark">Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-dark-elevated border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-text-secondary"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-dark-card">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="px-4 py-2 text-text-secondary hover:text-white transition-colors mt-6"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card-dark max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Invoice Details
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="label-dark">Contractor</p>
                  <p className="text-white font-medium">
                    {selectedInvoice.contractors?.name || 'Unknown'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="label-dark">Week 1</p>
                    <p className="text-white">
                      {selectedInvoice.week_1_hours}h × ${selectedInvoice.week_1_rate}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      {selectedInvoice.week_1_notes || 'No notes'}
                    </p>
                  </div>
                  <div>
                    <p className="label-dark">Week 2</p>
                    <p className="text-white">
                      {selectedInvoice.week_2_hours}h × ${selectedInvoice.week_2_rate}
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      {selectedInvoice.week_2_notes || 'No notes'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-dark-border">
                  <div className="flex justify-between">
                    <p className="text-text-secondary font-medium">Total</p>
                    <p className="text-xl font-bold text-status-success-text">
                      ${(selectedInvoice.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                {selectedInvoice.approval_1_at && (
                  <div className="text-xs text-text-muted">
                    <p>
                      1st Approval: {new Date(selectedInvoice.approval_1_at).toLocaleString()}
                      {selectedInvoice.approval_1_by && ` by ${selectedInvoice.approval_1_by}`}
                    </p>
                  </div>
                )}
                {selectedInvoice.approval_2_at && (
                  <div className="text-xs text-text-muted">
                    <p>
                      2nd Approval: {new Date(selectedInvoice.approval_2_at).toLocaleString()}
                      {selectedInvoice.approval_2_by && ` by ${selectedInvoice.approval_2_by}`}
                    </p>
                  </div>
                )}
                {/* Delete Button */}
                <div className="pt-4 border-t border-dark-border">
                  <button
                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                    disabled={actionLoading}
                    className="w-full py-3 px-4 bg-status-error text-status-error-text rounded-lg font-medium hover:bg-status-error/80 disabled:bg-accent/50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete Timecard'}
                  </button>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    This will completely remove the timecard and allow the contractor to submit fresh.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
