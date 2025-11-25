import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TimecardForm from '../components/TimecardForm';
import StatusTracker from '../components/StatusTracker';
import InvoiceHistory from '../components/InvoiceHistory';
import {
  getContractorByToken,
  getCurrentInvoice,
  getContractorInvoices,
  submitTimecard,
} from '../lib/api';

export default function Timecard() {
  const { token } = useParams();
  const [contractor, setContractor] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'history'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const contractorData = await getContractorByToken(token);
        if (!contractorData) {
          setError('Invalid or inactive timecard link');
          return;
        }

        setContractor(contractorData);

        const [invoice, history] = await Promise.all([
          getCurrentInvoice(contractorData.id),
          getContractorInvoices(contractorData.id),
        ]);

        setCurrentInvoice(invoice);
        // Filter out current period from history
        const currentStart = invoice?.pay_period_start;
        setInvoiceHistory(
          history.filter((inv) => inv.pay_period_start !== currentStart)
        );
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load timecard data');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadData();
    }
  }, [token]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await submitTimecard(contractor.id, formData);
      setCurrentInvoice(result);
      setSubmitSuccess(true);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit timecard');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timecard...</p>
        </div>
      </div>
    );
  }

  if (error && !contractor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
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
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Invalid Link
          </h1>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Contractor Timecard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {contractor?.name}
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">
                Timecard submitted successfully!
              </p>
              <p className="text-sm text-green-700">
                You will receive a confirmation email shortly.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'form'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Current Period
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History ({invoiceHistory.length})
          </button>
        </div>

        {activeTab === 'form' ? (
          <div className="space-y-6">
            {/* Status Tracker */}
            {currentInvoice && currentInvoice.status !== 'pending' && (
              <StatusTracker
                status={currentInvoice.status}
                timestamps={{
                  submitted: currentInvoice.submitted_at,
                  approval_1: currentInvoice.approval_1_at,
                  approval_2: currentInvoice.approval_2_at,
                  pending_payment: currentInvoice.approval_2_at,
                  paid: currentInvoice.paid_at,
                }}
              />
            )}

            {/* Timecard Form */}
            <TimecardForm
              contractor={contractor}
              existingInvoice={currentInvoice}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <InvoiceHistory
            invoices={invoiceHistory}
            onSelect={(invoice) => {
              // Could show a modal with invoice details
              console.log('Selected invoice:', invoice);
            }}
          />
        )}
      </div>
    </div>
  );
}
