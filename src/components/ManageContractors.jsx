import { useState, useEffect, useCallback } from 'react';
import { getAllContractors, updateContractorStatus } from '../lib/api';

export default function ManageContractors({ onStatusChange }) {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadContractors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllContractors();
      setContractors(data);
    } catch (err) {
      console.error('Error loading contractors:', err);
      setError(err.message || 'Failed to load contractors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isExpanded) {
      loadContractors();
    }
  }, [isExpanded, loadContractors]);

  const handleToggle = async (contractor) => {
    try {
      setUpdatingId(contractor.id);
      setError(null);
      const newStatus = !contractor.is_active;
      await updateContractorStatus(contractor.id, newStatus);

      // Update local state
      setContractors(prev => prev.map(c =>
        c.id === contractor.id ? { ...c, is_active: newStatus } : c
      ));

      setSuccessMessage('Contractor status updated');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Notify parent if needed
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      console.error('Error updating contractor:', err);
      setError(err.message || 'Failed to update contractor status');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCount = contractors.filter(c => c.is_active).length;
  const totalCount = contractors.length;

  return (
    <div style={{
      backgroundColor: '#0d1b2a',
      border: '1px solid #2d3f50',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid #2d3f50' : 'none'
        }}
      >
        <div className="flex items-center gap-3">
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
            Manage Contractors
          </h3>
          {!isExpanded && totalCount > 0 && (
            <span style={{
              fontSize: '12px',
              color: '#8a94a6',
              backgroundColor: '#1b2838',
              padding: '4px 10px',
              borderRadius: '9999px'
            }}>
              {activeCount} of {totalCount} active
            </span>
          )}
        </div>
        <svg
          style={{
            width: '20px',
            height: '20px',
            color: '#8a94a6',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div>
          {/* Stats Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #2d3f50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', color: '#8a94a6' }}>
              <span style={{ color: '#4ade80', fontWeight: '600' }}>{activeCount}</span> of {totalCount} contractors active
            </span>
            <button
              onClick={loadContractors}
              disabled={loading}
              style={{
                padding: '6px',
                color: '#8a94a6',
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(45, 90, 61, 0.2)',
              borderBottom: '1px solid #2d3f50',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg style={{ width: '16px', height: '16px', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span style={{ fontSize: '13px', color: '#4ade80' }}>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid #2d3f50'
            }}>
              <span style={{ fontSize: '13px', color: '#f87171' }}>{error}</span>
            </div>
          )}

          {/* Contractor List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #3d4f5f',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#8a94a6', fontSize: '13px' }}>Loading contractors...</p>
              </div>
            ) : contractors.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ color: '#8a94a6', fontSize: '13px' }}>No contractors found</p>
              </div>
            ) : (
              contractors.map((contractor, idx) => (
                <div
                  key={contractor.id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: idx < contractors.length - 1 ? '1px solid #2d3f50' : 'none',
                    opacity: contractor.is_active ? 1 : 0.5,
                    transition: 'opacity 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Active indicator dot */}
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: contractor.is_active ? '#4ade80' : '#5a6478',
                        flexShrink: 0
                      }}></div>
                      <div>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: contractor.is_active ? '#ffffff' : '#8a94a6',
                          marginBottom: '4px'
                        }}>
                          {contractor.name}
                        </p>
                        {contractor.company && (
                          <p style={{ fontSize: '12px', color: '#5a6478', marginBottom: '2px' }}>
                            {contractor.company}
                          </p>
                        )}
                        <p style={{ fontSize: '12px', color: '#5a6478' }}>
                          {contractor.email}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(contractor)}
                      disabled={updatingId === contractor.id}
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: contractor.is_active ? '#2d5a3d' : '#3d4f5f',
                        border: 'none',
                        cursor: updatingId === contractor.id ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: updatingId === contractor.id ? 0.5 : 1,
                        flexShrink: 0
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: contractor.is_active ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: contractor.is_active ? '#4ade80' : '#8a94a6',
                        transition: 'left 0.2s, background-color 0.2s'
                      }}></div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
