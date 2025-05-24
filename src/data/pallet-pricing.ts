export const palletPricingData = {
  "subscriptionTypes": [
    {
      "id": "monthly",
      "name": "Monthly Subscription",
      "description": "Billed Monthly"
    },
    {
      "id": "pilot",
      "name": "3-Month Pilot",
      "description": "3 months upfront"
    },
    {
      "id": "yearly",
      "name": "Annual Agreement",
      "description": "20% off over monthly"
    }
  ],
  "pricing": {
    "monthly": {
      "core": {
        "upTo8Cameras": 100,
        "upTo16Cameras": 90,
        "over16Cameras": 80
      }
    },
    "yearly": {
      "core": {
        "upTo8Cameras": 80,
        "upTo16Cameras": 72,
        "over16Cameras": 64
      }
    }
  },
  "additionalCosts": {
    "edgeServer": {
      "name": "Edge Server",
      "description": "Supports up to 16 Cameras",
      "cost": 3500
    }
  },
  "scenarios": [
    {
      "id": "core",
      "name": "Core Package",
      "description": "Includes all pallet productivity tracking scenarios",
      "details": [
        "Build Count", "Repair Count", "Dismantle Count", "Board Count"
      ]
    }
  ],
  "selectedScenarios": [
    "Build Count",
    "Repair Count", 
    "Dismantle Count",
    "Board Count"
  ],
  "standardFeatures": [
    "Web and Mobile App",
    "12s video clips of anomaly events",
    "Up to 100 users",
    "Whiteglove onboarding & setup",
    "Periodic reports",
    "Webhook APIs"
  ],
  "companyInfo": {
    "name": "Visionify Inc.",
    "address": "1499, W 120th Ave, Ste 110",
    "city": "Westminster",
    "state": "CO",
    "zip": "80234",
    "phone": "720-449-1124",
    "email": "sales@visionify.ai",
    "website": "www.visionify.ai"
  },
  "branding": {
    "companyName": "Visionify",
    "logo": "/logo-color.png",
    "primaryColor": "#1976d2",
    "secondaryColor": "#ffffff",
    "fontFamily": "'Roboto', 'Helvetica', 'Arial', sans-serif"
  },
  "minCameras": 8,
  "maxCameras": 200,
  "camerasPerEdgeServer": 16
} 