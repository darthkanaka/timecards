export default function ContractorList({ contractors, notSubmitted = [], isLoading = false, onSendReminder }) {
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
  const activeContractors = contractors?.filter(c => c.is_active) || [];
  const inactiveContractors = contractors?.filter(c => !c.is_active) || [];

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
          {activeContractors.length} active{inactiveContractors.length > 0 ? `, ${inactiveContractors.length} inactive` : ''}
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
            const isInactive = !contractor.is_active;
            const hasNotSubmitted = !isInactive && notSubmittedIds.has(contractor.id);

            return (
              <div
                key={contractor.id}
                style={{
                  padding: '16px',
                  borderBottom: idx < contractors.length - 1 ? '1px solid #2d3f50' : 'none',
                  backgroundColor: hasNotSubmitted ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                  opacity: isInactive ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: isInactive ? '#8a94a6' : '#ffffff' }}>
                      {contractor.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#5a6478' }}>{contractor.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {isInactive ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        backgroundColor: 'rgba(90, 100, 120, 0.2)',
                        color: '#8a94a6',
                        borderRadius: '9999px'
                      }}>
                        Inactive
                      </span>
                    ) : hasNotSubmitted ? (
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
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <code style={{
                    fontSize: '11px',
                    color: '#5a6478',
                    backgroundColor: '#1b2838',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    /timecard/{contractor.url_token}
                  </code>
                  {onSendReminder && hasNotSubmitted && !isInactive && (
                    <button
                      onClick={() => onSendReminder(contractor)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#60a5fa',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                      }}
                    >
                      <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Remind
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
