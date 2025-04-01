import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define the window object with gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalytics() {
  const location = useLocation();
  
  useEffect(() => {
    // Track page views when the location changes
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
  
  return null; // This component doesn't render anything
} 