import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Home, ShoppingBag, Calendar, MessageCircle, User, UserPlus, Bell } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export function AppSidebar() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [user, setUser] = useState<any>(null)
    const [unreadNotifications, setUnreadNotifications] = useState<number>(0)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // First check if user is authenticated
                const authResponse = await axios.get("/api/auth/check");
                if (authResponse.data.success && authResponse.data.authenticated) {
                    setIsLoggedIn(true);
                    
                    // If authenticated, try to fetch profile data
                    try {
                        const profileResponse = await axios.get("/api/profileSetup");
                        if (profileResponse.data.success && profileResponse.data.data.documents?.length > 0) {
                            setUser(profileResponse.data.data.documents[0]);
                        } else {
                            // Use basic user data if no profile exists
                            setUser(authResponse.data.data);
                        }
                    } catch (profileError) {
                        console.error("Error fetching profile:", profileError);
                        // Use basic user data if profile fetch fails
                        setUser(authResponse.data.data);
                    }
                    
                    // Fetch unread notifications count
                    try {
                        const notificationsResponse = await axios.get("/api/notifications?status=unread");
                        if (notificationsResponse.data.success) {
                            setUnreadNotifications(notificationsResponse.data.data.length);
                        }
                    } catch (notificationError) {
                        console.error("Error fetching notifications:", notificationError);
                    }
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } catch (error: any) {
                console.error("Auth check error:", error.response?.status, error.message);
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        checkAuth();
    }, [])

    const handleLogout = async () => {
        try {
            await axios.post("/api/kill-jwt");
            setIsLoggedIn(false);
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <Sidebar className="invert">
            <SidebarHeader>
                <div className="flex items-center gap-3 px-3 py-4">
                    <span className="font-bold text-lg tracking-tight">JustRent-It</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/">
                                <SidebarMenuButton tooltip="Home">
                                    <Home />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/items">
                                <SidebarMenuButton tooltip="Rent Items">
                                    <ShoppingBag />
                                    <span>Rent Items</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/bookings">
                                <SidebarMenuButton tooltip="Bookings">
                                    <Calendar />
                                    <span>Booking</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/chat">
                                <SidebarMenuButton tooltip="Chat">
                                    <MessageCircle />
                                    <span>Chat</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/notifications">
                                <SidebarMenuButton tooltip="Notifications" className="relative">
                                    <Bell />
                                    <span>Notifications</span>
                                    {unreadNotifications > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                        </div>
                                    )}
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex justify-center w-full gap-2 pb-2">
                    {isLoggedIn === null ? null : isLoggedIn ? (
                        <>
                            <Link href="/profile" className="block w-full">
                                <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-3 shadow hover:bg-accent transition cursor-pointer">
                                    <Avatar>
                                        {user?.avatarUrl ? (
                                            <AvatarImage src={user.avatarUrl} alt={user?.userName || user?.email || "User"} />
                                        ) : (
                                            <AvatarFallback>{user?.userName ? user.userName[0] : user?.email?.[0] || "U"}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold truncate">{user?.userName || user?.name || "User"}</span>
                                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="ml-auto text-muted-foreground hover:text-foreground"
                                        title="Logout"
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button asChild variant="secondary" size="sm" title="Login">
                                    <span className="flex items-center gap-2">
                                        <User />
                                        <span>Login</span>
                                    </span>
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button asChild variant="secondary" size="sm" title="Signup">
                                    <span className="flex items-center gap-2">
                                        <UserPlus />
                                        <span>Signup</span>
                                    </span>
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}