# Visionify Partner Portal

A comprehensive partner management and sales platform for Visionify's AI-powered workplace safety monitoring solutions. This application enables partners to manage deals, generate quotes, access learning resources, and track performance analytics for Vision AI safety technology implementations.

## 🏢 About Visionify

Visionify provides AI-powered workplace safety monitoring solutions using computer vision and video analytics technology for manufacturing and warehousing industries. The platform helps organizations ensure OSHA compliance, prevent accidents, and improve workplace safety through real-time monitoring and automated alerts.

### Core Safety Scenarios
- **PPE Compliance** - Hard hat, safety vest, safety glasses monitoring
- **Area Controls** - Restricted area access monitoring
- **Forklift Safety** - Vehicle safety compliance monitoring
- **Emergency Events** - Incident detection and response
- **Hazard Warnings** - Proactive safety alerts
- **Behavioral Safety** - Worker behavior analysis
- **Mobile Phone Compliance** - Device usage monitoring
- **Staircase Safety** - Stair safety monitoring
- **Housekeeping** - Workplace cleanliness monitoring
- **Headcounts** - Personnel counting and tracking
- **Occupancy Metrics** - Space utilization analytics

## 🌟 Application Overview

The Visionify Partner Portal is a React-based SaaS application that serves as a comprehensive business management platform for partners selling Visionify's safety monitoring solutions. It features role-based access control, real-time data synchronization, and integrated payment processing.

### Key Business Functions

1. **Partner Onboarding** - Application submission and approval workflow
2. **Deal Management** - Lead registration, tracking, and pipeline management
3. **Quote Generation** - Automated pricing and proposal creation
4. **Customer Management** - Contact and company information management
5. **Learning Resources** - Training materials and documentation access
6. **Analytics Dashboard** - Performance metrics and business intelligence
7. **Subscription Management** - Billing and payment processing
8. **Task Management** - Partner activity tracking and organization

## 🔧 Technology Stack

### Frontend
- **React 18** - Modern JavaScript framework with hooks and concurrent features
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Ultra-fast build tool with Hot Module Replacement (HMR)
- **React Router** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for responsive design

### UI Components
- **Radix UI** - Accessible, unstyled UI primitives
- **Shadcn/UI** - Beautiful, customizable component library
- **Lucide React** - Feather-inspired icon library
- **Framer Motion** - Animation and gesture library

### Backend & Database
- **Convex** - Real-time database with serverless functions
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing and subscription management

### Integrations
- **Supabase** - Additional database capabilities
- **Vercel Analytics** - Usage analytics and performance monitoring
- **Google Analytics** - Website traffic and user behavior tracking

## 📁 Project Structure

```
├── convex/                    # Backend functions and database schema
│   ├── schema.ts             # Database table definitions
│   ├── users.ts              # User management functions
│   ├── deals.ts              # Deal registration and tracking
│   ├── quotes.ts             # Quote generation and management
│   ├── customers.ts          # Customer data management
│   ├── subscriptions.ts      # Stripe subscription handling
│   ├── admin.ts              # Administrative functions
│   ├── partners.ts           # Partner application management
│   ├── tasks.ts              # Task management system
│   └── stripe.ts             # Payment processing integration
│
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, forms, etc.)
│   │   ├── navbar.tsx       # Navigation component
│   │   ├── footer.tsx       # Footer component
│   │   └── ...              # Feature-specific components
│   │
│   ├── pages/               # Page components and routing
│   │   ├── home.tsx         # Landing page
│   │   ├── partner-application.tsx  # Partner onboarding
│   │   ├── analytics-dashboard.tsx  # Main dashboard
│   │   ├── admin-dashboard.tsx      # Admin management panel
│   │   ├── deal-registration.tsx    # Deal management
│   │   ├── quotes.tsx       # Quote generation
│   │   ├── customers.tsx    # Customer management
│   │   ├── tasks.tsx        # Task management
│   │   └── subscriptions.tsx        # Billing management
│   │
│   ├── data/                # Static data and configurations
│   │   └── pricing_v2.ts    # Updated pricing structure and packages
│   │
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Custom CSS styles
│   └── lib/                 # Shared libraries and helpers
│
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── netlify.toml           # Netlify deployment configuration
└── vite.config.ts         # Vite build configuration
```

## 🎯 Core Features

### 1. Partner Management System
- **Application Workflow**: Multi-step partner application with approval process
- **Role-Based Access**: Admin, Partner, and User role permissions
- **Profile Management**: Company information and contact details
- **Status Tracking**: Application status monitoring and updates

### 2. Deal Registration & Tracking
- **Lead Management**: Customer information capture and organization
- **Pipeline Tracking**: Deal stages from prospecting to closed
- **Commission Calculation**: Automated commission calculations based on deal value
- **Comment System**: Deal activity logging with sentiment analysis
- **Follow-up Scheduling**: Automated reminder system for deal management

### 3. Quote Generation System
- **Dynamic Pricing**: Automated pricing based on camera count and package selection
- **Multiple Packages**: Everything, Core, and Single-scenario offerings
- **Subscription Options**: Monthly, 3-month, yearly, and 3-year terms
- **PDF Export**: Professional quote generation with company branding
- **Currency Support**: Multi-currency pricing and display

