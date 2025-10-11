import { FaCamera, FaUserEdit, FaPlus } from 'react-icons/fa';
import type { QuickAction } from '../../types/dashboard';

interface QuickActionsProps {
  actions: QuickAction[];
  onScan: () => void;
  onEditProfile?: () => void;
}

export default function QuickActions({ 
  actions, 
  onScan
}: QuickActionsProps) {
  const getActionIcon = (type: string) => {
    if (type === 'scan') {
      return <FaCamera className="text-blue-500" />;
    } else if (type === 'edit_profile') {
      return <FaUserEdit className="text-green-500" />;
    } else {
      return <FaPlus className="text-text-body" />;
    }
  };

  const getActionColor = (type: string) => {
    if (type === 'scan') {
      return 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200';
    } else if (type === 'edit_profile') {
      return 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200';
    } else {
      return 'bg-bg-muted hover:bg-bg-muted/80 text-text-body';
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.type === 'scan') {
      onScan();
    } else {
      action.action();
    }
  };

  return (
    <div className="bg-bg-card rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <div className="p-1.5 bg-primary rounded-lg mr-2">
          <FaPlus className="text-primary-contrast text-lg" />
        </div>
        <h2 className="text-lg font-semibold text-text-header">
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Chỉ hiển thị 2 actions đầu tiên */}
        {actions.slice(0, 2).map(action => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className={`p-3 rounded-lg border border-transparent hover:border-primary/50 transition-all duration-200 ${getActionColor(action.type)}`}
          >
            <div className="flex items-center">
              <div className="p-1.5 bg-bg rounded-lg mr-2">
                {getActionIcon(action.type)}
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {action.title}
                </h3>
                <p className="text-xs opacity-80 truncate">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
