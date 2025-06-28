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

1. **Partner Management** - Comprehensive partner lifecycle management
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

## 📁 Detailed Project Structure

```
visionai-admin/
├── 📁 convex/                     # Backend Functions & Database Schema
│   ├── _generated/                # Auto-generated Convex types and API
│   │   ├── api.d.ts              # API type definitions
│   │   ├── api.js                # API client functions
│   │   ├── dataModel.d.ts        # Database model types
│   │   └── server.d.ts           # Server function types
│   ├── migrations/               # Database migrations
│   │   ├── addContactNameToAdmin.ts
│   │   └── learningMaterialsMigration.ts
│   ├── admin.ts                  # 🆕 Admin functions (Partners, user management, system control)
│   ├── auth.config.ts            # Authentication configuration
│   ├── customers.ts              # Customer CRUD operations
│   ├── dealComments.ts           # Deal comment system with sentiment
│   ├── deals.ts                  # Deal registration and tracking
│   ├── debug.ts                  # Development and debugging utilities
│   ├── email.ts                  # Email notifications (Resend integration)
│   ├── forms.ts                  # Form handling and validation
│   ├── http.ts                   # HTTP actions and external API calls
│   ├── learningMaterials.ts      # Training resources management
│   ├── partners.ts               # Partner application workflow
│   ├── quotes.ts                 # Quote generation and management
│   ├── schema.ts                 # Database table definitions
│   ├── stripe.ts                 # Payment processing integration
│   ├── subscriptions.ts          # Subscription management
│   ├── tasks.ts                  # Task management system
│   ├── userPreferences.ts        # User settings and preferences
│   ├── users.ts                  # User profile management
│   └── webhooks.ts               # Webhook handlers (Stripe, etc.)
│
├── 📁 src/                       # Frontend Application Source
│   ├── 📁 components/            # Reusable UI Components
│   │   ├── 📁 ui/               # Base UI Components (Shadcn/UI)
│   │   │   ├── accordion.tsx     # Collapsible content sections
│   │   │   ├── alert-dialog.tsx  # Modal confirmation dialogs
│   │   │   ├── avatar.tsx        # User profile pictures
│   │   │   ├── badge.tsx         # Status and category labels
│   │   │   ├── button.tsx        # Interactive buttons
│   │   │   ├── card.tsx          # Content containers
│   │   │   ├── country-select.tsx # Country selection dropdown
│   │   │   ├── dialog.tsx        # Modal windows
│   │   │   ├── dropdown-menu.tsx # Dropdown menus with actions
│   │   │   ├── form.tsx          # Form components
│   │   │   ├── industry-select.tsx # Industry selection dropdown
│   │   │   ├── input.tsx         # Text input fields
│   │   │   ├── label.tsx         # Form labels
│   │   │   ├── select.tsx        # Dropdown selections
│   │   │   ├── separator.tsx     # Visual separators
│   │   │   ├── table.tsx         # Data tables
│   │   │   ├── tabs.tsx          # Tabbed interfaces
│   │   │   ├── textarea.tsx      # Multi-line text input
│   │   │   ├── toast.tsx         # Notification toasts
│   │   │   ├── use-toast.tsx     # Toast hook utilities
│   │   │   └── ... (30+ UI components)
│   │   ├── 📁 quote/            # Quote Generation Components
│   │   │   ├── ClientInformation.tsx      # Customer details form
│   │   │   ├── CurrencyOptions.tsx        # Multi-currency support
│   │   │   ├── CustomerCheckoutLink.tsx   # Stripe checkout integration
│   │   │   ├── CustomPricingOverride.tsx  # Manual pricing adjustments
│   │   │   ├── DeploymentOptions.tsx      # Cloud vs Edge deployment
│   │   │   ├── DiscountSection.tsx        # Discount calculations
│   │   │   ├── ImplementationCosts.tsx    # Setup fee calculations
│   │   │   ├── PackageSelection.tsx       # Product package chooser
│   │   │   ├── QuoteCheckout.tsx          # Payment processing
│   │   │   ├── QuoteClientData.tsx        # Customer information display
│   │   │   ├── QuoteFooter.tsx            # Quote document footer
│   │   │   ├── QuoteHeader.tsx            # Quote document header
│   │   │   ├── QuotePackageDetails.tsx    # Package specifications
│   │   │   ├── QuotePackageSummary.tsx    # Package overview
│   │   │   ├── QuotePricingSheet.tsx      # Detailed pricing breakdown
│   │   │   ├── QuotePricingSummary.tsx    # Price summary
│   │   │   ├── QuoteSelectedScenarios.tsx # Selected safety scenarios
│   │   │   ├── QuoteStandardFeatures.tsx  # Standard feature list
│   │   │   ├── QuoteTotalContractValue.tsx # Total contract calculation
│   │   │   └── SubscriptionTabs.tsx       # Subscription term options
│   │   ├── 📁 wrappers/         # Higher-Order Components
│   │   │   ├── ProtectedRoute.tsx         # Authentication wrapper
│   │   │   └── SubscriptionGuard.tsx      # Subscription access control
│   │   ├── AuthLoadingState.tsx           # Authentication loading UI
│   │   ├── ConfettiCelebration.tsx        # Success animations
│   │   ├── CurrencySelect.tsx             # Currency selection dropdown
│   │   ├── CustomerForm.tsx               # Customer creation form
│   │   ├── CustomerList.tsx               # Customer listing component
│   │   ├── CustomerSearch.tsx             # Customer search interface
│   │   ├── CustomerSelect.tsx             # Customer selection dropdown
│   │   ├── DealCard.tsx                   # Deal summary card
│   │   ├── DealComments.tsx               # Deal comment system
│   │   ├── DealRegistrationForm.tsx       # New deal creation form
│   │   ├── DealsListView.tsx              # Deal list with sorting/filtering
│   │   ├── EmailTestButton.tsx            # Email system testing
│   │   ├── footer.tsx                     # Application footer
│   │   ├── form.tsx                       # Generic form wrapper
│   │   ├── GoogleAnalytics.tsx            # Analytics integration
│   │   ├── loading-spinner.tsx            # Loading indicators
│   │   ├── navbar.tsx                     # Main navigation
│   │   ├── NewListDialog.tsx              # New list creation modal
│   │   ├── PartnerCheckoutLinks.tsx       # Partner payment links
│   │   ├── PartnerProgressTracker.tsx     # Application progress tracking
│   │   ├── pricing-card.tsx               # Subscription pricing display
│   │   ├── QuoteGeneratorV2.tsx           # Quote generation interface
│   │   ├── QuotePreviewV2.tsx             # Quote preview and PDF export
│   │   ├── ResourceCard.tsx               # Learning resource cards
│   │   ├── ResourceCardGrid.tsx           # Resource grid layout
│   │   ├── ResourceCardList.tsx           # Resource list layout
│   │   ├── SavedQuotesManager.tsx         # Quote management interface
│   │   ├── SearchWithResults.tsx          # Universal search component
│   │   ├── StaticPricingTable.tsx         # Static pricing display
│   │   ├── TaskDetail.tsx                 # Task detail view
│   │   ├── TaskList.tsx                   # Task listing component
│   │   ├── UserCreationFallback.tsx       # User setup fallback
│   │   └── UserProfileView.tsx            # User profile management
│   │
│   ├── 📁 pages/                # Page Components & Routing
│   │   ├── 📁 admin-dashboard-tabs/       # Admin Dashboard Sections
│   │   │   ├── analytics-tab.tsx          # Admin analytics view
│   │   │   ├── cameras-tab.tsx            # Camera management
│   │   │   ├── migrations-tab.tsx         # Database migrations
│   │   │   ├── partners-tab.tsx           # 🆕 Comprehensive Partners Management
│   │   │   └── quotes-tab.tsx             # Quote management
│   │   ├── 📁 quotes/           # Quote-Related Pages
│   │   │   └── quote-generator.tsx        # Quote generation page
│   │   ├── admin-dashboard.tsx            # 🆕 Admin control panel (updated with Partners)
│   │   ├── admin-setup.tsx                # Admin initialization
│   │   ├── analytics-dashboard.tsx        # Main analytics dashboard
│   │   ├── customers.tsx                  # Customer management page
│   │   ├── dashboard-paid.tsx             # Paid user dashboard
│   │   ├── dashboard.tsx                  # Main dashboard
│   │   ├── deal-registration.tsx          # Deal management interface
│   │   ├── form.tsx                       # Generic form page
│   │   ├── home.tsx                       # Landing page
│   │   ├── migrations.tsx                 # Database migration interface
│   │   ├── not-subscribed.tsx             # Subscription prompt
│   │   ├── partner-application.tsx        # Partner onboarding
│   │   ├── payment-success.tsx            # Payment confirmation
│   │   ├── quotes.tsx                     # Quote management page
│   │   ├── subscriptions.tsx              # Subscription management
│   │   ├── success.tsx                    # Generic success page
│   │   └── tasks.tsx                      # Task management page
│   │
│   ├── 📁 data/                 # Static Data & Configuration
│   │   └── pricing_v2.ts        # Pricing structure and packages
│   │
│   ├── 📁 lib/                  # Shared Libraries
│   │   ├── supabase.ts          # Supabase client configuration
│   │   └── utils.ts             # Common utility functions
│   │
│   ├── 📁 stories/              # Storybook Component Stories
│   │   └── ... (40+ story files for UI components)
│   │
│   ├── 📁 styles/               # Custom Styles
│   │   └── pricingTable.css     # Pricing table specific styles
│   │
│   ├── 📁 types/                # TypeScript Type Definitions
│   │   ├── plans.ts             # Subscription plan types
│   │   └── quote.ts             # Quote-related types
│   │
│   ├── 📁 utils/                # Utility Functions
│   │   ├── currencyUtils.ts     # Currency formatting and conversion
│   │   ├── formatters.ts        # Data formatting utilities
│   │   ├── pdfUtils.ts          # PDF generation utilities
│   │   └── useStoreUserEffect.ts # User state management hook
│   │
│   ├── App.tsx                  # Main application component
│   ├── index.css                # Global styles
│   ├── main.tsx                 # Application entry point
│   └── vite-env.d.ts           # Vite environment types
│
├── 📁 public/                   # Static Assets
│   ├── favicon.svg              # Site favicon
│   ├── logo-color.png           # Colored logo
│   ├── Logo.svg                 # SVG logo
│   ├── tempo.jpg                # Tempo integration image
│   └── visionify-hero-image.png # Hero section image
│
├── 📄 Configuration Files
├── components.json              # Shadcn/UI component configuration
├── netlify.toml                # Netlify deployment settings
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tempo.config.json           # Tempo development configuration
├── tsconfig.json               # 🆕 TypeScript configuration (updated)
├── tsconfig.node.json          # Node.js TypeScript configuration
├── vercel.json                 # Vercel deployment configuration
└── vite.config.ts              # Vite build configuration
```

