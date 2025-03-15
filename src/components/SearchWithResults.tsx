import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SearchWithResults({ 
  placeholder, 
  onSearch, 
  onSelect, 
  selectedItems = [],
  getResultLabel,
  getResultIcon,
  getResultType,
  results,
  resultGroups,
  clearSelection
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(!!value);
    onSearch(value);
  };
  
  // Handle result selection
  const handleResultClick = (item) => {
    onSelect(item);
    setShowResults(false);
    // Clear the search term after selection
    setSearchTerm("");
  };
  
  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchTerm) {
      setShowResults(true);
    }
  };
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative flex-grow" ref={searchContainerRef}>
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={placeholder}
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
          />
          
          {/* Instant search results dropdown */}
          {showResults && results.length > 0 && (
            <div 
              className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {resultGroups.map(group => {
                const groupResults = results.filter(item => getResultType(item) === group.type);
                
                if (groupResults.length === 0) return null;
                
                return (
                  <div key={group.type}>
                    <div className="p-2 text-xs font-medium text-gray-500 uppercase">
                      {group.label}
                    </div>
                    {groupResults.map((item, index) => (
                      <div 
                        key={`${group.type}-${index}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleResultClick(item)}
                      >
                        {group.icon}
                        <span>{getResultLabel(item)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedItems.map((item, index) => {
              const group = resultGroups.find(g => g.type === getResultType(item));
              return (
                <Badge 
                  key={index} 
                  className="flex items-center gap-1 px-3 py-1"
                  variant="secondary"
                >
                  {group?.icon}
                  <span>{getResultLabel(item)}</span>
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection(item);
                    }} 
                  />
                </Badge>
              );
            })}
            
            {selectedItems.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => clearSelection(null, true)}
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 