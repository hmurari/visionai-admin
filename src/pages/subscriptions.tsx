import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Define the Subscription type
interface Subscription {
  _id: string;
  _creationTime: number;
  customerId: string;
  subscriptionId: string;
  status: string;
  currentPeriodEnd: number;
  customerName: string;
  customerEmail: string;
  cameraCount: number;
  subscriptionType: string;
  includesStarterKit: boolean;
  totalAmount: number;
  createdAt: number;
}

export default function Subscriptions() {
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get subscription references from the database
  const subscriptionRefs = useQuery(api.subscriptions.getPartnerSubscriptions, { 
    partnerId: user?.id 
  });
  
  const createTestSubscription = useAction(api.subscriptions.createTestSubscription);
  const getSubscriptionManageUrl = useAction(api.subscriptions.getSubscriptionManageUrl);
  const getAllPartnerSubscriptionsFromStripe = useAction(api.subscriptions.getAllPartnerSubscriptionsFromStripe);
  
  // Function to refresh subscriptions directly from Stripe
  const refreshSubscriptions = async () => {
    if (!user?.id) return;
    
    setIsRefreshing(true);
    try {
      await getAllPartnerSubscriptionsFromStripe({ partnerId: user.id });
      toast.success("Subscriptions refreshed from Stripe");
      // This will trigger a re-fetch of subscriptionRefs
    } catch (error) {
      console.error("Error refreshing subscriptions:", error);
      toast.error("Failed to refresh subscriptions");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Initial load from Stripe
  useEffect(() => {
    if (user?.id) {
      refreshSubscriptions();
    }
  }, [user?.id]);
  
  // Update subscriptions when refs change
  useEffect(() => {
    setSubscriptions(subscriptionRefs || []);
    setIsLoading(false);
  }, [subscriptionRefs]);

  // Handle creating a test subscription
  const handleCreateTest = async () => {
    try {
      await createTestSubscription({});
      toast.success("Test subscription created");
      refreshSubscriptions();
    } catch (error) {
      console.error("Error creating test subscription:", error);
      toast.error("Failed to create test subscription");
    }
  };

  // Handle managing a subscription
  const handleManageSubscription = async (subscription: Subscription) => {
    try {
      setIsLoading(true);
      const result = await getSubscriptionManageUrl({
        customerId: subscription.customerId,
        returnUrl: window.location.href
      });
      
      if (result.url) {
        window.open(result.url, "_blank");
      } else {
        toast.error("Failed to get subscription management URL");
      }
    } catch (error) {
      console.error("Error getting subscription management URL:", error);
      toast.error("Failed to get subscription management URL");
    } finally {
      setIsLoading(false);
    }
  };

  // Define table columns
  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-sm text-muted-foreground">{row.original.customerEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "subscriptionType",
      header: "Plan",
      cell: ({ row }) => (
        <div>
          <div className="font-medium capitalize">{row.original.subscriptionType} Plan</div>
          <div className="text-sm text-muted-foreground">{row.original.cameraCount} Cameras</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === "active" ? "success" : status === "trialing" ? "default" : "destructive"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "currentPeriodEnd",
      header: "Renewal Date",
      cell: ({ row }) => {
        const date = new Date(row.original.currentPeriodEnd);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.totalAmount / 100;
        return `$${amount.toFixed(2)}`;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscription = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleManageSubscription(subscription)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage Subscription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshSubscriptions}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh from Stripe
            </Button>
            <Button onClick={handleCreateTest}>
              <Plus className="mr-2 h-4 w-4" />
              Create Test Subscription
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subscriptions found. Create a test subscription or refresh from Stripe.
              </div>
            ) : (
              <DataTable columns={columns} data={subscriptions} />
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}