## 🎯 Feature Location Guide

### 🔐 Authentication & User Management
- **Frontend**: `src/App.tsx` (routing logic), `src/components/navbar.tsx` (user menu)
- **Backend**: `convex/users.ts`, `convex/auth.config.ts`
- **Components**: `src/components/UserProfileView.tsx`, `src/components/AuthLoadingState.tsx`

### 👥 Partner Management System 🆕
The Partners management system provides comprehensive partner lifecycle management, replacing the basic partner applications feature.

#### **Core Components**
- **Main Interface**: `src/pages/admin-dashboard-tabs/partners-tab.tsx`
- **Backend Functions**: `convex/admin.ts` (getAllPartners, updatePartner, togglePartnerStatus, deletePartner)
- **Admin Dashboard**: `src/pages/admin-dashboard.tsx` (Partners tab integration)

#### **Key Features**
- **Partner Listing**: Card-based layout with comprehensive partner information
- **Search & Filter**: Search by name/company/email, filter by status and business type
- **Partner Actions**:
  - **View Details**: Complete profile view with UserProfileView integration
  - **Edit Partner**: Comprehensive edit form with validation
  - **Enable/Disable**: Toggle partner status with confirmation
  - **Delete Partner**: Secure deletion with company name verification
- **Performance Metrics**: Deal counts, total values, and business analytics
- **Contact Management**: Phone, email, website, and address information
- **Business Information**: Industry focus, annual revenue, country, business type

