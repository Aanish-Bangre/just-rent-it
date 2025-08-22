"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, User, DollarSign, Clock, ArrowLeft, Package, UserCheck, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface Item {
  listingId: string;
  title: string;
  description: string;
  images: string[];
  categories: string[];
  pricePerDay: number;
  deposit: number;
  location: string;
  status: string;
  ownerId: string;
}

interface Owner {
  $id: string;
  userName: string;
  email: string;
  phone: string;
}

function getInitials(name?: string) {
  return name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";
}

export default function BookingDetailPage() {
  const params = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const bookingId = params.bookingId as string;
  const router = useRouter();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch booking details
        const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
        if (!bookingResponse.data.success) {
          throw new Error(bookingResponse.data.error || "Failed to fetch booking");
        }

        const bookingData = bookingResponse.data.data;
        setBooking(bookingData);

        // Fetch item details
        const itemResponse = await axios.get(`/api/items/${bookingData.listingId}`);
        if (itemResponse.data.success) {
          setItem(itemResponse.data.data);
        }

        // Fetch owner details
        const ownerResponse = await axios.get(`/api/profileSetup?userId=${bookingData.ownerId}`);
        if (ownerResponse.data.success && ownerResponse.data.data.documents?.length > 0) {
          setOwner(ownerResponse.data.data.documents[0]);
        }

      } catch (err: any) {
        console.error("Error fetching booking details:", err);
        setError(err.response?.data?.error || err.message || "Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

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

  const calculateTotalDays = () => {
    if (!booking) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-xl mb-4">Please log in to view booking details</div>
            <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-lg mb-4">{error}</div>
            <Button onClick={() => router.push("/bookings")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-gray-600 font-medium text-lg mb-4">Booking not found</div>
            <Button onClick={() => router.push("/bookings")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => router.push("/bookings")} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
            <span className="text-sm text-gray-600">
              Booking ID: {booking.bookingId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <div className="text-lg font-semibold">
                    {format(new Date(booking.startDate), "PPP")}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <div className="text-lg font-semibold">
                    {format(new Date(booking.endDate), "PPP")}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <div className="text-lg font-semibold">
                  {calculateTotalDays()} days
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Total Price</label>
                <div className="text-2xl font-bold text-green-600">
                  ₹{booking.totalPrice}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Booked On</label>
                <div className="text-lg font-semibold">
                  {format(new Date(booking.createdAt), "PPP")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Item Name</label>
                    <div className="text-lg font-semibold">{item.title}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <div className="text-gray-700">{item.description}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {item.categories?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Categories</label>
                      <div className="flex gap-2 flex-wrap">
                        {item.categories.map((cat: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.images && item.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Images</label>
                      <div className="flex gap-2 flex-wrap">
                        {item.images.slice(0, 3).map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Item ${idx + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">Item information not available</div>
              )}
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owner ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {getInitials(owner.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg font-semibold">{owner.userName}</div>
                      <div className="text-sm text-gray-600">{owner.email}</div>
                      <div className="text-sm text-gray-600">{owner.phone}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <Button 
                      onClick={async () => {
                        try {
                          // Create chat
                          const chatResponse = await axios.post("/api/chats", {
                            ownerId: booking.ownerId,
                            bookingId: booking.bookingId
                          });
                          
                          if (chatResponse.data.success) {
                            // Send notification to owner
                            try {
                              await axios.post("/api/notifications", {
                                toId: booking.ownerId,
                                type: "chat",
                                message: `New chat request for booking ${booking.bookingId}`
                              });
                            } catch (notificationError) {
                              console.error("Error sending notification:", notificationError);
                              // Don't fail the chat creation if notification fails
                            }
                            
                            router.push(`/chat/${chatResponse.data.chatId}`);
                          } else {
                            console.error("Failed to create chat:", chatResponse.data.error);
                          }
                        } catch (error) {
                          console.error("Error creating chat:", error);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Owner
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Owner information not available</div>
              )}
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item && (
                <>
                  <div className="flex justify-between">
                    <span>Rent per day</span>
                    <span>₹{item.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration ({calculateTotalDays()} days)</span>
                    <span>× {calculateTotalDays()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Rent total</span>
                    <span>₹{item.pricePerDay * calculateTotalDays()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deposit</span>
                    <span>₹{item.deposit}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{booking.totalPrice}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
