export const pricingData = {
  "subscriptionTypes": [
    {
      "id": "monthly",
      "name": "Monthly Subscription",
      "description": "Billed Monthly"
    },
    {
      "id": "yearly",
      "name": "1 Year Agreement",
      "description": "17% off over monthly"
    },
    {
      "id": "threeYear",
      "name": "3 Year Agreement",
      "description": "33% off over monthly"
    }
  ],
  "pricing": {
    "monthly": {
      "everything": {
        "upTo20Cameras": 60,
        "upTo100Cameras": 50,
        "over100Cameras": 45
      },
      "core": {
        "upTo20Cameras": 50,
        "upTo100Cameras": 40,
        "over100Cameras": 35
      },
      "single": {
        "upTo20Cameras": 40,
        "upTo100Cameras": 30,
        "over100Cameras": 25
      },
      "infrastructureCost": 15
    },
    "yearly": {
      "everything": {
        "upTo20Cameras": 50,
        "upTo100Cameras": 40,
        "over100Cameras": 35
      },
      "core": {
        "upTo20Cameras": 40,
        "upTo100Cameras": 32,
        "over100Cameras": 28
      },
      "single": {
        "upTo20Cameras": 32,
        "upTo100Cameras": 25,
        "over100Cameras": 20
      },
      "infrastructureCost": 12
    },
    "threeYear": {
      "everything": {
        "upTo20Cameras": 40,
        "upTo100Cameras": 32,
        "over100Cameras": 28
      },
      "core": {
        "upTo20Cameras": 32,
        "upTo100Cameras": 25,
        "over100Cameras": 22
      },
      "single": {
        "upTo20Cameras": 25,
        "upTo100Cameras": 20,
        "over100Cameras": 18
      },
      "infrastructureCost": 10
    }
  },
  "additionalCosts": {
    "edgeServer": {
      "name": "Edge Server",
      "description": "Supports 20 Cameras",
      "cost": 3000
    },
    "implementation": {
      "name": "Implementation Costs",
      "description": "One-time Setup Costs",
      "cost": 10000
    },
    "infrastructure": {
      "name": "Infrastructure Costs",
      "description": "Cloud Server Deployment",
      "costPerCamera": 15
    }
  },
  "scenarios": [
    {
      "id": "everything",
      "name": "Everything Package",
      "description": "Includes all 11 safety scenarios",
      "details": [
        "PPE Compliance", "Area Controls", "Forklift Safety", "Emergency Events", 
        "Hazard Warnings", "Behavioral Safety", "Mobile Phone Compliance", 
        "Staircase Safety", "Housekeeping", "Headcounts", "Occupancy Metrics"
      ]
    },
    {
      "id": "core",
      "name": "Core Package - 3 Scenarios",
      "description": "Choose any 3 safety scenarios",
      "details": ["Choose any 3 scenarios from the Everything Package"]
    },
    {
      "id": "ppe",
      "name": "PPE Compliance Only",
      "description": "Basic PPE compliance monitoring",
      "details": ["PPE Compliance monitoring only"]
    },
    {
      "id": "mobile",
      "name": "Mobile Phone Compliance Only",
      "description": "Mobile phone usage monitoring",
      "details": ["Mobile Phone Compliance monitoring only"]
    },
    {
      "id": "staircase",
      "name": "Staircase Safety Only",
      "description": "Staircase safety monitoring",
      "details": ["Staircase Safety monitoring only"]
    },
    {
      "id": "spills",
      "name": "Spills & Leaks Detection Only",
      "description": "Spills and leaks detection",
      "details": ["Spills & Leaks Detection monitoring only"]
    }
  ],
  "standardFeatures": [
    "12s Video Clips, 1 year Archival",
    "Web & Mobile App",
    "Up to 100 users",
    "Volume discounts for 100+ Cameras available"
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
  }
} 