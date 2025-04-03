import { Loader2 } from "lucide-react";

interface AuthLoadingStateProps {
    message?: string;
    step?: number;
    totalSteps?: number;
}

export function AuthLoadingState({ 
    message = "Setting up your account...", 
    step = 1, 
    totalSteps = 3 
}: AuthLoadingStateProps) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="text-xl font-semibold text-center">{message}</h2>
                    
                    {totalSteps > 1 && (
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                {/* <span>Step {step} of {totalSteps}</span> */}
                                <span>{Math.round((step / totalSteps) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
                                    style={{ width: `${(step / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}