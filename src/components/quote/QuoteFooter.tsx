interface QuoteFooterProps {}

export function QuoteFooter({}: QuoteFooterProps) {
  return (
    <div className="mt-8 text-center border-t border-gray-200 pt-4 footer-section">
      <p className="text-sm text-gray-600">
        Quote valid for 30 days from the date of issue. For questions regarding this quote, please contact sales@visionify.ai
      </p>
    </div>
  );
} 