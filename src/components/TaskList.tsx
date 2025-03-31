import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit, 
  Building,
  Clock,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { format, addDays, isPast, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CustomerForm } from "@/components/CustomerForm";

export function TaskList({ listId, onTaskSelect }) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingDueDate, setEditingDueDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  
  // Default due date is today
  const today = new Date();
  const [selectedDueDate, setSelectedDueDate] = useState(today);
  
  // Fetch tasks for this list
  const tasks = useQuery(api.tasks.getTasks, { listId }) || [];
  
  // Sort tasks by creation time only (to maintain original order)
  // This ensures completed tasks stay in their original position
  const sortedTasks = [...tasks].sort((a, b) => {
    return a._creationTime - b._creationTime;
  });
  
  // Fetch customers for selection
  const customers = useQuery(api.customers.list) || [];
  
  // Mutations
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const cleanupCompletedTasks = useMutation(api.tasks.cleanupCompletedTasks);
  
  // Add cleanup mutation
  useEffect(() => {
    const runCleanup = async () => {
      try {
        const result = await cleanupCompletedTasks();
        if (result.deletedCount > 0) {
          toast.success(`Cleaned up ${result.deletedCount} completed tasks`);
        }
      } catch (error) {
        console.error("Failed to clean up tasks:", error);
      }
    };
    
    runCleanup();
    
    // Optional: Set up a daily cleanup interval
    const dailyCleanup = setInterval(runCleanup, 24 * 60 * 60 * 1000);
    return () => clearInterval(dailyCleanup);
  }, [cleanupCompletedTasks]);
  
  // Filter customers based on search term
  const filteredCustomers = searchTerm
    ? customers.filter(customer => 
        (customer.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;
  
  // Handle creating a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      await createTask({
        title: newTaskTitle,
        dueDate: selectedDueDate.getTime(),
        listId,
      });
      
      setNewTaskTitle("");
      setSelectedDueDate(today);
      toast.success("Task created");
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    }
  };
  
  // Handle toggling task status
  const handleToggleStatus = async (task) => {
    try {
      await updateTask({
        id: task._id,
        status: task.status === "todo" ? "completed" : "todo",
      });
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask({ id: taskId });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };
  
  // Handle updating task customer
  const handleUpdateCustomer = async (taskId, customer) => {
    try {
      if (customer) {
        // When assigning a customer
        await updateTask({
          id: taskId,
          customerId: customer._id,
          customerName: customer.companyName || customer.name,
        });
        toast.success(`Customer "${customer.companyName || customer.name}" assigned to task`);
      } else {
        // When removing a customer, only update the customerName
        // and don't touch the customerId field
        await updateTask({
          id: taskId,
          customerName: "",  // Empty string instead of null
        });
        toast.success("Customer removed from task");
      }
      
      // Close the popover and reset state
      setEditingCustomer(null);
      setCustomerPopoverOpen(false);
      setSearchTerm("");
    } catch (error) {
      toast.error("Failed to update customer");
      console.error(error);
    }
  };
  
  // Handle updating task due date
  const handleUpdateDueDate = async (taskId, date) => {
    try {
      await updateTask({
        id: taskId,
        dueDate: date.getTime(),
      });
      setEditingDueDate(null);
      setDueDatePopoverOpen(false);
    } catch (error) {
      toast.error("Failed to update due date");
      console.error(error);
    }
  };
  
  // Check if a date is overdue
  const isOverdue = (date) => {
    if (!date) return false;
    return isPast(new Date(date)) && new Date(date).setHours(0,0,0,0) < today.setHours(0,0,0,0);
  };
  
  // Get overdue days
  const getOverdueDays = (date) => {
    if (!date) return 0;
    return differenceInDays(today, new Date(date));
  };
  
  // Handle customer creation success
  const handleCustomerCreated = (customer) => {
    // Close the form
    setIsCustomerFormOpen(false);
    
    // Update the task with the new customer if we're editing a task
    if (editingCustomer) {
      handleUpdateCustomer(editingCustomer, customer);
    }
  };
  
  return (
    <Card className="shadow-sm border-t-4 border-t-blue-500 overflow-hidden">
      <CardHeader className="bg-gradient-to-b from-blue-50 to-white pb-2">
        <CardTitle className="text-xl font-semibold text-blue-800">Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-[70%]">Task</TableHead>
                <TableHead className="w-[15%]">Customer</TableHead>
                <TableHead className="w-[10%]">Due Date</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No tasks yet. Add your first task below.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTasks.map(task => {
                  const isTaskOverdue = task.status !== "completed" && isOverdue(task.dueDate);
                  const overdueDays = getOverdueDays(task.dueDate);
                  
                  return (
                    <TableRow 
                      key={task._id}
                      className={cn(
                        "group transition-colors",
                        task.status === "completed" ? "bg-green-50" : "",
                        isTaskOverdue ? "bg-red-50" : ""
                      )}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            task.status === "completed" ? "text-green-500" : "text-gray-400 hover:text-blue-500"
                          )}
                          onClick={() => handleToggleStatus(task)}
                        >
                          {task.status === "completed" ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell 
                        className={cn(
                          "font-medium cursor-pointer max-w-[300px]",
                          task.status === "completed" ? "text-green-700 line-through" : "text-gray-800",
                          isTaskOverdue ? "text-red-700" : ""
                        )}
                        onClick={() => onTaskSelect(task)}
                      >
                        <span className="truncate block">
                          {task.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Popover
                          open={editingCustomer === task._id && customerPopoverOpen}
                          onOpenChange={(open) => {
                            setCustomerPopoverOpen(open);
                            if (!open) setEditingCustomer(null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className={cn(
                                "h-8 justify-start p-2 w-full",
                                "text-ellipsis overflow-hidden",
                                task.status === "completed" ? "text-green-600 line-through" : "text-gray-500"
                              )}
                              onClick={() => setEditingCustomer(task._id)}
                            >
                              <Building className="h-4 w-4 mr-2 opacity-70 flex-shrink-0" />
                              <span className="truncate block">
                                {task.customerName || ""}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[220px] p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Search customers..." 
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                              />
                              <CommandList>
                                <CommandEmpty>No customers found</CommandEmpty>
                                <CommandGroup>
                                  {filteredCustomers.map(customer => (
                                    <CommandItem
                                      key={customer._id}
                                      onSelect={() => handleUpdateCustomer(task._id, customer)}
                                    >
                                      <Building className="mr-2 h-4 w-4" />
                                      {customer.companyName || customer.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                {task.customerName && (
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => handleUpdateCustomer(task._id, null)}
                                      className="text-destructive"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Clear customer
                                    </CommandItem>
                                  </CommandGroup>
                                )}
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => {
                                      setCustomerPopoverOpen(false); // Close the popover
                                      setIsCustomerFormOpen(true); // Open the customer form
                                    }}
                                    className="text-blue-600"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add new customer
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Popover
                          open={editingDueDate === task._id && dueDatePopoverOpen}
                          onOpenChange={(open) => {
                            setDueDatePopoverOpen(open);
                            if (!open) setEditingDueDate(null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className={cn(
                                "h-8 justify-start p-2 w-full",
                                task.status === "completed" ? "text-green-600 line-through" : "",
                                isTaskOverdue ? "text-red-600" : "text-gray-500"
                              )}
                              onClick={() => setEditingDueDate(task._id)}
                            >
                              {isTaskOverdue ? (
                                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                              ) : (
                                <Clock className="h-4 w-4 mr-2 opacity-70" />
                              )}
                              <span className="truncate">
                                {task.dueDate ? (
                                  isTaskOverdue ? (
                                    `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`
                                  ) : (
                                    format(new Date(task.dueDate), "MMM d, yyyy")
                                  )
                                ) : ""}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-2 flex gap-2 bg-gray-50 border-b">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateDueDate(task._id, today)}
                                className="bg-white"
                              >
                                Today
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateDueDate(task._id, addDays(today, 1))}
                                className="bg-white"
                              >
                                Tomorrow
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateDueDate(task._id, addDays(today, 7))}
                                className="bg-white"
                              >
                                Next week
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={task.dueDate ? new Date(task.dueDate) : undefined}
                              onSelect={(date) => date && handleUpdateDueDate(task._id, date)}
                              initialFocus
                              className="rounded-md"
                            />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="h-4"></div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t pt-6 pb-6">
        <form onSubmit={handleCreateTask} className="w-full">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-grow bg-white border-blue-200 focus-visible:ring-blue-400"
              autoComplete="off"
              name="new-task"
              data-lpignore="true"
              data-form-type="other"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  type="button" 
                  className="bg-white border-blue-200 text-blue-700"
                  tabIndex="-1"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDueDate, "MMM d")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-2 flex gap-2 bg-gray-50 border-b">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDueDate(today)}
                    className="bg-white"
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDueDate(addDays(today, 1))}
                    className="bg-white"
                  >
                    Tomorrow
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDueDate(addDays(today, 7))}
                    className="bg-white"
                  >
                    Next week
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDueDate}
                  onSelect={(date) => date && setSelectedDueDate(date)}
                  initialFocus
                  className="rounded-md"
                />
              </PopoverContent>
            </Popover>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </form>
      </CardFooter>
      
      {/* Customer Form */}
      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => setIsCustomerFormOpen(false)}
        onSuccess={handleCustomerCreated}
      />
    </Card>
  );
} 