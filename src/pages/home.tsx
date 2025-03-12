import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PricingCard } from "@/components/pricing-card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useAction, useQuery } from "convex/react";
import { ArrowRight, Star, Shield, Camera, Bell, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../convex/_generated/api";

const FEATURES = [
  {
    icon: <Camera className="h-8 w-8 text-[#0066CC]" />,
    title: "Camera Monitoring",
    description:
      "Connect your security cameras for 24/7 safety monitoring and incident detection",
  },
  {
    icon: <Shield className="h-8 w-8 text-[#0066CC]" />,
    title: "Safety Alerts",
    description:
      "Receive real-time notifications when safety incidents are detected",
  },
  {
    icon: <Activity className="h-8 w-8 text-[#0066CC]" />,
    title: "Analytics Dashboard",
    description:
      "Comprehensive safety analytics and reporting for your workplace",
  },
  {
    icon: <Bell className="h-8 w-8 text-[#0066CC]" />,
    title: "Incident Management",
    description:
      "Track and manage safety incidents from detection to resolution",
  },
] as const;

const TESTIMONIALS = [
  {
    content:
      "Visionify's AI safety monitoring has transformed how we manage workplace safety. The real-time alerts have helped us prevent several potential incidents.",
    author: "Sarah Chen",
    role: "Safety Manager",
    company: "Industrial Manufacturing Inc.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
  },
  {
    content:
      "The camera integration was seamless, and the analytics dashboard gives us insights we never had before. Our safety compliance has improved by 45%.",
    author: "Michael Rodriguez",
    role: "Operations Director",
    company: "Logistics Pro",
    image:
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777540?q=80&w=1200&auto=format&fit=crop",
  },
  {
    content:
      "As a construction company, safety is our top priority. Visionify's per-camera subscription model allowed us to scale our monitoring as our projects grew.",
    author: "Emily Thompson",
    role: "Safety Director",
    company: "BuildRight Construction",
    image:
      "https://images.unsplash.com/photo-1581578731548-7f392f521ad6?q=80&w=1200&auto=format&fit=crop",
  },
];

function App() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const subscriptionStatus = useQuery(
    api.subscriptions.getUserSubscriptionStatus,
  );
  const getProducts = useAction(api.subscriptions.getProducts);
  const [products, setProducts] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const result = async () => {
      const products = await getProducts();
      setProducts(products?.data);
      return products;
    };
    result();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-24">
          {/* Hero Section */}
          <div className="relative flex flex-col items-center text-center space-y-6 pb-24">
            <div className="absolute inset-x-0 -top-24 -bottom-24 bg-gradient-to-b from-[#FBFBFD] via-white to-[#FBFBFD] opacity-80 blur-3xl -z-10" />
            <div className="inline-flex items-center gap-2 rounded-[20px] bg-[#0066CC]/10 px-4 py-2">
              <Shield className="h-4 w-4 text-[#0066CC]" />
              <span className="text-sm font-medium text-[#0066CC]">
                AI-Powered Safety Monitoring
              </span>
            </div>
            <h1 className="text-6xl font-semibold text-[#1D1D1F] tracking-tight max-w-[800px] leading-[1.1]">
              Enhance Workplace Safety with Visionify
            </h1>
            <p className="text-xl text-[#86868B] max-w-[600px] leading-relaxed">
              AI-powered camera monitoring that detects safety incidents in
              real-time and helps prevent workplace accidents.
            </p>

            <div className="flex items-center gap-5 pt-4">
              <Button
                variant="default"
                className="h-12 px-8 text-base rounded-[14px] bg-[#0066CC] hover:bg-[#0077ED] text-white shadow-sm transition-all"
              >
                Start Free Trial
              </Button>
              <Button
                variant="ghost"
                className="h-12 px-8 text-base rounded-[14px] text-[#0066CC] hover:text-[#0077ED] hover:bg-[#0066CC]/10 transition-all"
              >
                View Demo
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-24">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-[20px] bg-white p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="mb-4 transform-gpu transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">
                  {feature.title}
                </h3>
                <p className="text-base text-[#86868B] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonials Section */}
          <div className="py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-3">
                Trusted by Safety Professionals
              </h2>
              <p className="text-xl text-[#86868B]">
                See how Visionify is transforming workplace safety monitoring.
              </p>
            </div>
            <div className="space-y-24">
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-16 ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="flex-1">
                    <div className="max-w-xl">
                      <p className="text-[32px] font-medium text-[#1D1D1F] mb-8 leading-tight">
                        {testimonial.content}
                      </p>
                      <div className="space-y-1">
                        <div className="text-xl font-semibold text-[#1D1D1F]">
                          {testimonial.author}
                        </div>
                        <div className="text-lg text-[#86868B]">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-[#F5F5F7]">
                      <img
                        src={testimonial.image}
                        alt={`${testimonial.author} from ${testimonial.company}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <section id="pricing" className="relative py-24">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FBFBFD] via-white to-[#FBFBFD] opacity-80 blur-3xl -z-10" />
            <div className="flex flex-col items-center text-center relative">
              <div className="mb-12">
                <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-3">
                  Simple Per-Camera Pricing
                </h2>
                <p className="text-xl text-[#86868B]">
                  Pay only for the cameras you connect, with no hidden fees
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                <div className="group relative rounded-[32px] bg-white p-8 transition-all hover:scale-[1.02] hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-50 rounded-[32px] -z-10" />
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
                        Monthly Plan
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-medium text-[#1D1D1F]">
                          $29
                        </span>
                        <span className="text-lg text-[#86868B]">
                          /camera/month
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-[#86868B] leading-relaxed">
                      Flexible monthly billing with no long-term commitment
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-base text-[#1D1D1F]">
                          24/7 Safety Monitoring
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-base text-[#1D1D1F]">
                          Real-time Incident Alerts
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-base text-[#1D1D1F]">
                          Basic Analytics Dashboard
                        </span>
                      </li>
                    </ul>
                    <Button
                      variant="default"
                      className="w-full h-12 text-base rounded-[14px] bg-[#0066CC] hover:bg-[#0077ED] text-white shadow-sm transition-all"
                    >
                      Get Started Monthly
                    </Button>
                  </div>
                </div>

                <div className="group relative rounded-[32px] bg-white p-8 transition-all hover:scale-[1.02] hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-50 rounded-[32px] -z-10" />
                  <div className="inline-flex items-center gap-2 rounded-[20px] bg-[#0066CC]/10 px-4 py-2 mb-6">
                    <span className="text-sm font-medium text-[#0066CC]">
                      Save 15%
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
                        Annual Plan
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-medium text-[#1D1D1F]">
                          $25
                        </span>
                        <span className="text-lg text-[#86868B]">
                          /camera/month
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-[#86868B] leading-relaxed">
                      Best value for long-term safety monitoring
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-base text-[#1D1D1F]">
                          Everything in Monthly
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-base text-[#1D1D1F]">
                          Advanced Analytics & Reporting
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#0066CC]" />
                        <span className="text-base text-[#1D1D1F]">
                          Priority Support
                        </span>
                      </li>
                    </ul>
                    <Button
                      variant="default"
                      className="w-full h-12 text-base rounded-[14px] bg-[#0066CC] hover:bg-[#0077ED] text-white shadow-sm transition-all"
                    >
                      Get Started Annually
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="py-24">
            <div className="rounded-[32px] bg-gradient-to-b from-[#0066CC] to-[#0077ED] p-16 text-center text-white">
              <h2 className="text-4xl font-semibold mb-4">
                Ready to enhance workplace safety?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Start monitoring your facility with Visionify's AI-powered
                safety solution.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-5">
                <Button
                  variant="default"
                  className="h-12 px-8 text-base rounded-[14px] bg-white text-[#0066CC] hover:bg-white/90 transition-all"
                >
                  Start Free Trial
                </Button>
                <Button className="h-12 px-8 text-base rounded-[14px] border-white/20 text-white hover:bg-white/10 group transition-all">
                  Schedule Demo
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
