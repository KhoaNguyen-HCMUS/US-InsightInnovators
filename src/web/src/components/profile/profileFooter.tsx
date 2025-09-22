import { FaSave, FaExclamationTriangle, FaInfoCircle, FaClock, FaShieldAlt } from 'react-icons/fa';

interface ProfileFooterProps {
  isEditing: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  lastSaved?: Date;
}

export default function ProfileFooter({
  isEditing,
  hasChanges,
  onSave,
  onCancel,
  isSaving = false,
  lastSaved
}: ProfileFooterProps) {
  const formatLastSaved = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-6 border-l-4 border-success">
      {/* Save Actions */}
      {isEditing && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className={`inline-flex items-center px-8 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                hasChanges && !isSaving
                  ? 'bg-success text-success-foreground transform hover:-translate-y-0.5 hover:shadow-xl'
                  : 'bg-bg-muted text-text-disabled cursor-not-allowed'
              }`}
            >
              <FaSave className="mr-3" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
            
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex items-center px-8 py-4 bg-button-ghost-bg text-button-ghost-text border border-border-light hover:bg-button-ghost-hover rounded-lg font-medium transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Cancel
            </button>
          </div>
          
          {hasChanges && (
            <div className="flex items-center text-warning-foreground bg-warning-bg px-4 py-2 rounded-lg border border-warning-border">
              <FaExclamationTriangle className="mr-2 text-warning" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
        </div>
      )}

      {/* Last Saved Info */}
      {lastSaved && !isEditing && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-text-body bg-bg-muted px-4 py-2 rounded-lg border border-border-light">
            <FaClock className="mr-2 text-info" />
            <span className="text-sm font-medium">
              Last saved: {formatLastSaved(lastSaved)}
            </span>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-info-bg border border-info-border rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="p-2 bg-info rounded-lg">
              <FaShieldAlt className="h-5 w-5 text-info-foreground" />
            </div>
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-semibold text-text-header mb-2">
              Profile Update Impact
            </h4>
            <p className="text-sm text-text-body leading-relaxed">
              Updating your health profile will automatically recalculate your meal plans and nutritional recommendations. 
              This ensures your dietary guidance stays aligned with your current health status and goals.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-bg-muted rounded-lg border border-border-light">
        <div className="flex items-start">
          <FaInfoCircle className="h-4 w-4 text-text-muted mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-xs text-text-muted leading-relaxed">
            <strong>Note:</strong> All health calculations are estimates based on standard formulas. 
            For personalized medical advice, please consult with a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
