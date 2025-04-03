import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function UserCreationFallback() {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createUser = useMutation(api.users.createOrUpdateUser);
  
  const handleCreateUser = async () => {
    if (!user) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      await createUser();
      // Reload the page after successful user creation
      window.location.reload();
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Account Setup Required</h2>
      <p className="text-gray-600 mb-6 text-center">
        We need to complete your account setup. Please click the button below to continue.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 w-full">
          {error}
        </div>
      )}
      
      <Button 
        onClick={handleCreateUser} 
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up account...
          </>
        ) : (
          "Complete Account Setup"
        )}
      </Button>
    </div>
  );
} 