import { useUser } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useStoreUserEffect() {
    const { isLoading, isAuthenticated } = useConvexAuth();
    const { user } = useUser();
    // When this state is set we know the server
    // has stored the user.
    const [userId, setUserId] = useState<Id<"users"> | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const storeUser = useMutation(api.users.createOrUpdateUser);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        // If the user is not logged in don't do anything
        if (!isAuthenticated) {
            return;
        }
        
        // Reset error state on new attempt
        setError(null);
        
        // Store the user in the database.
        async function createUser() {
            try {
                const id = await storeUser();
                setUserId(id);
                setRetryCount(0); // Reset retry count on success
            } catch (err) {
                console.error("Failed to store user in Convex:", err);
                setError(err instanceof Error ? err : new Error(String(err)));
                
                // Retry logic with limit
                if (retryCount < MAX_RETRIES) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        createUser();
                    }, 2000 * (retryCount + 1)); // Exponential backoff
                }
            }
        }
        
        createUser();
        return () => setUserId(null);
    }, [isAuthenticated, storeUser, user?.id]);
    
    // Return retry information as well
    return {
        isLoading: isLoading || (isAuthenticated && userId === null && !error),
        isAuthenticated: isAuthenticated && userId !== null,
        error,
        retryCount,
        maxRetries: MAX_RETRIES
    };
}