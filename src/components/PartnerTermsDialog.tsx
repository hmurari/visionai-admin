import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PartnerTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  isSubmitting: boolean;
}

type Step = "tos" | "commission" | "confirm";

export function PartnerTermsDialog({
  open,
  onOpenChange,
  onAccept,
  isSubmitting,
}: PartnerTermsDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("tos");
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const [acceptedCommission, setAcceptedCommission] = useState(false);

  const handleNext = () => {
    if (currentStep === "tos" && acceptedTOS) {
      setCurrentStep("commission");
    } else if (currentStep === "commission" && acceptedCommission) {
      setCurrentStep("confirm");
    }
  };

  const handleBack = () => {
    if (currentStep === "commission") {
      setCurrentStep("tos");
    } else if (currentStep === "confirm") {
      setCurrentStep("commission");
    }
  };

  const handleAccept = () => {
    if (acceptedTOS && acceptedCommission) {
      onAccept();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep("tos");
      setAcceptedTOS(false);
      setAcceptedCommission(false);
      onOpenChange(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "tos":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Partner Terms of Service Agreement
              </DialogTitle>
              <DialogDescription>
                Step 1 of 3: Please review and accept the Partner Terms of Service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  You can also view the full Partner Terms of Service at:{" "}
                  <a
                    href="https://visionify.ai/partner-tos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    https://visionify.ai/partner-tos
                  </a>
                </p>
              </div>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="flex flex-col items-center justify-center h-full">
                  <embed
                    src="/Partner-Terms-of-Service.pdf"
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="min-h-[350px]"
                  />
                </div>
              </ScrollArea>
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox
                  id="accept-tos"
                  checked={acceptedTOS}
                  onCheckedChange={(checked) => setAcceptedTOS(checked === true)}
                />
                <Label
                  htmlFor="accept-tos"
                  className="text-sm font-normal cursor-pointer"
                >
                  I have read and agree to the Partner Terms of Service
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!acceptedTOS}>
                Next
              </Button>
            </DialogFooter>
          </>
        );

      case "commission":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exhibit A - Partner Commission Schedule
              </DialogTitle>
              <DialogDescription>
                Step 2 of 3: Please review and accept the Partner Commission Schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Partner Commission Schedule PDF
                  </p>
                  <embed
                    src="/Partner-Commission-Schedule.pdf"
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="min-h-[350px]"
                  />
                </div>
              </ScrollArea>
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox
                  id="accept-commission"
                  checked={acceptedCommission}
                  onCheckedChange={(checked) =>
                    setAcceptedCommission(checked === true)
                  }
                />
                <Label
                  htmlFor="accept-commission"
                  className="text-sm font-normal cursor-pointer"
                >
                  I have read and agree to the Partner Commission Schedule (Exhibit A)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!acceptedCommission}>
                Next
              </Button>
            </DialogFooter>
          </>
        );

      case "confirm":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Confirm Your Agreement
              </DialogTitle>
              <DialogDescription>
                Step 3 of 3: Review and submit your partner application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-900 mb-1">
                      Partner Terms of Service
                    </h4>
                    <p className="text-sm text-green-700">
                      You have accepted the Partner Terms of Service
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-900 mb-1">
                      Partner Commission Schedule
                    </h4>
                    <p className="text-sm text-green-700">
                      You have accepted the Partner Commission Schedule (Exhibit A)
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  By submitting this application, you acknowledge that you have read,
                  understood, and agree to be bound by the Partner Terms of Service
                  and Partner Commission Schedule.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleAccept} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}

