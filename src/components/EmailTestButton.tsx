import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export function EmailTestButton() {
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const testEmailSetup = useMutation(api.email.testEmailSetup);
  
  const handleTest = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await testEmailSetup({ testEmail });
      toast({
        title: "Success",
        description: result.message || "Test email sent successfully!",
      });
    } catch (error) {
      console.error("Test email error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Email Test (Debug)</h3>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email to test"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? "Sending..." : "Test Email"}
        </Button>
      </div>
      <p className="text-xs text-yellow-700 mt-2">
        This tests if Resend is properly configured and can send emails.
      </p>
    </div>
  );
} 