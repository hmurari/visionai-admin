import { Branding } from '@/types/quote';

interface SignaturePageProps {
  branding: Branding;
  visionifySignature?: {
    company: string;
    authorizedSignature: string;
    signeeName: string;
    signeeTitle: string;
    companyAddress: string;
    date: string;
  };
  customerSignature?: {
    company: string;
    authorizedSignature: string;
    signeeName: string;
    signeeTitle: string;
    companyAddress: string;
    date: string;
  };
  onVisionifySignatureChange?: (signature: any) => void;
  onCustomerSignatureChange?: (signature: any) => void;
  isEditable?: boolean;
  isWideFormat?: boolean;
}

export function SignaturePage({ 
  branding, 
  visionifySignature, 
  customerSignature, 
  onVisionifySignatureChange,
  onCustomerSignatureChange,
  isEditable = false,
  isWideFormat = false 
}: SignaturePageProps) {
  return (
    <div className="mb-8 quote-section signature-page">
      <h3 className="text-sm font-bold mb-6 text-center" style={{ color: branding.primaryColor }}>
        SIGNATURES
      </h3>
      
      <div className={`grid gap-8 ${isWideFormat ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* Visionify Signature */}
        <div className="border border-gray-200 rounded-md p-6">
          <h4 className="font-bold mb-4 text-center" style={{ color: branding.primaryColor }}>
            VISIONIFY INC.
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="text"
                    value={visionifySignature?.company || 'Visionify Inc.'}
                    onChange={(e) => onVisionifySignatureChange?.({...visionifySignature, company: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{visionifySignature?.company || 'Visionify Inc.'}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Authorized Signature</label>
              <div className="border-b border-gray-300 pb-1 h-8">
                {isEditable ? (
                  <input
                    type="text"
                    value={visionifySignature?.authorizedSignature || ''}
                    onChange={(e) => onVisionifySignatureChange?.({...visionifySignature, authorizedSignature: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{visionifySignature?.authorizedSignature}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Signee Name</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="text"
                    value={visionifySignature?.signeeName || ''}
                    onChange={(e) => onVisionifySignatureChange?.({...visionifySignature, signeeName: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{visionifySignature?.signeeName}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Signee Title</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="text"
                    value={visionifySignature?.signeeTitle || ''}
                    onChange={(e) => onVisionifySignatureChange?.({...visionifySignature, signeeTitle: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{visionifySignature?.signeeTitle}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Address</label>
              <div className="border-b border-gray-300 pb-1 h-12">
                {isEditable ? (
                  <textarea
                    value={visionifySignature?.companyAddress || '1499, W 120th Ave, Ste 110\nWestminster, CO 80234'}
                    onChange={(e) => onVisionifySignatureChange?.({...visionifySignature, companyAddress: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none resize-none h-12"
                  />
                ) : (
                  <div className="text-sm whitespace-pre-line h-12 flex items-start">{visionifySignature?.companyAddress || '1499, W 120th Ave, Ste 110\nWestminster, CO 80234'}</div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="date"
                    value={visionifySignature?.date || ''}
                    onChange={(e) => onVisionifySignatureChange?.({...visionifySignature, date: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{visionifySignature?.date}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Signature */}
        <div className="border border-gray-200 rounded-md p-6">
          <h4 className="font-bold mb-4 text-center" style={{ color: branding.primaryColor }}>
            CUSTOMER
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="text"
                    value={customerSignature?.company || ''}
                    onChange={(e) => onCustomerSignatureChange?.({...customerSignature, company: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{customerSignature?.company}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Authorized Signature</label>
              <div className="border-b border-gray-300 pb-1 h-8">
                {isEditable ? (
                  <input
                    type="text"
                    value={customerSignature?.authorizedSignature || ''}
                    onChange={(e) => onCustomerSignatureChange?.({...customerSignature, authorizedSignature: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{customerSignature?.authorizedSignature}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Signee Name</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="text"
                    value={customerSignature?.signeeName || ''}
                    onChange={(e) => onCustomerSignatureChange?.({...customerSignature, signeeName: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{customerSignature?.signeeName}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Signee Title</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="text"
                    value={customerSignature?.signeeTitle || ''}
                    onChange={(e) => onCustomerSignatureChange?.({...customerSignature, signeeTitle: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{customerSignature?.signeeTitle}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Address</label>
              <div className="border-b border-gray-300 pb-1 h-12">
                {isEditable ? (
                  <textarea
                    value={customerSignature?.companyAddress || ''}
                    onChange={(e) => onCustomerSignatureChange?.({...customerSignature, companyAddress: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none resize-none h-12"
                    placeholder="Company Address Line 1&#10;Company Address Line 2"
                  />
                ) : (
                  <div className="text-sm whitespace-pre-line h-12 flex items-start">{customerSignature?.companyAddress || ''}</div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <div className="border-b border-gray-300 pb-1">
                {isEditable ? (
                  <input
                    type="date"
                    value={customerSignature?.date || ''}
                    onChange={(e) => onCustomerSignatureChange?.({...customerSignature, date: e.target.value})}
                    className="w-full text-sm border-none focus:outline-none"
                  />
                ) : (
                  <span className="text-sm">{customerSignature?.date}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 