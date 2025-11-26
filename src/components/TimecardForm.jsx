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
  isResubmission = false,
}) {
  const [formData, setFormData] = useState({
    week1Hours: 0,
    week1Rate: contractor?.default_hourly_rate || 0,
    week1Notes: '',
    week2Hours: 0,
    week2Rate: contractor?.default_hourly_rate || 0,
    week2Notes: '',
    taxRate: '',
  });

  useEffect(() => {
    setFormData({
      week1Hours: existingInvoice?.week_1_hours || 0,
      week1Rate: existingInvoice?.week_1_rate || contractor?.default_hourly_rate || 0,
      week1Notes: existingInvoice?.week_1_notes || '',
      week2Hours: existingInvoice?.week_2_hours || 0,
      week2Rate: existingInvoice?.week_2_rate || contractor?.default_hourly_rate || 0,
      week2Notes: existingInvoice?.week_2_notes || '',
      taxRate: existingInvoice?.tax_rate || '',
    });
  }, [existingInvoice, contractor?.default_hourly_rate]);

  const week1Amount = formData.week1Hours * formData.week1Rate;
  const week2Amount = formData.week2Hours * formData.week2Rate;
  const subtotal = week1Amount + week2Amount;

  const taxRateValue = formData.taxRate === '' ? 0 : parseFloat(formData.taxRate) || 0;
  const taxAmount = subtotal * taxRateValue;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly && onSubmit) {
      onSubmit({
        ...formData,
        taxRate: taxRateValue || null,
        taxAmount: taxRateValue ? taxAmount : null,
        totalAmount,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contractor Info */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="label-dark">Contractor Name</label>
            <div className="text-white font-medium py-2 border-b border-dark-border">
              {contractor?.name || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="label-dark">Pay Period</label>
            <div className="text-white font-medium py-2 border-b border-dark-border">
              {getPayPeriodLabel(payPeriod)}
            </div>
          </div>
        </div>
      </div>

      {/* Week Rows */}
      <div className="space-y-6">
        <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Hours & Rates
        </h2>

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

      {/* Tax Rate */}
      <div className="space-y-4">
        <div className="max-w-xs">
          <label className="label-dark">Tax Rate (optional)</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="1"
              step="0.00001"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              disabled={readOnly}
              className="input-underline w-32"
              placeholder="0.04712"
            />
            <span className="text-xs text-text-muted">e.g., 0.04712 for Hawaii GET</span>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="card-dark p-6">
        <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
          Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Week 1 Total</span>
            <span className="text-white font-medium">${week1Amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Week 2 Total</span>
            <span className="text-white font-medium">${week2Amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-muted">
            <span>Total Hours</span>
            <span>{formData.week1Hours + formData.week2Hours} hours</span>
          </div>

          <div className="flex justify-between text-sm pt-3 border-t border-dark-border">
            <span className="text-text-secondary font-medium">Subtotal</span>
            <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {taxRateValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">
                Tax ({(taxRateValue * 100).toFixed(3)}%)
              </span>
              <span className="text-white font-medium">${taxAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-dark-border">
            <span className="text-white font-semibold">Total Amount</span>
            <span className="text-xl font-bold text-status-success-text">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {!readOnly && (
        <button
          type="submit"
          disabled={isSubmitting || subtotal === 0}
          className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
            isSubmitting || subtotal === 0
              ? 'bg-accent/50 cursor-not-allowed'
              : isResubmission
                ? 'bg-status-warning hover:bg-status-warning/80'
                : 'bg-accent hover:bg-accent-hover'
          }`}
        >
          {isSubmitting ? 'Submitting...' : isResubmission ? 'Resubmit Timecard' : 'Submit Timecard'}
        </button>
      )}

      {readOnly && existingInvoice && (
        <div className="card-dark p-4 text-center">
          <p className="text-sm text-text-secondary">
            This timecard has already been submitted and is currently in{' '}
            <span className="text-white font-medium">{existingInvoice.status.replace('_', ' ')}</span> status.
          </p>
        </div>
      )}
    </form>
  );
}
