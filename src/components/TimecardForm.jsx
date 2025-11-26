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
    <form onSubmit={handleSubmit}>
      {/* Contractor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            Contractor Name
          </label>
          <div style={{
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '16px',
            paddingBottom: '10px',
            borderBottom: '1px solid #2d3f50'
          }}>
            {contractor?.name || 'Unknown'}
          </div>
        </div>
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            Pay Period
          </label>
          <div style={{
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '16px',
            paddingBottom: '10px',
            borderBottom: '1px solid #2d3f50'
          }}>
            {getPayPeriodLabel(payPeriod)}
          </div>
        </div>
      </div>

      {/* Week Rows Section */}
      <div className="mb-10">
        <h2 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#8a94a6',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '24px'
        }}>
          Hours & Rates
        </h2>

        <div style={{ marginBottom: '24px' }}>
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
        </div>

        {/* Divider between weeks */}
        <div style={{
          borderTop: '1px solid #2d3f50',
          margin: '32px 0'
        }}></div>

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
      <div className="mb-10">
        <div className="max-w-xs">
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            Tax Rate (optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="1"
              step="0.00001"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              disabled={readOnly}
              className="input-underline"
              style={{ width: '140px', height: '42px', fontSize: '16px' }}
              placeholder="0.04712"
            />
            <span style={{ fontSize: '12px', color: '#5a6478' }}>e.g., 0.04712 for Hawaii GET</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card-dark p-8 mb-10">
        <h2 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#8a94a6',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '20px'
        }}>
          Summary
        </h2>
        <div>
          <div className="flex justify-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', color: '#8a94a6' }}>Week 1 Total</span>
            <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${week1Amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', color: '#8a94a6' }}>Week 2 Total</span>
            <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${week2Amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: '#5a6478' }}>Total Hours</span>
            <span style={{ fontSize: '14px', color: '#5a6478' }}>{formData.week1Hours + formData.week2Hours} hours</span>
          </div>

          <div className="flex justify-between" style={{
            paddingTop: '16px',
            borderTop: '1px solid #2d3f50',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '15px', color: '#8a94a6', fontWeight: '500' }}>Subtotal</span>
            <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${subtotal.toFixed(2)}</span>
          </div>

          {taxRateValue > 0 && (
            <div className="flex justify-between" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', color: '#8a94a6' }}>
                Tax ({(taxRateValue * 100).toFixed(3)}%)
              </span>
              <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${taxAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center" style={{
            paddingTop: '16px',
            borderTop: '1px solid #2d3f50'
          }}>
            <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Total Amount</span>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80' }}>
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
          style={{
            width: '100%',
            padding: '18px 24px',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: isSubmitting || subtotal === 0
              ? 'rgba(61, 79, 95, 0.5)'
              : isResubmission
                ? '#5a4d2d'
                : '#3d4f5f',
            cursor: isSubmitting || subtotal === 0 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            border: 'none'
          }}
        >
          {isSubmitting ? 'Submitting...' : isResubmission ? 'Resubmit Timecard' : 'Submit Timecard'}
        </button>
      )}

      {readOnly && existingInvoice && (
        <div className="card-dark p-5 text-center">
          <p style={{ fontSize: '14px', color: '#8a94a6' }}>
            This timecard has already been submitted and is currently in{' '}
            <span style={{ color: '#ffffff', fontWeight: '500' }}>{existingInvoice.status.replace('_', ' ')}</span> status.
          </p>
        </div>
      )}
    </form>
  );
}
