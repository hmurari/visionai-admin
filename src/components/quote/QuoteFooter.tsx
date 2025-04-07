import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ExternalLink } from 'lucide-react';

interface QuoteFooterProps {
  quoteId?: string;
  pdfMode?: boolean;
}

export const QuoteFooter = React.memo(({ quoteId, pdfMode = false }: QuoteFooterProps) => {
  // Always call useQuery, but with an empty string if quoteId is undefined
  const checkoutLink = useQuery(api.subscriptions.getCheckoutLinkForQuote, { 
    quoteId: quoteId || "" 
  });
  
  return (
    <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500 quote-section quote-footer">
      <div className="flex flex-col gap-1">
        <p>Thank you for your business. We look forward to working with you!</p>
        <p>For any questions, please contact us at <a href="mailto:sales@visionify.ai" className="text-blue-600">sales@visionify.ai</a></p>
        {quoteId && (
          <p className="text-xs text-gray-400">Quote ID: {quoteId}</p>
        )}
        
        {/* Display payment link if available */}
        {quoteId && checkoutLink && checkoutLink.checkoutUrl && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="font-medium text-blue-800">Complete your purchase online:</p>
            
            {/* Web view button */}
            {!pdfMode && (
              <a 
                href={checkoutLink.checkoutUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors pdf-payment-link"
                data-url={checkoutLink.checkoutUrl}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Pay Now
              </a>
            )}
            
            {/* PDF clickable link */}
            {pdfMode && (
              <div className="mt-2">
                <a 
                  href={checkoutLink.checkoutUrl}
                  data-url={checkoutLink.checkoutUrl}
                  className="pdf-payment-link text-blue-600 underline break-all"
                >
                  {checkoutLink.checkoutUrl}
                </a>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Valid until: {new Date(checkoutLink.expiresAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// Add display name to help with debugging
QuoteFooter.displayName = 'QuoteFooter'; 