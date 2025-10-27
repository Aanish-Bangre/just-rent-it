"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MessageSquare, Users, Clock, ArrowRight, Plus } from "lucide-react";

interface Chat {
  $id: string;
  chatId: string;
  participantIds: string[];
  messages: string[];
  lastMessage: string;
  updatedAt: string;
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

export default function ChatListPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [participants, setParticipants] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all chats for the logged-in user
        const chatsResponse = await axios.get("/api/chats");
        if (!chatsResponse.data.success) {
          throw new Error(chatsResponse.data.error || "Failed to fetch chats");
        }

        const chatsData = chatsResponse.data.data;
        setChats(chatsData);

        // Fetch participant details for all chats
        const allParticipantIds = new Set<string>();
        chatsData.forEach((chat: Chat) => {
          chat.participantIds.forEach(id => allParticipantIds.add(id));
        });

        // Fetch user details for all participants
        const participantsData: Record<string, User> = {};
        for (const participantId of allParticipantIds) {
          try {
            const userResponse = await axios.get(`/api/profileSetup?userId=${participantId}`);
            if (userResponse.data.success && userResponse.data.data.documents?.length > 0) {
              participantsData[participantId] = userResponse.data.data.documents[0];
            }
          } catch (error) {
            console.error(`Error fetching user ${participantId}:`, error);
          }
        }
        setParticipants(participantsData);

      } catch (err: any) {
        console.error("Error fetching chats:", err);
        setError(err.response?.data?.error || err.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const getOtherParticipant = (chat: Chat) => {
    // Get the current user's ID (you might need to fetch this from context or API)
    // For now, we'll show the first participant that's not the current user
    return chat.participantIds[0] || "";
  };

  const getParticipantName = (participantId: string) => {
    const participant = participants[participantId];
    return participant?.userName || `User_${participantId.slice(-6)}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Chats</h1>
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
          <h1 className="text-3xl font-bold mb-8">My Chats</h1>
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-lg">Please log in to view your chats.</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Chats</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
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
          <h1 className="text-3xl font-bold mb-8">My Chats</h1>
          <div className="text-center py-12">
            <div className="text-red-600 font-medium text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full mb-4">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-semibold">Messages</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
              Your Conversations
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Connect with item owners and renters
            </p>
          </div>
          <Button 
            onClick={() => router.push("/")}
            className="bg-black hover:bg-slate-800 text-white font-semibold shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        {chats.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <MessageSquare className="h-16 w-16 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">No conversations yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              You haven't started any conversations. Browse items and connect with owners!
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chats.map((chat) => {
              const otherParticipantId = getOtherParticipant(chat);
              const participantName = getParticipantName(otherParticipantId);
              
              return (
                <Card 
                  key={chat.$id} 
                  className="border-0 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 duration-300 group overflow-hidden"
                  onClick={() => router.push(`/chat/${chat.chatId}`)}
                >
                  <CardHeader className="pb-4 bg-slate-50 dark:from-slate-800 dark:to-slate-900">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-slate-800">
                        <AvatarFallback className="bg-slate-100 dark:from-blue-950 dark:to-purple-950 text-slate-700 dark:text-slate-300 font-bold">
                          {getInitials(participantName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                          {participantName}
                        </CardTitle>
                        <div className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                          #{chat.chatId.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {chat.lastMessage ? (
                      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        {chat.lastMessage}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-500 italic p-3">
                        No messages yet
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(chat.updatedAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{chat.participantIds.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
                      <span>Open Chat</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
