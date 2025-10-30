"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProfilSetUp from "@/components/ProfilSetUp";
import { Button } from "@/components/ui/button";
import { account } from "@/lib/appwrite";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Edit3,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
  Crown,
  ShoppingBag
} from "lucide-react";
import PublishItem from "@/components/PublishItem";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  // Refetch profiles function
  const fetchProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError(null);
    try {
      const res = await axios.get("/api/profileSetup");
      const data = res.data;
      if (data.success) {
        setProfiles(data.data.documents || []);
      } else {
        setProfilesError(data.error || "Failed to fetch profiles");
      }
    } catch (err: any) {
      setProfilesError(err.message || "Failed to fetch profiles");
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Fetch user's published items
  const fetchMyItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await axios.get("/api/items/my-items");
      if (res.data.success) {
        setMyItems(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching items:", err);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyItems();
    }
  }, [isAuthenticated, fetchMyItems]);

  // Auto-open profile setup for new users
  useEffect(() => {
    if (!profilesLoading && profiles.length === 0 && !profilesError) {
      setSheetOpen(true);
    }
  }, [profilesLoading, profiles.length, profilesError]);

  // Handler for after profile update
  const handleProfileUpdated = () => {
    setSheetOpen(false);
    fetchProfiles();
  };

  // Handler for after publishing item
  const handleItemPublished = () => {
    setPublishOpen(false);
    fetchMyItems();
  };

  const handleLogout = async () => {
    await account.deleteSession("current");
    await axios.post("/api/kill-jwt");
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-lg font-medium mb-4">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-600 font-medium text-xl mb-4">Please log in to view your profile</div>
          <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile Center</h1>
                <p className="text-sm text-slate-500">Manage your account settings</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-end mb-8">
          <Sheet open={publishOpen} onOpenChange={setPublishOpen}>
            <SheetTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg">
                + Publish Item
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg">
              <PublishItem onItemPublished={handleItemPublished} />
            </SheetContent>
          </Sheet>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 ring-4 ring-slate-100">
                      <AvatarImage src="/api/placeholder/64/64" />
                      <AvatarFallback className="bg-slate-900 text-white text-lg font-bold">
                        {profiles.length > 0 ? getInitials(profiles[0].userName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                        {profiles.length > 0 ? profiles[0].userName : 'Your Profile'}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-lg">
                      <SheetHeader className="pb-6">
                        <SheetTitle className="text-xl font-bold text-slate-900">
                          Edit Profile
                        </SheetTitle>
                      </SheetHeader>
                      <ProfilSetUp onProfileUpdated={handleProfileUpdated} />
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          className="mt-6 w-full border-slate-300 hover:bg-slate-50"
                        >
                          Close
                        </Button>
                      </SheetClose>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {profilesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    <span className="ml-3 text-slate-600 font-medium">Loading profile...</span>
                  </div>
                ) : profilesError ? (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">{profilesError}</p>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600 font-medium">Welcome! Let's complete your profile</p>
                    <p className="text-sm text-slate-500 mt-1">The profile setup form will open automatically</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="group p-4 bg-slate-50/50 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Username</p>
                            <p className="font-semibold text-slate-900">{profiles[0].userName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="group p-4 bg-slate-50/50 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Phone</p>
                            <p className="font-semibold text-slate-900">{profiles[0].phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="group p-4 bg-slate-50/50 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Mail className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Email</p>
                            <p className="font-semibold text-slate-900">{profiles[0].email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="group p-4 bg-slate-50/50 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Member Since</p>
                            <p className="font-semibold text-slate-900">{formatDate(profiles[0].createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Published Items Section */}
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900">
                    My Published Items
                  </CardTitle>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    {myItems.length} {myItems.length === 1 ? 'Item' : 'Items'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                    <span className="ml-3 text-slate-600 font-medium">Loading items...</span>
                  </div>
                ) : myItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600 font-medium">No items published yet</p>
                    <p className="text-sm text-slate-500 mt-1">Click &quot;Publish Item&quot; to list your first item</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myItems.map((item: any) => (
                      <div
                        key={item.$id}
                        className="group relative bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => router.push(`/items/${item.listingId}`)}
                      >
                        {/* Item Image */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <ShoppingBag className="h-16 w-16 text-slate-300" />
                            </div>
                          )}
                          {/* Status Badge */}
                          <Badge 
                            className="absolute top-2 right-2"
                            variant={item.status === 'available' ? 'default' : 'secondary'}
                          >
                            {item.status}
                          </Badge>
                        </div>

                        {/* Item Details */}
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-500">Price per day</p>
                              <p className="text-lg font-bold text-slate-900">
                                ₹{item.pricePerDay}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Deposit</p>
                              <p className="text-sm font-semibold text-slate-700">
                                ₹{item.deposit}
                              </p>
                            </div>
                          </div>

                          {/* Categories */}
                          {item.categories && item.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {item.categories.slice(0, 2).map((category: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {item.categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
