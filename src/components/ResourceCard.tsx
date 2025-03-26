import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Presentation, FileText, Video, Link as LinkIcon, ExternalLink, 
  Briefcase, Star, Clock, Play 
} from "lucide-react";

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
    }
  };
  
  return (
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
        <a 
          href={material.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" className="w-full gap-2 hover:bg-gray-50">
            {material.type === "video" ? (
              <Play className="h-4 w-4" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {material.type === "video" ? "Watch Video" : "Open Resource"}
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
} 