import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { TaskList } from "@/components/TaskList";
import { TaskDetail } from "@/components/TaskDetail";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TasksPage() {
  const { isSignedIn, user } = useUser();
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [activeList, setActiveList] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const newListInputRef = useRef(null);
  const initializationRef = useRef(false);
  
  // Fetch task lists
  const lists = useQuery(api.tasks.getLists) || [];
  
  // Mutations
  const initializeDefaultList = useMutation(api.tasks.initializeDefaultList);
  const deleteList = useMutation(api.tasks.deleteList);
  const createList = useMutation(api.tasks.createList);
  
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
  
  // Focus the new list input when it appears
  useEffect(() => {
    if (isAddingList && newListInputRef.current) {
      newListInputRef.current.focus();
    }
  }, [isAddingList]);
  
  // Handle task selection
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };
  
  // Handle list creation
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setIsAddingList(false);
      setNewListName("");
      return;
    }
    
    try {
      const newListId = await createList({ 
        name: newListName.trim(),
        order: lists.length // Place at the end
      });
      setActiveList(newListId); // Set the new list as active
      setIsAddingList(false);
      setNewListName("");
      toast.success(`Created "${newListName.trim()}" list`);
    } catch (error) {
      console.error("Failed to create list:", error);
      toast.error("Failed to create list");
    }
  };
  
  // Handle list deletion
  const handleDeleteList = async () => {
    if (!listToDelete) return;
    
    try {
      await deleteList({ id: listToDelete });
      
      // If the deleted list was active, switch to another list
      if (activeList === listToDelete) {
        const remainingLists = lists.filter(list => list._id !== listToDelete);
        if (remainingLists.length > 0) {
          setActiveList(remainingLists[0]._id);
        } else {
          setActiveList(null);
        }
      }
      
      toast.success("List deleted");
      setDeleteDialogOpen(false);
      setListToDelete(null);
    } catch (error) {
      console.error("Failed to delete list:", error);
      toast.error("Failed to delete list");
    }
  };
  
  // Handle cancel new list
  const handleCancelNewList = () => {
    setIsAddingList(false);
    setNewListName("");
  };
  
  // Handle key press in new list input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateList();
    } else if (e.key === 'Escape') {
      handleCancelNewList();
    }
  };
  
  // Redirect if not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        
        {lists.length > 0 && (
          <Tabs value={activeList} onValueChange={setActiveList}>
            <div className="flex items-center mb-4 overflow-x-auto">
              <TabsList className="h-10 p-1 bg-white border shadow-sm rounded-md flex">
                {lists.map((list) => (
                  <div key={list._id} className="flex items-center">
                    <TabsTrigger 
                      value={list._id} 
                      className="px-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 group relative"
                    >
                      {list.name}
                      
                      {/* Delete button that appears only on the active list when hovering */}
                      {lists.length > 1 && activeList === list._id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 absolute right-0 top-0 -mt-2 -mr-2 bg-white rounded-full border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setListToDelete(list._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </TabsTrigger>
                  </div>
                ))}
                
                {isAddingList ? (
                  <div className="flex items-center px-1 py-1 ml-1 bg-blue-50 rounded-md">
                    <Input
                      ref={newListInputRef}
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="h-7 w-32 text-sm"
                      placeholder="List name"
                    />
                    <div className="flex ml-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-green-600"
                        onClick={handleCreateList}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-600"
                        onClick={handleCancelNewList}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 ml-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsAddingList(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
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
      
      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          onTaskUpdated={() => setSelectedTask(null)}
        />
      )}
      
      {/* Delete List Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the list and all tasks within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteList}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 