import { getPayPeriodLabel, isCurrentPeriod, isFuturePeriod } from '../lib/payPeriod';

export default function PayPeriodNav({ payPeriod, onPrevious, onNext }) {
  const isCurrent = isCurrentPeriod(payPeriod);
  const nextPeriodIsFuture = isFuturePeriod({
    periodStart: new Date(payPeriod.periodStart.getTime() + 14 * 24 * 60 * 60 * 1000)
  });

  return (
    <div className="flex items-center justify-between" style={{
      backgroundColor: '#0d1b2a',
      border: '1px solid #2d3f50',
      borderRadius: '8px',
      padding: '16px 20px'
    }}>
      <button
        onClick={onPrevious}
        style={{
          padding: '10px',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#8a94a6',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1b2838';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#8a94a6';
        }}
        title="Previous pay period"
      >
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="text-center">
        <p style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>
          {getPayPeriodLabel(payPeriod)}
        </p>
        {isCurrent && (
          <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '500' }}>Current Period</span>
        )}
        {!isCurrent && !isFuturePeriod(payPeriod) && (
          <span style={{ fontSize: '12px', color: '#5a6478' }}>Past Period</span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={nextPeriodIsFuture}
        style={{
          padding: '10px',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: nextPeriodIsFuture ? '#3d4f5f' : '#8a94a6',
          cursor: nextPeriodIsFuture ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!nextPeriodIsFuture) {
            e.currentTarget.style.backgroundColor = '#1b2838';
            e.currentTarget.style.color = '#ffffff';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = nextPeriodIsFuture ? '#3d4f5f' : '#8a94a6';
        }}
        title={nextPeriodIsFuture ? "Can't view future periods" : 'Next pay period'}
      >
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