#### **Data Structure**
```typescript
// Partner data includes:
{
  // User profile fields
  _id, tokenIdentifier, name, email, phone, companyName, 
  partnerStatus, joinDate, country, industryFocus, annualRevenue,
  
  // Application data
  application: {
    businessType, website, region, status, reviewedAt, reviewedBy
  },
  
  // Performance metrics
  dealCounts: {
    total, active, closed, totalValue, closedValue
  }
}
```

#### **Business Types Supported**
- **VAR** (Value Added Reseller)
- **SI** (System Integrator) 
- **Distributor**
- **Consultant**
- **Technology Partner**

### 🤝 Deal Management System
- **Main Interface**: `src/pages/deal-registration.tsx`
- **Backend Functions**: `convex/deals.ts`, `convex/dealComments.ts`
- **Components**: 
  - `src/components/DealCard.tsx` - Individual deal display
  - `src/components/DealRegistrationForm.tsx` - New deal creation
  - `src/components/DealsListView.tsx` - List view with sorting/filtering
  - `src/components/DealComments.tsx` - Comment system with sentiment

### 💰 Quote Generation & Management
- **Main Generator**: `src/components/QuoteGeneratorV2.tsx`
- **Quote Preview**: `src/components/QuotePreviewV2.tsx`
- **Quote Management**: `src/pages/quotes.tsx`
- **Backend Logic**: `convex/quotes.ts`
- **Pricing Data**: `src/data/pricing_v2.ts`
- **Sub-components**: `src/components/quote/` (20+ specialized components)

