import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PartnerTermsDialog } from "./PartnerTermsDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, AlertCircle } from "lucide-react";

/**
 * Component that checks if an existing approved partner needs to accept new terms
 * and displays a modal requiring them to accept before continuing
 */
export function ExistingPartnerTermsCheck() {
  const { toast } = useToast();
  const needsToAcceptTerms = useQuery(api.partners.needsToAcceptNewTerms);
  const acceptNewTerms = useMutation(api.partners.acceptNewTerms);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShownAlert, setHasShownAlert] = useState(false);

  useEffect(() => {
    // Show the dialog when the partner needs to accept terms
    if (needsToAcceptTerms && !hasShownAlert) {
      setShowTermsDialog(true);
      setHasShownAlert(true);
    }
  }, [needsToAcceptTerms, hasShownAlert]);

  const handleTermsAccept = async () => {
    setIsSubmitting(true);
    
    try {
      await acceptNewTerms({
        acceptedTermsOfService: true,
        acceptedCommissionSchedule: true,
      });
      
      toast({
        title: "Terms Accepted",
        description: "Thank you for accepting the updated Partner Terms and Commission Schedule.",
      });
      setShowTermsDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "There was an error accepting the terms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show anything if partner doesn't need to accept terms
  if (!needsToAcceptTerms) {
    return null;
  }

  return (
    <>
      {/* Alert Dialog to inform partner about new terms */}
      <AlertDialog open={showTermsDialog && !isSubmitting}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-2xl">
                  Welcome Back! 👋
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base mt-2">
                  We have updated our Partner Terms of Service
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="space-y-4 my-6">
            <p className="text-gray-700">
              Thank you for being a valued Visionify partner! We want to let you know that 
              we've updated our Partner Terms of Service and Commission Schedule to better 
              serve our partnership program.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                What's changing?
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Updated Partner Terms of Service with enhanced partnership guidelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Revised Commission Schedule (Exhibit A) with current rates and structure</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">
                    Please Accept the New Terms
                  </h4>
                  <p className="text-sm text-amber-800">
                    To continue using the partner portal, we kindly ask you to review and accept 
                    the updated terms. This ensures we're all aligned on the latest partnership 
                    terms and commission structure. It will only take a moment!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center py-2 font-medium">
              Click anywhere outside this message to begin reviewing the updated terms
            </p>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terms Dialog for actual acceptance */}
      <PartnerTermsDialog
        open={showTermsDialog}
        onOpenChange={(open) => {
          // Prevent closing the dialog - they must accept the terms
          if (!open && !isSubmitting) {
            toast({
              title: "Terms Acceptance Required",
              description: "You must review and accept the updated terms to continue using the partner portal.",
              variant: "destructive",
            });
          }
        }}
        onAccept={handleTermsAccept}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

