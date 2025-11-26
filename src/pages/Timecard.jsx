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
const BG_IMAGE_URL = "https://images.squarespace-cdn.com/content/57e6cc979de4bbd5509a028e/1a53ba70-7df5-4bfd-8896-3dbf6f6ba03c/DJI_0626-HDR-Pano.jpg?content-type=image%2Fjpeg";

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
        setError('Failed to load timecard data');
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
      <div className="min-h-screen flex" style={{ backgroundColor: '#0a1628' }}>
        {/* Fixed Logo */}
        <img
          src={LOGO_URL}
          alt="InvizArts"
          className="fixed top-6 left-6 z-50 hidden lg:block"
          style={{ width: '90px', height: 'auto' }}
        />

        {/* Left side - Fixed Background image */}
        <div
          className="hidden lg:block fixed left-0 top-0 bottom-0"
          style={{ width: '30%' }}
        >
          <img
            src={BG_IMAGE_URL}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
        </div>

        {/* Right side - Error */}
        <div className="flex-1 lg:ml-[30%] flex items-center justify-center p-8">
          <div className="card-dark p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#5a2d2d' }}>
              <svg className="w-8 h-8" style={{ color: '#f87171' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-3">Invalid Link</h1>
            <p style={{ color: '#8a94a6' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0a1628' }}>
      {/* Fixed Logo - top left corner */}
      <img
        src={LOGO_URL}
        alt="InvizArts"
        className="fixed top-6 left-6 z-50 hidden lg:block"
        style={{ width: '90px', height: 'auto' }}
      />

      {/* Left side - Fixed Background image */}
      <div
        className="hidden lg:block fixed left-0 top-0 bottom-0"
        style={{ width: '30%' }}
      >
        <img
          src={BG_IMAGE_URL}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
      </div>

      {/* Right side - Scrollable Form content */}
      <div className="flex-1 lg:ml-[30%] min-h-screen overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden pt-6 pl-6">
          <img src={LOGO_URL} alt="InvizArts" style={{ width: '80px', height: 'auto' }} />
        </div>

        <div className="px-8 py-10 lg:px-12 lg:py-14 max-w-2xl">
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
              <div className="card-dark p-5 animate-pulse">
                <div className="h-6 rounded w-32" style={{ backgroundColor: '#1b2838' }}></div>
              </div>
            ) : (
              <InvoiceStatusBadge status={getInvoiceStatus()} />
            )}
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="rounded-lg p-5 mb-8 flex items-center gap-4" style={{ backgroundColor: 'rgba(45, 90, 61, 0.2)', border: '1px solid #2d5a3d' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2d5a3d' }}>
                <svg className="w-5 h-5" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#4ade80', fontSize: '15px' }}>
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
            <div className="rounded-lg p-5 mb-8" style={{ backgroundColor: 'rgba(90, 45, 45, 0.2)', border: '1px solid #5a2d2d' }}>
              <p style={{ color: '#f87171', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex mb-10" style={{ borderBottom: '1px solid #2d3f50' }}>
            <button
              onClick={() => setActiveTab('form')}
              className="px-5 py-4 font-medium transition-colors"
              style={{
                fontSize: '15px',
                marginBottom: '-1px',
                borderBottom: activeTab === 'form' ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === 'form' ? '#ffffff' : '#8a94a6'
              }}
            >
              Timecard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="px-5 py-4 font-medium transition-colors"
              style={{
                fontSize: '15px',
                marginBottom: '-1px',
                borderBottom: activeTab === 'history' ? '2px solid #ffffff' : '2px solid transparent',
                color: activeTab === 'history' ? '#ffffff' : '#8a94a6'
              }}
            >
              History ({invoiceHistory.length})
            </button>
          </div>

          {activeTab === 'form' ? (
            <div>
              {/* Status Tracker */}
              {invoice && invoice.status && invoice.status !== 'pending' && invoice.status !== 'not_submitted' && (
                <div className="mb-10">
                  <StatusTracker
                    status={invoice.status}
                    timestamps={{
                      submitted: invoice.submitted_at,
                      approval_1: invoice.approval_1_at,
                      approval_2: invoice.approval_2_at,
                      pending_payment: invoice.approval_2_at,
                      paid: invoice.paid_at,
                    }}
                    rejectionInfo={{
                      reason: invoice.rejection_reason,
                      rejectedBy: invoice.rejected_by,
                      rejectedAt: invoice.rejected_at,
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