### 🏢 Customer Management
- **Main Page**: `src/pages/customers.tsx`
- **Backend**: `convex/customers.ts`
- **Components**:
  - `src/components/CustomerForm.tsx` - Customer creation
  - `src/components/CustomerList.tsx` - Customer listing
  - `src/components/CustomerSearch.tsx` - Search interface
  - `src/components/CustomerSelect.tsx` - Selection dropdown

### 📊 Analytics & Dashboard
- **Main Dashboard**: `src/pages/analytics-dashboard.tsx`
- **Admin Dashboard**: `src/pages/admin-dashboard.tsx` 🆕 (Updated with Partners tab)
- **Admin Tabs**: `src/pages/admin-dashboard-tabs/`
  - `analytics-tab.tsx` - System analytics
  - `cameras-tab.tsx` - Camera management
  - `migrations-tab.tsx` - Database migrations
  - `partners-tab.tsx` 🆕 - Comprehensive partner management
  - `quotes-tab.tsx` - Quote administration
- **Backend**: `convex/admin.ts` 🆕 (Enhanced with partner functions)

### 💳 Subscription & Billing
- **Subscription Page**: `src/pages/subscriptions.tsx`
- **Backend**: `convex/subscriptions.ts`, `convex/stripe.ts`
- **Components**: `src/components/PartnerCheckoutLinks.tsx`
- **Webhooks**: `convex/webhooks.ts`

### ✅ Task Management
- **Main Page**: `src/pages/tasks.tsx`
- **Backend**: `convex/tasks.ts`
- **Components**: `src/components/TaskList.tsx`, `src/components/TaskDetail.tsx`

### 📚 Learning Resources
- **Backend**: `convex/learningMaterials.ts`
- **Components**: `src/components/ResourceCard.tsx`, `src/components/ResourceCardGrid.tsx`

### 📧 Email System
- **Backend**: `convex/email.ts` (Resend integration)
- **Testing**: `src/components/EmailTestButton.tsx`

## 🔧 Development Guide

### 🚀 Getting Started

#### Prerequisites
- Node.js 16+ with npm or yarn
- Clerk account for authentication
- Convex account for backend services
- Stripe account for payment processing

#### Environment Setup
Create a `.env.local` file with:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
AUTH_PROVIDER_DOMAIN=your-clerk-domain.clerk.accounts.dev

# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Stripe Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Additional Services
RESEND_API_KEY=re_your_resend_key
FRONTEND_URL=http://localhost:5173
```

#### Installation & Development

```bash
# Clone and install
git clone [repository-url]
cd visionai-admin
npm install

# Start development servers
npm run dev          # Frontend (Vite)
npx convex dev       # Backend (Convex) - run in separate terminal

# Build for production
npm run build

