export default function ContractorList({ contractors, notSubmitted = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="card-dark p-6 text-center">
        <div className="w-6 h-6 border-2 border-text-secondary border-t-white rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const notSubmittedIds = new Set(notSubmitted.map((c) => c.id));

  return (
    <div className="card-dark overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Contractors</h3>
        <span className="text-xs text-text-muted">
          {contractors?.length || 0} total
        </span>
      </div>

      {notSubmitted.length > 0 && (
        <div className="px-4 py-2 bg-status-warning/20 border-b border-status-warning/30">
          <p className="text-xs text-status-warning-text">
            <span className="font-medium">{notSubmitted.length}</span> contractor(s)
            have not submitted for the current period
          </p>
        </div>
      )}

      <div className="divide-y divide-dark-border">
        {(!contractors || contractors.length === 0) ? (
          <div className="p-4 text-center text-text-secondary text-sm">
            No contractors found.
          </div>
        ) : (
          contractors.map((contractor) => {
            const hasNotSubmitted = notSubmittedIds.has(contractor.id);

            return (
              <div
                key={contractor.id}
                className={`p-4 ${hasNotSubmitted ? 'bg-status-warning/10' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {contractor.name}
                    </p>
                    <p className="text-xs text-text-muted">{contractor.email}</p>
                  </div>
                  <div className="text-right">
                    {hasNotSubmitted ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-status-warning text-status-warning-text rounded-full">
                        Not Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-status-success text-status-success-text rounded-full">
                        Submitted
                      </span>
                    )}
                    <p className="text-xs text-text-muted mt-1">
                      ${contractor.default_hourly_rate}/hr
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <code className="text-xs text-text-muted bg-dark-elevated px-2 py-0.5 rounded">
                    /timecard/{contractor.url_token}
                  </code>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
