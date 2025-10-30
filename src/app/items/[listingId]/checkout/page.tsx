"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ArrowRight, Calendar as CalendarIcon } from "lucide-react";

function getInitials(name?: string) {
  return name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";
}

function CheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const listingId = params.listingId as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const today = new Date();
  // Set to start of today and add 1 day to get tomorrow
  const minDate = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), 1);
  const router = useRouter();
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Get start and end date from query params
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const startDateFromParams = startDateStr ? new Date(startDateStr) : undefined;
  const endDateFromParams = endDateStr ? new Date(endDateStr) : undefined;

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    setItem(null);
    axios
      .get(`/api/items/${listingId}`)
      .then((res) => {
        if (!res.data.success)
          throw new Error(res.data.error || "Failed to fetch item");
        setItem(res.data.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || "Failed to fetch item");
        setItem(null);
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  useEffect(() => {
    if (!item || !item.ownerId) return;
    setOwnerLoading(true);
    setOwnerError(null);
    setOwner(null);
    axios
      .get(`/api/profileSetup?userId=${item.ownerId}`)
      .then((res) => {
        if (!res.data.success || !res.data.data.documents?.length)
          throw new Error("Owner not found");
        setOwner(res.data.data.documents[0]);
        setOwnerError(null);
      })
      .catch((err) => {
        setOwnerError(
          err.response?.data?.error || err.message || "Failed to fetch owner"
        );
        setOwner(null);
      })
      .finally(() => setOwnerLoading(false));
  }, [item?.ownerId]);

  // Calculate total amount
  let totalDays = 0;
  let totalRent = 0;
  let totalAmount = 0;
  if (startDate && endDate && item) {
    totalDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
    totalRent = totalDays * item.pricePerDay;
    totalAmount = totalRent + item.deposit;
  }

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async () => {
    if (!startDate || !endDate || !item) return;

    setPaymentLoading(true);
    try {
      // Initialize payment
      const response = await axios.post(`/api/razorpay/${listingId}`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount,
        itemId: item.listingId,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Payment initialization failed");
      }

      const { orderId, amount, currency, key } = response.data.data;

      // Open Razorpay payment modal
      const options = {
        key,
        amount,
        currency,
        name: "JustRent-It",
        description: `Rent for ${item.title}`,
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful - create booking
          try {
            console.log("Payment successful:", response);
            
            // Create booking in Appwrite
            const bookingResponse = await axios.post(`/api/items/${listingId}/checkout`, {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              totalAmount,
            });

            if (bookingResponse.data.success) {
              alert("Payment successful! Your booking has been confirmed.");
              router.push("/bookings");
            } else {
              alert("Payment successful but booking creation failed. Please contact support.");
            }
          } catch (bookingError: any) {
            console.error("Booking creation error:", bookingError);
            alert("Payment successful but booking creation failed. Please contact support.");
          }
        },
        prefill: {
          name: owner?.userName || "",
          email: owner?.email || "",
          contact: owner?.phone || "",
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpay = (window as any).Razorpay;
      if (razorpay) {
        const rzp = new razorpay(options);
        rzp.open();
      } else {
        throw new Error("Razorpay not loaded");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert("Payment failed: " + (error.response?.data?.error || error.message));
    } finally {
      setPaymentLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
        <div className="text-center">
          <div className="text-lg font-medium mb-4">Checking authentication...</div>
          <Skeleton className="w-[420px] h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
        <div className="text-center">
          <div className="text-red-600 font-medium text-xl mb-4">Please log in to continue with checkout</div>
          <Button onClick={() => router.push('/login')} className="bg-black hover:bg-slate-800">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
        <Skeleton className="w-[420px] h-[420px] rounded-2xl" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center font-bold text-red-600 text-2xl">
        Error: {error}
      </div>
    );
  if (!item)
    return (
      <div className="min-h-screen flex justify-center items-center font-bold text-slate-600 text-xl">
        No item found
      </div>
    );

  return (
    <div className="min-h-screen py-12 bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl backdrop-blur-md overflow-hidden">
          <CardContent className="p-8 lg:p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 font-sans">
                Complete Your Booking
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Select your rental dates and finalize your order
              </p>
            </div>
            
            {/* Date selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-black dark:text-white" />
                Choose Rental Period
              </h2>
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                <div>
                  <label className="block mb-3 font-semibold text-slate-700 dark:text-slate-200">
                    Start Date
                  </label>
                  {startDate && (
                    <div className="mb-3 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                      Selected: {format(startDate, "PPP")}
                    </div>
                  )}
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < minDate}
                    className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
                  />
                </div>
                <div>
                  <label className="block mb-3 font-semibold text-slate-700 dark:text-slate-200">
                    End Date
                  </label>
                  {endDate && (
                    <div className="mb-3 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                      Selected: {format(endDate, "PPP")}
                    </div>
                  )}
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < minDate}
                    className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {startDate && endDate && (
              <div className="mb-8 p-6 rounded-2xl bg-slate-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between text-base">
                    <span>Total Days:</span>
                    <span className="font-semibold">{totalDays} days</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Daily Rate:</span>
                    <span className="font-semibold">₹{item.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{totalRent}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Security Deposit:</span>
                    <span className="font-semibold">₹{item.deposit}</span>
                  </div>
                  <hr className="border-slate-300 dark:border-slate-700" />
                  <div className="flex justify-between text-2xl font-bold text-slate-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            )}

            <hr className="my-8 border-slate-200 dark:border-slate-800" />

            {/* Item Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Item Details
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                  {item.images && item.images.length > 0 && (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-24 w-24 object-cover rounded-xl border-2 border-white dark:border-slate-900 shadow-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-base text-slate-600 dark:text-slate-400 mb-3">
                      {item.description}
                    </p>
                    {item.categories?.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {item.categories.map((cat: string, idx: number) => (
                          <Badge
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold rounded-full text-slate-700 dark:text-slate-300 border-0"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xl" role="img" aria-label="Location">📍</span>
                  <span className="font-medium">{item.location}</span>
                </div>
              </div>
            </div>

            <hr className="my-8 border-slate-200 dark:border-slate-800" />

            {/* Owner Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Owner Details
              </h2>
              <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                <Avatar className="h-16 w-16 text-2xl uppercase font-bold border-4 border-white dark:border-slate-900 bg-slate-100 dark:from-blue-950 dark:to-purple-950 shadow-lg">
                  <AvatarFallback className="text-slate-700 dark:text-slate-300">
                    {getInitials(owner?.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-900 dark:text-white min-h-[1.75rem] mb-1">
                    {ownerLoading ? <Skeleton className="w-32 h-6" /> : owner?.userName}
                  </div>
                  <div className="text-base text-slate-600 dark:text-slate-400 mb-1">
                    {ownerLoading ? <Skeleton className="w-24 h-5" /> : owner?.email}
                  </div>
                  <div className="text-base text-slate-600 dark:text-slate-400">
                    {ownerLoading ? <Skeleton className="w-20 h-5" /> : owner?.phone}
                  </div>
                  {ownerError && (
                    <div className="text-red-600 font-medium text-sm mt-2">{ownerError}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              size="lg" 
              className="w-full font-bold text-lg py-6 rounded-xl shadow-xl bg-black hover:bg-slate-800 text-white transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={!startDate || !endDate || paymentLoading}
              onClick={handleCheckout}
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
        <Skeleton className="w-[420px] h-[420px] rounded-2xl" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
