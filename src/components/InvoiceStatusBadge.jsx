const STATUS_CONFIG = {
  not_submitted: {
    label: 'Not Submitted',
    description: 'Timecard not yet submitted for this period',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  pending: {
    label: 'Not Submitted',
    description: 'Timecard not yet submitted for this period',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  submitted: {
    label: 'Submitted',
    description: 'Awaiting first approval',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  approval_1: {
    label: 'First Approval',
    description: 'Awaiting second approval',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  approval_2: {
    label: 'Approved',
    description: 'Awaiting payment processing',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  pending_payment: {
    label: 'Payment Processing',
    description: 'Payment is being processed',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  paid: {
    label: 'Paid',
    description: 'Payment complete',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
};

export default function InvoiceStatusBadge({ status, showDescription = true }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      {showDescription && (
        <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
          {config.description}
        </p>
      )}
    </div>
  );
}
