import { Branding, KeyTerms as KeyTermsType } from '@/types/quote';

interface KeyTermsProps {
  keyTerms: KeyTermsType;
  branding: Branding;
}

export function KeyTerms({ keyTerms, branding }: KeyTermsProps) {
  return (
    <div className="mb-8 quote-section key-terms">
      <h3 className="text-sm font-bold mb-4" style={{ color: branding.primaryColor }}>
        KEY TERMS
      </h3>
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200 w-1/3">Product</td>
              <td className="p-3">{keyTerms.product}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">Program</td>
              <td className="p-3">{keyTerms.program}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">Deployment</td>
              <td className="p-3">{keyTerms.deployment}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">Initial Term</td>
              <td className="p-3">{keyTerms.initialTerm}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">Start Date</td>
              <td className="p-3">{keyTerms.startDate}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">End Date</td>
              <td className="p-3">{keyTerms.endDate}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">Licenses</td>
              <td className="p-3">{keyTerms.licenses}</td>
            </tr>
            <tr>
              <td className="p-3 font-medium bg-gray-50 border-r border-gray-200">Renewal</td>
              <td className="p-3">{keyTerms.renewal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 