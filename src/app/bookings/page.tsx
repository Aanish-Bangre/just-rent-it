"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, User, DollarSign, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Booking {
  $id: string;
  bookingId: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: string;
  status: string;
}

export default function BookingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/bookings");
        if (response.data.success) {
          setBookings(response.data.data);
        } else {
          setError(response.data.error || "Failed to fetch bookings");
        }
      } catch (err: any) {
        console.error("Booking fetch error:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err.response?.data?.error || err.message || "Failed to fetch bookings");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          <div className="text-center py-12">
            <div className="text-lg font-medium">Checking authentication...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-lg">Please log in to view your bookings.</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          <div className="">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full mb-4">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-semibold">My Bookings</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Your Reservations
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
            Manage and track all your rental bookings
          </p>
        </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <Calendar className="h-16 w-16 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">No bookings found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              You haven't made any bookings yet. Start exploring items to rent!
            </p>
            <Button 
              onClick={() => router.push("/items")}
              className="bg-black hover:bg-slate-800 text-white font-semibold px-8 py-3"
            >
              Browse Items
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="">
            {bookings.map((booking) => (
              <Card 
                key={booking.$id} 
                className="border-0 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 duration-300 group overflow-hidden"
                onClick={() => router.push(`/bookings/${booking.bookingId}`)}
              >
                <CardHeader className="pb-4 bg-slate-50 dark:from-slate-800 dark:to-slate-900">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      Booking #{booking.bookingId.slice(-8)}
                    </CardTitle>
                    <Badge className={`${getStatusColor(booking.status)} font-bold text-xs px-3 py-1`}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Calendar className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Rental Period</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Clock className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Booked On</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <DollarSign className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Total Amount</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        ₹{booking.totalPrice}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Booking ID:</span>
                        <span className="font-mono">{booking.bookingId.slice(-12)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Item ID:</span>
                        <span className="font-mono">{booking.listingId.slice(-12)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end text-black dark:text-white text-sm font-semibold group-hover:gap-2 transition-all">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
