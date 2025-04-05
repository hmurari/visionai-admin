interface SubscriptionTabsProps {
  subscriptionType: string;
  className?: string;
  onSubscriptionChange?: (type: string) => void;
  interactive?: boolean;
}

export function SubscriptionTabs({ 
  subscriptionType, 
  className = '',
  onSubscriptionChange,
  interactive = false
}: SubscriptionTabsProps) {
  const handleTabClick = (type: string) => {
    if (interactive && onSubscriptionChange) {
      onSubscriptionChange(type);
    }
  };

  const getTabStyles = (type: string) => {
    const isSelected = subscriptionType === type;
    const baseStyles = "px-2 py-1 text-xs rounded-md flex items-center";
    const selectedStyles = "bg-blue-100 text-blue-800 border border-blue-300";
    const unselectedStyles = "bg-gray-100 text-gray-600";
    const interactiveStyles = interactive ? "cursor-pointer hover:bg-gray-200" : "";
    
    return `${baseStyles} ${isSelected ? selectedStyles : unselectedStyles} ${interactive && !isSelected ? interactiveStyles : ""}`;
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div 
        className={getTabStyles('monthly')}
        onClick={() => handleTabClick('monthly')}
      >
        <span>Monthly</span>
        {subscriptionType === 'monthly' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div 
        className={getTabStyles('yearly')}
        onClick={() => handleTabClick('yearly')}
      >
        <span>Annual (20% off)</span>
        {subscriptionType === 'yearly' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div 
        className={getTabStyles('threeYear')}
        onClick={() => handleTabClick('threeYear')}
      >
        <span>3 Year (30% off)</span>
        {subscriptionType === 'threeYear' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
} 