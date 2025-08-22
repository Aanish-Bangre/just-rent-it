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
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Chats</h1>
          <Button 
            onClick={() => router.push("/")}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No chats found</h3>
            <p className="text-gray-500">You haven't started any conversations yet.</p>
            <Button 
              onClick={() => router.push("/")}
              className="mt-4"
            >
              Start a Chat
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
                  className="hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200"
                  onClick={() => router.push(`/chat/${chat.chatId}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(participantName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                          {participantName}
                        </CardTitle>
                        <div className="text-sm text-gray-600">
                          Chat #{chat.chatId.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {chat.lastMessage ? (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {chat.lastMessage}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No messages yet
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(chat.updatedAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{chat.participantIds.length} participants</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end mt-2 text-blue-600 text-sm">
                      <span>Open Chat</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
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
