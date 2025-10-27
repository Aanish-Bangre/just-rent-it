"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Calendar, 
  MessageCircle, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Heart
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: ShoppingBag,
      title: "Browse & Rent",
      description: "Discover thousands of items available for rent in your area",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and encrypted transactions powered by Razorpay",
      color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Connect instantly with item owners through live messaging",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule rentals with flexible dates and instant confirmation",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of users renting and lending with confidence",
      color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400"
    },
    {
      icon: Zap,
      title: "Quick Approval",
      description: "Get instant booking confirmations and start renting right away",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
    }
  ];

  const stats = [
    { label: "Active Items", value: "10K+", icon: ShoppingBag },
    { label: "Happy Users", value: "5K+", icon: Users },
    { label: "Cities", value: "50+", icon: TrendingUp },
    { label: "Satisfaction", value: "98%", icon: Heart }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="px-4 py-2 bg-black text-white border-0 shadow-lg">
                <Sparkles className="h-3 w-3 mr-2" />
                Welcome to Just Rent It
              </Badge>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
                Rent Anything,
                <br />
                <span className="text-black dark:text-white">
                  Anytime, Anywhere
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                Your peer-to-peer rental marketplace. Discover items from trusted owners, 
                book with ease, and connect through real-time chat.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-black hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => router.push("/items")}
              >
                Browse Items
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
                onClick={() => router.push("/profile")}
              >
                List Your Item
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg">
                      <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Just Rent It?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need for a seamless rental experience, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black dark:from-blue-900 dark:to-purple-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join our community today and start renting or listing items in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 bg-white text-black hover:bg-slate-100 shadow-xl"
              onClick={() => router.push("/items")}
            >
              Start Browsing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
              onClick={() => router.push("/login")}
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
