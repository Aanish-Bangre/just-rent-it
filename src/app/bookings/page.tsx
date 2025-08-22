"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
            <p className="text-gray-500">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Card 
                key={booking.$id} 
                className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200"
                onClick={() => router.push(`/bookings/${booking.bookingId}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                      Booking #{booking.bookingId.slice(-8)}
                    </CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.startDate), "MMM dd")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold text-green-600">
                      ₹{booking.totalPrice}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Booking ID: {booking.bookingId}</div>
                      <div>Item ID: {booking.listingId}</div>
                    </div>
                    <div className="flex items-center justify-end mt-2 text-blue-600 text-sm">
                      <span>View Details</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
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
