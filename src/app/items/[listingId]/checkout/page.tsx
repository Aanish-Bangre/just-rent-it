"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

function getInitials(name?: string) {
  return name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";
}

export default function CheckoutPage() {
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
        <div className="text-center">
          <div className="text-lg font-medium mb-4">Checking authentication...</div>
          <Skeleton className="w-[420px] h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
        <div className="text-center">
          <div className="text-red-600 font-medium text-xl mb-4">Please log in to continue with checkout</div>
          <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
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
    <div className="min-h-screen py-12">
      <div className="max-w-3xl flex flex-col gap-10 px-4">
        <Card className="bg-white/95 dark:bg-black/60 border-0 w-full shadow-2xl rounded-3xl backdrop-blur-md p-0 overflow-hidden">
          <CardContent className="p-8">
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-black dark:text-white mb-4 font-sans">
              Checkout
            </h1>
            {/* Date selection and total */}
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div>
                <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-200">Start Date</label>
                {startDate && (
                  <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">
                    Selected: {format(startDate, "PPP")}
                  </div>
                )}
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < minDate}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-200">End Date</label>
                {endDate && (
                  <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">
                    Selected: {format(endDate, "PPP")}
                  </div>
                )}
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < minDate}
                />
              </div>
            </div>
            {startDate && endDate && (
              <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col gap-2">
                <div><b>Total Days:</b> {totalDays}</div>
                <div><b>Rent:</b> ₹{totalRent}</div>
                <div><b>Deposit:</b> ₹{item.deposit}</div>
                <div className="text-lg font-bold"><b>Total Amount:</b> ₹{totalAmount}</div>
              </div>
            )}
            <hr className="my-6 border-slate-200 dark:border-slate-800" />
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Item Information</h2>
              <div className="mb-2 text-lg font-semibold">{item.title}</div>
              <div className="mb-2 text-base text-slate-700 dark:text-slate-300">{item.description}</div>
              {item.categories?.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {item.categories.map((cat: string, idx: number) => (
                    <Badge
                      key={idx}
                      className="bg-black/10 dark:bg-white/10 uppercase tracking-tight px-3 py-1 text-xs font-bold rounded-full text-slate-700 dark:text-slate-100 border-0"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mb-2 text-base text-slate-600 dark:text-slate-400">
                <span className="inline-block mr-1.5" role="img" aria-label="Location">📍</span>
                {item.location}
              </div>
              <div className="mb-2 text-base text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Status:</span> {item.status}
              </div>
              {item.images && item.images.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-4">
                  {item.images.map((url: string, idx: number) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow"
                      loading="lazy"
                      style={{ maxWidth: 96, maxHeight: 96 }}
                    />
                  ))}
                </div>
              )}
            </div>
            <hr className="my-6 border-slate-200 dark:border-slate-800" />
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Owner Information</h2>
              <div className="flex items-center gap-5 mb-2">
                <Avatar className="h-14 w-14 text-2xl uppercase font-bold border-4 border-white dark:border-black bg-slate-100 dark:bg-neutral-800">
                  <AvatarFallback>
                    {getInitials(owner?.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold text-black dark:text-white min-h-[1.75rem]">
                    {ownerLoading ? <Skeleton className="w-32 h-6" /> : owner?.userName}
                  </div>
                  <div className="text-base text-slate-700 dark:text-slate-300">
                    {ownerLoading ? <Skeleton className="w-24 h-5" /> : owner?.email}
                  </div>
                  <div className="text-base text-slate-700 dark:text-slate-300">
                    {ownerLoading ? <Skeleton className="w-20 h-5" /> : owner?.phone}
                  </div>
                  {ownerError && (
                    <div className="text-red-600 font-medium text-sm mt-2">{ownerError}</div>
                  )}
                </div>
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full font-bold text-lg rounded-xl shadow bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 mt-6" 
              disabled={!startDate || !endDate || paymentLoading}
              onClick={handleCheckout}
            >
              {paymentLoading ? "Processing..." : "Checkout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
