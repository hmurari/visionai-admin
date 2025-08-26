import { Branding } from '@/types/quote';

interface TermsAndConditionsProps {
  termsAndConditions: string;
  branding: Branding;
  onEdit?: (value: string) => void;
  isEditable?: boolean;
  isOrderForm?: boolean;
}

export function TermsAndConditions({ termsAndConditions, branding, onEdit, isEditable = false, isOrderForm = false }: TermsAndConditionsProps) {
  // Function to render text with markdown-style bold formatting
  const renderFormattedText = (text: string) => {
    // Split by **bold** markers and render accordingly
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold text-gray-800">{boldText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="mb-8 quote-section terms-and-conditions">
      <h3 className="text-sm font-bold mb-4" style={{ color: branding.primaryColor }}>
        TERMS & CONDITIONS
      </h3>
      {isEditable ? (
        <div className="border border-gray-200 rounded-md p-4 bg-white">
          <textarea
            value={termsAndConditions}
            onChange={(e) => onEdit?.(e.target.value)}
            className="w-full h-40 text-sm border-none resize-none focus:outline-none"
            placeholder="Enter terms and conditions..."
          />
        </div>
      ) : (
        <div className={isOrderForm ? "text-xs leading-snug text-gray-600" : "border border-gray-200 rounded-md p-4 bg-white"}>
          {isOrderForm ? (
            termsAndConditions.split('\n').map((line, index) => (
              <div key={index} className="mb-1">
                {renderFormattedText(line)}
              </div>
            ))
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {termsAndConditions}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 