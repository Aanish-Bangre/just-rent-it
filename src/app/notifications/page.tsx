"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Bell, MessageCircle, Video, User, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  $id: string;
  notificationId: string;
  fromId: string;
  toId: string;
  type: string;
  lastUpdated: string;
}

interface User {
  $id: string;
  userName: string;
  email: string;
}

function getInitials(name?: string) {
  return name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "chat":
      return <MessageCircle className="h-4 w-4" />;
    case "video_call":
      return <Video className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "chat":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "video_call":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [senders, setSenders] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all notifications for the logged-in user
        const notificationsResponse = await axios.get("/api/notifications");
        if (!notificationsResponse.data.success) {
          throw new Error(notificationsResponse.data.error || "Failed to fetch notifications");
        }

        const notificationsData = notificationsResponse.data.data;
        setNotifications(notificationsData);

        // Fetch sender details for all notifications
        const allSenderIds = new Set<string>();
        notificationsData.forEach((notification: Notification) => {
          allSenderIds.add(notification.fromId);
        });

        // Fetch user details for all senders
        const sendersData: Record<string, User> = {};
        for (const senderId of allSenderIds) {
          try {
            const userResponse = await axios.get(`/api/profileSetup?userId=${senderId}`);
            if (userResponse.data.success && userResponse.data.data.documents?.length > 0) {
              sendersData[senderId] = userResponse.data.data.documents[0];
            }
          } catch (error) {
            console.error(`Error fetching user ${senderId}:`, error);
          }
        }
        setSenders(sendersData);

      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.response?.data?.error || err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getSenderName = (senderId: string) => {
    const sender = senders[senderId];
    return sender?.userName || `User_${senderId.slice(-6)}`;
  };

  const getNotificationMessage = (notification: Notification) => {
    const senderName = getSenderName(notification.fromId);
    
    switch (notification.type) {
      case "chat":
        return `${senderName} wants to start a chat with you`;
      case "video_call":
        return `${senderName} is calling you for a video chat`;
      default:
        return `You have a new ${notification.type} notification from ${senderName}`;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Notifications</h1>
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
          <h1 className="text-3xl font-bold mb-8">Notifications</h1>
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-xl mb-4">Please log in to view notifications</div>
            <Button onClick={() => window.location.href = '/login'} className="bg-blue-600 hover:bg-blue-700">
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
          <h1 className="text-3xl font-bold mb-8">Notifications</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Notifications</h1>
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full mb-4">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Stay Updated
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            All your important updates in one place
          </p>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <Bell className="h-16 w-16 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">All caught up!</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You don't have any notifications yet. We'll notify you when there's something new.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const senderName = getSenderName(notification.fromId);
              
              return (
                <Card 
                  key={notification.$id} 
                  className="border-0 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.01] duration-300 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-slate-800">
                        <AvatarFallback className="bg-slate-100 dark:from-blue-950 dark:to-purple-950 text-slate-700 dark:text-slate-300 font-bold text-lg">
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                            {getNotificationIcon(notification.type)}
                            <span className="font-bold text-slate-900 dark:text-white">{senderName}</span>
                          </div>
                          <Badge className={`${getNotificationColor(notification.type)} font-bold text-xs px-3 py-1`}>
                            {notification.type}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-700 dark:text-slate-300 mb-4 text-base leading-relaxed">
                          {getNotificationMessage(notification)}
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(notification.lastUpdated), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            <MessageCircle className="h-4 w-4" />
                            <span>Open Chat</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}