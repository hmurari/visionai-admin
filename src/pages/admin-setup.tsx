import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

export default function AdminSetup() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const makeAdmin = useMutation(api.debug.makeAdmin);
  
  const handleMakeAdmin = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await makeAdmin({ tokenIdentifier: user.id });
      setResult("Success! You are now an admin. Please refresh the page.");
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Setup</CardTitle>
              <CardDescription>
                Make yourself an admin to access all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Current user: {user?.fullName || user?.username || "Not signed in"}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    ID: {user?.id || "N/A"}
                  </p>
                </div>
                
                <Button 
                  onClick={handleMakeAdmin} 
                  disabled={isLoading || !user?.id}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Make Me Admin"
                  )}
                </Button>
                
                {result && (
                  <div className={`mt-4 p-3 rounded text-sm ${
                    result.startsWith("Success") 
                      ? "bg-green-50 text-green-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {result}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 