import { useState, useEffect } from 'react';
import WeekRow from './WeekRow';
import { getPayPeriodLabel } from '../lib/payPeriod';

export default function TimecardForm({
  contractor,
  payPeriod,
  existingInvoice,
  onSubmit,
  isSubmitting = false,
  readOnly = false,
}) {
  const [formData, setFormData] = useState({
    week1Hours: 0,
    week1Rate: contractor?.default_hourly_rate || 0,
    week1Notes: '',
    week2Hours: 0,
    week2Rate: contractor?.default_hourly_rate || 0,
    week2Notes: '',
  });

  // Reset form when invoice or pay period changes
  useEffect(() => {
    setFormData({
      week1Hours: existingInvoice?.week_1_hours || 0,
      week1Rate: existingInvoice?.week_1_rate || contractor?.default_hourly_rate || 0,
      week1Notes: existingInvoice?.week_1_notes || '',
      week2Hours: existingInvoice?.week_2_hours || 0,
      week2Rate: existingInvoice?.week_2_rate || contractor?.default_hourly_rate || 0,
      week2Notes: existingInvoice?.week_2_notes || '',
    });
  }, [existingInvoice, contractor?.default_hourly_rate]);

  const week1Amount = formData.week1Hours * formData.week1Rate;
  const week2Amount = formData.week2Hours * formData.week2Rate;
  const totalAmount = week1Amount + week2Amount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contractor Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Contractor Name
            </label>
            <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm font-medium text-gray-700">
              {contractor?.name || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Pay Period
            </label>
            <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm font-medium text-gray-700">
              {getPayPeriodLabel(payPeriod)}
            </div>
          </div>
        </div>
      </div>

      {/* Week Rows */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Hours & Rates</h2>

        <WeekRow
          weekNumber={1}
          weekStart={payPeriod.week1.start}
          weekEnd={payPeriod.week1.end}
          hours={formData.week1Hours}
          rate={formData.week1Rate}
          notes={formData.week1Notes}
          onHoursChange={(v) => setFormData({ ...formData, week1Hours: v })}
          onRateChange={(v) => setFormData({ ...formData, week1Rate: v })}
          onNotesChange={(v) => setFormData({ ...formData, week1Notes: v })}
          readOnly={readOnly}
        />

        <WeekRow
          weekNumber={2}
          weekStart={payPeriod.week2.start}
          weekEnd={payPeriod.week2.end}
          hours={formData.week2Hours}
          rate={formData.week2Rate}
          notes={formData.week2Notes}
          onHoursChange={(v) => setFormData({ ...formData, week2Hours: v })}
          onRateChange={(v) => setFormData({ ...formData, week2Rate: v })}
          onNotesChange={(v) => setFormData({ ...formData, week2Notes: v })}
          readOnly={readOnly}
        />
      </div>

      {/* Totals */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Week 1 Total</span>
            <span className="font-medium">${week1Amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Week 2 Total</span>
            <span className="font-medium">${week2Amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-700">Total Amount</span>
            <span className="font-bold text-lg text-green-600">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Hours</span>
            <span>{formData.week1Hours + formData.week2Hours} hours</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {!readOnly && (
        <button
          type="submit"
          disabled={isSubmitting || totalAmount === 0}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isSubmitting || totalAmount === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Timecard'}
        </button>
      )}

      {readOnly && existingInvoice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            This timecard has already been submitted and is currently in{' '}
            <span className="font-medium">{existingInvoice.status.replace('_', ' ')}</span> status.
          </p>
        </div>
      )}
    </form>
  );
}
