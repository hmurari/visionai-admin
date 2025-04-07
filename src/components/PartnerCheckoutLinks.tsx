import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CheckoutLink {
  _id: string;
  quoteId: string;
  customerEmail: string;
  checkoutUrl: string;
  expiresAt: string;
  createdAt: string;
  isUsed: boolean;
}

export function PartnerCheckoutLinks() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get all checkout links for the partner
  const checkoutLinks = useQuery(api.subscriptions.getPartnerCheckoutLinks, { 
    partnerId: user?.id || '' 
  }) || [];
  
  // Handle copying link to clipboard
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Checkout link copied to clipboard");
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Define table columns
  const columns: ColumnDef<CheckoutLink>[] = [
    {
      accessorKey: "customerEmail",
      header: "Customer",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => formatDate(row.original.expiresAt),
    },
    {
      accessorKey: "isUsed",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isUsed ? "success" : "default"}>
          {row.original.isUsed ? "Used" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCopyLink(row.original.checkoutUrl)}
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(row.original.checkoutUrl, '_blank')}
            title="Open link"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Checkout Links</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : checkoutLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No checkout links found. Generate links from your quotes.
          </div>
        ) : (
          <DataTable columns={columns} data={checkoutLinks} />
        )}
      </CardContent>
    </Card>
  );
} 