import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TimecardForm from '../components/TimecardForm';
import StatusTracker from '../components/StatusTracker';
import InvoiceHistory from '../components/InvoiceHistory';
import PayPeriodNav from '../components/PayPeriodNav';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import {
  getContractorByToken,
  getInvoiceForPeriod,
  getContractorInvoices,
  submitTimecard,
} from '../lib/api';
import {
  getCurrentPayPeriod,
  getPreviousPayPeriod,
  getNextPayPeriod,
  toISODateString,
  isCurrentPeriod,
  isFuturePeriod,
} from '../lib/payPeriod';

const LOGO_URL = "https://static.wixstatic.com/media/edda46_11cebb29dd364966929fec216683b3f3~mv2.png/v1/fill/w_486,h_344,al_c,lg_1,q_85,enc_avif,quality_auto/IA%20LOGO.png";
const BG_IMAGE_URL = "https://images.squarespace-cdn.com/content/57e6cc979de4bbd5509a028e/e40c7e87-957a-4182-a7f7-89556b540617/TimecardBG.jpg?content-type=image%2Fjpeg";

export default function Timecard() {
  const { token } = useParams();
  const [contractor, setContractor] = useState(null);
  const [payPeriod, setPayPeriod] = useState(getCurrentPayPeriod());
  const [invoice, setInvoice] = useState(null);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    async function loadContractor() {
      try {
        setLoading(true);
        setError(null);

        const contractorData = await getContractorByToken(token);
        if (!contractorData) {
          setError('Invalid or inactive timecard link');
          return;
        }

        setContractor(contractorData);

        const history = await getContractorInvoices(contractorData.id);
        setInvoiceHistory(history);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load timecard data');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadContractor();
    }
  }, [token]);

  const loadInvoiceForPeriod = useCallback(async () => {
    if (!contractor) return;

    try {
      setInvoiceLoading(true);
      const periodStart = toISODateString(payPeriod.periodStart);
      const invoiceData = await getInvoiceForPeriod(contractor.id, periodStart);
      setInvoice(invoiceData);
    } catch (err) {
      console.error('Error loading invoice:', err);
    } finally {
      setInvoiceLoading(false);
    }
  }, [contractor, payPeriod]);

  useEffect(() => {
    loadInvoiceForPeriod();
  }, [loadInvoiceForPeriod]);

  const handlePreviousPeriod = () => {
    setPayPeriod(getPreviousPayPeriod(payPeriod));
    setSubmitSuccess(false);
  };

  const handleNextPeriod = () => {
    const next = getNextPayPeriod(payPeriod);
    if (!isFuturePeriod(next)) {
      setPayPeriod(next);
      setSubmitSuccess(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await submitTimecard(contractor.id, formData, payPeriod, isResubmission());
      setInvoice(result);
      setSubmitSuccess(true);

      const history = await getContractorInvoices(contractor.id);
      setInvoiceHistory(history);

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit timecard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInvoiceStatus = () => {
    if (!invoice) return 'not_submitted';
    return invoice.status || 'not_submitted';
  };

  const canSubmit = () => {
    if (isFuturePeriod(payPeriod)) return false;
    if (!invoice) return true;
    if (invoice.status === 'pending') return true;
    if (invoice.status === 'rejected') return true;
    return false;
  };

  const isResubmission = () => {
    return invoice?.status === 'rejected';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a1628' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-500 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#8a94a6' }}>Loading timecard...</p>
        </div>
      </div>
    );
  }

  if (error && !contractor) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
        {/* Fixed Background Image - covers full viewport */}
        <div
          className="hidden lg:block"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '30%',
            height: '100vh',
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <img
            src={BG_IMAGE_URL}
            alt=""
            style={{
              width: '1440px',
              height: '1800px',
              objectFit: 'cover',
              objectPosition: 'center top',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
        </div>

        {/* Fixed Logo - top left corner over image */}
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

        {/* Content Panel */}
        <div
          className="min-h-screen lg:ml-[30%]"
          style={{ backgroundColor: '#0a1628', position: 'relative', zIndex: 10 }}
        >
          <div className="flex items-center justify-center min-h-screen p-8">
            <div style={{
              backgroundColor: '#0d1b2a',
              border: '1px solid #2d3f50',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#5a2d2d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>Invalid Link</h1>
              <p style={{ color: '#8a94a6', fontSize: '15px' }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1628' }}>
      {/* Fixed Background Image - covers full viewport, visible on left 30% */}
      <div
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '30%',
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        <img
          src={BG_IMAGE_URL}
          alt=""
          style={{
            width: '1440px',
            height: '1800px',
            objectFit: 'cover',
            objectPosition: 'center top',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
      </div>

      {/* Fixed Logo - top left corner over image */}
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

      {/* Content Panel - scrolls over background */}
      <div
        className="min-h-screen lg:ml-[30%]"
        style={{ backgroundColor: '#0a1628', position: 'relative', zIndex: 10 }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden pt-6 pl-6">
          <img src={LOGO_URL} alt="InvizArts" style={{ width: '80px', height: 'auto' }} />
        </div>

        <div className="px-8 py-10 lg:px-12 lg:py-14 lg:pr-16">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-white font-normal tracking-wide" style={{ fontSize: '30px' }}>
              Contractor Timecard
            </h1>
            <p className="mt-3" style={{ fontSize: '17px', color: '#8a94a6' }}>
              Welcome back, <span className="text-white font-medium">{contractor?.name}</span>
            </p>
          </div>

          {/* Pay Period Navigation */}
          <div className="mb-8">
            <PayPeriodNav
              payPeriod={payPeriod}
              onPrevious={handlePreviousPeriod}
              onNext={handleNextPeriod}
            />
          </div>

          {/* Invoice Status Badge */}
          <div className="mb-10">
            {invoiceLoading ? (
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px solid #2d3f50',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <div style={{ height: '24px', borderRadius: '4px', width: '128px', backgroundColor: '#1b2838' }}></div>
              </div>
            ) : (
              <InvoiceStatusBadge
                status={getInvoiceStatus()}
                rejectionInfo={invoice?.status === 'rejected' ? {
                  reason: invoice.rejection_reason,
                  rejectedBy: invoice.rejected_by,
                  rejectedAt: invoice.rejected_at,
                } : null}
              />
            )}
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="flex items-center gap-4" style={{
              backgroundColor: 'rgba(45, 90, 61, 0.2)',
              border: '1px solid #2d5a3d',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#2d5a3d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p style={{ color: '#4ade80', fontSize: '15px', fontWeight: '500' }}>
                  Timecard {invoice?.status === 'submitted' ? 'submitted' : 'resubmitted'} successfully!
                </p>
                <p style={{ color: 'rgba(74, 222, 128, 0.7)', fontSize: '14px' }}>
                  You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(90, 45, 45, 0.2)',
              border: '1px solid #5a2d2d',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <p style={{ color: '#f87171', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid #2d3f50', marginBottom: '40px' }}>
            <button
              onClick={() => setActiveTab('form')}
              style={{
                padding: '16px 20px',
                fontSize: '15px',
                fontWeight: '500',
                marginBottom: '-1px',
                borderBottom: activeTab === 'form' ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === 'form' ? '#ffffff' : '#8a94a6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              Timecard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '16px 20px',
                fontSize: '15px',
                fontWeight: '500',
                marginBottom: '-1px',
                borderBottom: activeTab === 'history' ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === 'history' ? '#ffffff' : '#8a94a6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              History ({invoiceHistory.length})
            </button>
          </div>

          {activeTab === 'form' ? (
            <div>
              {/* Status Tracker */}
              {invoice && invoice.status && invoice.status !== 'pending' && invoice.status !== 'not_submitted' && invoice.status !== 'rejected' && (
                <div style={{ marginBottom: '40px' }}>
                  <StatusTracker
                    status={invoice.status}
                    timestamps={{
                      submitted: invoice.submitted_at,
                      approval_1: invoice.approval_1_at,
                      approval_2: invoice.approval_2_at,
                      pending_payment: invoice.approval_2_at,
                      paid: invoice.paid_at,
                    }}
                  />
                </div>
              )}

              {/* Timecard Form */}
              <TimecardForm
                contractor={contractor}
                payPeriod={payPeriod}
                existingInvoice={invoice}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                readOnly={!canSubmit()}
                isResubmission={isResubmission()}
              />
            </div>
          ) : (
            <InvoiceHistory
              invoices={invoiceHistory}
              onSelect={(selectedInvoice) => {
                const periodStart = new Date(selectedInvoice.pay_period_start + 'T00:00:00');
                setPayPeriod({
                  periodStart,
                  periodEnd: new Date(selectedInvoice.pay_period_end + 'T00:00:00'),
                  week1: {
                    start: new Date(selectedInvoice.week_1_start + 'T00:00:00'),
                    end: new Date(selectedInvoice.week_1_end + 'T00:00:00'),
                  },
                  week2: {
                    start: new Date(selectedInvoice.week_2_start + 'T00:00:00'),
                    end: new Date(selectedInvoice.week_2_end + 'T00:00:00'),
                  },
                });
                setActiveTab('form');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
