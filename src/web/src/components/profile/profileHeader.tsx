import { FaUser, FaEdit, FaSave, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
  isEditing: boolean;
  consentGranted: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileHeader({
  userName,
  userEmail,
  isEditing,
  consentGranted,
  onEditToggle,
  onSave,
  onCancel
}: ProfileHeaderProps) {
  return (
    <div className="bg-bg-card rounded-lg shadow-md p-6 mb-6 border-l-4 border-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-linear-(--gradient-primary) rounded-full flex items-center justify-center shadow-lg">
            <FaUser className="text-primary text-2xl" />
          </div>
          
          {/* User Info */}
          <div>
            <h1 className="text-2xl font-bold text-text-header">
              {userName || 'User Profile'}
            </h1>
            <p className="text-text-body">{userEmail}</p>
            
            {/* Consent Status */}
            <div className="flex items-center mt-2">
              <span className="text-sm text-text-muted mr-2">Consent:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                consentGranted 
                  ? 'bg-success-bg text-success-foreground' 
                  : 'bg-error-bg text-error-foreground'
              }`}>
                {consentGranted ? (
                  <>
                    <FaCheckCircle className="mr-1 text-success" />
                    Granted
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="mr-1 text-error" />
                    Not granted
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="inline-flex items-center px-6 py-3 bg-success text-success-foreground text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaSave className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center px-6 py-3 bg-button-ghost-bg text-button-ghost-text border border-border-light hover:bg-button-ghost-hover text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onEditToggle}
              className="inline-flex items-center px-6 py-3 bg-button-bg text-button-text hover:bg-button-hover text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
