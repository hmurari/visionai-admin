import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomerSelect } from "./CustomerSelect";
import { DatePicker } from "./ui/date-picker";
import { toast } from "sonner";
import { format } from "date-fns";

export function TaskDetail({ task, open, onOpenChange, onTaskUpdated }) {
  const { user } = useUser();
  
  // Get user data to check role
  const userData = useQuery(
    api.users?.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip"
  );
  
  const isAdmin = userData?.role === "admin";
  
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    customerId: task.customerId,
    customerName: task.customerName,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    status: task.status || "todo",
  });
  
  // Mutations
  const updateTask = useMutation(api.tasks.updateTask);
  
  // Fetch customer if needed
  const customer = useQuery(
    api.customers.get, 
    formData.customerId ? { id: formData.customerId } : "skip"
  );
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle customer selection
  const handleCustomerChange = (selectedCustomer) => {
    setFormData(prev => ({
      ...prev,
      customerId: selectedCustomer?._id,
      customerName: selectedCustomer?.companyName || selectedCustomer?.name,
    }));
  };
  
  // Handle date selection
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateTask({
        id: task._id,
        title: formData.title,
        description: formData.description,
        customerId: formData.customerId,
        customerName: formData.customerName,
        dueDate: formData.dueDate?.getTime(),
        status: formData.status,
      });
      
      onOpenChange(false);
      if (onTaskUpdated) onTaskUpdated();
      toast.success("Task updated");
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            View and edit task information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <CustomerSelect
              value={customer}
              onChange={handleCustomerChange}
              isAdmin={isAdmin}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <DatePicker
              date={formData.dueDate}
              onDateChange={handleDateChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="todo">To Do</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 