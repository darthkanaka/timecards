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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-text-secondary border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading timecard...</p>
        </div>
      </div>
    );
  }

  if (error && !contractor) {
    return (
      <div className="min-h-screen bg-dark-bg flex">
        {/* Left side - Background image */}
        <div
          className="hidden lg:block lg:w-[30%] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-8 left-8">
            <img src={LOGO_URL} alt="InvizArts" className="h-16 w-auto" />
          </div>
        </div>

        {/* Right side - Error */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="card-dark p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-status-error rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-status-error-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-3">Invalid Link</h1>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left side - Background image */}
      <div
        className="hidden lg:block lg:w-[30%] bg-cover bg-center relative fixed left-0 top-0 bottom-0"
        style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-8 left-8">
          <img src={LOGO_URL} alt="InvizArts" className="h-16 w-auto" />
        </div>
      </div>

      {/* Right side - Form content */}
      <div className="flex-1 lg:ml-[30%]">
        {/* Mobile logo */}
        <div className="lg:hidden p-6 flex justify-center">
          <img src={LOGO_URL} alt="InvizArts" className="h-12 w-auto" />
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 lg:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-white tracking-wide">
              Contractor Timecard
            </h1>
            <p className="text-text-secondary mt-2">
              Welcome back, <span className="text-white font-medium">{contractor?.name}</span>
            </p>
          </div>

          {/* Pay Period Navigation */}
          <div className="mb-6">
            <PayPeriodNav
              payPeriod={payPeriod}
              onPrevious={handlePreviousPeriod}
              onNext={handleNextPeriod}
            />
          </div>

          {/* Invoice Status Badge */}
          <div className="mb-8">
            {invoiceLoading ? (
              <div className="card-dark p-4 animate-pulse">
                <div className="h-6 bg-dark-elevated rounded w-32"></div>
              </div>
            ) : (
              <InvoiceStatusBadge status={getInvoiceStatus()} />
            )}
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-status-success/20 border border-status-success rounded-lg p-4 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-status-success rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-status-success-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-status-success-text">
                  Timecard {invoice?.status === 'submitted' ? 'submitted' : 'resubmitted'} successfully!
                </p>
                <p className="text-sm text-status-success-text/70">
                  You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-status-error/20 border border-status-error rounded-lg p-4 mb-6">
              <p className="text-status-error-text text-sm">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-dark-border mb-8">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'form'
                  ? 'border-white text-white'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              Timecard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'history'
                  ? 'border-white text-white'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              History ({invoiceHistory.length})
            </button>
          </div>

          {activeTab === 'form' ? (
            <div className="space-y-8">
              {/* Status Tracker */}
              {invoice && invoice.status && invoice.status !== 'pending' && invoice.status !== 'not_submitted' && (
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
