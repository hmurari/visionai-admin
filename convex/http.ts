import { httpRouter } from "convex/server";
// Comment out this import since we've commented out the export
// import { paymentWebhook } from "./subscriptions";

const http = httpRouter();

// Comment out this route since the handler is not available
// http.route({
//   path: "/stripe-webhook",
//   method: "POST",
//   handler: paymentWebhook,
// });

// Log that routes are configured
console.log("HTTP routes configured");

// Make sure to export the router even if it has no routes
export default http;