### 4. Customer Relationship Management
- **Contact Management**: Comprehensive customer database
- **Company Profiles**: Detailed business information tracking
- **Communication History**: Interaction logging and follow-up tracking
- **Integration**: Seamless connection with deal and quote systems

### 5. Learning Management System
- **Resource Library**: Training materials, videos, and documentation
- **Content Categories**: Organized by type and topic tags
- **Access Control**: Role-based content access permissions
- **Progress Tracking**: Learning progress and completion status

### 6. Analytics & Reporting
- **Performance Metrics**: Deal conversion rates and pipeline analysis
- **Revenue Tracking**: Commission calculations and payment history
- **Growth Analytics**: Month-over-month performance comparison
- **Dashboard Widgets**: Real-time KPI visualization

### 7. Task Management
- **Activity Tracking**: Partner task creation and completion
- **Customer Association**: Link tasks to specific customers
- **List Organization**: Categorized task management
- **Completion Analytics**: Progress tracking and productivity metrics

### 8. Subscription & Billing
- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Automated billing and renewals
- **Invoice Tracking**: Payment history and status monitoring
- **Webhook Processing**: Real-time payment event handling

## 💰 Pricing Structure

### Package Tiers
1. **Everything Package** - All 11 safety scenarios included
2. **Core Package** - Choose any 3 safety scenarios
3. **Single Scenario** - Individual safety monitoring solutions

### Subscription Options
- **Monthly** - Month-to-month billing
- **3-Month Pilot** - Short-term evaluation period
- **1-Year Agreement** - 17% discount over monthly pricing
- **3-Year Agreement** - 33% discount over monthly pricing

### Pricing Tiers (per camera/month)
- **1-20 Cameras**: Premium pricing tier
- **21-100 Cameras**: Volume discount pricing
- **100+ Cameras**: Enterprise pricing with maximum discounts

### Additional Costs
- **Edge Server**: $3,000 (supports 20 cameras)
- **Implementation**: $10,000 one-time setup fee
- **Infrastructure**: $15/camera/month cloud deployment costs

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ with npm or yarn
- Clerk account for authentication
- Convex account for backend services
- Stripe account for payment processing

### Environment Setup
Create a `.env` file with the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_CONVEX_URL=your_convex_deployment_url
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Installation & Development

```bash
# Clone the repository
git clone [repository-url]
cd visionai-admin

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup
The application uses Convex for real-time database functionality. Database tables include:

- **users** - User profiles and authentication data
- **partnerApplications** - Partner onboarding workflow
- **deals** - Deal registration and tracking
- **quotes** - Quote generation and management
- **customers** - Customer relationship management
- **subscriptions** - Stripe subscription management
- **learningMaterials** - Training resource management
- **tasks** - Task management system
- **invoices** - Billing and payment tracking

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, partner approval, content management
- **Partner**: Deal management, quote generation, customer access
- **User**: Basic access to assigned features

### Authentication Flow
1. User signs in via Clerk authentication
2. System creates/updates user profile in Convex database
3. Role-based routing determines accessible features
4. Token-based API authorization for backend operations

## 📊 Business Intelligence

### Key Performance Indicators
- **Deal Conversion Rate**: Percentage of deals reaching closed status
- **Pipeline Value**: Total value of active deals
- **Commission Tracking**: Potential and realized commission amounts
- **Partner Performance**: Individual partner success metrics
- **Resource Utilization**: Learning material engagement rates

### Analytics Features
- Real-time dashboard updates
- Historical performance trends
- Comparative analysis tools
- Automated reporting capabilities

## 🌐 Deployment

### Netlify Configuration
The application is configured for Netlify deployment with:
- Automatic builds from Git repository
- SPA routing support
- CORS headers for API access
- Environment variable management

### Production Considerations
- CDN optimization for global performance
- SSL/TLS security implementation
- Database connection pooling
- Error monitoring and logging

## 🔧 Development Workflow

### Code Organization
- Component-based architecture with reusable UI elements
- Type-safe development with comprehensive TypeScript coverage
- Utility-first CSS with Tailwind for consistent styling
- Real-time data synchronization with Convex subscriptions

### Quality Assurance
- ESLint configuration for code quality
- TypeScript strict mode for type safety
- Component testing with modern testing frameworks
- End-to-end testing for critical user flows

## 📈 Scalability & Performance

### Optimization Features
- Lazy loading for improved initial load times
- Code splitting for efficient bundle management
- Image optimization and CDN delivery
- Database query optimization with indexed lookups

### Monitoring & Analytics
- Real-time performance monitoring
- User behavior analytics
- Error tracking and alerting
- Business metrics dashboard

## 🤝 Support & Documentation

### Contact Information
- **Company**: Visionify Inc.
- **Address**: 1499 W 120th Ave, Ste 110, Westminster, CO 80234
- **Phone**: (720) 449-1124
- **Email**: info@visionify.ai
- **Website**: https://visionify.ai
- **Partner Portal**: https://partner.visionify.ai

### Additional Resources
- Technical documentation and API references
- Partner training materials and certification programs
- Sales enablement resources and competitive analysis
- Customer success stories and case studies

---

**License**: Proprietary - Visionify Inc.
**Last Updated**: 2024
**Version**: Production Release
