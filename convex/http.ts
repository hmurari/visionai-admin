import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
// Comment out this import since we've commented out the export
// import { paymentWebhook } from "./subscriptions";

const http = httpRouter();

// Add the Stripe webhook route
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: async (ctx, request) => {
    try {
      const body = await request.text();
      const sig = request.headers.get("Stripe-Signature");

      if (!sig) {
        return new Response(
          JSON.stringify({ error: "No Stripe-Signature header" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Process the webhook via the subscriptions action
      await ctx.runAction(api.subscriptions.webhooksHandler, {
        body,
        sig
      });

      return new Response(
        JSON.stringify({ message: "Webhook received!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
  isHttp: true
});

// Comment out this route since the handler is not available
// http.route({
//   path: "/stripe-webhook",
//   method: "POST",
//   handler: paymentWebhook,
// });

// Make sure to export the router even if it has no routes
export default http;