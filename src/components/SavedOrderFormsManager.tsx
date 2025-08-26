import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Eye, Trash2, Download } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import OrderFormPreview from './OrderFormPreview';
import { OrderFormDetails } from '@/types/quote';

interface SavedOrderFormsManagerProps {
  branding: any;
}

interface OrderForm {
  _id: string;
  _creationTime: number;
  customerName: string;
  companyName: string;
  email: string;
  orderFormData: OrderFormDetails;
  createdAt: number;
}

export default function SavedOrderFormsManager({ branding }: SavedOrderFormsManagerProps) {
  const [selectedOrderForm, setSelectedOrderForm] = useState<OrderForm | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Fetch saved order forms
  const orderForms = useQuery(api.orderForms.getOrderForms) || [];
  const deleteOrderFormMutation = useMutation(api.orderForms.deleteOrderForm);

  const handleViewOrderForm = (orderForm: OrderForm) => {
    setSelectedOrderForm(orderForm);
    setPreviewDialogOpen(true);
  };

  const handleDeleteOrderForm = async (orderFormId: string) => {
    try {
      await deleteOrderFormMutation({ orderFormId: orderFormId as any });
      toast.success('Order form deleted successfully');
    } catch (error) {
      console.error('Error deleting order form:', error);
      toast.error('Failed to delete order form');
    }
  };

  const columns: ColumnDef<OrderForm>[] = [
    {
      accessorKey: "orderFormData.orderFormNumber",
      header: "Order Form #",
      cell: ({ row }) => {
        const orderFormNumber = row.original.orderFormData?.orderFormNumber || 'N/A';
        return (
          <div className="font-medium">
            {orderFormNumber}
          </div>
        );
      },
    },
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => {
        const company = row.getValue("companyName") as string;
        return <div className="font-medium">{company || 'N/A'}</div>;
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const name = row.getValue("customerName") as string;
        return <div>{name || 'N/A'}</div>;
      },
    },
    {
      accessorKey: "orderFormData.keyTerms.product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.orderFormData?.keyTerms?.product || 'N/A';
        return (
          <Badge variant="outline" className="text-xs">
            {product}
          </Badge>
        );
      },
    },
    {
      accessorKey: "orderFormData.quoteDetails.totalContractValue",
      header: "Total Value",
      cell: ({ row }) => {
        const totalValue = row.original.orderFormData?.quoteDetails?.totalContractValue;
        return (
          <div className="font-medium">
            {totalValue ? formatCurrency(totalValue) : 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const timestamp = row.getValue("createdAt") as number;
        return <div className="text-sm text-gray-500">{new Date(timestamp).toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const orderForm = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => handleViewOrderForm(orderForm)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order Form</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this order form for {orderForm.companyName}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteOrderForm(orderForm._id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (!orderForms) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading order forms...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saved Order Forms ({orderForms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderForms.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved order forms</h3>
              <p className="text-gray-500">
                Create and save order forms from your quotes to see them here.
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={orderForms} />
          )}
        </CardContent>
      </Card>

      {/* Order Form Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Order Form Preview: {selectedOrderForm?.orderFormData?.orderFormNumber || 'N/A'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedOrderForm && (
              <OrderFormPreview orderFormDetails={selectedOrderForm.orderFormData} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 