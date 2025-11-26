const STATUS_CONFIG = {
  not_submitted: {
    label: 'Not Submitted',
    description: 'Timecard not yet submitted for this period',
    bgColor: 'bg-dark-elevated',
    textColor: 'text-text-secondary',
    borderColor: 'border-dark-border',
    badgeBg: 'bg-dark-border',
  },
  pending: {
    label: 'Not Submitted',
    description: 'Timecard not yet submitted for this period',
    bgColor: 'bg-dark-elevated',
    textColor: 'text-text-secondary',
    borderColor: 'border-dark-border',
    badgeBg: 'bg-dark-border',
  },
  submitted: {
    label: 'Submitted',
    description: 'Awaiting first approval',
    bgColor: 'bg-status-info/20',
    textColor: 'text-status-info-text',
    borderColor: 'border-status-info/50',
    badgeBg: 'bg-status-info',
  },
  approval_1: {
    label: 'First Approval',
    description: 'Awaiting second approval',
    bgColor: 'bg-purple-900/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    badgeBg: 'bg-purple-900/50',
  },
  approval_2: {
    label: 'Approved',
    description: 'Awaiting payment processing',
    bgColor: 'bg-indigo-900/20',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-900/50',
  },
  pending_payment: {
    label: 'Payment Processing',
    description: 'Payment is being processed',
    bgColor: 'bg-status-warning/20',
    textColor: 'text-status-warning-text',
    borderColor: 'border-status-warning/50',
    badgeBg: 'bg-status-warning',
  },
  paid: {
    label: 'Paid',
    description: 'Payment complete',
    bgColor: 'bg-status-success/20',
    textColor: 'text-status-success-text',
    borderColor: 'border-status-success/50',
    badgeBg: 'bg-status-success',
  },
  rejected: {
    label: 'Rejected',
    description: 'Timecard was rejected - please review and resubmit',
    bgColor: 'bg-status-error/20',
    textColor: 'text-status-error-text',
    borderColor: 'border-status-error/50',
    badgeBg: 'bg-status-error',
  },
};

export default function InvoiceStatusBadge({ status, showDescription = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${config.badgeBg} ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      {showDescription && (
        <p className={`text-sm mt-2 ${config.textColor} opacity-80`}>
          {config.description}
        </p>
      )}
    </div>
  );
}
