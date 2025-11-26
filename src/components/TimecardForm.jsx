import { useState, useEffect } from 'react';
import WeekRow from './WeekRow';
import { getPayPeriodLabel } from '../lib/payPeriod';

export default function TimecardForm({
  contractor,
  payPeriod,
  existingInvoice,
  onSubmit,
  isSubmitting = false,
  readOnly = false,
  isResubmission = false,
}) {
  const [formData, setFormData] = useState({
    week1Hours: 0,
    week1Rate: contractor?.default_hourly_rate || 0,
    week1Notes: '',
    week2Hours: 0,
    week2Rate: contractor?.default_hourly_rate || 0,
    week2Notes: '',
    taxRate: '',
  });

  const [expenses, setExpenses] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setFormData({
      week1Hours: existingInvoice?.week_1_hours || 0,
      week1Rate: existingInvoice?.week_1_rate || contractor?.default_hourly_rate || 0,
      week1Notes: existingInvoice?.week_1_notes || '',
      week2Hours: existingInvoice?.week_2_hours || 0,
      week2Rate: existingInvoice?.week_2_rate || contractor?.default_hourly_rate || 0,
      week2Notes: existingInvoice?.week_2_notes || '',
      taxRate: existingInvoice?.tax_rate || '',
    });
    // Load existing expenses if any
    if (existingInvoice?.expenses) {
      try {
        const parsed = typeof existingInvoice.expenses === 'string'
          ? JSON.parse(existingInvoice.expenses)
          : existingInvoice.expenses;
        setExpenses(Array.isArray(parsed) ? parsed : []);
      } catch {
        setExpenses([]);
      }
    } else {
      setExpenses([]);
    }
  }, [existingInvoice, contractor?.default_hourly_rate]);

  const week1Amount = formData.week1Hours * formData.week1Rate;
  const week2Amount = formData.week2Hours * formData.week2Rate;
  const subtotal = week1Amount + week2Amount;

  const taxRateValue = formData.taxRate === '' ? 0 : parseFloat(formData.taxRate) || 0;
  const taxAmount = subtotal * taxRateValue;
  const laborTotal = subtotal + taxAmount;

  // Calculate total expenses (not affected by tax)
  const expensesTotal = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const totalAmount = laborTotal + expensesTotal;

  const addExpense = () => {
    setExpenses([...expenses, { merchant: '', description: '', amount: '' }]);
  };

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    if (!readOnly && onSubmit) {
      onSubmit({
        ...formData,
        taxRate: taxRateValue || null,
        taxAmount: taxRateValue ? taxAmount : null,
        expenses: expenses.filter(exp => exp.merchant || exp.amount),
        expensesTotal,
        totalAmount,
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmitClick}>
        {/* Contractor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              Contractor Name
            </label>
            <div style={{
              color: '#ffffff',
              fontWeight: '500',
              fontSize: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid #2d3f50'
            }}>
              {contractor?.name || 'Unknown'}
            </div>
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              Pay Period
            </label>
            <div style={{
              color: '#ffffff',
              fontWeight: '500',
              fontSize: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid #2d3f50'
            }}>
              {getPayPeriodLabel(payPeriod)}
            </div>
          </div>
        </div>

        {/* Week Rows Section */}
        <div className="mb-10">
          <h2 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '24px'
          }}>
            Hours & Rates
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <WeekRow
              weekNumber={1}
              weekStart={payPeriod.week1.start}
              weekEnd={payPeriod.week1.end}
              hours={formData.week1Hours}
              rate={formData.week1Rate}
              notes={formData.week1Notes}
              onHoursChange={(v) => setFormData({ ...formData, week1Hours: v })}
              onRateChange={(v) => setFormData({ ...formData, week1Rate: v })}
              onNotesChange={(v) => setFormData({ ...formData, week1Notes: v })}
              readOnly={readOnly}
            />
          </div>

          {/* Divider between weeks */}
          <div style={{
            borderTop: '1px solid #2d3f50',
            margin: '32px 0'
          }}></div>

          <WeekRow
            weekNumber={2}
            weekStart={payPeriod.week2.start}
            weekEnd={payPeriod.week2.end}
            hours={formData.week2Hours}
            rate={formData.week2Rate}
            notes={formData.week2Notes}
            onHoursChange={(v) => setFormData({ ...formData, week2Hours: v })}
            onRateChange={(v) => setFormData({ ...formData, week2Rate: v })}
            onNotesChange={(v) => setFormData({ ...formData, week2Notes: v })}
            readOnly={readOnly}
          />
        </div>

        {/* Tax Rate */}
        <div className="mb-10">
          <div className="max-w-xs">
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              color: '#8a94a6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px'
            }}>
              Tax Rate (optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="1"
                step="0.00001"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                disabled={readOnly}
                className="input-filled"
                style={{ width: '160px' }}
                placeholder="0.04712"
              />
              <span style={{ fontSize: '12px', color: '#5a6478' }}>e.g., 0.04712 for Hawaii GET</span>
            </div>
          </div>
        </div>

        {/* Expense Reimbursements Section */}
        <div className="mb-10">
          <div style={{
            borderTop: '1px solid #2d3f50',
            paddingTop: '32px'
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div>
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#8a94a6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Expense Reimbursements
                </h2>
                <p style={{ fontSize: '12px', color: '#5a6478', marginTop: '4px' }}>
                  Not subject to tax
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={addExpense}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    backgroundColor: '#1b2838',
                    color: '#60a5fa',
                    border: '1px solid #2d3f50',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  + Add Expense
                </button>
              )}
            </div>

            {expenses.length === 0 ? (
              <div style={{
                backgroundColor: '#0d1b2a',
                border: '1px dashed #2d3f50',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '14px', color: '#5a6478' }}>
                  No expense reimbursements added
                </p>
                {!readOnly && (
                  <p style={{ fontSize: '12px', color: '#5a6478', marginTop: '8px' }}>
                    Click "Add Expense" to include reimbursable purchases
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {expenses.map((expense, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#0d1b2a',
                      border: '1px solid #2d3f50',
                      borderRadius: '8px',
                      padding: '20px'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#8a94a6', fontWeight: '500' }}>
                        Expense #{index + 1}
                      </span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => removeExpense(index)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#f87171',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: '#8a94a6',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: '10px'
                        }}>
                          Merchant / Vendor
                        </label>
                        <input
                          type="text"
                          value={expense.merchant}
                          onChange={(e) => updateExpense(index, 'merchant', e.target.value)}
                          disabled={readOnly}
                          className="input-filled"
                          placeholder="e.g., Home Depot, Amazon"
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: '#8a94a6',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: '10px'
                        }}>
                          Amount ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={expense.amount}
                          onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                          disabled={readOnly}
                          className="input-filled"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#8a94a6',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '10px'
                      }}>
                        Description / Reason for Purchase
                      </label>
                      <textarea
                        value={expense.description}
                        onChange={(e) => updateExpense(index, 'description', e.target.value)}
                        disabled={readOnly}
                        className="textarea-filled"
                        style={{ minHeight: '80px' }}
                        placeholder="Explain why this purchase was made and how it relates to your work..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="card-dark p-8 mb-10">
          <h2 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#8a94a6',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '20px'
          }}>
            Summary
          </h2>
          <div>
            <div className="flex justify-between" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', color: '#8a94a6' }}>Week 1 Total</span>
              <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${week1Amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', color: '#8a94a6' }}>Week 2 Total</span>
              <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${week2Amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#5a6478' }}>Total Hours</span>
              <span style={{ fontSize: '14px', color: '#5a6478' }}>{formData.week1Hours + formData.week2Hours} hours</span>
            </div>

            <div className="flex justify-between" style={{
              paddingTop: '16px',
              borderTop: '1px solid #2d3f50',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '15px', color: '#8a94a6', fontWeight: '500' }}>Labor Subtotal</span>
              <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${subtotal.toFixed(2)}</span>
            </div>

            {taxRateValue > 0 && (
              <div className="flex justify-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', color: '#8a94a6' }}>
                  Tax ({(taxRateValue * 100).toFixed(3)}%)
                </span>
                <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${taxAmount.toFixed(2)}</span>
              </div>
            )}

            {expensesTotal > 0 && (
              <div className="flex justify-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', color: '#8a94a6' }}>
                  Expense Reimbursements ({expenses.filter(e => parseFloat(e.amount) > 0).length} item{expenses.filter(e => parseFloat(e.amount) > 0).length !== 1 ? 's' : ''})
                </span>
                <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>${expensesTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center" style={{
              paddingTop: '16px',
              borderTop: '1px solid #2d3f50'
            }}>
              <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Total Amount</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#4ade80' }}>
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting || (subtotal === 0 && expensesTotal === 0)}
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '16px',
              color: '#ffffff',
              backgroundColor: isSubmitting || (subtotal === 0 && expensesTotal === 0)
                ? 'rgba(61, 79, 95, 0.5)'
                : isResubmission
                  ? '#5a4d2d'
                  : '#3d4f5f',
              cursor: isSubmitting || (subtotal === 0 && expensesTotal === 0) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              border: 'none'
            }}
          >
            {isSubmitting ? 'Submitting...' : isResubmission ? 'Resubmit Timecard' : 'Submit Timecard'}
          </button>
        )}

        {readOnly && existingInvoice && (
          <div className="card-dark p-5 text-center">
            <p style={{ fontSize: '14px', color: '#8a94a6' }}>
              This timecard has already been submitted and is currently in{' '}
              <span style={{ color: '#ffffff', fontWeight: '500' }}>{existingInvoice.status.replace('_', ' ')}</span> status.
            </p>
          </div>
        )}
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0d1b2a',
              border: '1px solid #2d3f50',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Confirm Submission
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#8a94a6',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Please review your timecard before submitting
            </p>

            {/* Summary in Modal */}
            <div style={{
              backgroundColor: '#1b2838',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: '#8a94a6', marginBottom: '4px' }}>Pay Period</p>
                <p style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>
                  {getPayPeriodLabel(payPeriod)}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #2d3f50', paddingTop: '16px' }}>
                <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#8a94a6' }}>Week 1</span>
                  <span style={{ fontSize: '14px', color: '#ffffff' }}>
                    {formData.week1Hours} hrs × ${formData.week1Rate}/hr = ${week1Amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#8a94a6' }}>Week 2</span>
                  <span style={{ fontSize: '14px', color: '#ffffff' }}>
                    {formData.week2Hours} hrs × ${formData.week2Rate}/hr = ${week2Amount.toFixed(2)}
                  </span>
                </div>

                {taxRateValue > 0 && (
                  <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#8a94a6' }}>Tax ({(taxRateValue * 100).toFixed(3)}%)</span>
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>${taxAmount.toFixed(2)}</span>
                  </div>
                )}

                {expensesTotal > 0 && (
                  <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#8a94a6' }}>
                      Expenses ({expenses.filter(e => parseFloat(e.amount) > 0).length} item{expenses.filter(e => parseFloat(e.amount) > 0).length !== 1 ? 's' : ''})
                    </span>
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>${expensesTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between" style={{
                  borderTop: '1px solid #2d3f50',
                  paddingTop: '12px',
                  marginTop: '12px'
                }}>
                  <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#4ade80' }}>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '15px',
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  border: '1px solid #2d3f50',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '15px',
                  color: '#ffffff',
                  backgroundColor: isResubmission ? '#5a4d2d' : '#2d5a3d',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
