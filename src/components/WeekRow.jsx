import { formatDateRange } from '../lib/payPeriod';

export default function WeekRow({
  weekNumber,
  weekStart,
  weekEnd,
  hours,
  rate,
  notes,
  onHoursChange,
  onRateChange,
  onNotesChange,
  readOnly = false,
}) {
  const dateRange = formatDateRange(weekStart, weekEnd);
  const amount = (hours || 0) * (rate || 0);

  return (
    <div className="card-dark p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-medium">Week {weekNumber}</h3>
        <span className="text-text-secondary text-sm">{dateRange}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="label-dark">Hours Worked</label>
          <input
            type="number"
            min="0"
            max="168"
            step="0.5"
            value={hours || ''}
            onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            className="input-underline"
            placeholder="0"
          />
        </div>

        <div>
          <label className="label-dark">Hourly Rate ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={rate || ''}
            onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            className="input-underline"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="label-dark">Amount</label>
          <div className="text-white font-medium py-2 border-b border-dark-border">
            ${amount.toFixed(2)}
          </div>
        </div>
      </div>

      <div>
        <label className="label-dark">Work Description / Notes</label>
        <textarea
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={readOnly}
          rows={2}
          className="input-underline resize-none"
          placeholder="Describe work completed this week..."
        />
      </div>
    </div>
  );
}
