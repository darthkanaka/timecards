import { getPayPeriodLabel, isCurrentPeriod, isFuturePeriod } from '../lib/payPeriod';

export default function PayPeriodNav({ payPeriod, onPrevious, onNext }) {
  const isCurrent = isCurrentPeriod(payPeriod);
  const nextPeriodIsFuture = isFuturePeriod({
    periodStart: new Date(payPeriod.periodStart.getTime() + 14 * 24 * 60 * 60 * 1000)
  });

  return (
    <div className="flex items-center justify-between card-dark p-3">
      <button
        onClick={onPrevious}
        className="p-2 rounded-lg hover:bg-dark-elevated transition-colors text-text-secondary hover:text-white"
        title="Previous pay period"
      >
        <svg
          className="w-5 h-5"
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
        <p className="text-sm font-medium text-white">
          {getPayPeriodLabel(payPeriod)}
        </p>
        {isCurrent && (
          <span className="text-xs text-status-info-text font-medium">Current Period</span>
        )}
        {!isCurrent && !isFuturePeriod(payPeriod) && (
          <span className="text-xs text-text-muted">Past Period</span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={nextPeriodIsFuture}
        className={`p-2 rounded-lg transition-colors ${
          nextPeriodIsFuture
            ? 'text-text-muted cursor-not-allowed'
            : 'hover:bg-dark-elevated text-text-secondary hover:text-white'
        }`}
        title={nextPeriodIsFuture ? "Can't view future periods" : 'Next pay period'}
      >
        <svg
          className="w-5 h-5"
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
