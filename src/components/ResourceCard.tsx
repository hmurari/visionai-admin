import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Presentation, FileText, Video, Link as LinkIcon, ExternalLink, 
  Briefcase, Star, Clock, Play, X, Maximize2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ResourceMaterial {
  _id: string;
  title: string;
  description: string;
  type: "presentation" | "document" | "video" | "link" | "case-study";
  link: string;
  tags: string[];
  featured?: boolean;
  duration?: string;
}

interface ResourceCardProps {
  material: ResourceMaterial;
  onClick?: (material: ResourceMaterial) => void;
}

export function ResourceCard({ material, onClick }: ResourceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Function to get the appropriate icon and color based on resource type
  const getResourceTypeInfo = (type) => {
    switch (type) {
      case "presentation":
        return { 
          icon: <Presentation className="h-5 w-5 text-orange-500" />,
          bgColor: "bg-orange-50",
          textColor: "text-orange-700"
        };
      case "document":
        return { 
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      case "video":
        return { 
          icon: <Video className="h-5 w-5 text-purple-500" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-700"
        };
      case "link":
        return { 
          icon: <LinkIcon className="h-5 w-5 text-green-500" />,
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "case-study":
        return { 
          icon: <Briefcase className="h-5 w-5 text-amber-500" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-700"
        };
      default:
        return { 
          icon: <FileText className="h-5 w-5 text-gray-500" />,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };
  
  const typeInfo = getResourceTypeInfo(material.type);
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(material);
    } else {
      setIsModalOpen(true);
    }
  };
  
  // Function to render embedded content based on type and URL
  const renderEmbeddedContent = () => {
    const { link, type } = material;
    
    // Handle regular web links with iframe embedding
    if (type === "link" || 
        (!link.includes('youtube.com') && 
         !link.includes('youtu.be') && 
         !link.includes('vimeo.com') && 
         !link.includes('drive.google.com') && 
         !link.toLowerCase().endsWith('.pdf') && 
         !link.includes('docs.google.com') && 
         !link.includes('pitch.com'))) {
      return (
        <div className="h-[70vh] w-full flex flex-col">
          <div className="flex-grow relative">
            <iframe 
              src={link} 
              className="w-full h-full rounded-md absolute inset-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              referrerPolicy="no-referrer"
            ></iframe>
          </div>
          <div className="mt-4 text-center">
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </a>
          </div>
        </div>
      );
    }
    
    // YOUTUBE VIDEOS
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
      const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYoutubeId(link);
      
      if (videoId) {
        return (
          <div className="aspect-video w-full">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`} 
              className="w-full h-full rounded-md"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        );
      }
    }
    
    // VIMEO VIDEOS
    if (link.includes('vimeo.com')) {
      // Extract Vimeo ID - handle multiple formats
      let vimeoId = null;
      
      // Try standard format: vimeo.com/123456789
      let match = link.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) vimeoId = match[1];
      
      // Try with query params: vimeo.com/123456789?param=value
      if (!vimeoId) {
        match = link.match(/vimeo\.com\/(\d+)\?/);
        if (match && match[1]) vimeoId = match[1];
      }
      
      if (vimeoId) {
        return (
          <div className="aspect-video w-full">
            <iframe 
              src={`https://player.vimeo.com/video/${vimeoId}`} 
              className="w-full h-full rounded-md"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        );
      }
    }
    
    // GOOGLE DRIVE FILES
    if (link.includes('drive.google.com')) {
      // Extract Google Drive file ID
      let fileId = null;
      
      // Format: drive.google.com/file/d/FILE_ID/view
      let match = link.match(/\/file\/d\/([^\/]+)/);
      if (match && match[1]) fileId = match[1];
      
      // Format: drive.google.com/open?id=FILE_ID
      if (!fileId) {
        match = link.match(/[?&]id=([^&]+)/);
        if (match && match[1]) fileId = match[1];
      }
      
      if (fileId) {
        // Use the direct embed URL with minimal UI
        return (
          <div className="h-[70vh] w-full">
            <iframe 
              src={`https://drive.google.com/file/d/${fileId}/preview?usp=drivesdk&embedded=true`} 
              className="w-full h-full rounded-md"
              allowFullScreen
              allow="autoplay"
            ></iframe>
          </div>
        );
      }
    }
    
    // DIRECT PDF LINKS
    if (link.toLowerCase().endsWith('.pdf')) {
      return (
        <div className="h-[70vh] w-full">
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(link)}&embedded=true`} 
            className="w-full h-full rounded-md"
          ></iframe>
        </div>
      );
    }
    
    // GOOGLE DOCS
    if (link.includes('docs.google.com/document')) {
      // Convert to embed URL
      const embedUrl = link.replace(/\/edit.*$/, '/preview');
      return (
        <div className="h-[70vh] w-full">
          <iframe 
            src={embedUrl} 
            className="w-full h-full rounded-md"
          ></iframe>
        </div>
      );
    }
    
    // GOOGLE SLIDES
    if (link.includes('docs.google.com/presentation')) {
      // Convert to embed URL
      const embedUrl = link.replace(/\/edit.*$/, '/embed');
      return (
        <div className="aspect-[4/3] w-full">
          <iframe 
            src={embedUrl} 
            className="w-full h-full rounded-md"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    // GOOGLE SHEETS
    if (link.includes('docs.google.com/spreadsheets')) {
      // Convert to embed URL
      const embedUrl = link.replace(/\/edit.*$/, '/preview');
      return (
        <div className="h-[70vh] w-full">
          <iframe 
            src={embedUrl} 
            className="w-full h-full rounded-md"
          ></iframe>
        </div>
      );
    }
    
    // PITCH PRESENTATIONS
    if (link.includes('pitch.com')) {
      return (
        <div className="aspect-[4/3] w-full">
          <iframe 
            src={link} 
            className="w-full h-full rounded-md"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    // FALLBACK - External link
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="mb-4 text-gray-600">This content can't be embedded directly.</p>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <Button className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
        </a>
      </div>
    );
  };
  
  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md" onClick={handleCardClick}>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.textColor} text-xs font-medium`}>
              {typeInfo.icon}
              <span className="capitalize">{material.type}</span>
            </div>
            {material.featured && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                Featured
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{material.title}</CardTitle>
          <CardDescription className="line-clamp-2">{material.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-4">
            {material.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
          {material.type === "video" && (
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{material.duration || "Unknown duration"}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full gap-2 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            {material.type === "video" ? (
              <Play className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            {material.type === "video" ? "Watch Video" : "View Resource"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Resource Content Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                {typeInfo.icon}
                <DialogTitle>{material.title}</DialogTitle>
              </div>
            </div>
            <DialogDescription className="mt-2 line-clamp-2">{material.description}</DialogDescription>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {material.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </DialogHeader>
          
          <div className="mt-2">
            {renderEmbeddedContent()}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {material.type === "video" && material.duration && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{material.duration}</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 