import { Branding } from '@/types/quote';

interface SuccessCriteriaProps {
  successCriteria: string;
  branding: Branding;
  onEdit?: (value: string) => void;
  isEditable?: boolean;
}

export function SuccessCriteria({ successCriteria, branding, onEdit, isEditable = false }: SuccessCriteriaProps) {
  const renderFormattedCriteria = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => (
      <div key={index} className="mb-1">
        {index + 1}. {line.replace(/^-\s*/, '')}
      </div>
    ));
  };

  return (
    <div className="mb-4 quote-section success-criteria">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        SUCCESS CRITERIA
      </h3>
      {isEditable ? (
        <div className="border border-gray-200 rounded-md p-2 bg-white">
          <textarea
            value={successCriteria}
            onChange={(e) => onEdit?.(e.target.value)}
            className="w-full h-24 text-sm border-none resize-none focus:outline-none"
            placeholder="Enter success criteria..."
          />
        </div>
      ) : (
        <div className="text-xs leading-tight text-gray-600">
          {renderFormattedCriteria(successCriteria)}
        </div>
      )}
    </div>
  );
} 