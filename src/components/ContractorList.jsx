export default function ContractorList({ contractors, notSubmitted = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const notSubmittedIds = new Set(notSubmitted.map((c) => c.id));

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Contractors</h3>
        <span className="text-xs text-gray-500">
          {contractors?.length || 0} total
        </span>
      </div>

      {notSubmitted.length > 0 && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
          <p className="text-xs text-yellow-800">
            <span className="font-medium">{notSubmitted.length}</span> contractor(s)
            have not submitted for the current period
          </p>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {(!contractors || contractors.length === 0) ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No contractors found.
          </div>
        ) : (
          contractors.map((contractor) => {
            const hasNotSubmitted = notSubmittedIds.has(contractor.id);

            return (
              <div
                key={contractor.id}
                className={`p-4 ${hasNotSubmitted ? 'bg-yellow-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {contractor.name}
                    </p>
                    <p className="text-xs text-gray-500">{contractor.email}</p>
                  </div>
                  <div className="text-right">
                    {hasNotSubmitted ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Not Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Submitted
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      ${contractor.default_hourly_rate}/hr
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <code className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
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
