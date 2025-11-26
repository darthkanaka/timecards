export default function ContractorList({ contractors, notSubmitted = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#0d1b2a',
        border: '1px solid #2d3f50',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid #3d4f5f',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  const notSubmittedIds = new Set(notSubmitted.map((c) => c.id));

  return (
    <div style={{
      backgroundColor: '#0d1b2a',
      border: '1px solid #2d3f50',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #2d3f50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#8a94a6',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          Contractors
        </h3>
        <span style={{ fontSize: '12px', color: '#5a6478' }}>
          {contractors?.length || 0} total
        </span>
      </div>

      {notSubmitted.length > 0 && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.25)'
        }}>
          <p style={{ fontSize: '12px', color: '#fbbf24' }}>
            <span style={{ fontWeight: '500' }}>{notSubmitted.length}</span> contractor(s)
            have not submitted for the current period
          </p>
        </div>
      )}

      <div>
        {(!contractors || contractors.length === 0) ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#8a94a6', fontSize: '14px' }}>
              No contractors found.
            </p>
          </div>
        ) : (
          contractors.map((contractor, idx) => {
            const hasNotSubmitted = notSubmittedIds.has(contractor.id);

            return (
              <div
                key={contractor.id}
                style={{
                  padding: '16px',
                  borderBottom: idx < contractors.length - 1 ? '1px solid #2d3f50' : 'none',
                  backgroundColor: hasNotSubmitted ? 'rgba(251, 191, 36, 0.08)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>
                      {contractor.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#5a6478' }}>{contractor.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {hasNotSubmitted ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                        color: '#fbbf24',
                        borderRadius: '9999px'
                      }}>
                        Not Submitted
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: 'rgba(52, 211, 153, 0.2)',
                        color: '#34d399',
                        borderRadius: '9999px'
                      }}>
                        Submitted
                      </span>
                    )}
                    <p style={{ fontSize: '12px', color: '#5a6478', marginTop: '6px' }}>
                      ${contractor.default_hourly_rate}/hr
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <code style={{
                    fontSize: '11px',
                    color: '#5a6478',
                    backgroundColor: '#1b2838',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
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
