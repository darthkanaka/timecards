import { getPayPeriodLabel, isCurrentPeriod, isFuturePeriod } from '../lib/payPeriod';

export default function PayPeriodNav({ payPeriod, onPrevious, onNext }) {
  const isCurrent = isCurrentPeriod(payPeriod);
  const nextPeriodIsFuture = isFuturePeriod({
    periodStart: new Date(payPeriod.periodStart.getTime() + 14 * 24 * 60 * 60 * 1000)
  });

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
      <button
        onClick={onPrevious}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
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
        <p className="text-sm font-semibold text-gray-900">
          {getPayPeriodLabel(payPeriod)}
        </p>
        {isCurrent && (
          <span className="text-xs text-blue-600 font-medium">Current Period</span>
        )}
        {!isCurrent && !isFuturePeriod(payPeriod) && (
          <span className="text-xs text-gray-500">Past Period</span>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={nextPeriodIsFuture}
        className={`p-2 rounded-lg transition-colors ${
          nextPeriodIsFuture
            ? 'text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
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
