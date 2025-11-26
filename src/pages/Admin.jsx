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
const BG_IMAGE_URL = "https://images.squarespace-cdn.com/content/57e6cc979de4bbd5509a028e/1a53ba70-7df5-4bfd-8896-3dbf6f6ba03c/DJI_0626-HDR-Pano.jpg?content-type=image%2Fjpeg";

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approval_1', label: 'Nick (1/2)' },
  { value: 'approval_2', label: 'Chris (2/2)' },
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
      setError(err.message || 'Failed to load data');
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
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      {/* Fixed Background Image - full viewport */}
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 0
        }}
      >
        <img
          src={BG_IMAGE_URL}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center'
          }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
      </div>

      {/* Fixed Logo */}
      <img
        src={LOGO_URL}
        alt="InvizArts"
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          width: '90px',
          height: 'auto',
          zIndex: 50
        }}
      />

      {/* Mobile background fallback */}
      <div className="lg:hidden" style={{ position: 'fixed', inset: 0, backgroundColor: '#0a1628', zIndex: 0 }}></div>

      {/* Centered Content Panel */}
      <div className="min-h-screen flex flex-col" style={{ position: 'relative', zIndex: 10 }}>
        {/* Mobile logo */}
        <div className="lg:hidden pt-6 pl-6">
          <img src={LOGO_URL} alt="InvizArts" style={{ width: '80px', height: 'auto' }} />
        </div>

        <div className="flex-1 flex justify-center">
          <div style={{
            backgroundColor: '#0a1628',
            width: '100%',
            maxWidth: '1200px',
            minHeight: '100vh',
            padding: '40px 32px'
          }}>
            {/* Page Title */}
            <div className="flex items-center justify-between" style={{ marginBottom: '40px' }}>
              <div>
                <h1 style={{
                  fontSize: '30px',
                  fontWeight: '300',
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  marginBottom: '8px'
                }}>
                  Admin Dashboard
                </h1>
                <p style={{ fontSize: '14px', color: '#8a94a6' }}>
                  Manage contractor timecards and approvals
                </p>
              </div>
              <span className="hidden sm:block" style={{
                fontSize: '12px',
                color: '#8a94a6',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '500'
              }}>
                Admin
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</p>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '40px' }}>
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px solid #2d3f50',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px'
                }}>
                  Current Period
                </p>
                <p style={{ color: '#ffffff', fontWeight: '500', fontSize: '15px' }}>
                  {getPayPeriodLabel(payPeriod)}
                </p>
              </div>
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px solid #2d3f50',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px'
                }}>
                  Submitted
                </p>
                <p style={{ fontSize: '32px', fontWeight: '300', color: '#ffffff' }}>
                  {summary?.submittedCount || 0}
                  <span style={{ fontSize: '14px', fontWeight: '400', color: '#5a6478' }}>
                    {' '}/ {summary?.totalContractors || 0}
                  </span>
                </p>
              </div>
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px solid #2d3f50',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px'
                }}>
                  Period Total
                </p>
                <p style={{ fontSize: '32px', fontWeight: '300', color: '#34d399' }}>
                  ${(summary?.totalAmount || 0).toFixed(2)}
                </p>
              </div>
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px solid #2d3f50',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px'
                }}>
                  Status
                </p>
                {summary?.allSubmitted ? (
                  <p style={{ color: '#34d399', fontWeight: '500', fontSize: '15px' }}>
                    All Submitted
                  </p>
                ) : (
                  <p style={{ color: '#fbbf24', fontWeight: '500', fontSize: '15px' }}>
                    {summary?.notSubmitted?.length || 0} Pending
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>
              {/* Main Content */}
              <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Filters */}
                <div style={{
                  backgroundColor: '#0d1b2a',
                  border: '1px solid #2d3f50',
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#8a94a6',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '12px'
                      }}>
                        Filter by Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#1b2838',
                          border: '1px solid #2d3f50',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} style={{ backgroundColor: '#0d1b2a' }}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={loadData}
                      disabled={loading}
                      style={{
                        padding: '10px',
                        color: '#8a94a6',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        marginTop: '28px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#8a94a6';
                      }}
                    >
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <ContractorList
                  contractors={contractors}
                  notSubmitted={summary?.notSubmitted || []}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100 }}>
          <div style={{
            backgroundColor: '#0d1b2a',
            border: '1px solid #2d3f50',
            borderRadius: '12px',
            maxWidth: '512px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #2d3f50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                Invoice Details
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  color: '#8a94a6',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8a94a6'}
              >
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  Contractor
                </p>
                <p style={{ color: '#ffffff', fontWeight: '500', fontSize: '16px' }}>
                  {selectedInvoice.contractors?.name || 'Unknown'}
                </p>
              </div>
              <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
                <div>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#8a94a6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px'
                  }}>
                    Week 1
                  </p>
                  <p style={{ color: '#ffffff', fontSize: '15px' }}>
                    {selectedInvoice.week_1_hours}h × ${selectedInvoice.week_1_rate}
                  </p>
                  <p style={{ color: '#5a6478', fontSize: '12px', marginTop: '4px' }}>
                    {selectedInvoice.week_1_notes || 'No notes'}
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: '#8a94a6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px'
                  }}>
                    Week 2
                  </p>
                  <p style={{ color: '#ffffff', fontSize: '15px' }}>
                    {selectedInvoice.week_2_hours}h × ${selectedInvoice.week_2_rate}
                  </p>
                  <p style={{ color: '#5a6478', fontSize: '12px', marginTop: '4px' }}>
                    {selectedInvoice.week_2_notes || 'No notes'}
                  </p>
                </div>
              </div>
              <div style={{ paddingTop: '20px', borderTop: '1px solid #2d3f50', marginBottom: '20px' }}>
                <div className="flex justify-between items-center">
                  <p style={{ color: '#8a94a6', fontWeight: '500', fontSize: '14px' }}>Total</p>
                  <p style={{ fontSize: '22px', fontWeight: '600', color: '#34d399' }}>
                    ${(selectedInvoice.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              {selectedInvoice.approval_1_at && (
                <div style={{ fontSize: '12px', color: '#5a6478', marginBottom: '8px' }}>
                  <p>
                    Nick (1/2): {new Date(selectedInvoice.approval_1_at).toLocaleString()}
                    {selectedInvoice.approval_1_by && ` by ${selectedInvoice.approval_1_by}`}
                  </p>
                </div>
              )}
              {selectedInvoice.approval_2_at && (
                <div style={{ fontSize: '12px', color: '#5a6478', marginBottom: '20px' }}>
                  <p>
                    Chris (2/2): {new Date(selectedInvoice.approval_2_at).toLocaleString()}
                    {selectedInvoice.approval_2_by && ` by ${selectedInvoice.approval_2_by}`}
                  </p>
                </div>
              )}
              {/* Delete Button */}
              <div style={{ paddingTop: '20px', borderTop: '1px solid #2d3f50' }}>
                <button
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  disabled={actionLoading}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    border: 'none',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
                  }}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Timecard'}
                </button>
                <p style={{ fontSize: '12px', color: '#5a6478', marginTop: '10px', textAlign: 'center' }}>
                  This will completely remove the timecard and allow the contractor to submit fresh.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
