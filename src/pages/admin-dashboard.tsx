import { useUser } from "@clerk/clerk-react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  CreditCard,
  Calendar,
  Tag,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { CamerasTab } from "./admin-dashboard-tabs/cameras-tab";
import { AnalyticsTab } from "./admin-dashboard-tabs/analytics-tab";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function AdminDashboard() {
  const { user } = useUser();
  const userData = useQuery(
    api.users.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip",
  );
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getUserDashboardUrl);

  const handleManageSubscription = async () => {
    try {
      const result = await getDashboardUrl({
        customerId: subscription?.customerId,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error getting dashboard URL:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="relative mb-8">
            <div className="absolute inset-x-0 -top-24 -bottom-24 bg-gradient-to-b from-[#FBFBFD] via-white to-[#FBFBFD] opacity-80 blur-3xl -z-10" />
            <h1 className="text-3xl font-semibold text-[#1D1D1F] mb-2">
              Camera Subscription Management
            </h1>
            <p className="text-lg text-[#86868B]">
              Manage your camera fleet, subscription, and safety monitoring
              settings
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="overview" className="text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="cameras" className="text-sm">
                Cameras
              </TabsTrigger>
              <TabsTrigger value="subscription" className="text-sm">
                Subscription
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-sm">
                Billing History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Plan</CardTitle>
                    <CardDescription>Your active subscription</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#1D1D1F]">
                          {subscription?.interval === "year"
                            ? "Annual Camera Subscription"
                            : "Monthly Camera Subscription"}
                        </h3>
                        <StatusBadge status={subscription?.status} />
                      </div>
                      <div className="text-sm text-[#86868B]">
                        <p>
                          Next billing date:{" "}
                          {formatDate(subscription?.currentPeriodEnd)}
                        </p>
                        <p className="mt-1">
                          Amount:{" "}
                          {formatCurrency(
                            subscription?.amount,
                            subscription?.currency,
                          )}{" "}
                          for {subscription?.metadata?.cameraCount || 1}{" "}
                          {(subscription?.metadata?.cameraCount || 1) === 1
                            ? "camera"
                            : "cameras"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleManageSubscription}
                      >
                        Manage Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Upcoming Payment</CardTitle>
                    <CardDescription>Your next billing cycle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#1D1D1F]">
                          {formatCurrency(
                            subscription?.amount,
                            subscription?.currency,
                          )}{" "}
                          ({subscription?.metadata?.cameraCount || 1}{" "}
                          {(subscription?.metadata?.cameraCount || 1) === 1
                            ? "camera"
                            : "cameras"}
                          )
                        </h3>
                        <p className="text-sm text-[#86868B]">
                          Due on {formatDate(subscription?.currentPeriodEnd)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current period</span>
                          <span>
                            {Math.round(
                              getPercentageTimeElapsed(
                                subscription?.currentPeriodStart,
                                subscription?.currentPeriodEnd,
                              ),
                            )}
                            % elapsed
                          </span>
                        </div>
                        <Progress
                          value={getPercentageTimeElapsed(
                            subscription?.currentPeriodStart,
                            subscription?.currentPeriodEnd,
                          )}
                          className="h-2"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleManageSubscription}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Update Payment
                        Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Discounts</CardTitle>
                    <CardDescription>
                      Applied to your subscription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subscription?.metadata?.discount ? (
                        <div className="p-4 border rounded-lg bg-[#F5F5F7]">
                          <div className="flex items-center">
                            <Tag className="h-5 w-5 text-[#0066CC] mr-2" />
                            <h4 className="font-medium">Early Adopter</h4>
                          </div>
                          <p className="text-sm text-[#86868B] mt-2">
                            20% off for the lifetime of your subscription
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-[#0066CC]/10 text-[#0066CC] border-[#0066CC]/20"
                          >
                            Active
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                          <Tag className="h-8 w-8 text-[#86868B] mb-2 opacity-50" />
                          <p className="text-[#86868B]">No active discounts</p>
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() =>
                              document
                                .querySelector('[data-value="promotions"]')
                                ?.click()
                            }
                          >
                            View available promotions
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    Your last 3 billing statements
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
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
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
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Sample invoice data - would be replaced with actual data */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(subscription?.currentPeriodStart)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(
                              subscription?.amount,
                              subscription?.currency,
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Paid
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <DownloadIcon className="h-4 w-4 mr-1" /> PDF
                            </Button>
                          </td>
                        </tr>
                        {subscription?.startedAt &&
                          subscription.startedAt !==
                            subscription.currentPeriodStart && (
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(subscription.startedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(
                                  subscription?.amount,
                                  subscription?.currency,
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Paid
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                >
                                  <DownloadIcon className="h-4 w-4 mr-1" /> PDF
                                </Button>
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-right">
                    <Button
                      variant="link"
                      onClick={() =>
                        document
                          .querySelector('[data-value="billing"]')
                          ?.click()
                      }
                    >
                      View all invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cameras Tab */}
            <TabsContent value="cameras" className="space-y-6">
              <CamerasTab subscription={subscription} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTab />
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>
                    Manage your current plan and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-6 border rounded-lg bg-[#F5F5F7]">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {subscription?.interval === "year"
                              ? "Annual Plan"
                              : "Monthly Plan"}
                          </h3>
                          <p className="text-[#86868B] mt-1">
                            {formatCurrency(
                              subscription?.amount,
                              subscription?.currency,
                            )}{" "}
                            per {subscription?.interval}
                          </p>
                        </div>
                        <StatusBadge status={subscription?.status} />
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Current period</span>
                          <span>
                            {formatDate(subscription?.currentPeriodStart)} -{" "}
                            {formatDate(subscription?.currentPeriodEnd)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Auto-renewal</span>
                          <span>
                            {subscription?.cancelAtPeriodEnd ? "Off" : "On"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next billing date</span>
                          <span>
                            {formatDate(subscription?.currentPeriodEnd)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-4">
                        <Button onClick={handleManageSubscription}>
                          Manage Subscription
                        </Button>
                        <Button variant="outline">Cancel Subscription</Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Available Plans
                      </h3>
                      <div className="space-y-4">
                        <PlanOption
                          name="Monthly Camera Subscription"
                          price={`${29 * (subscription?.metadata?.cameraCount || 1)}`}
                          interval="month"
                          features={[
                            `${subscription?.metadata?.cameraCount || 1} camera${(subscription?.metadata?.cameraCount || 1) > 1 ? "s" : ""} at $29/camera`,
                            "24/7 Safety Monitoring",
                            "Real-time Incident Alerts",
                          ]}
                          current={subscription?.interval === "month"}
                        />

                        <PlanOption
                          name="Annual Camera Subscription"
                          price={`${25 * 12 * (subscription?.metadata?.cameraCount || 1)}`}
                          interval="year"
                          features={[
                            `${subscription?.metadata?.cameraCount || 1} camera${(subscription?.metadata?.cameraCount || 1) > 1 ? "s" : ""} at $25/camera/month`,
                            "Save $4/camera/month",
                            "Priority Support",
                          ]}
                          current={subscription?.interval === "year"}
                          discount="Save 15%"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Renewal Settings</CardTitle>
                  <CardDescription>
                    Manage your subscription renewal preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Auto-renewal</h3>
                        <p className="text-sm text-[#86868B] mt-1">
                          Your subscription will{" "}
                          {subscription?.cancelAtPeriodEnd ? "not" : ""}{" "}
                          automatically renew on{" "}
                          {formatDate(subscription?.currentPeriodEnd)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleManageSubscription}
                      >
                        {subscription?.cancelAtPeriodEnd ? "Enable" : "Disable"}{" "}
                        Auto-renewal
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Billing Cycle</h3>
                        <p className="text-sm text-[#86868B] mt-1">
                          You are currently billed{" "}
                          {subscription?.interval === "year"
                            ? "annually"
                            : "monthly"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleManageSubscription}
                      >
                        Change Billing Cycle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing History Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Billing History</CardTitle>
                      <CardDescription>
                        View and download your past invoices
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Export All
                    </Button>
                  </div>
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
                            <div className="flex items-center cursor-pointer">
                              Date
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            <div className="flex items-center cursor-pointer">
                              Amount
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            <div className="flex items-center cursor-pointer">
                              Status
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Sample invoice data - would be replaced with actual data */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(subscription?.currentPeriodStart)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(
                              subscription?.amount,
                              subscription?.currency,
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Paid
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <DownloadIcon className="h-4 w-4 mr-1" /> PDF
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <DownloadIcon className="h-4 w-4 mr-1" /> CSV
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {subscription?.startedAt &&
                          subscription.startedAt !==
                            subscription.currentPeriodStart && (
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(subscription.startedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(
                                  subscription?.amount,
                                  subscription?.currency,
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Paid
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                  >
                                    <DownloadIcon className="h-4 w-4 mr-1" />{" "}
                                    PDF
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                  >
                                    <DownloadIcon className="h-4 w-4 mr-1" />{" "}
                                    CSV
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-[#86868B]">
                      Showing 1-2 of 2 invoices
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Promotions Tab */}
            <TabsContent
              value="promotions"
              className="space-y-6"
              style={{ display: "none" }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Available Discounts</CardTitle>
                  <CardDescription>
                    Special offers for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            Annual Subscription Discount
                          </h3>
                          <p className="text-[#86868B] mt-1">
                            Save 17% when you switch to annual billing
                          </p>
                          <div className="mt-2 flex items-center text-sm text-[#0066CC]">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>YEARLY17</span>
                          </div>
                        </div>
                        <Button variant="outline">Apply</Button>
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            Referral Bonus
                          </h3>
                          <p className="text-[#86868B] mt-1">
                            Get 10% off your next billing cycle for each friend
                            you refer
                          </p>
                          <div className="mt-2 flex items-center text-sm text-[#0066CC]">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>REFER10</span>
                          </div>
                        </div>
                        <Button variant="outline">Apply</Button>
                      </div>
                    </div>

                    <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">Early Adopter</h3>
                          <p className="text-[#86868B] mt-1">
                            20% off for the lifetime of your subscription
                          </p>
                          <div className="mt-2 flex items-center text-sm text-[#0066CC]">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>EARLY20</span>
                          </div>
                        </div>
                        {subscription?.metadata?.discount ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Applied
                          </Badge>
                        ) : (
                          <Button variant="outline">Apply</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Have a Promo Code?</CardTitle>
                  <CardDescription>
                    Enter your code to apply a discount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <Button>Apply</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-16 bg-[#F5F5F7] rounded flex items-center justify-center mr-4">
                          <CreditCard className="h-6 w-6 text-[#1D1D1F]" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-[#86868B]">
                            Expires 12/25
                          </p>
                        </div>
                      </div>
                      <Badge>Default</Badge>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageSubscription}
                    >
                      <CreditCard className="mr-2 h-4 w-4" /> Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive billing notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-[#86868B] mt-1">
                          Receive invoice and payment notifications via email
                        </p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="email-notifications"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Payment Reminders</h3>
                        <p className="text-sm text-[#86868B] mt-1">
                          Get notified before your subscription renews
                        </p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="payment-reminders"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Promotional Emails</h3>
                        <p className="text-sm text-[#86868B] mt-1">
                          Receive special offers and discount notifications
                        </p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="promotional-emails"
                          className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string | undefined }) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-[#E3F3E3] text-[#1D7D1D]";
      case "canceled":
        return "bg-[#FFE7E7] text-[#D70015]";
      case "past_due":
        return "bg-[#FFF4E5] text-[#FF9500]";
      default:
        return "bg-[#F5F5F7] text-[#86868B]";
    }
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}
    >
      {status || "No status"}
    </span>
  );
}

function formatDate(timestamp: number | undefined) {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString();
}

function formatCurrency(amount: number | undefined, currency: string = "USD") {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
}

function getPercentageTimeElapsed(
  startTimestamp: number | undefined,
  endTimestamp: number | undefined,
) {
  if (!startTimestamp || !endTimestamp) return 0;

  const start = startTimestamp * 1000;
  const end = endTimestamp * 1000;
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  const totalDuration = end - start;
  const elapsed = now - start;

  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

function PlanOption({
  name,
  price,
  interval,
  features,
  current,
  discount,
}: {
  name: string;
  price: string;
  interval: string;
  features: string[];
  current?: boolean;
  discount?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg p-6 ${current ? "border-[#0066CC]" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-medium">{name}</h3>
            {current && (
              <Badge className="ml-2 bg-[#0066CC]/10 text-[#0066CC] border-[#0066CC]/20">
                Current Plan
              </Badge>
            )}
            {discount && !current && (
              <Badge className="ml-2 bg-[#0066CC]/10 text-[#0066CC] border-[#0066CC]/20">
                {discount}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold mt-2">
            {price}
            <span className="text-sm font-normal text-[#86868B]">
              /{interval}
            </span>
          </p>
        </div>
        <Button variant={current ? "outline" : "default"} disabled={current}>
          {current ? "Current Plan" : "Switch Plan"}
        </Button>
      </div>

      <div className="mt-4">
        <Button
          variant="link"
          className="p-0 h-auto text-[#0066CC]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Show"} details
          {expanded ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>

        {expanded && (
          <ul className="mt-4 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 text-[#0066CC] mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
