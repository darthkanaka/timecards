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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Week {weekNumber}</h3>
        <span className="text-sm text-gray-500">{dateRange}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hours Worked
          </label>
          <input
            type="number"
            min="0"
            max="168"
            step="0.5"
            value={hours || ''}
            onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              readOnly ? 'bg-gray-100 text-gray-600' : 'bg-white'
            }`}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={rate || ''}
            onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              readOnly ? 'bg-gray-100 text-gray-600' : 'bg-white'
            }`}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Amount
          </label>
          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm font-medium text-gray-700">
            ${amount.toFixed(2)}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Work Description / Notes
        </label>
        <textarea
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={readOnly}
          rows={2}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            readOnly ? 'bg-gray-100 text-gray-600' : 'bg-white'
          }`}
          placeholder="Describe work completed this week..."
        />
      </div>
    </div>
  );
}
