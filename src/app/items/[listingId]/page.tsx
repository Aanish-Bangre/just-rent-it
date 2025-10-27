"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";

function getInitials(name?: string) {
  return name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";
}

// Dialog implementation (shadcn style)
function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-[90vw] relative">
        <button
          className="absolute top-3 right-3 text-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [owner, setOwner] = useState<any>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  const router = useRouter();

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

  // -- LOADING/ERR STATES

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

  // -- PAGE LAYOUT

  return (
    <div className="min-h-screen py-12 bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-6xl flex flex-col-reverse lg:flex-row gap-8 px-4">
        {/* Details & Owner in a card */}
        <div className="flex-1">
          <Card className="bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl backdrop-blur-md p-0 overflow-hidden">
            <CardContent className="p-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 font-sans">
                {item.title}
              </h1>
              {item.categories?.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  {item.categories.map((cat: string, idx: number) => (
                    <Badge
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 tracking-tight px-3 py-1 text-xs font-bold rounded-full text-slate-700 dark:text-slate-300 border-0"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium mb-6 min-h-[2.5em]">
                {item.description}
              </p>
              <div className="flex flex-wrap items-center mb-4 gap-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{item.pricePerDay}
                  <span className="ml-2 text-base font-normal text-slate-500">/day</span>
                </span>
                <span className="block text-base text-slate-700 dark:text-slate-300 border-l-2 border-slate-300 dark:border-slate-700 px-4">
                  <b>Deposit:</b> ₹{item.deposit}
                </span>
                <span className="block text-base text-slate-700 dark:text-slate-300 border-l-2 border-slate-300 dark:border-slate-700 px-4">
                  <b>Status:</b>{" "}
                  <span
                    className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ml-1
                    ${item.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                      }`}
                  >
                    {item.status}
                  </span>
                </span>
              </div>
              <div className="text-base text-slate-600 dark:text-slate-400 mb-8 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                <span className="inline-block text-xl" role="img" aria-label="Location">
                  📍
                </span>
                <span className="font-medium">{item.location}</span>
              </div>
              <hr className="my-8 border-slate-200 dark:border-slate-800" />

              {/* Owner Section */}
              <h2 className="text-2xl mb-6 font-bold text-slate-900 dark:text-white flex items-center gap-2 font-sans">
                <Shield className="h-6 w-6 text-black dark:text-white" />
                Owner Information
              </h2>
              <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                <Avatar className="h-20 w-20 text-2xl uppercase font-bold border-4 border-white dark:border-slate-900 bg-slate-100 dark:from-blue-950 dark:to-purple-950 shadow-lg">
                  <AvatarFallback className="text-slate-700 dark:text-slate-300">
                    {getInitials(owner?.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xl font-semibold text-slate-900 dark:text-white min-h-[1.75rem] mb-1">
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
              {/* Rent Now Button */}
              <div className="mt-10 flex justify-end">
                <Button
                  size="lg"
                  className="font-bold px-10 py-6 text-lg rounded-xl shadow-xl bg-black hover:bg-slate-800 text-white transition-all duration-300 hover:shadow-2xl"
                  onClick={() => router.push(`/items/${listingId}/checkout`)}
                >
                  Rent Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Gallery */}
        <div className="flex-1 flex flex-col items-center justify-start gap-6">
          <div className="w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex justify-center items-center h-[480px]">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="object-cover h-full w-full rounded-3xl shadow-md"
              />
            ) : (
              <span className="text-3xl font-bold text-slate-400">No image</span>
            )}
          </div>
          {item.images && item.images.length > 1 && (
            <div className="flex gap-3 flex-wrap justify-center">
              {item.images.slice(1).map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Gallery ${idx + 2}`}
                  className="h-28 w-28 object-cover rounded-2xl border-2 border-white dark:border-slate-800 shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
