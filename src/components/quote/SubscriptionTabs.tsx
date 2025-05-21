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
          <span className="ml-1 font-bold print:text-black">✓</span>
        )}
      </div>
      
      <div 
        className={getTabStyles('threeMonth')}
        onClick={() => handleTabClick('threeMonth')}
      >
        <span>3 Month</span>
        {subscriptionType === 'threeMonth' && (
          <span className="ml-1 font-bold print:text-black">✓</span>
        )}
      </div>
      
      <div 
        className={getTabStyles('yearly')}
        onClick={() => handleTabClick('yearly')}
      >
        <span>Annual (20% off)</span>
        {subscriptionType === 'yearly' && (
          <span className="ml-1 font-bold print:text-black">✓</span>
        )}
      </div>
      
      <div 
        className={getTabStyles('threeYear')}
        onClick={() => handleTabClick('threeYear')}
      >
        <span>3 Year (30% off)</span>
        {subscriptionType === 'threeYear' && (
          <span className="ml-1 font-bold print:text-black">✓</span>
        )}
      </div>
    </div>
  );
} 