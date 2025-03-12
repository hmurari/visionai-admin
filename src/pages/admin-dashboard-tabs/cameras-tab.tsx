import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Camera, Plus, Minus } from "lucide-react";

export function CamerasTab({ subscription }: { subscription: any }) {
  const [cameraCount, setCameraCount] = useState(
    subscription?.metadata?.cameraCount || 1,
  );

  const handleIncrease = () => {
    setCameraCount((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (cameraCount > 1) {
      setCameraCount((prev) => prev - 1);
    }
  };

  // Mock camera data
  const cameras = [
    {
      id: "cam-001",
      name: "Warehouse Entrance",
      status: "online",
      lastSeen: "2 minutes ago",
      events: 3,
    },
    {
      id: "cam-002",
      name: "Assembly Line A",
      status: "online",
      lastSeen: "Just now",
      events: 0,
    },
    {
      id: "cam-003",
      name: "Loading Dock",
      status: "online",
      lastSeen: "5 minutes ago",
      events: 1,
    },
    {
      id: "cam-004",
      name: "Packaging Area",
      status: "offline",
      lastSeen: "3 hours ago",
      events: 0,
    },
    {
      id: "cam-005",
      name: "Employee Entrance",
      status: "online",
      lastSeen: "1 minute ago",
      events: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Camera Subscription</CardTitle>
          <CardDescription>
            Manage your camera fleet and subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-[#F5F5F7]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    Current Camera Count
                  </h3>
                  <p className="text-[#86868B] mt-1">
                    You are currently subscribed for {cameraCount}{" "}
                    {cameraCount === 1 ? "camera" : "cameras"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrease}
                    disabled={cameraCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold px-4">
                    {cameraCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrease}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-[#86868B]">
                  Your monthly charge will be adjusted to{" "}
                  {formatCurrency(cameraCount * 2900)} starting from your next
                  billing cycle.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <Button>Update Camera Count</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Your Cameras</h3>
              <div className="space-y-4">
                {cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-[#F5F5F7] rounded-full flex items-center justify-center mr-4">
                        <Camera className="h-5 w-5 text-[#1D1D1F]" />
                      </div>
                      <div>
                        <p className="font-medium">{camera.name}</p>
                        <p className="text-sm text-[#86868B]">
                          Last seen: {camera.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {camera.events > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-200"
                        >
                          {camera.events}{" "}
                          {camera.events === 1 ? "event" : "events"}
                        </Badge>
                      )}
                      {camera.status === "online" ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Online
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Offline
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
}
