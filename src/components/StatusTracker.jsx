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

export default function StatusTracker({ status, timestamps = {}, rejectionInfo = {} }) {
  const currentIndex = getStatusIndex(status);

  if (status === 'pending') {
    return (
      <div className="bg-status-warning/20 border border-status-warning/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-status-warning-text rounded-full"></div>
          <span className="text-sm font-medium text-status-warning-text">
            Pending Submission
          </span>
        </div>
        <p className="text-sm text-status-warning-text/80 mt-1">
          Your timecard for this pay period has not been submitted yet.
        </p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-status-error/20 border border-status-error/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-status-error-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-semibold text-status-error-text">
            Timecard Rejected
          </span>
        </div>
        {rejectionInfo.reason && (
          <div className="mt-3 bg-dark-elevated border border-status-error/30 rounded-md p-3">
            <p className="text-xs font-medium text-status-error-text mb-1">Rejection Reason:</p>
            <p className="text-sm text-white">{rejectionInfo.reason}</p>
          </div>
        )}
        <div className="mt-3 text-xs text-status-error-text/70">
          {rejectionInfo.rejectedBy && (
            <p>Rejected by: {rejectionInfo.rejectedBy}</p>
          )}
          {rejectionInfo.rejectedAt && (
            <p>
              {new Date(rejectionInfo.rejectedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
        <p className="text-sm text-status-error-text mt-3 font-medium">
          Please review the feedback, make any necessary changes, and resubmit your timecard.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark p-4">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">Invoice Status</h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-dark-border"></div>
        <div
          className="absolute left-3 top-3 w-0.5 bg-status-success-text transition-all duration-300"
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
                      ? 'bg-status-success'
                      : 'bg-dark-border'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5 text-status-success-text"
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
                    <div className="w-2 h-2 bg-text-muted rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-white' : 'text-text-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-status-info text-status-info-text text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {step.description}
                  </p>
                  {isCompleted && timestamps[step.key] && (
                    <p className="text-xs text-text-muted mt-1">
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