# Preview production build
npm run preview
```

### 🗄️ Database Schema (Convex)

#### Core Tables
- **users** - User profiles and authentication (`convex/users.ts`)
  - Enhanced with partner-specific fields: `partnerStatus`, `joinDate`, `industryFocus`, `annualRevenue`
- **partnerApplications** - Partner onboarding workflow (`convex/partners.ts`)
- **deals** - Deal registration and tracking (`convex/deals.ts`)
- **dealComments** - Deal comment system (`convex/dealComments.ts`)
- **quotes** - Quote generation and management (`convex/quotes.ts`)
- **customers** - Customer relationship management (`convex/customers.ts`)
- **subscriptions** - Stripe subscription management (`convex/subscriptions.ts`)
- **learningMaterials** - Training resources (`convex/learningMaterials.ts`)
- **tasks** - Task management system (`convex/tasks.ts`)
- **userPreferences** - User settings (`convex/userPreferences.ts`)

#### 🆕 Partner Management Schema
```typescript
// Enhanced users table for partners
users: {
  // Standard fields
  _id, _creationTime, tokenIdentifier, name, email, role,
  
  // Partner-specific fields
  partnerStatus: "active" | "disabled",
  joinDate: number,
  companyName: string,
  phone: string,
  website: string,
  country: string,
  industryFocus: string,
  annualRevenue: string,
  
  // Timestamps
  createdAt: number,
  updatedAt: number
}

