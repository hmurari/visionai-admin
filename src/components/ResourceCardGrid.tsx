import { ResourceCard, ResourceMaterial } from "./ResourceCard";

interface ResourceCardGridProps {
  materials: ResourceMaterial[];
  onCardClick?: (material: ResourceMaterial) => void;
  emptyMessage?: string;
}

export function ResourceCardGrid({ 
  materials, 
  onCardClick,
  emptyMessage = "No resources found matching your criteria" 
}: ResourceCardGridProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map(material => (
        <ResourceCard 
          key={material._id} 
          material={material} 
          onClick={onCardClick}
        />
      ))}
    </div>
  );
} 