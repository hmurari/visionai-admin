import { Branding } from '@/types/quote';

interface SuccessCriteriaProps {
  successCriteria: string;
  branding: Branding;
  onEdit?: (value: string) => void;
  isEditable?: boolean;
}

export function SuccessCriteria({ successCriteria, branding, onEdit, isEditable = false }: SuccessCriteriaProps) {
  return (
    <div className="mb-6 quote-section success-criteria">
      <h3 className="text-sm font-bold mb-3" style={{ color: branding.primaryColor }}>
        SUCCESS CRITERIA
      </h3>
      <div className="border border-gray-200 rounded-md p-3 bg-white">
        {isEditable ? (
          <textarea
            value={successCriteria}
            onChange={(e) => onEdit?.(e.target.value)}
            className="w-full h-32 text-sm border-none resize-none focus:outline-none"
            placeholder="Enter success criteria..."
          />
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {successCriteria}
          </div>
        )}
      </div>
    </div>
  );
} 