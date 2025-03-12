import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  AlertTriangle,
  Clock,
  Activity,
  Camera,
} from "lucide-react";

export function AnalyticsTab() {
  // Mock analytics data
  const safetyMetrics = {
    dailyEvents: 4,
    weeklyEvents: 23,
    monthlyEvents: 87,
    cameraUptime: 98.7,
    responseTime: "1m 42s",
    resolvedIncidents: 19,
    pendingIncidents: 2,
  };

  // Mock incident data
  const recentIncidents = [
    {
      id: "inc-001",
      type: "Fall Detection",
      location: "Warehouse Entrance",
      time: "Today, 10:23 AM",
      status: "resolved",
    },
    {
      id: "inc-002",
      type: "PPE Violation",
      location: "Assembly Line A",
      time: "Today, 9:15 AM",
      status: "pending",
    },
    {
      id: "inc-003",
      type: "Restricted Area",
      location: "Loading Dock",
      time: "Yesterday, 4:45 PM",
      status: "resolved",
    },
    {
      id: "inc-004",
      type: "Fall Detection",
      location: "Packaging Area",
      time: "Yesterday, 2:30 PM",
      status: "resolved",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Safety Events</CardTitle>
            <CardDescription>Recent incident detections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1D1D1F]">
                  {safetyMetrics.dailyEvents}
                </h3>
                <p className="text-sm text-[#86868B]">Events detected today</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last 7 days</span>
                  <span>{safetyMetrics.weeklyEvents} events</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last 30 days</span>
                  <span>{safetyMetrics.monthlyEvents} events</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <Button variant="outline" className="w-full">
                <Activity className="mr-2 h-4 w-4" /> View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Camera Uptime</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1D1D1F]">
                  {safetyMetrics.cameraUptime}%
                </h3>
                <p className="text-sm text-[#86868B]">
                  Average uptime across all cameras
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>System health</span>
                  <span>Excellent</span>
                </div>
                <Progress value={safetyMetrics.cameraUptime} className="h-2" />
              </div>
              <div className="p-3 bg-[#F5F5F7] rounded-md">
                <div className="flex items-center">
                  <Camera className="h-4 w-4 text-[#0066CC] mr-2" />
                  <span className="text-sm font-medium">
                    4 of 5 cameras online
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" /> View Camera Status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response Metrics</CardTitle>
            <CardDescription>Incident handling performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1D1D1F]">
                  {safetyMetrics.responseTime}
                </h3>
                <p className="text-sm text-[#86868B]">Average response time</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F5F5F7] rounded-md text-center">
                  <p className="text-xl font-bold text-[#1D7D1D]">
                    {safetyMetrics.resolvedIncidents}
                  </p>
                  <p className="text-xs text-[#86868B]">Resolved</p>
                </div>
                <div className="p-3 bg-[#F5F5F7] rounded-md text-center">
                  <p className="text-xl font-bold text-[#D70015]">
                    {safetyMetrics.pendingIncidents}
                  </p>
                  <p className="text-xs text-[#86868B]">Pending</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" /> View Response Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Safety Incidents</CardTitle>
          <CardDescription>
            Latest events detected by your cameras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Incident Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {incident.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incident.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incident.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {incident.status === "resolved" ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <a
              href="https://app.visionify.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="link">
                View all incidents in Visionify App
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
