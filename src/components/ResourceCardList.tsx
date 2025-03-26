import { useState, useEffect } from "react";
import { ResourceMaterial } from "./ResourceCard";
import { ResourceCardGrid } from "./ResourceCardGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ResourceCardListProps {
  materials: ResourceMaterial[];
  onCardClick?: (material: ResourceMaterial) => void;
  itemsPerPage?: number;
}

export function ResourceCardList({ 
  materials, 
  onCardClick,
  itemsPerPage = 9
}: ResourceCardListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  
  // Extract all unique tags from materials and count their frequency
  const tagFrequency = materials.reduce((acc, material) => {
    material.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // Sort tags by frequency (most used first)
  const allTags = Object.keys(tagFrequency).sort((a, b) => tagFrequency[b] - tagFrequency[a]);
  
  // Get the top 10 most used tags
  const topTags = allTags.slice(0, 10);
  
  // Get the remaining tags for the dropdown
  const remainingTags = allTags.slice(10);
  
  // Filter materials based on search term and selected tags
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Also search in tags
      material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => material.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });
  
  // Group materials by type
  const materialsByType = {
    all: filteredMaterials,
    presentation: filteredMaterials.filter(m => m.type === "presentation"),
    document: filteredMaterials.filter(m => m.type === "document"),
    video: filteredMaterials.filter(m => m.type === "video"),
    link: filteredMaterials.filter(m => m.type === "link"),
  };

  // Reset to first page when filters change or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTags, activeTab]);
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Pagination logic with featured materials prioritized
  const currentMaterials = materialsByType[activeTab];
  const totalPages = Math.max(1, Math.ceil(currentMaterials.length / itemsPerPage));
  
  const paginatedMaterials = (type: string) => {
    // Sort materials to prioritize featured items
    const sortedMaterials = [...materialsByType[type]].sort((a, b) => {
      // First sort by featured status (featured first)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // If both have the same featured status, maintain original order
      return 0;
    });
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedMaterials.slice(startIndex, endIndex);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
        
        {/* Tags - Single line with top 10 tags and dropdown for more */}
        <div className="flex items-center gap-2 mb-2">
          {topTags.map(tag => (
            <Badge 
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => toggleTag(tag)}
            >
              {tag} ({tagFrequency[tag]})
            </Badge>
          ))}
          
          {remainingTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs flex items-center gap-1"
                >
                  More Tags
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                {remainingTags.map(tag => (
                  <DropdownMenuItem 
                    key={tag}
                    className="cursor-pointer flex justify-between items-center"
                    onClick={() => toggleTag(tag)}
                  >
                    <span>{tag}</span>
                    <Badge 
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {tagFrequency[tag]}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Selected tags from dropdown */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags
              .filter(tag => !topTags.includes(tag))
              .map(tag => (
                <Badge 
                  key={tag}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ({tagFrequency[tag]})
                  <span className="ml-1 text-xs">&times;</span>
                </Badge>
              ))}
          </div>
        )}
      </div>
      
      {/* Tabs and Content */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="presentation">Presentations</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="link">Links</TabsTrigger>
        </TabsList>
        
        {Object.keys(materialsByType).map(type => (
          <TabsContent key={type} value={type}>
            <ResourceCardGrid 
              materials={paginatedMaterials(type)} 
              onCardClick={onCardClick}
              emptyMessage={`No ${type === 'all' ? 'resources' : type + 's'} found matching your criteria`}
            />
            
            {/* Pagination - Always show regardless of total pages */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className="w-10 h-10 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 