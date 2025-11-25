const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', description: 'Timecard submitted' },
  { key: 'approval_1', label: 'First Approval', description: 'Awaiting first approval' },
  { key: 'approval_2', label: 'Second Approval', description: 'Awaiting second approval' },
  { key: 'pending_payment', label: 'Payment Processing', description: 'Approved, payment in process' },
  { key: 'paid', label: 'Paid', description: 'Payment complete' },
];

function getStatusIndex(status) {
  if (status === 'pending') return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function StatusTracker({ status, timestamps = {} }) {
  const currentIndex = getStatusIndex(status);

  if (status === 'pending') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-sm font-medium text-yellow-800">
            Pending Submission
          </span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Your timecard for this pay period has not been submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Invoice Status</h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200"></div>
        <div
          className="absolute left-3 top-3 w-0.5 bg-green-500 transition-all duration-300"
          style={{
            height: `${Math.max(0, currentIndex) * 60 + (currentIndex >= 0 ? 20 : 0)}px`,
          }}
        ></div>

        {/* Steps */}
        <div className="space-y-4">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex items-start gap-3 relative">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5 text-white"
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
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {step.description}
                  </p>
                  {isCompleted && timestamps[step.key] && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(timestamps[step.key]).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
