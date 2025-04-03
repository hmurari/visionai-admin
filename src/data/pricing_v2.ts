export const pricingDataV2 = {
  "subscriptionTypes": [
    {
      "id": "monthly",
      "name": "Monthly",
      "description": "Month-to-month",
      "multiplier": 1
    },
    {
      "id": "yearly",
      "name": "Annual",
      "description": "1 year contract",
      "multiplier": 12
    },
    {
      "id": "threeYear",
      "name": "Three Year",
      "description": "3 year contract",
      "multiplier": 36
    }
  ],
  "packages": [
    {
      "id": "starter",
      "name": "Core Package",
      "baseCost": 5000,
      "includedCameras": 5
    }
  ],
  "additionalCameraCost": {
    "monthly": 40,
    "yearly": 40,
    "threeYear": 40
  },
  "cameraTiers": [
    {
      "name": "Up to 20 Cameras",
      "pricePerCamera": 40,
      "priceAllScenarios": 50
    },
    {
      "name": "21-100 Cameras",
      "pricePerCamera": 30,
      "priceAllScenarios": 40
    },
    {
      "name": "100+ Cameras",
      "pricePerCamera": 25,
      "priceAllScenarios": 30
    }
  ],
  "scenarios": [
    "PPE Compliance", 
    "Area Controls", 
    "Forklift Safety", 
    "Emergency Events", 
    "Hazard Warnings", 
    "Behavioral Safety", 
    "Mobile Phone Compliance", 
    "Staircase Safety", 
    "Housekeeping", 
    "Headcounts", 
    "Occupancy Metrics",
    "Spills & Leaks Detection"
  ],
  "standardFeatures": [
    "Web & Mobile App",
    "4 weeks whiteglove onboarding",
    "12s Video Clips",
    "1 Year Video Archival",
    "Up to 100 users",
    "TV Wall Feature",
    "Text, Email, MS Teams, WhatsApp",
    "Periodic Reports (daily, weekly)",
    "Speaker Integration (Axis, HikVision)"
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
    "logo": "/visionify-logo.png",
    "companyName": "Visionify, Inc.",
    "primaryColor": "#1E40AF"
  }
} 