import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit, 
  X,
  User,
  Building,
  Clock,
  MoreHorizontal
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { TaskList } from "@/components/TaskList";
import { TaskDetail } from "@/components/TaskDetail";
import { NewListDialog } from "@/components/NewListDialog";

export default function TasksPage() {
  const { isSignedIn, user } = useUser();
  const [newListDialogOpen, setNewListDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [activeList, setActiveList] = useState(null);
  const initializationRef = useRef(false);
  
  // Fetch task lists
  const lists = useQuery(api.tasks.getLists) || [];
  
  // Initialize default list
  const initializeDefaultList = useMutation(api.tasks.initializeDefaultList);
  
  useEffect(() => {
    const initialize = async () => {
      // Only run once
      if (initializationRef.current) return;
      initializationRef.current = true;
      
      try {
        const result = await initializeDefaultList();
        if (result.created) {
          toast.success("Created default task list");
        }
        setActiveList(result.defaultListId);
      } catch (error) {
        console.error("Failed to initialize lists:", error);
      }
    };
    
    initialize();
  }, [initializeDefaultList]);
  
  // Set active list when lists load (if not already set)
  useEffect(() => {
    if (lists.length > 0 && !activeList) {
      setActiveList(lists[0]._id);
    }
  }, [lists, activeList]);
  
  // Handle task selection
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };
  
  // Redirect if not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        
        {lists.length > 0 && (
          <Tabs value={activeList} onValueChange={setActiveList}>
            <div className="flex items-center mb-4">
              <TabsList className="h-10 p-1 bg-white border shadow-sm rounded-md">
                {lists.map(list => (
                  <TabsTrigger 
                    key={list._id} 
                    value={list._id} 
                    className="px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                  >
                    {list.name}
                  </TabsTrigger>
                ))}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 ml-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setNewListDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TabsList>
            </div>
            
            {lists.map(list => (
              <TabsContent key={list._id} value={list._id}>
                <TaskList 
                  listId={list._id} 
                  onTaskSelect={handleTaskSelect}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      {/* New List Dialog */}
      <NewListDialog 
        open={newListDialogOpen} 
        onOpenChange={setNewListDialogOpen}
      />
      
      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          onTaskUpdated={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
} 