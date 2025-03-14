import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, BarChart, Award } from "lucide-react";

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
      title: "Exclusive Resources",
      description: "Access partner-only training materials and sales resources",
    },
    {
      icon: <Users className="h-8 w-8 text-[#0066CC]" />,
      title: "Deal Registration",
      description: "Register and track your deals with Visionify",
    },
    {
      icon: <BarChart className="h-8 w-8 text-[#0066CC]" />,
      title: "Performance Tracking",
      description: "Monitor your sales performance and partnership status",
    },
    {
      icon: <Award className="h-8 w-8 text-[#0066CC]" />,
      title: "Partner Benefits",
      description: "Earn rewards and recognition for your partnership success",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-6">
                  Become a Visionify Partner
                </h1>
                <p className="text-xl text-[#86868B] mb-8">
                  Join our partner program to access exclusive resources, register deals, and grow your business with Visionify.
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
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <img 
                  src="/partner-illustration.svg" 
                  alt="Partner Program" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Partner Program Benefits</h2>
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

        {/* CTA Section */}
        <section className="py-20 bg-[#0066CC]">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Grow with Visionify?</h2>
            <p className="text-xl text-white/80 mb-8">
              Join our partner program today and unlock exclusive resources to help your business succeed.
            </p>
            {isSignedIn ? (
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleGetStarted}
              >
                Apply Now
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg" variant="secondary">
                  Sign In to Apply
                </Button>
              </SignInButton>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