// Partner applications table
partnerApplications: {
  _id, _creationTime, userId, status, businessType,
  companyName, contactPhone, website, region,
  industryFocus, annualRevenue, reasonForPartnership,
  reviewedAt, reviewedBy, createdAt, updatedAt
}
```

### 🎨 UI Component System

#### Base Components (`src/components/ui/`)
Built on Radix UI primitives with Tailwind styling:
- **Forms**: `button.tsx`, `input.tsx`, `select.tsx`, `form.tsx`, `label.tsx`, `textarea.tsx`
- **Layout**: `card.tsx`, `tabs.tsx`, `accordion.tsx`, `separator.tsx`
- **Feedback**: `alert.tsx`, `badge.tsx`, `toast.tsx`, `progress.tsx`
- **Overlays**: `dialog.tsx`, `popover.tsx`, `tooltip.tsx`, `sheet.tsx`
- **Data**: `table.tsx`, `calendar.tsx`, `pagination.tsx`
- **Navigation**: `dropdown-menu.tsx`
- **Selection**: `country-select.tsx`, `industry-select.tsx`

#### Feature Components
- **Navigation**: `navbar.tsx`, `footer.tsx`
- **Authentication**: `AuthLoadingState.tsx`, `UserCreationFallback.tsx`
- **Business Logic**: Deal, Quote, Customer, Task, Partner components
- **Analytics**: Dashboard and reporting components

### 🔧 Common Development Tasks

#### Adding a New Feature
1. **Backend**: Create functions in `convex/[feature].ts`
2. **Types**: Add TypeScript types in `src/types/`
3. **Components**: Create reusable components in `src/components/`
4. **Pages**: Add page components in `src/pages/`
5. **Routing**: Update `src/App.tsx` with new routes

#### Modifying Existing Features

##### Partner Management 🆕
- **Backend**: Edit `convex/admin.ts` (getAllPartners, updatePartner, etc.)
- **Frontend**: Modify `src/pages/admin-dashboard-tabs/partners-tab.tsx`
- **Integration**: Update `src/pages/admin-dashboard.tsx` for tab changes

##### Deal Management
- **Main Interface**: Edit `src/pages/deal-registration.tsx`
- **Backend**: Modify `convex/deals.ts`
- **Components**: Update `src/components/DealCard.tsx`, `src/components/DealsListView.tsx`

##### Quote System
- **Generator**: Modify `src/components/QuoteGeneratorV2.tsx`
- **Backend**: Edit `convex/quotes.ts`
- **Pricing**: Update `src/data/pricing_v2.ts`

##### UI Components
- **Base Components**: Edit files in `src/components/ui/`
- **Feature Components**: Modify specific feature components

#### Database Changes
1. **Schema**: Modify `convex/schema.ts`
2. **Migrations**: Create migration files in `convex/migrations/`
3. **Functions**: Update related functions in `convex/`

### 🔍 Troubleshooting

#### Common Issues
- **Blank Screen**: Check browser console for JavaScript errors
- **Authentication**: Verify Clerk configuration and environment variables
- **Database**: Check Convex deployment status and functions
- **Payments**: Verify Stripe keys and webhook configuration
- **Build Errors**: Check TypeScript types and import paths

#### TypeScript Configuration 🆕
The `tsconfig.json` has been updated to properly handle all source files:
```json
{
  "include": ["src/**/*"],  // Updated from specific files
  "compilerOptions": {
    "jsx": "react-jsx",     // Proper JSX handling
    "strict": false         // Relaxed for development
  }
}
```

#### Vite Configuration
The `vite.config.ts` includes optimizations for:
- Dependency pre-bundling exclusions for Clerk and Convex
- Manual chunk splitting for better performance
- Development server configuration

## 📊 Business Intelligence

### Key Performance Indicators
- **Deal Conversion Rate**: Percentage of deals reaching closed status
- **Pipeline Value**: Total value of active deals
- **Commission Tracking**: Potential and realized commission amounts
- **Partner Performance**: Individual partner success metrics 🆕
- **Resource Utilization**: Learning material engagement rates

### Analytics Features
- Real-time dashboard updates
- Historical performance trends
- Comparative analysis tools
- Automated reporting capabilities
- 🆕 **Partner Analytics**: Performance metrics, deal statistics, revenue tracking

### 🆕 Partner Management Analytics
- **Deal Performance**: Total deals, active deals, closed deals per partner
- **Revenue Metrics**: Total deal value, closed deal value, commission potential
- **Business Intelligence**: Partner type analysis, geographic distribution
- **Activity Tracking**: Application status, join dates, engagement levels

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
- 🆕 **Partner Data Security**: Secure partner information handling with proper access controls

## 🆕 Recent Updates & Enhancements

### Partners Management System (Latest)
- **Comprehensive Partner Management**: Replaced basic partner applications with full lifecycle management
- **Enhanced Admin Dashboard**: New Partners tab with advanced functionality
- **Advanced Search & Filtering**: Multi-criteria partner discovery
- **Performance Analytics**: Deal tracking and business intelligence per partner
- **Secure Operations**: Protected edit, disable, and delete operations with confirmations
- **Modern UI**: Card-based layout with responsive design and accessibility features

### Technical Improvements
- **TypeScript Configuration**: Updated `tsconfig.json` for better file inclusion
- **Component Architecture**: Enhanced UI component system with proper type safety
- **Backend Functions**: New admin functions for comprehensive partner management
- **Database Schema**: Extended user model with partner-specific fields

### Development Experience
- **Better Documentation**: Comprehensive README with feature location guide
- **Code Organization**: Clear separation of concerns between components and pages
- **Type Safety**: Enhanced TypeScript support throughout the application
- **Development Tools**: Improved build process and error handling

---

## 🚀 Quick Start for Developers

### Understanding the Codebase (5-minute guide)

1. **Authentication Flow**: `src/App.tsx` → Clerk → `convex/auth.config.ts`
2. **Main Dashboard**: `src/pages/dashboard.tsx` (partners) or `src/pages/admin-dashboard.tsx` (admins)
3. **Partner Management**: `src/pages/admin-dashboard-tabs/partners-tab.tsx` + `convex/admin.ts`
4. **Deal Pipeline**: `src/pages/deal-registration.tsx` + `convex/deals.ts`
5. **Quote Generation**: `src/components/QuoteGeneratorV2.tsx` + `convex/quotes.ts`
6. **UI Components**: `src/components/ui/` (base) + `src/components/` (feature-specific)

### Key Files to Know
- **Backend Entry**: `convex/schema.ts` (database structure)
- **Frontend Entry**: `src/App.tsx` (routing and auth)
- **Main Navigation**: `src/components/navbar.tsx`
- **Admin Functions**: `convex/admin.ts` (partner management, system control)
- **Partner Workflow**: `convex/partners.ts` (applications) + admin functions
- **Business Logic**: `src/data/pricing_v2.ts` (pricing structure)

This structure provides a comprehensive foundation for AI-powered workplace safety partner management and sales operations.
