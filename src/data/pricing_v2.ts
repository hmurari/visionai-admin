export const pricingDataV2 = {
  "basePackage": {
    "name": "Core Package",
    "price": 5000,
    "includedCameras": 5,
    "includedScenarios": 3,
    "description": [
      "Includes 5 Cameras",
      "Includes 3 Scenarios",
      "Includes Edge Hardware",
      "4 Week Whiteglove Onboarding",
      "Configuration & Model Tuning"
    ]
  },
  "subscriptionTypes": [
    {
      "id": "monthly",
      "name": "Monthly",
      "description": "Month-to-month",
      "multiplier": 1,
      "discount": 0
    },
    {
      "id": "yearly",
      "name": "Annual",
      "description": "1 year contract",
      "multiplier": 12,
      "discount": 0.2  // 20% discount on per-camera pricing
    },
    {
      "id": "threeYear",
      "name": "Three Year",
      "description": "3 year contract",
      "multiplier": 36,
      "discount": 0.3  // Changed from 0.4 to 0.3 (30% discount)
    }
  ],
  "additionalCameraPricing": {
    "corePackage": [
      {
        "range": "Up to 20 Cameras",
        "pricePerMonth": 50
      },
      {
        "range": "21-100 Cameras",
        "pricePerMonth": 40
      },
      {
        "range": "100+ Cameras",
        "pricePerMonth": 30
      }
    ],
    "everythingPackage": [
      {
        "range": "Up to 20 Cameras",
        "pricePerMonth": 60
      },
      {
        "range": "21-100 Cameras",
        "pricePerMonth": 50
      },
      {
        "range": "100+ Cameras",
        "pricePerMonth": 40
      }
    ]
  },
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