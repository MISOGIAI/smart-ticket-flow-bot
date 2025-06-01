import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Star,
  Lightbulb,
  Target,
  Globe
} from 'lucide-react';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Routing",
      description: "Intelligent ticket routing to the right department and agent using advanced AI algorithms.",
      color: "text-yellow-600"
    },
    {
      icon: Users,
      title: "Multi-Role Support",
      description: "Comprehensive role-based access for employees, support agents, managers, and administrators.",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights and performance metrics to optimize your support operations.",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with role-based permissions and data encryption.",
      color: "text-red-600"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Round-the-clock support management with automated workflows and notifications.",
      color: "text-purple-600"
    },
    {
      icon: Lightbulb,
      title: "Smart Suggestions",
      description: "AI-powered suggestions for quick resolutions and knowledge base recommendations.",
      color: "text-orange-600"
    }
  ];

  const stats = [
    { label: "Tickets Resolved", value: "50K+", icon: CheckCircle },
    { label: "Response Time", value: "<2min", icon: Clock },
    { label: "Customer Satisfaction", value: "98%", icon: Star },
    { label: "Departments Supported", value: "15+", icon: Target }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "IT Manager",
      company: "TechCorp Inc.",
      content: "HelpDesk Pro transformed our support operations. The AI routing is incredibly accurate and our response times have improved by 60%.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Operations Director",
      company: "Global Solutions",
      content: "The analytics dashboard gives us insights we never had before. We can now predict and prevent issues before they become problems.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success Lead",
      company: "StartupXYZ",
      content: "Our team loves the intuitive interface. Even new employees can start managing tickets effectively from day one.",
      rating: 5
    }
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowAuth(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Home
            </Button>
          </div>
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">HelpDesk Pro</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">AI-Powered Ticket Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsLogin(true);
                  setShowAuth(true);
                }}
                className="text-gray-700 hover:text-gray-900 text-sm sm:text-base px-2 sm:px-4"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => {
                  setIsLogin(false);
                  setShowAuth(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full text-center">
          <Badge className="mb-4 sm:mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Support Platform
          </Badge>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Transform Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Support Operations</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Streamline ticket management with intelligent routing, real-time analytics, and AI-powered insights. 
            Deliver exceptional customer support at scale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg" 
              onClick={() => {
                setIsLogin(false);
                setShowAuth(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => {
                setIsLogin(true);
                setShowAuth(true);
              }}
              className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-2 sm:py-3 border-gray-300 hover:border-gray-400 w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 px-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Powerful Features for Modern Support Teams
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Everything you need to deliver exceptional customer support, powered by cutting-edge AI technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="w-full">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Trusted by Support Teams Worldwide
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about their experience with HelpDesk Pro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6 pb-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full h-10 w-10 flex items-center justify-center text-white font-medium">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-xs text-gray-600">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Support Operations?
            </h2>
            <p className="text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg">
              Join thousands of companies that use HelpDesk Pro to deliver exceptional customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => {
                  setIsLogin(false);
                  setShowAuth(true);
                }}
                className="bg-white text-blue-600 hover:bg-blue-50 text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => {
                  setIsLogin(true);
                  setShowAuth(true);
                }}
                className="text-white border-white hover:bg-blue-700/30 text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold">HelpDesk Pro</h3>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered ticket management system for modern support teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>Roadmap</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>Guides</li>
                <li>API Reference</li>
                <li>Community</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              © 2023 HelpDesk Pro. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <span className="text-sm text-gray-500">Terms</span>
              <span className="text-sm text-gray-500">Privacy</span>
              <span className="text-sm text-gray-500">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;