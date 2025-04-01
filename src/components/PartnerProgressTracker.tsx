import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  ClipboardList, 
  FileText, 
  Users, 
  BarChart3, 
  Award,
  X
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export function PartnerProgressTracker() {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  
  // Get user preferences
  const preferences = useQuery(api.userPreferences.getProgressTrackerPreference) || { 
    showTracker: true, 
    hasSeenConfetti: false 
  };
  
  // Mutations
  const updatePreferences = useMutation(api.userPreferences.updateProgressTrackerPreference);
  
  // Get all the data we need to determine progress
  const taskLists = useQuery(api.tasks.getLists) || [];
  const quotes = useQuery(api.quotes.getQuotes) || [];
  const customers = useQuery(api.customers.list) || [];
  const deals = useQuery(api.deals.getPartnerDeals) || [];
  
  // Check if any deals are won
  const hasWonDeal = deals.some(deal => deal.status === "won");
  
  // Calculate if user has any tasks by checking if any task lists exist
  const hasTasks = taskLists.length > 0;
  
  // Calculate progress
  useEffect(() => {
    let completedSteps = 1; // Start with 1 for being an approved partner
    
    if (hasTasks) completedSteps++;
    if (quotes.length > 0) completedSteps++;
    if (customers.length > 0) completedSteps++;
    if (deals.length > 0) completedSteps++;
    if (hasWonDeal) completedSteps++;
    
    const calculatedProgress = Math.round((completedSteps / 6) * 100);
    setProgress(calculatedProgress);
    
    // Show confetti if we hit 100% for the first time
    if (calculatedProgress === 100 && !preferences.hasSeenConfetti) {
      setShowConfetti(true);
      updatePreferences({ hasSeenConfetti: true });
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [hasTasks, quotes.length, customers.length, deals.length, hasWonDeal, preferences.hasSeenConfetti, updatePreferences]);
  
  // If user has chosen to hide the tracker, don't render it
  if (!preferences.showTracker) {
    return null;
  }
  
  // Handle hiding the tracker
  const handleHideTracker = () => {
    updatePreferences({ showTracker: false });
  };
  
  // Define the progress steps
  const progressSteps = [
    {
      title: "Approved Partner",
      icon: <CheckCircle className="h-5 w-5" />,
      isComplete: true, // Always complete for approved partners
      link: null, // No link for this step
    },
    {
      title: "First Task",
      icon: <ClipboardList className="h-5 w-5" />,
      isComplete: hasTasks,
      link: "/tasks",
    },
    {
      title: "First Quote",
      icon: <FileText className="h-5 w-5" />,
      isComplete: quotes.length > 0,
      link: "/quotes",
    },
    {
      title: "First Customer",
      icon: <Users className="h-5 w-5" />,
      isComplete: customers.length > 0,
      link: "/customers",
    },
    {
      title: "First Deal",
      icon: <BarChart3 className="h-5 w-5" />,
      isComplete: deals.length > 0,
      link: "/deals",
    },
    {
      title: "Deal Won",
      icon: <Award className="h-5 w-5" />,
      isComplete: hasWonDeal,
      link: "/deals",
    },
  ];

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}
      
      <div className="w-full mx-auto mb-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Partner Progress</h2>
          <span className="text-sm font-medium">{progress}% Complete</span>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
          {progressSteps.map((step, index) => {
            const StepContainer = step.link ? Link : 'div';
            
            return (
              <StepContainer 
                key={index}
                to={step.link || undefined}
                className={`flex-1 min-w-[100px] cursor-${step.link ? 'pointer' : 'default'}`}
              >
                <Card 
                  className={`border ${
                    step.isComplete 
                      ? "bg-green-50/50 border-green-100" 
                      : "bg-gray-50/50 border-gray-100"
                  } h-full transition-colors hover:${step.link ? 'bg-opacity-70' : ''}`}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <div className={`p-2 rounded-full mb-2 ${
                      step.isComplete 
                        ? "bg-green-50 text-green-500" 
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className="text-sm font-medium">{step.title}</h3>
                  </CardContent>
                </Card>
              </StepContainer>
            );
          })}
        </div>
        
        <div className="flex justify-end mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={handleHideTracker}
          >
            <X className="h-3 w-3 mr-1" />
            Don't show again
          </Button>
        </div>
      </div>
    </>
  );
} 