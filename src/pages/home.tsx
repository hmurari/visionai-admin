import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, BarChart, Award, Eye, CheckCircle, Zap, Building, Phone, Mail, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import React from "react";

export default function Home() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate("/partner-application");
    }
  };

  const BENEFITS = [
    {
      icon: <Shield className="h-8 w-8 text-[#0066CC]" />,
      title: "Workplace Safety Solutions",
      description: "Offer cutting-edge Vision AI safety monitoring solutions to your customers",
    },
    {
      icon: <Users className="h-8 w-8 text-[#0066CC]" />,
      title: "Deal Registration & Protection",
      description: "Register and track your safety monitoring implementation deals",
    },
    {
      icon: <BarChart className="h-8 w-8 text-[#0066CC]" />,
      title: "Performance Analytics",
      description: "Access detailed analytics on your safety solution deployments",
    },
    {
      icon: <Award className="h-8 w-8 text-[#0066CC]" />,
      title: "Partner Certification",
      description: "Become certified in Visionify's AI-powered safety monitoring technology",
    },
  ];

  const FEATURES = [
    {
      icon: <Eye className="h-8 w-8 text-white" />,
      title: "Vision AI Technology",
      description: "Leverage advanced computer vision and AI for proactive safety monitoring"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      title: "OSHA Compliance",
      description: "Help customers meet safety regulations with automated monitoring"
    },
    {
      icon: <Zap className="h-8 w-8 text-white" />,
      title: "Real-time Alerts",
      description: "Provide instant safety violation notifications to prevent accidents"
    },
    {
      icon: <Building className="h-8 w-8 text-white" />,
      title: "Industrial Solutions",
      description: "Specialized for manufacturing, construction, and industrial environments"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Helmet>
        <title>Visionify Partner Portal | AI-Powered Workplace Safety Monitoring Solutions</title>
        <meta name="description" content="Join Visionify's Partner Program to offer AI-powered workplace safety monitoring solutions for manufacturing and warehousing industries. Provide video analytics for safety compliance and accident prevention." />
        <meta name="keywords" content="Visionify, partner program, workplace safety, safety monitoring, Vision AI, video analytics for safety, AI safety solutions, industrial safety, OSHA compliance, safety technology, computer vision for safety, manufacturing safety, warehousing safety" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://partner.visionify.ai/" />
        <meta property="og:title" content="Visionify Partner Portal | AI-Powered Workplace Safety Monitoring Solutions" />
        <meta property="og:description" content="Join Visionify's Partner Program to offer AI-powered workplace safety monitoring solutions for manufacturing and warehousing industries. Provide video analytics for safety compliance and accident prevention." />
        <meta property="og:image" content="https://partner.visionify.ai/visionify-hero-image.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://partner.visionify.ai/" />
        <meta property="twitter:title" content="Visionify Partner Portal | AI-Powered Workplace Safety Monitoring Solutions" />
        <meta property="twitter:description" content="Join Visionify's Partner Program to offer AI-powered workplace safety monitoring solutions for manufacturing and warehousing industries. Provide video analytics for safety compliance and accident prevention." />
        <meta property="twitter:image" content="https://partner.visionify.ai/visionify-hero-image.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://partner.visionify.ai/" />
        
        {/* Additional SEO metadata */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Visionify Inc." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="geo.region" content="US" />
        
        {/* Structured data for Google */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Visionify",
              "url": "https://partner.visionify.ai",
              "logo": "https://partner.visionify.ai/Logo.svg",
              "description": "Visionify provides AI-powered workplace safety monitoring solutions using computer vision and video analytics technology for manufacturing and warehousing industries.",
              "sameAs": [
                "https://visionify.ai",
                "https://twitter.com/visionify",
                "https://www.linkedin.com/company/visionify-ai/"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-720-449-1124",
                "email": "info@visionify.ai",
                "contactType": "customer service",
                "availableLanguage": "English"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1499 W 120th Ave, Ste 110",
                "addressLocality": "Westminster",
                "addressRegion": "CO",
                "postalCode": "80234",
                "addressCountry": "US"
              }
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://partner.visionify.ai",
              "name": "Visionify Partner Portal",
              "description": "Join Visionify's Partner Program to offer AI-powered workplace safety monitoring solutions for manufacturing and warehousing industries.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://partner.visionify.ai/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>
      
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-6">
                  Partner with Visionify for Safety AI Monitoring
                </h1>
                <p className="text-xl text-[#86868B] mb-8">
                  Empower your clients with AI-driven safety monitoring for visual compliance, near-miss detection, and behavioral analysis in manufacturing and warehousing environments.
                </p>
                {isSignedIn ? (
                  <Button 
                    size="lg" 
                    className="bg-[#0066CC] hover:bg-[#004999]"
                    onClick={handleGetStarted}
                  >
                    Apply Now
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="lg" className="bg-[#0066CC] hover:bg-[#004999]">
                      Sign In to Apply
                    </Button>
                  </SignInButton>
                )}
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src="/visionify-hero-image.png" 
                  alt="Visionify Workplace Safety Monitoring Solutions for Manufacturing and Warehousing" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Partner Program Benefits</h2>
            <p className="text-center text-[#86868B] mb-12 max-w-3xl mx-auto">
              Expand your portfolio with Visionify's cutting-edge Vision AI technology for workplace safety monitoring in manufacturing and warehousing industries
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="bg-[#F5F5F7] p-6 rounded-lg">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-[#86868B]">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 bg-[#F5F7FA]">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#1D1D1F] mb-4">Vision AI Safety Technology</h2>
              <p className="text-xl text-[#86868B] max-w-3xl mx-auto">
                Our advanced video analytics platform uses computer vision to detect safety violations and prevent workplace accidents in manufacturing and warehousing environments
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-[#0066CC]/20 transition-all hover:translate-y-[-5px]">
                  <div className="mb-6 bg-[#0066CC] p-3 rounded-full inline-block">
                    {React.cloneElement(feature.icon, { className: "h-8 w-8 text-white" })}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-[#1D1D1F]">{feature.title}</h3>
                  <p className="text-[#86868B] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-[#0066CC] to-[#0052A3] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Manufacturing & Warehousing Safety?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Join our partner program to offer Vision AI safety monitoring solutions that help manufacturing and warehousing companies prevent accidents and ensure compliance.
            </p>
            <div className="inline-block bg-white/10 backdrop-blur-sm p-1 rounded-lg">
              {isSignedIn ? (
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={handleGetStarted}
                  className="px-8 py-6 text-lg font-medium hover:bg-white hover:text-[#0066CC] transition-colors"
                >
                  Apply Now
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="px-8 py-6 text-lg font-medium hover:bg-white hover:text-[#0066CC] transition-colors"
                  >
                    Sign In to Apply
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </section>
        
        {/* Contact Information Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1D1D1F] mb-4">Contact Us</h2>
              <p className="text-lg text-[#86868B] max-w-2xl mx-auto">
                Have questions about our partner program? Our team is here to help you get started.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#F5F5F7] p-8 rounded-xl text-center hover:shadow-md transition-shadow">
                <div className="bg-[#0066CC]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-[#0066CC]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <p className="text-[#0066CC]">720-449-1124</p>
              </div>
              <div className="bg-[#F5F5F7] p-8 rounded-xl text-center hover:shadow-md transition-shadow">
                <div className="bg-[#0066CC]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-[#0066CC]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <a href="mailto:info@visionify.ai" className="text-[#0066CC] hover:underline">info@visionify.ai</a>
              </div>
              <div className="bg-[#F5F5F7] p-8 rounded-xl text-center hover:shadow-md transition-shadow">
                <div className="bg-[#0066CC]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-[#0066CC]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Address</h3>
                <p className="text-[#86868B]">1499 W 120th Ave, Ste 110<br />Westminster, CO 80234</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
