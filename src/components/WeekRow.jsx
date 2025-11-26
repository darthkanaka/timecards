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
    <div>
      {/* Week Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '19px', color: '#ffffff', fontWeight: '500' }}>
          Week {weekNumber}
        </h3>
        <span style={{ fontSize: '14px', color: '#8a94a6' }}>{dateRange}</span>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
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
            className="input-underline"
            style={{ height: '44px', fontSize: '16px' }}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
            Hourly Rate ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={rate || ''}
            onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            className="input-underline"
            style={{ height: '44px', fontSize: '16px' }}
            placeholder="0.00"
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
            Amount
          </label>
          <div style={{
            color: '#ffffff',
            fontWeight: '500',
            fontSize: '16px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #2d3f50'
          }}>
            ${amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '500',
          color: '#8a94a6',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '14px'
        }}>
          Work Description / Notes
        </label>
        <textarea
          value={notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={readOnly}
          style={{
            width: '100%',
            minHeight: '110px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: '1px solid #2d3f50',
            color: '#ffffff',
            fontSize: '16px',
            padding: '10px 0',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit'
          }}
          placeholder="Describe work completed this week..."
        />
      </div>
    </div>
  );
}
